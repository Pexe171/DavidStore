import { Router } from 'express'
import { getDashboardMetrics } from '../controllers/dashboardController.js'
import { authenticateRequest } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/', authenticateRequest(['admin']), getDashboardMetrics)

export default router
