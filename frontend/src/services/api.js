import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000'
})

export const fetchProducts = async (params = {}) => {
  const { data } = await api.get('/produtos', { params })
  return data
}

export const fetchProduct = async (id) => {
  const { data } = await api.get(`/produtos/${id}`)
  return data
}

export const fetchCategories = async () => {
  const { data } = await api.get('/categorias')
  return data
}

export const authenticate = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials)
  api.defaults.headers.common.Authorization = `Bearer ${data.token}`
  return data
}

export const fetchDashboard = async () => {
  const { data } = await api.get('/dashboard')
  return data
}

export const fetchPaymentOverview = async () => {
  const { data } = await api.get('/gateway/overview')
  return data
}

export const fetchPaymentTransactions = async (params = {}) => {
  const { data } = await api.get('/gateway/transacoes', { params })
  return data
}

export const submitOrder = async (payload) => {
  const { data } = await api.post('/pedidos', payload)
  return data
}

export default api
