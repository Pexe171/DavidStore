import { verifyAccessToken } from '../lib/jwtManager.js'
import { ForbiddenError, UnauthorizedError } from '../utils/errors.js'

export const authenticateRequest = (roles = []) => {
  return (req, res, next) => {
    try {
      const header = req.headers.authorization
      if (!header) {
        throw new UnauthorizedError('Token não fornecido.')
      }
      const [type, token] = header.split(' ')
      if (type !== 'Bearer' || !token) {
        throw new UnauthorizedError('Token inválido.')
      }
      const payload = verifyAccessToken(token)
      req.user = payload
      if (roles.length && !roles.includes(payload.role)) {
        throw new ForbiddenError('Você não possui permissão para acessar este recurso.')
      }
      next()
    } catch (error) {
      next(error)
    }
  }
}
