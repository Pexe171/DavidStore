import { EventEmitter } from 'events'
import { randomUUID } from 'crypto'

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

    setImmediate(() => {
      this.emitter.emit(event, envelope)
    })

    return Promise.resolve(envelope)
  }

  subscribe(event, handler) {
    const wrapped = async (envelope) => {
      try {
        await handler(envelope)
      } catch (error) {
        console.error(`Erro ao processar mensagem ${envelope?.id ?? ''} em ${event}:`, error)
      }
    }

    this.emitter.on(event, wrapped)

    return () => {
      this.emitter.off(event, wrapped)
    }
  }
}

const messageQueue = new InMemoryMessageQueue()

export default messageQueue
