import { z } from 'zod'

export declare const CategorySchema: z.ZodObject<{
  id: z.ZodString
  name: z.ZodString
}>
export declare const CategoryListSchema: z.ZodArray<typeof CategorySchema>

export declare const ProductIdSchema: z.ZodString

export declare const CreateProductSchema: z.ZodObject<{
  id: z.ZodString
  name: z.ZodString
  description: z.ZodString
  price: z.ZodNumber
  discount: z.ZodOptional<z.ZodNumber>
  stock: z.ZodNumber
  brand: z.ZodString
  rating: z.ZodOptional<z.ZodNumber>
  highlights: z.ZodOptional<z.ZodArray<z.ZodString>>
  images: z.ZodOptional<z.ZodArray<z.ZodString>>
  category: z.ZodString
}>
export declare const UpdateProductSchema: z.ZodEffects<
  z.ZodObject<{
    name: z.ZodString
    description: z.ZodString
    price: z.ZodNumber
    discount: z.ZodOptional<z.ZodNumber>
    stock: z.ZodNumber
    brand: z.ZodString
    rating: z.ZodOptional<z.ZodNumber>
    highlights: z.ZodOptional<z.ZodArray<z.ZodString>>
    images: z.ZodOptional<z.ZodArray<z.ZodString>>
    category: z.ZodString
  }>
>
export declare const ProductPresentationSchema: z.ZodObject<{
  id: z.ZodString
  name: z.ZodString
  description: z.ZodString
  price: z.ZodNumber
  discount: z.ZodOptional<z.ZodNumber>
  stock: z.ZodOptional<z.ZodNumber>
  reservedStock: z.ZodOptional<z.ZodNumber>
  availableStock: z.ZodOptional<z.ZodNumber>
  brand: z.ZodOptional<z.ZodString>
  rating: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
  highlights: z.ZodOptional<z.ZodArray<z.ZodString>>
  images: z.ZodOptional<z.ZodArray<z.ZodString>>
  category: z.ZodOptional<z.ZodString>
  categoryId: z.ZodOptional<z.ZodString>
  finalPrice: z.ZodOptional<z.ZodNumber>
  createdAt: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>
  updatedAt: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>
}>
export declare const ProductListResponseSchema: z.ZodArray<typeof ProductPresentationSchema>
export declare const ListProductsRequestSchema: z.ZodObject<{
  query: z.ZodOptional<
    z.ZodObject<{
      categoria: z.ZodOptional<z.ZodString>
      busca: z.ZodOptional<z.ZodString>
    }>
  >
}>
export declare const GetProductRequestSchema: z.ZodObject<{
  params: z.ZodObject<{
    id: z.ZodString
  }>
}>
export declare const CreateProductRequestSchema: z.ZodObject<{
  body: typeof CreateProductSchema
}>
export declare const UpdateProductRequestSchema: z.ZodObject<{
  params: z.ZodObject<{
    id: z.ZodString
  }>
  body: typeof UpdateProductSchema
}>
export declare const DeleteProductRequestSchema: z.ZodObject<{
  params: z.ZodObject<{
    id: z.ZodString
  }>
}>

