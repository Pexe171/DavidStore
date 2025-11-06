import {
  listProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct
} from '../services/productService.js'
import { toPresentationProduct } from '../utils/formatters.js'

export const getProducts = async (req, res, next) => {
  try {
    const { categoria: category, busca: search } = req.query ?? {}
    const products = await listProducts({ category, search })
    res.json(products.map(toPresentationProduct))
  } catch (error) {
    next(error)
  }
}

export const getProduct = async (req, res, next) => {
  try {
    const product = await getProductById(req.params.id)
    res.json(toPresentationProduct(product))
  } catch (error) {
    next(error)
  }
}

export const createProduct = async (req, res, next) => {
  try {
    const payload = await addProduct(req.body)
    res.status(201).json(toPresentationProduct(payload))
  } catch (error) {
    next(error)
  }
}

export const updateProductController = async (req, res, next) => {
  try {
    const updated = await updateProduct(req.params.id, req.body)
    res.json(toPresentationProduct(updated))
  } catch (error) {
    next(error)
  }
}

export const removeProduct = async (req, res, next) => {
  try {
    await deleteProduct(req.params.id)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
