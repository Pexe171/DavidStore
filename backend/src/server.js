import 'dotenv/config'
import app from './app.js'
import config from '../config/default.js'
import prisma from './lib/prisma.js'
import { scheduleAutomaticRotation } from './lib/jwtKeys.js'
import { setupMessaging } from './messaging/setupMessaging.js'

const { port, name } = config.app

const start = async () => {
  try {
    await prisma.$connect()
    setupMessaging()
    const rotationInterval = scheduleAutomaticRotation()
    const server = app.listen(port, () => {
      console.log(`${name} rodando na porta ${port}`)
    })

    const shutdown = async () => {
      console.log('Encerrando servidor com segurança...')
      if (rotationInterval) {
        clearInterval(rotationInterval)
      }
      await prisma.$disconnect()
      server.close(() => {
        process.exit(0)
      })
    }

    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
  } catch (error) {
    console.error('Falha ao iniciar o servidor:', error)
    process.exit(1)
  }
}

start()
