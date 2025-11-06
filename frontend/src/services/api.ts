import axios from 'axios'

export type Category = {
  id: string
  name: string
}

export type Product = {
  id: string
  name: string
  description: string
  brand: string
  price: number
  finalPrice: number
  stock?: number
  images?: string[]
  highlights?: string[]
}

export type DashboardMetrics = {
  metrics: {
    totalRevenue: number
    totalOrders: number
    averageTicket: number
    processingOrders: number
    deliveredOrders: number
  }
  lowStock: Array<{
    id: string
    name: string
    stock: number
  }>
  paymentGateway?: {
    taxaAprovacao?: number
    volumeBruto?: number
  }
}

export type PaymentTransaction = {
  id: string
  method: string
  amount: number
  orderId: string
  status: string
}

export type PaymentOverview = {
  kpis: {
    volumeBruto: number
    volumeLiquido: number
    taxaAprovacao: number
    taxaChargeback: number
    ticketMedioAprovado: number
    tempoMedioLiquidacao: number
  }
  metodos: Array<{
    method: string
    count: number
    percentual: number
    volume: number
  }>
  distribuicaoStatus: Record<string, number>
  alertas: Array<{
    id: string
    customerName: string
    mensagem: string
    orderId: string
    riskScore: number
  }>
  agendaLiquidacoes: Array<{
    id: string
    orderId: string
    expectedAmount: number
    settlementDate: string
  }>
  temposProcessamento: Array<{
    id: string
    orderId: string
    authorizationSeconds?: number
    captureSeconds?: number
  }>
  transacoesRecentes: PaymentTransaction[]
}

export type PaymentTransactionsResponse = {
  transactions?: PaymentTransaction[]
}

export type AuthResponse = {
  token: string
}

export type SubmitOrderPayload = {
  customer: {
    id: string
    name: string
    email: string
    document: string
    address: string
  }
  items: Array<{
    productId: string
    quantity: number
  }>
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000'
})

export const fetchProducts = async (params: Record<string, unknown> = {}): Promise<Product[]> => {
  const { data } = await api.get<Product[]>('/produtos', { params })
  return data
}

export const fetchProduct = async (id: string): Promise<Product> => {
  const { data } = await api.get<Product>(`/produtos/${id}`)
  return data
}

export const fetchCategories = async (): Promise<Category[]> => {
  const { data } = await api.get<Category[]>('/categorias')
  return data
}

export const authenticate = async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/login', credentials)
  return data
}

export const setAuthToken = (token?: string): void => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    return
  }

  delete api.defaults.headers.common.Authorization
}

export const fetchDashboard = async (): Promise<DashboardMetrics> => {
  const { data } = await api.get<DashboardMetrics>('/dashboard')
  return data
}

export const fetchPaymentOverview = async (): Promise<PaymentOverview> => {
  const { data } = await api.get<PaymentOverview>('/gateway/overview')
  return data
}

export const fetchPaymentTransactions = async (
  params: Record<string, unknown> = {}
): Promise<PaymentTransactionsResponse> => {
  const { data } = await api.get<PaymentTransactionsResponse>('/gateway/transacoes', { params })
  return data
}

export const submitOrder = async (payload: SubmitOrderPayload): Promise<void> => {
  await api.post('/pedidos', payload)
}

export default api