export declare const OrderIdSchema: z.ZodString
export declare const OrderStatusSchema: z.ZodEnum<[
  'processando',
  'enviado',
  'entregue',
  'cancelado',
  'aguardando_pagamento',
  'capturado'
]>
export declare const OrderCustomerSchema: z.ZodObject<{
  id: z.ZodOptional<z.ZodString>
  name: z.ZodString
  email: z.ZodString
  document: z.ZodOptional<z.ZodString>
  address: z.ZodOptional<z.ZodString>
}>
export declare const OrderItemInputSchema: z.ZodObject<{
  productId: z.ZodString
  quantity: z.ZodNumber
}>
export declare const OrderItemSchema: z.ZodObject<{
  productId: z.ZodString
  quantity: z.ZodNumber
  price: z.ZodNumber
  id: z.ZodOptional<z.ZodString>
}>
export declare const OrderItemListSchema: z.ZodArray<typeof OrderItemSchema>
export declare const CreateOrderBodySchema: z.ZodObject<{
  customer: typeof OrderCustomerSchema
  items: z.ZodArray<typeof OrderItemInputSchema>
}>
export declare const CreateOrderRequestSchema: z.ZodObject<{
  body: typeof CreateOrderBodySchema
}>
export declare const UpdateOrderStatusRequestSchema: z.ZodObject<{
  params: z.ZodObject<{
    id: z.ZodString
  }>
  body: z.ZodObject<{
    status: typeof OrderStatusSchema
  }>
}>
export declare const GetOrderRequestSchema: z.ZodObject<{
  params: z.ZodObject<{
    id: z.ZodString
  }>
}>
export declare const OrderSchema: z.ZodObject<{
  id: z.ZodString
  status: typeof OrderStatusSchema
  total: z.ZodNumber
  customer: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>
    name: z.ZodString
    email: z.ZodString
    document: z.ZodOptional<z.ZodString>
    address: z.ZodOptional<z.ZodString>
  }>
  customerReference: z.ZodOptional<z.ZodNullable<z.ZodString>>
  items: typeof OrderItemListSchema
  createdAt: z.ZodUnion<[z.ZodString, z.ZodDate]>
  updatedAt: z.ZodUnion<[z.ZodString, z.ZodDate]>
}>
export declare const OrderListSchema: z.ZodArray<typeof OrderSchema>
export declare const SubmitOrderPayloadSchema: typeof CreateOrderBodySchema

export declare const AuthResponseSchema: z.ZodObject<{
  token: z.ZodString
}>

export declare const PaymentTransactionSchema: z.ZodObject<{
  id: z.ZodString
  orderId: z.ZodString
  method: z.ZodString
  cardBrand: z.ZodOptional<z.ZodNullable<z.ZodString>>
  status: z.ZodString
  amount: z.ZodNumber
  netAmount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
  installments: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
  gatewayFees: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
  riskScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
  chargeback: z.ZodOptional<z.ZodBoolean>
  settlementDate: z.ZodOptional<z.ZodNullable<z.ZodUnion<[z.ZodString, z.ZodDate]>>>
  settlementStatus: z.ZodOptional<z.ZodNullable<z.ZodString>>
  customerName: z.ZodOptional<z.ZodString>
  createdAt: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>
  authorizedAt: z.ZodOptional<z.ZodNullable<z.ZodUnion<[z.ZodString, z.ZodDate]>>>
  capturedAt: z.ZodOptional<z.ZodNullable<z.ZodUnion<[z.ZodString, z.ZodDate]>>>
}>
export declare const PaymentTransactionsResponseSchema: z.ZodObject<{
  transactions: z.ZodOptional<z.ZodArray<typeof PaymentTransactionSchema>>
}>
export declare const PaymentAlertSchema: z.ZodObject<{
  id: z.ZodString
  orderId: z.ZodString
  customerName: z.ZodString
  mensagem: z.ZodString
  status: z.ZodOptional<z.ZodString>
  riskScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
  chargeback: z.ZodOptional<z.ZodBoolean>
}>
export declare const PaymentScheduleItemSchema: z.ZodObject<{
  id: z.ZodString
  orderId: z.ZodString
  expectedAmount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
  settlementDate: z.ZodOptional<z.ZodNullable<z.ZodUnion<[z.ZodString, z.ZodDate]>>>
  settlementStatus: z.ZodOptional<z.ZodNullable<z.ZodString>>
}>
export declare const PaymentProcessingTimelineSchema: z.ZodObject<{
  id: z.ZodString
  orderId: z.ZodString
  authorizationSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
  captureSeconds: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
}>
export declare const PaymentOverviewSchema: z.ZodObject<{
  kpis: z.ZodObject<{
    volumeBruto: z.ZodNumber
    volumeLiquido: z.ZodNumber
    taxaAprovacao: z.ZodNumber
    taxaChargeback: z.ZodNumber
    ticketMedioAprovado: z.ZodNumber
    tempoMedioLiquidacao: z.ZodNumber
  }>
  metodos: z.ZodArray<
    z.ZodObject<{
      method: z.ZodString
      count: z.ZodNumber
      percentual: z.ZodNumber
      volume: z.ZodNumber
    }>
  >
  distribuicaoStatus: z.ZodRecord<z.ZodNumber>
  alertas: z.ZodArray<typeof PaymentAlertSchema>
  agendaLiquidacoes: z.ZodArray<typeof PaymentScheduleItemSchema>
  temposProcessamento: z.ZodArray<typeof PaymentProcessingTimelineSchema>
  transacoesRecentes: z.ZodArray<typeof PaymentTransactionSchema>
}>
export declare const PaymentSummarySchema: z.ZodObject<{
  volumeBruto: z.ZodNumber
  taxaAprovacao: z.ZodNumber
  taxaChargeback: z.ZodNumber
  liquidacoesPendentes: z.ZodNumber
  alertasCriticos: z.ZodNumber
}>

