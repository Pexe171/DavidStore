import { validationResult } from 'express-validator'
import {
  listOrders,
  getOrderById,
  createOrder,
  updateOrderStatus
} from '../services/orderService.js'

export const getOrders = (req, res) => {
  res.json(listOrders())
}

export const getOrder = (req, res) => {
  const order = getOrderById(req.params.id)
  if (!order) {
    return res.status(404).json({ message: 'Pedido não encontrado.' })
  }
  res.json(order)
}

export const postOrder = (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  try {
    const order = createOrder(req.body)
    res.status(201).json(order)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const patchOrderStatus = (req, res) => {
  const order = updateOrderStatus(req.params.id, req.body.status)
  if (!order) {
    return res.status(404).json({ message: 'Pedido não encontrado.' })
  }
  res.json(order)
}
