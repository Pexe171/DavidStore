import { verifyAccessToken } from '../lib/jwtManager.js'
import { getAccessCookieName } from '../services/tokenService.js'
import { ForbiddenError, UnauthorizedError } from '../utils/errors.js'

export const authenticateRequest = (roles = []) => {
  return (req, res, next) => {
    try {
      const accessCookie = req.cookies?.[getAccessCookieName()]
      let token = accessCookie

      if (!token) {
        const header = req.headers.authorization
        if (!header) {
          throw new UnauthorizedError('Token não fornecido.')
        }
        const [type, value] = header.split(' ')
        if (type !== 'Bearer' || !value) {
          throw new UnauthorizedError('Token inválido.')
        }
        token = value
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
