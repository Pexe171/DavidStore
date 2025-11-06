import axios from 'axios'
import {
  AuthResponseSchema,
  CategoryListSchema,
  DashboardSnapshotSchema,
  PaymentOverviewSchema,
  PaymentTransactionsResponseSchema,
  ProductListResponseSchema,
  ProductPresentationSchema,
  SubmitOrderPayloadSchema,
  type AuthResponse as AuthResponseType,
  type Category as CategoryType,
  type DashboardMetrics as DashboardMetricsType,
  type PaymentOverview as PaymentOverviewType,
  type PaymentTransaction as PaymentTransactionType,
  type PaymentTransactionsResponse as PaymentTransactionsResponseType,
  type ProductPresentation,
  type SubmitOrderPayload as SubmitOrderPayloadType
} from '@davidstore/types'

export type Category = CategoryType
export type Product = ProductPresentation
export type DashboardMetrics = DashboardMetricsType
export type PaymentOverview = PaymentOverviewType
export type PaymentTransaction = PaymentTransactionType
export type PaymentTransactionsResponse = PaymentTransactionsResponseType
export type SubmitOrderPayload = SubmitOrderPayloadType
export type AuthResponse = AuthResponseType

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000'
})

export const fetchProducts = async (params: Record<string, unknown> = {}): Promise<Product[]> => {
  const { data } = await api.get('/produtos', { params })
  return ProductListResponseSchema.parse(data)
}

export const fetchProduct = async (id: string): Promise<Product> => {
  const { data } = await api.get(`/produtos/${id}`)
  return ProductPresentationSchema.parse(data)
}

export const fetchCategories = async (): Promise<Category[]> => {
  const { data } = await api.get('/categorias')
  return CategoryListSchema.parse(data)
}

export const authenticate = async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
  const { data } = await api.post('/auth/login', credentials)
  return AuthResponseSchema.parse(data)
}

export const setAuthToken = (token?: string): void => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    return
  }

  delete api.defaults.headers.common.Authorization
}

export const fetchDashboard = async (): Promise<DashboardMetrics> => {
  const { data } = await api.get('/dashboard')
  return DashboardSnapshotSchema.parse(data)
}

export const fetchPaymentOverview = async (): Promise<PaymentOverview> => {
  const { data } = await api.get('/gateway/overview')
  return PaymentOverviewSchema.parse(data)
}

export const fetchPaymentTransactions = async (
  params: Record<string, unknown> = {}
): Promise<PaymentTransactionsResponse> => {
  const { data } = await api.get('/gateway/transacoes', { params })
  return PaymentTransactionsResponseSchema.parse(data)
}

export const submitOrder = async (payload: SubmitOrderPayload): Promise<void> => {
  const body = SubmitOrderPayloadSchema.parse(payload)
  await api.post('/pedidos', body)
}

export default api
