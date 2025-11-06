import { AppError } from '../utils/errors.js'
import { getLogger } from '../lib/logger.js'

export const notFoundHandler = (req, res, next) => {
  const log = req.log ?? getLogger()
  log.warn({ route: req.originalUrl }, 'Rota não encontrada na David Store.')
  res.status(404).json({ message: 'Rota não encontrada na David Store.' })
}

export const errorHandler = (error, req, res, next) => {
  const log = req.log ?? getLogger()
  log.error({ err: error, route: req.originalUrl }, 'Erro capturado no pipeline da API')

  if (error?.message && error.message.includes('CORS')) {
    return res.status(403).json({ message: error.message })
  }

  const status = error instanceof AppError ? error.statusCode : error.statusCode || 500
  const message = error.message || 'Erro interno no servidor.'
  const response = { message }

  if (error instanceof AppError && error.details) {
    response.details = error.details
  }

  res.status(status).json(response)
}
