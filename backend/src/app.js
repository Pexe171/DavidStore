import express from 'express'
import cors from 'cors'
import pinoHttp from 'pino-http'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { context, trace } from '@opentelemetry/api'
import config from '../config/default.js'
import productRoutes from './routes/productRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import authRoutes from './routes/authRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import { globalRateLimiter } from './middleware/rateLimiter.js'
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js'
import logger from './lib/logger.js'

const app = express()

const allowedOrigins = config.security.cors.origins

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error('Origem bloqueada pela política de CORS da David Store.'), false)
  },
  methods: config.security.cors.methods,
  credentials: config.security.cors.credentials
}

const httpLogger = pinoHttp({
  logger,
  customProps: () => {
    const span = trace.getSpan(context.active())
    if (!span) {
      return {}
    }
    const spanContext = span.spanContext()
    return {
      traceId: spanContext.traceId,
      spanId: spanContext.spanId
    }
  }
})

app.use(httpLogger)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'same-site' },
  contentSecurityPolicy: false
}))
app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(globalRateLimiter)

app.get('/', (req, res) => {
  res.json({
    message: 'Bem-vindo à API da David Store.',
    docs: '/docs',
    version: config.app.version
  })
})

app.use('/auth', authRoutes)
app.use('/produtos', productRoutes)
app.use('/categorias', categoryRoutes)
app.use('/pedidos', orderRoutes)
app.use('/dashboard', dashboardRoutes)
app.use('/gateway', paymentRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
