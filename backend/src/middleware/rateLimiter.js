import rateLimit from 'express-rate-limit'
import config from '../../config/default.js'

const {
  security: { rateLimit: rateLimitConfig }
} = config

export const globalRateLimiter = rateLimit({
  windowMs: rateLimitConfig.global.windowMs,
  max: rateLimitConfig.global.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Muitas requisições a partir deste IP. Tente novamente mais tarde.'
  }
})

export const authRateLimiter = rateLimit({
  windowMs: rateLimitConfig.auth.windowMs,
  max: rateLimitConfig.auth.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Limite de tentativas de autenticação atingido. Aguarde alguns minutos.'
  }
})
