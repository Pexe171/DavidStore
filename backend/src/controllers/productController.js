import { validationResult } from 'express-validator'
import {
  listProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct
} from '../services/productService.js'
import { toPresentationProduct } from '../utils/formatters.js'

export const getProducts = (req, res) => {
  const { categoria: category, busca: search } = req.query
  const result = listProducts({ category, search }).map(toPresentationProduct)
  res.json(result)
}

export const getProduct = (req, res) => {
  const product = getProductById(req.params.id)
  if (!product) {
    return res.status(404).json({ message: 'Produto não encontrado.' })
  }
  res.json(toPresentationProduct(product))
}

export const createProduct = (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  try {
    const payload = addProduct(req.body)
    res.status(201).json(toPresentationProduct(payload))
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const updateProductController = (req, res) => {
  const updated = updateProduct(req.params.id, req.body)
  if (!updated) {
    return res.status(404).json({ message: 'Produto não encontrado.' })
  }
  res.json(toPresentationProduct(updated))
}

export const removeProduct = (req, res) => {
  const removed = deleteProduct(req.params.id)
  if (!removed) {
    return res.status(404).json({ message: 'Produto não encontrado.' })
  }
  res.status(204).send()
}
