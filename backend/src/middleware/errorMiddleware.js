export const notFoundHandler = (req, res, next) => {
  res.status(404).json({ message: 'Rota não encontrada na David Store.' })
}

export const errorHandler = (error, req, res, next) => {
  console.error('Erro capturado:', error)
  const status = error.statusCode || 500
  res.status(status).json({ message: error.message || 'Erro interno no servidor.' })
}
