import { Router } from 'express'
import { authenticateRequest } from '../middleware/authMiddleware.js'
import {
  getGatewayOverview,
  getGatewayTransactions,
  capturePayment,
  failPayment
} from '../controllers/paymentController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { capturePaymentSchema, failPaymentSchema } from '../validation/paymentSchemas.js'

const router = Router()

router.use(authenticateRequest(['admin']))

router.get('/overview', getGatewayOverview)
router.get('/transacoes', getGatewayTransactions)
router.patch('/transacoes/:orderId/capturar', validateRequest(capturePaymentSchema), capturePayment)
router.patch('/transacoes/:orderId/recusar', validateRequest(failPaymentSchema), failPayment)

export default router
