import { ZodError } from 'zod'
import { BadRequestError } from '../utils/errors.js'

export const validateRequest = schema => {
  return (req, res, next) => {
    try {
      const result = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query
      })
      if (result.body) req.body = result.body
      if (result.params) req.params = result.params
      if (result.query) req.query = result.query
      return next()
    } catch (error) {
      if (error instanceof ZodError) {
        const formatted = error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
        return next(new BadRequestError('Falha na validação dos dados enviados.', formatted))
      }
      return next(error)
    }
  }
}
