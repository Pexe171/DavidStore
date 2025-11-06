import { getPaymentOverview, listPayments } from '../services/paymentService.js'

export const getGatewayOverview = (req, res) => {
  const overview = getPaymentOverview()
  res.json(overview)
}

export const getGatewayTransactions = (req, res) => {
  const { status, method, limit } = req.query
  const transactions = listPayments({ status, method, limit })
  res.json({ transactions })
}
