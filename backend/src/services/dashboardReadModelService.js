import prisma from '../lib/prisma.js'
import { toDashboardMetrics } from '../utils/formatters.js'
import { decimalToNumber } from '../utils/prisma.js'

const SNAPSHOT_TTL_MS = 60 * 1000

const buildSnapshotPayload = (orders, products, paymentSummary) => {
  const metrics = toDashboardMetrics(orders)
  const lowStock = products
    .map((product) => ({
      id: product.id,
      name: product.name,
      stock: product.stock,
      reservedStock: product.reservedStock,
      availableStock: product.stock - product.reservedStock
    }))
    .filter((product) => product.availableStock < 10)
    .map((product) => ({
      id: product.id,
      name: product.name,
      stock: product.availableStock
    }))

  return {
    metrics,
    lowStock,
    paymentGateway: paymentSummary
  }
}

const mapOrderForReadModel = (order) => ({
  ...order,
  total: decimalToNumber(order.total)
})

export const rebuildDashboardSnapshot = async () => {
  const [orders, products, paymentSummary] = await Promise.all([
    prisma.order.findMany({
      include: {
        items: true,
        customer: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.product.findMany({
      orderBy: { name: 'asc' }
    }),
    (async () => {
      const { getPaymentSummary } = await import('./paymentService.js')
      return getPaymentSummary()
    })()
  ])

  const ordersMapped = orders.map(mapOrderForReadModel)
  const payload = buildSnapshotPayload(ordersMapped, products, paymentSummary)

  const snapshot = await prisma.dashboardSnapshot.create({
    data: {
      metrics: payload.metrics,
      lowStock: payload.lowStock,
      paymentSummary: payload.paymentGateway
    }
  })

  return { ...payload, generatedAt: snapshot.generatedAt }
}

export const getDashboardReadModel = async () => {
  const snapshot = await prisma.dashboardSnapshot.findFirst({
    orderBy: { generatedAt: 'desc' }
  })

  if (!snapshot) {
    return rebuildDashboardSnapshot()
  }

  const isExpired = Date.now() - new Date(snapshot.generatedAt).getTime() > SNAPSHOT_TTL_MS
  if (isExpired) {
    return rebuildDashboardSnapshot()
  }

  return {
    metrics: snapshot.metrics,
    lowStock: snapshot.lowStock,
    paymentGateway: snapshot.paymentSummary,
    generatedAt: snapshot.generatedAt
  }
}
