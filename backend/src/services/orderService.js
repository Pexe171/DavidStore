import { orders } from '../data/orders.js'
import { getProductById } from './productService.js'
import { v4 as uuid } from 'uuid'

const calculateTotal = (items) => items.reduce((acc, item) => acc + item.price * item.quantity, 0)

export const listOrders = () => orders

export const getOrderById = (id) => orders.find((order) => order.id === id)

export const createOrder = ({ customer, items }) => {
  const detailedItems = items.map((item) => {
    const product = getProductById(item.productId)
    if (!product) {
      throw new Error(`Produto ${item.productId} não encontrado.`)
    }
    const unitPrice = product.price * (1 - product.discount)
    return {
      productId: product.id,
      quantity: item.quantity,
      price: unitPrice
    }
  })

  const total = calculateTotal(detailedItems)
  const order = {
    id: `order-${uuid().slice(0, 8)}`,
    customer,
    status: 'processando',
    items: detailedItems,
    total,
    createdAt: new Date().toISOString()
  }
  orders.push(order)
  return order
}

export const updateOrderStatus = (id, status) => {
  const order = getOrderById(id)
  if (!order) return null
  order.status = status
  return order
}
