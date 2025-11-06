import { Router } from 'express'
import {
  getOrders,
  getOrder,
  postOrder,
  patchOrderStatus
} from '../controllers/orderController.js'
import { authenticateRequest } from '../middleware/authMiddleware.js'
import { validateRequest } from '../middleware/validateRequest.js'
import {
  createOrderSchema,
  getOrderSchema,
  updateOrderStatusSchema
} from '../validation/orderSchemas.js'

const router = Router()

router.get('/', authenticateRequest(['admin']), getOrders)
router.get('/:id', authenticateRequest(['admin']), validateRequest(getOrderSchema), getOrder)
router.post('/', authenticateRequest(['customer', 'admin']), validateRequest(createOrderSchema), postOrder)
router.patch(
  '/:id/status',
  authenticateRequest(['admin']),
  validateRequest(updateOrderStatusSchema),
  patchOrderStatus
)

export default router
