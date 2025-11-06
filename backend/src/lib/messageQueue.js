import { EventEmitter } from 'events'
import { randomUUID } from 'crypto'
import { trace } from '@opentelemetry/api'
import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand
} from '@aws-sdk/client-sqs'
import config from '../../config/default.js'
import logger from './logger.js'

const tracer = trace.getTracer('david-store:messaging')

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

class SQSMessageQueue {
  constructor(options) {
    const {
      queueUrl,
      region,
      endpoint,
      visibilityTimeoutSeconds,
      waitTimeSeconds,
      maxNumberOfMessages,
      pollIntervalMs,
      backoffMs
    } = options || {}

    if (!queueUrl) {
      throw new Error(
        'SQS_QUEUE_URL não configurada. Configure a URL da fila provisionada pelo Terraform para habilitar a mensageria.'
      )
    }

    this.queueUrl = queueUrl
    this.client = new SQSClient({
      region,
      endpoint: endpoint ? endpoint : undefined
    })

    this.visibilityTimeoutSeconds = visibilityTimeoutSeconds
    this.waitTimeSeconds = waitTimeSeconds
    this.maxNumberOfMessages = maxNumberOfMessages
    this.pollIntervalMs = pollIntervalMs
    this.backoffMs = backoffMs

    this.handlers = new Map()
    this.shouldPoll = false
    this.isPolling = false
    this.pollLoopPromise = null

    this.baseLogger = logger.child({ queue: this.queueUrl, driver: 'sqs' })
    this.baseLogger.info('Fila SQS da David Store inicializada com sucesso.')
  }

  async publish(event, payload) {
    const envelope = {
      id: randomUUID(),
      event,
      payload,
      timestamp: new Date().toISOString()
    }

    return new Promise((resolve, reject) => {
      tracer.startActiveSpan(`queue.publish ${event}`, async (span) => {
        span.setAttributes({
          'messaging.system': 'aws.sqs',
          'messaging.destination': this.queueUrl,
          'messaging.operation': 'publish',
          'messaging.message_id': envelope.id,
          'messaging.event.name': event
        })

        const childLogger = this.baseLogger.child({ event, messageId: envelope.id })

        try {
          await this.client.send(
            new SendMessageCommand({
              QueueUrl: this.queueUrl,
              MessageBody: JSON.stringify(envelope),
              MessageAttributes: {
                event: { DataType: 'String', StringValue: event }
              }
            })
          )

          childLogger.debug('Evento publicado na fila SQS da David Store.')
          span.end()
          resolve(envelope)
        } catch (error) {
          span.recordException(error)
          span.setStatus({ code: 2, message: error.message })
          childLogger.error({ err: error }, 'Erro ao publicar evento na fila SQS.')
          span.end()
          reject(error)
        }
      })
    })
  }

  subscribe(event, handler) {
    if (!event || typeof handler !== 'function') {
      throw new Error('Parâmetros inválidos ao se inscrever na fila SQS.')
    }

    const handlers = this.handlers.get(event) || new Set()
    handlers.add(handler)
    this.handlers.set(event, handlers)

    this.baseLogger.debug({ event }, 'Handler registrado na fila SQS.')

    this.ensurePolling()

    return () => {
      const currentHandlers = this.handlers.get(event)
      if (!currentHandlers) {
        return
      }

      currentHandlers.delete(handler)

      if (!currentHandlers.size) {
        this.handlers.delete(event)
      }

      if (!this.handlers.size) {
        this.stopPolling()
      }
    }
  }

  ensurePolling() {
    if (!this.shouldPoll) {
      this.shouldPoll = true
    }

    if (!this.isPolling) {
      this.pollLoopPromise = this.pollLoop()
    }
  }

  async stopPolling() {
    this.shouldPoll = false

    if (this.pollLoopPromise) {
      await this.pollLoopPromise
    }
  }

  async pollLoop() {
    this.isPolling = true
    this.baseLogger.info('Consumidor SQS iniciado para processar eventos da David Store.')

    while (this.shouldPoll) {
      try {
        const response = await this.client.send(
          new ReceiveMessageCommand({
            QueueUrl: this.queueUrl,
            MaxNumberOfMessages: this.maxNumberOfMessages,
            WaitTimeSeconds: this.waitTimeSeconds,
            VisibilityTimeout: this.visibilityTimeoutSeconds,
            MessageAttributeNames: ['All']
          })
        )

        const messages = response.Messages || []

        if (!messages.length) {
          if (this.pollIntervalMs) {
            await sleep(this.pollIntervalMs)
          }
          continue
        }

        for (const message of messages) {
          // eslint-disable-next-line no-await-in-loop
          await this.handleMessage(message)
        }
      } catch (error) {
        this.baseLogger.error({ err: error }, 'Falha ao receber mensagens da fila SQS.')
        await sleep(this.backoffMs)
      }
    }

    this.isPolling = false
    this.baseLogger.info('Consumidor SQS finalizado.')
  }

