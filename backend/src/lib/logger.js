import pino from 'pino'
import { context, trace } from '@opentelemetry/api'
import config from '../../config/default.js'

const transport = config.observability.logging.pretty
  ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname'
      }
    }
  : undefined

export const logger = pino({
  level: config.observability.logging.level,
  transport,
  base: {
    service: config.observability.tracing.serviceName,
    version: config.app.version
  }
})

export const getLogger = () => {
  const span = trace.getSpan(context.active())
  if (!span) {
    return logger
  }
  const spanContext = span.spanContext()
  return logger.child({
    traceId: spanContext.traceId,
    spanId: spanContext.spanId
  })
}

export default logger
