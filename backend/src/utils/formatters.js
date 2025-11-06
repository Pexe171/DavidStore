export const toPresentationProduct = (product) => ({
  ...product,
  finalPrice: Number((product.price * (1 - product.discount)).toFixed(2))
})

export const toDashboardMetrics = (orders) => {
  const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0)
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
