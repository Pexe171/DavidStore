import 'dotenv/config'
import app from './app.js'
import config from '../config/default.js'
import prisma from './lib/prisma.js'

const { port, name } = config.app

const start = async () => {
  try {
    await prisma.$connect()
    const server = app.listen(port, () => {
      console.log(`${name} rodando na porta ${port}`)
    })

    const shutdown = async () => {
      console.log('Encerrando servidor com segurança...')
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
