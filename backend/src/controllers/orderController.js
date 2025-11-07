import {
  listOrders,
  getOrderById,
  createOrder,
  updateOrderStatus
} from '../services/orderService.js'
import { ForbiddenError } from '../utils/errors.js'

export const getOrders = async (req, res, next) => {
  try {
    const orders = await listOrders()
    res.json(orders)
  } catch (error) {
    next(error)
  }
}

export const getOrder = async (req, res, next) => {
  try {
    const order = await getOrderById(req.params.id)
    res.json(order)
  } catch (error) {
    next(error)
  }
}

export const postOrder = async (req, res, next) => {
  try {
    const payload = { ...req.body }

    if (req.user?.role === 'customer') {
      const authenticatedCustomerId = req.user.sub

      if (!authenticatedCustomerId) {
        throw new ForbiddenError('Cliente autenticado inválido.')
      }

      const bodyCustomerId = payload.customer?.id

      if (bodyCustomerId && bodyCustomerId !== authenticatedCustomerId) {
        throw new ForbiddenError('Clientes só podem criar pedidos para si mesmos.')
      }

      payload.customer = {
        ...payload.customer,
        id: authenticatedCustomerId
      }
    }

    const order = await createOrder(payload)
    res.status(201).json(order)
  } catch (error) {
    next(error)
  }
}

export const patchOrderStatus = async (req, res, next) => {
  try {
    const order = await updateOrderStatus(req.params.id, req.body.status)
    res.json(order)
  } catch (error) {
    next(error)
  }
}
