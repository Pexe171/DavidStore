import { RateLimiterRedis, RateLimiterMemory } from 'rate-limiter-flexible'
import config from '../../config/default.js'
import redisClient, { isRedisEnabled } from '../lib/redis.js'
import logger from '../lib/logger.js'

const {
  security: { rateLimit: rateLimitConfig }
} = config

const createRateLimiter = (name, { windowMs, max, blockDurationSeconds }) => {
  const baseOptions = {
    points: max,
    duration: Math.ceil(windowMs / 1000),
    blockDuration: blockDurationSeconds || 0,
    keyPrefix: `${rateLimitConfig.redis.prefix}:${name}`
  }

  if (isRedisEnabled()) {
    return new RateLimiterRedis({
      storeClient: redisClient,
      ...baseOptions
    })
  }

  logger.warn(
    {
      name
    },
    'Redis indisponível para rate limiting. Fallback para memória local.'
  )

  return new RateLimiterMemory(baseOptions)
}

const buildMiddleware = (limiter, message) => async (req, res, next) => {
  try {
    await limiter.consume(req.ip)
    return next()
  } catch (rateLimiterRes) {
    const retryAfterSeconds = Math.ceil((rateLimiterRes.msBeforeNext || 0) / 1000)
    if (retryAfterSeconds > 0) {
      res.setHeader('Retry-After', retryAfterSeconds)
    }
    return res.status(429).json({
      message,
      retryAfterSeconds
    })
  }
}

const globalLimiter = createRateLimiter('global', rateLimitConfig.global)
const authLimiter = createRateLimiter('auth', rateLimitConfig.auth)

export const globalRateLimiter = buildMiddleware(
  globalLimiter,
  'Muitas requisições a partir deste IP. Tente novamente mais tarde.'
)

export const authRateLimiter = buildMiddleware(
  authLimiter,
  'Limite de tentativas de autenticação atingido. Aguarde alguns minutos.'
)
