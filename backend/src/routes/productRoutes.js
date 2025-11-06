import { Router } from 'express'
import { body } from 'express-validator'
import {
  getProducts,
  getProduct,
  createProduct,
  updateProductController,
  removeProduct
} from '../controllers/productController.js'
import { authenticateRequest } from '../middleware/authMiddleware.js'

const router = Router()

const productValidation = [
  body('id').notEmpty().withMessage('ID é obrigatório.'),
  body('name').isString().withMessage('Nome deve ser um texto.'),
  body('price').isFloat({ gt: 0 }).withMessage('Preço deve ser maior que zero.'),
  body('discount').isFloat({ min: 0, max: 1 }).withMessage('Desconto deve estar entre 0 e 1.'),
  body('stock').isInt({ min: 0 }).withMessage('Estoque deve ser um número inteiro positivo.'),
  body('category').notEmpty().withMessage('Categoria é obrigatória.')
]

router.get('/', getProducts)
router.get('/:id', getProduct)
router.post('/', authenticateRequest(['admin']), productValidation, createProduct)
router.put('/:id', authenticateRequest(['admin']), updateProductController)
router.delete('/:id', authenticateRequest(['admin']), removeProduct)

export default router
