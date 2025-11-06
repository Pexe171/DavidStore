import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import config from '../../config/default.js'
import logger from '../lib/logger.js'

let sdk

const parseHeaders = (raw) => {
  if (!raw) return undefined
  return Object.fromEntries(
    raw
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const [key, value] = entry.split('=').map((part) => part.trim())
        return [key, value]
      })
      .filter(([key, value]) => Boolean(key) && Boolean(value))
  )
}

const buildTraceExporter = () => {
  if (config.observability.tracing.otlpEndpoint) {
    return {
      exporter: new OTLPTraceExporter({
        url: config.observability.tracing.otlpEndpoint,
        headers: parseHeaders(config.observability.tracing.otlpHeaders)
      }),
      type: 'otlp'
    }
  }

  return {
    exporter: new ConsoleSpanExporter(),
    type: 'console'
  }
}

export const startTracing = async () => {
  if (!config.observability.tracing.enabled) {
    logger.info('Tracing distribuído desativado por configuração.')
    return null
  }

  if (sdk) {
    return sdk
  }

  const { exporter, type } = buildTraceExporter()

  sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: config.observability.tracing.serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: config.app.version
    }),
    traceExporter: exporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-http': { enabled: true },
        '@opentelemetry/instrumentation-express': { enabled: true }
      })
    ]
  })

  await sdk.start()
  logger.info({ exporter: type }, 'Tracing distribuído inicializado para a David Store API.')
  return sdk
}

export const stopTracing = async () => {
  if (!sdk) {
    return
  }

  await sdk.shutdown()
  logger.info('Tracing da David Store finalizado com sucesso.')
  sdk = null
}

export default {
  startTracing,
  stopTracing
}
