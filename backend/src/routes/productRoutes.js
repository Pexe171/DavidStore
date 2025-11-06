import { Router } from 'express'
import {
  getProducts,
  getProduct,
  createProduct,
  updateProductController,
  removeProduct
} from '../controllers/productController.js'
import { authenticateRequest } from '../middleware/authMiddleware.js'
import { validateRequest } from '../middleware/validateRequest.js'
import {
  createProductSchema,
  deleteProductSchema,
  getProductSchema,
  listProductsSchema,
  updateProductSchema
} from '../validation/productSchemas.js'

const router = Router()

router.get('/', validateRequest(listProductsSchema), getProducts)
router.get('/:id', validateRequest(getProductSchema), getProduct)
router.post('/', authenticateRequest(['admin']), validateRequest(createProductSchema), createProduct)
router.put('/:id', authenticateRequest(['admin']), validateRequest(updateProductSchema), updateProductController)
router.delete('/:id', authenticateRequest(['admin']), validateRequest(deleteProductSchema), removeProduct)

export default router
