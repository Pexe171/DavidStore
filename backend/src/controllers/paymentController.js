import {
  getPaymentOverview,
  listPayments,
  capturePaymentForOrder,
  failPaymentForOrder
} from '../services/paymentService.js'

export const getGatewayOverview = async (req, res, next) => {
  try {
    const overview = await getPaymentOverview()
    res.json(overview)
  } catch (error) {
    next(error)
  }
}

export const getGatewayTransactions = async (req, res, next) => {
  try {
    const { status, method, limit } = req.query
    const transactions = await listPayments({ status, method, limit })
    res.json({ transactions })
  } catch (error) {
    next(error)
  }
}

export const capturePayment = async (req, res, next) => {
  try {
    const payment = await capturePaymentForOrder(req.params.orderId, req.body)
    res.json({ payment })
  } catch (error) {
    next(error)
  }
}

export const failPayment = async (req, res, next) => {
  try {
    const payment = await failPaymentForOrder(req.params.orderId, req.body)
    res.json({ payment })
  } catch (error) {
    next(error)
  }
}
