import { Router } from 'express'
import { authenticateRequest } from '../middleware/authMiddleware.js'
import { getGatewayOverview, getGatewayTransactions } from '../controllers/paymentController.js'

const router = Router()

router.use(authenticateRequest(['admin']))

router.get('/overview', getGatewayOverview)
router.get('/transacoes', getGatewayTransactions)

export default router