export declare const DashboardMetricsSchema: z.ZodObject<{
  metrics: z.ZodObject<{
    totalRevenue: z.ZodNumber
    totalOrders: z.ZodNumber
    averageTicket: z.ZodNumber
    processingOrders: z.ZodNumber
    awaitingPayment: z.ZodNumber
    deliveredOrders: z.ZodNumber
  }>
  lowStock: z.ZodArray<
    z.ZodObject<{
      id: z.ZodString
      name: z.ZodString
      stock: z.ZodNumber
    }>
  >
  paymentGateway: z.ZodOptional<typeof PaymentSummarySchema>
  generatedAt: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>
}>
export declare const DashboardListResponseSchema: z.ZodArray<typeof DashboardMetricsSchema>
export declare const DashboardSnapshotSchema: typeof DashboardMetricsSchema

export type Category = z.infer<typeof CategorySchema>
export type ProductInput = z.infer<typeof CreateProductSchema>
export type ProductUpdateInput = z.infer<typeof UpdateProductSchema>
export type ProductPresentation = z.infer<typeof ProductPresentationSchema>
export type Order = z.infer<typeof OrderSchema>
export type OrderItem = z.infer<typeof OrderItemSchema>
export type OrderItemInput = z.infer<typeof OrderItemInputSchema>
export type SubmitOrderPayload = z.infer<typeof SubmitOrderPayloadSchema>
export type DashboardMetrics = z.infer<typeof DashboardMetricsSchema>
export type PaymentOverview = z.infer<typeof PaymentOverviewSchema>
export type PaymentTransactionsResponse = z.infer<typeof PaymentTransactionsResponseSchema>
export type PaymentTransaction = z.infer<typeof PaymentTransactionSchema>
export type AuthResponse = z.infer<typeof AuthResponseSchema>

export default {
  CategorySchema,
  CategoryListSchema,
  ProductIdSchema,
  CreateProductSchema,
  UpdateProductSchema,
  ProductPresentationSchema,
  ProductListResponseSchema,
  ListProductsRequestSchema,
  GetProductRequestSchema,
  CreateProductRequestSchema,
  UpdateProductRequestSchema,
  DeleteProductRequestSchema,
  OrderIdSchema,
  OrderStatusSchema,
  OrderCustomerSchema,
  OrderItemInputSchema,
  OrderItemSchema,
  OrderItemListSchema,
  CreateOrderBodySchema,
  CreateOrderRequestSchema,
  UpdateOrderStatusRequestSchema,
  GetOrderRequestSchema,
  OrderSchema,
  OrderListSchema,
  SubmitOrderPayloadSchema,
  AuthResponseSchema,
  PaymentTransactionSchema,
  PaymentTransactionsResponseSchema,
  PaymentAlertSchema,
  PaymentScheduleItemSchema,
  PaymentProcessingTimelineSchema,
  PaymentOverviewSchema,
  PaymentSummarySchema,
  DashboardMetricsSchema,
  DashboardListResponseSchema,
  DashboardSnapshotSchema
}
