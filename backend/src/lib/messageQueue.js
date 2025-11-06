import { EventEmitter } from 'events'
import { randomUUID } from 'crypto'
import { trace } from '@opentelemetry/api'
import logger from './logger.js'

const tracer = trace.getTracer('david-store:messaging')

class InMemoryMessageQueue {
  constructor() {
    this.emitter = new EventEmitter()
    this.emitter.setMaxListeners(50)
  }

  publish(event, payload) {
    const envelope = {
      id: randomUUID(),
      event,
      payload,
      timestamp: new Date().toISOString()
    }

    tracer.startActiveSpan(`queue.publish ${event}`, (span) => {
      span.setAttributes({
        'messaging.system': 'in-memory',
        'messaging.destination': event,
        'messaging.operation': 'publish',
        'messaging.message_id': envelope.id
      })
      logger.debug({ event, messageId: envelope.id }, 'Evento publicado na fila da David Store')
      setImmediate(() => {
        this.emitter.emit(event, envelope)
      })
      span.end()
    })

    return Promise.resolve(envelope)
  }

  subscribe(event, handler) {
    const wrapped = async (envelope) => {
      tracer.startActiveSpan(`queue.consume ${event}`, async (span) => {
        span.setAttributes({
          'messaging.system': 'in-memory',
          'messaging.destination': event,
          'messaging.operation': 'process',
          'messaging.message_id': envelope?.id ?? 'unknown'
        })
        const childLogger = logger.child({ event, messageId: envelope?.id })
        try {
          await handler(envelope)
          childLogger.debug('Mensagem processada com sucesso na fila')
        } catch (error) {
          span.recordException(error)
          span.setStatus({ code: 2, message: error.message })
          childLogger.error({ err: error }, 'Erro ao processar mensagem na fila')
        } finally {
          span.end()
        }
      })
    }

    this.emitter.on(event, wrapped)

    return () => {
      this.emitter.off(event, wrapped)
    }
  }
}

const messageQueue = new InMemoryMessageQueue()

export default messageQueue
