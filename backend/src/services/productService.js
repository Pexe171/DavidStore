import { products } from '../data/products.js'

export const listProducts = ({ category, search }) => {
  let filtered = [...products]
  if (category) {
    filtered = filtered.filter((product) => product.category === category)
  }
  if (search) {
    const term = search.toLowerCase()
    filtered = filtered.filter((product) =>
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term)
    )
  }
  return filtered
}

export const getProductById = (id) => products.find((product) => product.id === id)

export const addProduct = (payload) => {
  const exists = products.find((product) => product.id === payload.id)
  if (exists) {
    throw new Error('Já existe um produto com esse identificador.')
  }
  products.push(payload)
  return payload
}

export const updateProduct = (id, changes) => {
  const index = products.findIndex((product) => product.id === id)
  if (index === -1) return null
  products[index] = { ...products[index], ...changes }
  return products[index]
}

export const deleteProduct = (id) => {
  const index = products.findIndex((product) => product.id === id)
  if (index === -1) return false
  products.splice(index, 1)
  return true
}
