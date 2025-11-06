import messageQueue from '../lib/messageQueue.js'
import EVENTS from './events.js'
import { ensurePaymentIntent, createPaymentIntentRecord } from '../services/paymentService.js'
import { setOrderStatus } from '../services/orderService.js'
import { rebuildDashboardSnapshot } from '../services/dashboardReadModelService.js'

const registerOrderEvents = () => {
  messageQueue.subscribe(EVENTS.ORDER_CREATED, async ({ payload }) => {
    const { order } = payload
    await ensurePaymentIntent({
      orderId: order.id,
      total: order.total,
      customer: order.customer
    })
  })

  messageQueue.subscribe(EVENTS.ORDER_STATUS_UPDATED, async () => {
    await rebuildDashboardSnapshot()
  })
}

const registerPaymentEvents = () => {
  messageQueue.subscribe(EVENTS.PAYMENT_INTENT_CREATED, async ({ payload }) => {
    await createPaymentIntentRecord(payload)
    await rebuildDashboardSnapshot()
  })

  messageQueue.subscribe(EVENTS.PAYMENT_CAPTURED, async ({ payload }) => {
    const { orderId } = payload
    await setOrderStatus(orderId, 'capturado', {
      context: { origin: 'payment-service', event: EVENTS.PAYMENT_CAPTURED }
    })
  })

  messageQueue.subscribe(EVENTS.PAYMENT_FAILED, async ({ payload }) => {
    const { orderId, reason } = payload
    await setOrderStatus(orderId, 'cancelado', {
      context: { origin: 'payment-service', event: EVENTS.PAYMENT_FAILED, reason }
    })
  })
}

export const setupMessaging = () => {
  registerOrderEvents()
  registerPaymentEvents()
}

export default setupMessaging
