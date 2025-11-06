import { orders } from '../data/orders.js'
import { products } from '../data/products.js'
import { toDashboardMetrics } from '../utils/formatters.js'
import { getPaymentSummary } from '../services/paymentService.js'

export const getDashboardMetrics = (req, res) => {
  const metrics = toDashboardMetrics(orders)
  const lowStock = products
    .filter((product) => product.stock < 10)
    .map((product) => ({
      id: product.id,
      name: product.name,
      stock: product.stock
    }))

  res.json({
    metrics,
    lowStock,
    paymentGateway: getPaymentSummary()
  })
}
