import Redis from 'ioredis'
import config from '../../config/default.js'
import logger from './logger.js'

const redisConfig = config.cache?.redis || {}

let redisClient = null

if (redisConfig.enabled) {
  try {
    const connectionOptions = redisConfig.url
      ? redisConfig.url
      : {
          host: redisConfig.host,
          port: redisConfig.port,
          password: redisConfig.password || undefined,
          tls: redisConfig.tls ? {} : undefined
        }

    redisClient = new Redis(connectionOptions)

    redisClient.on('connect', () => {
      logger.info('Conectado ao Redis para cache e rate limiting.')
    })

    redisClient.on('error', (error) => {
      logger.error({ err: error }, 'Erro de comunicação com o Redis.')
    })
  } catch (error) {
    logger.error({ err: error }, 'Não foi possível iniciar o cliente Redis.')
    redisClient = null
  }
} else {
  logger.info('Redis desabilitado via configuração.')
}

export const isRedisEnabled = () => Boolean(redisClient)

export const deleteKeysByPattern = async (pattern) => {
  if (!isRedisEnabled()) {
    return 0
  }

  let cursor = '0'
  let deleted = 0

  do {
    // eslint-disable-next-line no-await-in-loop
    const [nextCursor, keys] = await redisClient.scan(cursor, 'MATCH', pattern, 'COUNT', 100)
    cursor = nextCursor

    if (keys.length) {
      // eslint-disable-next-line no-await-in-loop
      deleted += await redisClient.del(...keys)
    }
  } while (cursor !== '0')

  return deleted
}

export default redisClient
