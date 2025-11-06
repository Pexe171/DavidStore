import jwt from 'jsonwebtoken'
import config from '../../config/default.js'

export const authenticateRequest = (roles = []) => {
  return (req, res, next) => {
    const header = req.headers.authorization
    if (!header) {
      return res.status(401).json({ message: 'Token não fornecido.' })
    }
    const [type, token] = header.split(' ')
    if (type !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Token inválido.' })
    }
    try {
      const payload = jwt.verify(token, config.security.jwtSecret)
      req.user = payload
      if (roles.length && !roles.includes(payload.role)) {
        return res.status(403).json({ message: 'Você não possui permissão para acessar este recurso.' })
      }
      next()
    } catch (error) {
      return res.status(401).json({ message: 'Token expirado ou inválido.' })
    }
  }
}
