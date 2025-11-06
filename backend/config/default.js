export default {
  app: {
    name: 'David Store API',
    port: process.env.PORT || 4000,
    version: process.env.APP_VERSION || '1.0.0'
  },
  database: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://david:david@localhost:5432/davidstore?schema=public'
  },
  security: {
    saltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
    cors: {
      origins: process.env.CORS_ALLOWED_ORIGINS
        ? process.env.CORS_ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
        : ['http://localhost:3000', 'http://localhost:5173'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true
    },
    rateLimit: {
      global: {
        windowMs: Number(process.env.RATE_LIMIT_GLOBAL_WINDOW_MS) || 15 * 60 * 1000,
        max: Number(process.env.RATE_LIMIT_GLOBAL_MAX) || 100,
        blockDurationSeconds:
          Number(process.env.RATE_LIMIT_GLOBAL_BLOCK_DURATION_SECONDS) || 60
      },
      auth: {
        windowMs: Number(process.env.RATE_LIMIT_AUTH_WINDOW_MS) || 15 * 60 * 1000,
        max: Number(process.env.RATE_LIMIT_AUTH_MAX) || 10,
        blockDurationSeconds:
          Number(process.env.RATE_LIMIT_AUTH_BLOCK_DURATION_SECONDS) || 120
      },
      redis: {
        prefix: process.env.RATE_LIMIT_REDIS_PREFIX || 'rate-limit'
      }
    },
    jwt: {
      issuer: 'David Store API',
      audience: 'david-store-clients',
      accessToken: {
        expiresInSeconds: Number(process.env.JWT_ACCESS_EXPIRES_IN_SECONDS) || 15 * 60
      },
      refreshToken: {
        expirationMs:
          Number(process.env.JWT_REFRESH_EXPIRES_IN_MS) || 7 * 24 * 60 * 60 * 1000,
        cookieName: process.env.JWT_REFRESH_COOKIE_NAME || 'davidstore_refresh_token',
        cookieOptions: {
          httpOnly: true,
          sameSite: 'strict',
          path: '/auth/refresh'
        }
      },
      keyRotationIntervalMinutes:
        Number(process.env.JWT_ROTATION_INTERVAL_MINUTES) || 12 * 60,
      keyRetention: Number(process.env.JWT_KEY_RETENTION) || 3,
      keys: (() => {
        const initialKeys = []
        const primarySecret = process.env.JWT_SECRET_PRIMARY || process.env.JWT_SECRET
        if (primarySecret) {
          initialKeys.push({ id: 'primary', secret: primarySecret })
        }
        const secondarySecret = process.env.JWT_SECRET_SECONDARY
        if (secondarySecret) {
          initialKeys.push({ id: 'secondary', secret: secondarySecret })
        }
        if (!initialKeys.length) {
          initialKeys.push({ id: 'bootstrap', secret: 'segredo-super-seguro' })
        }
        return initialKeys
      })()
    }
  },
  cache: {
    redis: {
      enabled: process.env.REDIS_ENABLED !== 'false',
      url: process.env.REDIS_URL,
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD,
      tls: process.env.REDIS_TLS === 'true'
    },
    products: {
      enabled: process.env.PRODUCT_CACHE_ENABLED !== 'false',
      ttlSeconds: Number(process.env.PRODUCT_CACHE_TTL_SECONDS) || 60
    }
  },
  messaging: {
    driver: process.env.MESSAGE_QUEUE_DRIVER || 'sqs',
    sqs: {
      queueUrl: process.env.SQS_QUEUE_URL || '',
      region: process.env.SQS_REGION || process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.SQS_ENDPOINT || '',
      visibilityTimeoutSeconds:
        Number(process.env.SQS_VISIBILITY_TIMEOUT_SECONDS) || 30,
      waitTimeSeconds: Number(process.env.SQS_WAIT_TIME_SECONDS) || 20,
      maxNumberOfMessages: Number(process.env.SQS_MAX_NUMBER_OF_MESSAGES) || 5,
      pollIntervalMs: Number(process.env.SQS_POLL_INTERVAL_MS) || 0,
      backoffMs: Number(process.env.SQS_BACKOFF_MS) || 2000
    }
  },
  observability: {
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      pretty: process.env.NODE_ENV !== 'production'
    },
    tracing: {
      enabled: process.env.OTEL_TRACING_ENABLED !== 'false',
      serviceName: process.env.OTEL_SERVICE_NAME || 'david-store-api',
      otlpEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || '',
      otlpHeaders: process.env.OTEL_EXPORTER_OTLP_HEADERS || ''
    }
  }
}
