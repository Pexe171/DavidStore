import {
  listOrders,
  getOrderById,
  createOrder,
  updateOrderStatus
} from '../services/orderService.js'

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
    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado.' })
    }
    res.json(order)
  } catch (error) {
    next(error)
  }
}

export const postOrder = async (req, res, next) => {
  try {
    const order = await createOrder(req.body)
    res.status(201).json(order)
  } catch (error) {
    next(error)
  }
}

export const patchOrderStatus = async (req, res, next) => {
  try {
    const order = await updateOrderStatus(req.params.id, req.body.status)
    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado.' })
    }
    res.json(order)
  } catch (error) {
    next(error)
  }
}
