export default {
  app: {
    name: 'David Store API',
    port: process.env.PORT || 4000
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://david:david@localhost:5432/davidstore?schema=public'
  },
  security: {
    saltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
    cors: {
      origins: process.env.CORS_ALLOWED_ORIGINS
        ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
        : ['http://localhost:3000', 'http://localhost:5173'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true
    },
    rateLimit: {
      global: {
        windowMs: Number(process.env.RATE_LIMIT_GLOBAL_WINDOW_MS) || 15 * 60 * 1000,
        max: Number(process.env.RATE_LIMIT_GLOBAL_MAX) || 100
      },
      auth: {
        windowMs: Number(process.env.RATE_LIMIT_AUTH_WINDOW_MS) || 15 * 60 * 1000,
        max: Number(process.env.RATE_LIMIT_AUTH_MAX) || 10
      }
    },
    jwt: {
      issuer: 'David Store API',
      audience: 'david-store-clients',
      accessToken: {
        expiresInSeconds: Number(process.env.JWT_ACCESS_EXPIRES_IN_SECONDS) || 15 * 60
      },
      refreshToken: {
        expirationMs: Number(process.env.JWT_REFRESH_EXPIRES_IN_MS) || 7 * 24 * 60 * 60 * 1000,
        cookieName: process.env.JWT_REFRESH_COOKIE_NAME || 'davidstore_refresh_token',
        cookieOptions: {
          httpOnly: true,
          sameSite: 'strict',
          path: '/auth/refresh'
        }
      },
      keyRotationIntervalMinutes: Number(process.env.JWT_ROTATION_INTERVAL_MINUTES) || 12 * 60,
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
  }
}
