import { AppError } from '../utils/errors.js'

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({ message: 'Rota não encontrada na David Store.' })
}

export const errorHandler = (error, req, res, next) => {
  console.error('Erro capturado:', error)
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
