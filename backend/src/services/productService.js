import prisma from '../lib/prisma.js'
import redisClient, { deleteKeysByPattern, isRedisEnabled } from '../lib/redis.js'
import config from '../../config/default.js'
import { NotFoundError } from '../utils/errors.js'
import { decimalToNumber, toDecimal } from '../utils/prisma.js'

const {
  cache: {
    products: { enabled: isProductCacheEnabled, ttlSeconds: productCacheTtl }
  }
} = config

const PRODUCT_CACHE_ENABLED = Boolean(isProductCacheEnabled) && isRedisEnabled()
const PRODUCT_CACHE_TTL_SECONDS = productCacheTtl || 60

const productCacheKey = (id) => `products:item:${id}`
const productListCacheKey = ({ category, search }) =>
  `products:list:${category ?? 'all'}:${search ?? 'all'}`

const cacheResponse = async (key, payload) => {
  if (!PRODUCT_CACHE_ENABLED) {
    return
  }

  try {
    await redisClient.set(key, JSON.stringify(payload), 'EX', PRODUCT_CACHE_TTL_SECONDS)
  } catch (error) {
    // Cache é auxiliar; erros não devem impactar a resposta principal.
  }
}

const readCache = async (key) => {
  if (!PRODUCT_CACHE_ENABLED) {
    return null
  }

  try {
    const cached = await redisClient.get(key)
    return cached ? JSON.parse(cached) : null
  } catch (error) {
    return null
  }
}

const invalidateProductCache = async (id) => {
  if (!PRODUCT_CACHE_ENABLED) {
    return
  }

  try {
    await redisClient.del(productCacheKey(id))
    await deleteKeysByPattern('products:list:*')
  } catch (error) {
    // Falha na limpeza do cache não deve impedir a operação principal.
  }
}

const mapProduct = (product) => ({
  id: product.id,
  name: product.name,
  description: product.description,
  price: decimalToNumber(product.price) ?? 0,
  discount: decimalToNumber(product.discount) ?? 0,
  stock: product.stock,
  reservedStock: product.reservedStock ?? 0,
  availableStock: product.stock - (product.reservedStock ?? 0),
  brand: product.brand,
  rating: decimalToNumber(product.rating),
  highlights: product.highlights,
  images: product.images,
  category: product.categoryId,
  categoryId: product.categoryId,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt
})

export const listProducts = async ({ category, search } = {}) => {
  const cacheKey = productListCacheKey({ category, search })
  const cached = await readCache(cacheKey)
  if (cached) {
    return cached
  }

  const where = {}
  if (category) {
    where.categoryId = category
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ]
  }

  const result = await prisma.product.findMany({
    where,
    orderBy: { name: 'asc' }
  })
  const mapped = result.map(mapProduct)
  await cacheResponse(cacheKey, mapped)
  return mapped
}

export const getProductById = async (id) => {
  const cacheKey = productCacheKey(id)
  const cached = await readCache(cacheKey)
  if (cached) {
    return cached
  }

  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) {
    throw new NotFoundError('Produto não encontrado.')
  }
  const mapped = mapProduct(product)
  await cacheResponse(cacheKey, mapped)
  return mapped
}

export const addProduct = async (payload) => {
  const existing = await prisma.product.findUnique({ where: { id: payload.id } })
  if (existing) {
    const error = new Error('Já existe um produto com esse identificador.')
    error.statusCode = 400
    throw error
  }

  try {
    const created = await prisma.product.create({
      data: {
        id: payload.id,
        name: payload.name,
        description: payload.description,
        price: toDecimal(payload.price),
        discount: toDecimal(payload.discount ?? 0),
        stock: payload.stock,
        brand: payload.brand,
        rating: toDecimal(payload.rating ?? null),
        highlights: payload.highlights ?? [],
        images: payload.images ?? [],
        categoryId: payload.category
      }
    })

    const mapped = mapProduct(created)
    await invalidateProductCache(created.id)
    return mapped
  } catch (error) {
    if (error.code === 'P2003') {
      const friendly = new Error('Categoria informada não existe.')
      friendly.statusCode = 400
      throw friendly
    }
    throw error
  }
}

export const updateProduct = async (id, changes) => {
  const data = {}
  if (changes.name !== undefined) data.name = changes.name
  if (changes.description !== undefined) data.description = changes.description
  if (changes.price !== undefined) data.price = toDecimal(changes.price)
  if (changes.discount !== undefined) data.discount = toDecimal(changes.discount)
  if (changes.stock !== undefined) data.stock = changes.stock
  if (changes.brand !== undefined) data.brand = changes.brand
  if (changes.rating !== undefined) data.rating = toDecimal(changes.rating)
  if (changes.highlights !== undefined) data.highlights = changes.highlights
  if (changes.images !== undefined) data.images = changes.images
  if (changes.category !== undefined) data.categoryId = changes.category

  try {
    const updated = await prisma.product.update({
      where: { id },
      data
    })
    const mapped = mapProduct(updated)
    await invalidateProductCache(id)
    return mapped
  } catch (error) {
    if (error.code === 'P2025') {
      throw new NotFoundError('Produto não encontrado.')
    }
    if (error.code === 'P2003') {
      const friendly = new Error('Categoria informada não existe.')
      friendly.statusCode = 400
      throw friendly
    }
    throw error
  }
}

export const deleteProduct = async (id) => {
  try {
    await prisma.product.delete({ where: { id } })
    await invalidateProductCache(id)
    return true
  } catch (error) {
    if (error.code === 'P2025') {
      throw new NotFoundError('Produto não encontrado.')
    }
    throw error
  }
}
