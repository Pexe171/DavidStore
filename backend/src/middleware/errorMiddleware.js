export const notFoundHandler = (req, res, next) => {
  res.status(404).json({ message: 'Rota não encontrada na David Store.' })
}

export const errorHandler = (error, req, res, next) => {
  console.error('Erro capturado:', error)
  res.status(500).json({ message: error.message || 'Erro interno no servidor.' })
}
