import { v4 as uuid } from 'uuid'
import prisma from '../lib/prisma.js'
import { decimalToNumber, toDecimal } from '../utils/prisma.js'

const mapOrderItem = (item) => ({
  id: item.id,
  productId: item.productId,
  quantity: item.quantity,
  price: decimalToNumber(item.price) ?? 0
})

const mapCustomer = (order) => {
  if (order.customer) {
    return {
      id: order.customer.id,
      name: order.customer.name,
      email: order.customer.email
    }
  }
  return {
    id: order.customerReference ?? order.customerId,
    name: order.customerName,
    email: order.customerEmail
  }
}

const mapOrder = (order) => ({
  id: order.id,
  status: order.status,
  total: decimalToNumber(order.total) ?? 0,
  customer: mapCustomer(order),
  customerReference: order.customerReference,
  items: order.items.map(mapOrderItem),
  createdAt: order.createdAt,
  updatedAt: order.updatedAt
})

export const listOrders = async () => {
  const orders = await prisma.order.findMany({
    include: {
      items: true,
      customer: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
  return orders.map(mapOrder)
}

export const getOrderById = async (id) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      customer: {
        select: { id: true, name: true, email: true }
      }
    }
  })
  return order ? mapOrder(order) : null
}

export const createOrder = async ({ customer, items }) => {
  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error('Pedido deve possuir ao menos um item.')
    error.statusCode = 400
    throw error
  }

  if (!customer?.name || !customer?.email) {
    const error = new Error('Informações do cliente são obrigatórias.')
    error.statusCode = 400
    throw error
  }

  const productIds = items.map((item) => item.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } }
  })

  const productMap = new Map(products.map((product) => [product.id, product]))

  const detailedItems = items.map((item) => {
    const product = productMap.get(item.productId)
    if (!product) {
      const error = new Error(`Produto ${item.productId} não encontrado.`)
      error.statusCode = 400
      throw error
    }
    const price = decimalToNumber(product.price) ?? 0
    const discount = decimalToNumber(product.discount) ?? 0
    const unitPrice = Number((price * (1 - discount)).toFixed(2))
    return {
      productId: product.id,
      quantity: item.quantity,
      price: unitPrice
    }
  })

  const total = detailedItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const orderId = `order-${uuid().slice(0, 8)}`

  let customerId = null
  if (customer?.id) {
    const existing = await prisma.user.findUnique({ where: { id: customer.id } })
    customerId = existing ? existing.id : null
  }

  const created = await prisma.order.create({
    data: {
      id: orderId,
      status: 'processando',
      total: toDecimal(total),
      customerId,
      customerReference: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      items: {
        create: detailedItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: toDecimal(item.price)
        }))
      }
    },
    include: {
      items: true,
      customer: {
        select: { id: true, name: true, email: true }
      }
    }
  })

  return mapOrder(created)
}

export const updateOrderStatus = async (id, status) => {
  try {
    await prisma.order.update({
      where: { id },
      data: { status }
    })
    return getOrderById(id)
  } catch (error) {
    if (error.code === 'P2025') {
      return null
    }
    throw error
  }
}
