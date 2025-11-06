import { decimalToNumber } from './prisma.js'

const toNumber = (value) => {
  const parsed = decimalToNumber(value)
  return parsed === null ? null : parsed
}

export const toPresentationProduct = (product) => {
  const price = toNumber(product.price) ?? 0
  const discount = toNumber(product.discount) ?? 0
  const formatted = {
    ...product,
    price,
    discount,
    rating: toNumber(product.rating),
    finalPrice: Number((price * (1 - discount)).toFixed(2))
  }

  if (product.categoryId && !product.category) {
    formatted.category = product.categoryId
  }

  return formatted
}

export const toDashboardMetrics = (orders) => {
  const totalRevenue = orders.reduce((acc, order) => acc + (toNumber(order.total) ?? 0), 0)
  const totalOrders = orders.length
  const averageTicket = totalOrders ? totalRevenue / totalOrders : 0
  const processingOrders = orders.filter((order) => order.status === 'processando').length
  const deliveredOrders = orders.filter((order) => order.status === 'entregue').length

  return {
    totalRevenue,
    totalOrders,
    averageTicket,
    processingOrders,
    deliveredOrders
  }
}
