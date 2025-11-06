import { Router } from 'express'
import { body } from 'express-validator'
import {
  getOrders,
  getOrder,
  postOrder,
  patchOrderStatus
} from '../controllers/orderController.js'
import { authenticateRequest } from '../middleware/authMiddleware.js'

const router = Router()

const orderValidation = [
  body('customer.id').notEmpty(),
  body('customer.name').notEmpty(),
  body('customer.email').isEmail().withMessage('E-mail inválido.'),
  body('items').isArray({ min: 1 }).withMessage('Pedido deve possuir ao menos um item.'),
  body('items.*.productId').notEmpty(),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantidade deve ser maior que zero.')
]

router.get('/', authenticateRequest(['admin']), getOrders)
router.get('/:id', authenticateRequest(['admin']), getOrder)
router.post('/', authenticateRequest(['customer', 'admin']), orderValidation, postOrder)
router.patch('/:id/status', authenticateRequest(['admin']), patchOrderStatus)

export default router
