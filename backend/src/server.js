import 'dotenv/config'
import app from './app.js'
import config from '../config/default.js'
import prisma from './lib/prisma.js'
import { scheduleAutomaticRotation } from './lib/jwtKeys.js'
import { setupMessaging } from './messaging/setupMessaging.js'
import logger from './lib/logger.js'
import { startTracing, stopTracing } from './observability/tracing.js'

const { port, name } = config.app

const start = async () => {
  let rotationInterval
  let server
  let tracingSdk = null

  const shutdown = async (signal, exitCode = 0) => {
    logger.warn({ signal }, 'Encerrando servidor da David Store com segurança...')

    if (rotationInterval) {
      clearInterval(rotationInterval)
    }

    await prisma
      .$disconnect()
      .catch((error) => logger.error({ err: error }, 'Erro ao desconectar do banco de dados.'))

    if (tracingSdk) {
      await stopTracing().catch((error) =>
        logger.error({ err: error }, 'Erro ao finalizar o tracing distribuído.')
      )
    }

    if (server) {
      server.close(() => {
        logger.info('Servidor HTTP finalizado.')
        process.exit(exitCode)
      })
      return
    }

    process.exit(exitCode)
  }

  try {
    tracingSdk = await startTracing()
    await prisma.$connect()
    setupMessaging()
    rotationInterval = scheduleAutomaticRotation()

    server = app.listen(port, () => {
      logger.info({ port }, `${name} rodando na porta ${port}`)
    })

    process.on('SIGINT', () => shutdown('SIGINT'))
    process.on('SIGTERM', () => shutdown('SIGTERM'))

    process.on('unhandledRejection', (reason) => {
      logger.error({ err: reason }, 'Promise rejeitada sem tratamento capturada.')
    })

    process.on('uncaughtException', (error) => {
      logger.fatal({ err: error }, 'Exceção não tratada capturada. Encerrando processo.')
      shutdown('uncaughtException', 1)
    })
  } catch (error) {
    logger.error({ err: error }, 'Falha ao iniciar o servidor da David Store.')
    await shutdown('startup-error', 1)
  }
}

start()