  async handleMessage(message) {
    let envelope

    try {
      envelope = JSON.parse(message.Body)
    } catch (error) {
      this.baseLogger.error({ err: error }, 'Mensagem inválida recebida na fila SQS. Removendo para evitar loop infinito.')
      await this.safeDeleteMessage(message)
      return
    }

    const event = envelope?.event

    if (!event) {
      this.baseLogger.warn('Mensagem sem evento recebida na fila SQS. Removendo da fila.')
      await this.safeDeleteMessage(message)
      return
    }

    const handlers = this.handlers.get(event)

    if (!handlers || !handlers.size) {
      this.baseLogger.warn({ event }, 'Nenhum handler registrado para o evento recebido. Removendo mensagem da fila.')
      await this.safeDeleteMessage(message)
      return
    }

    envelope.id = envelope.id || message.MessageId
    envelope.timestamp = envelope.timestamp || new Date().toISOString()

    let allHandlersSucceeded = true

    for (const handler of handlers) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await this.executeHandler(event, envelope, handler)
      } catch (error) {
        allHandlersSucceeded = false
        this.baseLogger.error(
          { err: error, event, messageId: envelope.id },
          'Erro ao processar mensagem. Ela retornará para a fila ao expirar o timeout de visibilidade.'
        )
      }
    }

    if (allHandlersSucceeded) {
      await this.safeDeleteMessage(message)
    }
  }

  executeHandler(event, envelope, handler) {
    return new Promise((resolve, reject) => {
      tracer.startActiveSpan(`queue.consume ${event}`, async (span) => {
        span.setAttributes({
          'messaging.system': 'aws.sqs',
          'messaging.destination': this.queueUrl,
          'messaging.operation': 'process',
          'messaging.message_id': envelope.id,
          'messaging.event.name': event
        })

        const childLogger = this.baseLogger.child({ event, messageId: envelope.id })

        try {
          await handler(envelope)
          childLogger.debug('Mensagem processada com sucesso pelo handler inscrito.')
          span.end()
          resolve()
        } catch (error) {
          span.recordException(error)
          span.setStatus({ code: 2, message: error.message })
          childLogger.error({ err: error }, 'Handler falhou ao processar a mensagem da fila SQS.')
          span.end()
          reject(error)
        }
      })
    })
  }

  async safeDeleteMessage(message) {
    try {
      await this.client.send(
        new DeleteMessageCommand({
          QueueUrl: this.queueUrl,
          ReceiptHandle: message.ReceiptHandle
        })
      )
      this.baseLogger.debug({ messageId: message.MessageId }, 'Mensagem removida da fila SQS com sucesso.')
    } catch (error) {
      this.baseLogger.error({ err: error, messageId: message.MessageId }, 'Falha ao remover mensagem processada da fila SQS.')
    }
  }
}

class InMemoryMessageQueue {
  constructor() {
    this.emitter = new EventEmitter()
    this.emitter.setMaxListeners(50)
    this.baseLogger = logger.child({ driver: 'in-memory' })
    this.baseLogger.warn(
      'Fila em memória habilitada. Utilize apenas em desenvolvimento ou testes locais sem dependências externas.'
    )
  }

  publish(event, payload) {
    const envelope = {
      id: randomUUID(),
      event,
      payload,
      timestamp: new Date().toISOString()
    }

    return new Promise((resolve) => {
      tracer.startActiveSpan(`queue.publish ${event}`, (span) => {
        span.setAttributes({
          'messaging.system': 'in-memory',
          'messaging.destination': event,
          'messaging.operation': 'publish',
          'messaging.message_id': envelope.id,
          'messaging.event.name': event
        })

        this.baseLogger.debug({ event, messageId: envelope.id }, 'Evento publicado na fila em memória da David Store.')

        setImmediate(() => {
          this.emitter.emit(event, envelope)
          resolve(envelope)
          span.end()
        })
      })
    })
  }

  subscribe(event, handler) {
    const wrapped = async (envelope) => {
      tracer.startActiveSpan(`queue.consume ${event}`, async (span) => {
        span.setAttributes({
          'messaging.system': 'in-memory',
          'messaging.destination': event,
          'messaging.operation': 'process',
          'messaging.message_id': envelope?.id ?? 'unknown',
          'messaging.event.name': event
        })

        const childLogger = this.baseLogger.child({ event, messageId: envelope?.id })

        try {
          await handler(envelope)
          childLogger.debug('Mensagem processada com sucesso na fila em memória.')
        } catch (error) {
          span.recordException(error)
          span.setStatus({ code: 2, message: error.message })
          childLogger.error({ err: error }, 'Erro ao processar mensagem na fila em memória.')
        } finally {
          span.end()
        }
      })
    }

    this.emitter.on(event, wrapped)

    return () => this.emitter.off(event, wrapped)
  }
}

const messagingConfig = config.messaging || {}
const sqsConfig = messagingConfig.sqs || {}
const driver = (messagingConfig.driver || 'sqs').toLowerCase()

let messageQueue

switch (driver) {
  case 'sqs':
    messageQueue = new SQSMessageQueue({
      queueUrl: sqsConfig.queueUrl,
      region: sqsConfig.region,
      endpoint: sqsConfig.endpoint,
      visibilityTimeoutSeconds: sqsConfig.visibilityTimeoutSeconds,
      waitTimeSeconds: sqsConfig.waitTimeSeconds,
      maxNumberOfMessages: sqsConfig.maxNumberOfMessages,
      pollIntervalMs: sqsConfig.pollIntervalMs,
      backoffMs: sqsConfig.backoffMs
    })
    break
  case 'in-memory':
    messageQueue = new InMemoryMessageQueue()
    break
  default:
    throw new Error(`Driver de fila desconhecido: ${driver}`)
}

export default messageQueue
