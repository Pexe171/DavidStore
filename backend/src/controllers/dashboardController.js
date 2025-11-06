import { toDashboardMetrics } from '../utils/formatters.js'
import { listOrders } from '../services/orderService.js'
import { listProducts } from '../services/productService.js'
import { getPaymentSummary } from '../services/paymentService.js'

export const getDashboardMetrics = async (req, res, next) => {
  try {
    const [orders, products, paymentGateway] = await Promise.all([
      listOrders(),
      listProducts(),
      getPaymentSummary()
    ])

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
      paymentGateway
    })
  } catch (error) {
    next(error)
  }
}
