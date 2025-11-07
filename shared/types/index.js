import { z } from 'zod'

export const CategorySchema = z.object({
  id: z.string({ required_error: 'ID da categoria é obrigatório.' }).min(1, {
    message: 'ID da categoria é obrigatório.'
  }),
  name: z.string({ required_error: 'Nome da categoria é obrigatório.' }).min(1, {
    message: 'Nome da categoria é obrigatório.'
  })
})

export const CategoryListSchema = z.array(CategorySchema)

export const ProductIdSchema = z
  .string({ required_error: 'ID do produto é obrigatório.' })
  .min(1, { message: 'ID do produto é obrigatório.' })

const monetarySchema = z.coerce
  .number({ invalid_type_error: 'Valor deve ser numérico.' })
  .refine((value) => Number.isFinite(value), { message: 'Valor deve ser numérico.' })

const positiveMonetarySchema = monetarySchema.refine((value) => value >= 0.01, {
  message: 'Preço deve ser maior que zero.'
})

const percentageSchema = z.coerce
  .number({ invalid_type_error: 'Valor deve ser numérico.' })
  .min(0, { message: 'Valor deve ser maior ou igual a zero.' })
  .max(1, { message: 'Valor deve ser no máximo 1.' })

const optionalPercentageSchema = percentageSchema.optional()

const stockSchema = z.coerce
  .number({ invalid_type_error: 'Estoque deve ser numérico.' })
  .int({ message: 'Estoque deve ser um número inteiro.' })
  .min(0, { message: 'Estoque deve ser maior ou igual a zero.' })

const ratingSchema = z.coerce
  .number({ invalid_type_error: 'Avaliação deve ser numérica.' })
  .min(0, { message: 'Avaliação deve ser maior ou igual a zero.' })
  .max(5, { message: 'Avaliação deve ser no máximo 5.' })

const productBaseSchema = {
  name: z
    .string({ required_error: 'Nome é obrigatório.' })
    .min(1, { message: 'Nome é obrigatório.' }),
  description: z
    .string({ required_error: 'Descrição é obrigatória.' })
    .min(1, { message: 'Descrição é obrigatória.' }),
  price: positiveMonetarySchema,
  discount: optionalPercentageSchema,
  stock: stockSchema,
  brand: z
    .string({ required_error: 'Marca é obrigatória.' })
    .min(1, { message: 'Marca é obrigatória.' }),
  rating: ratingSchema.optional(),
  highlights: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  category: z
    .string({ required_error: 'Categoria é obrigatória.' })
    .min(1, { message: 'Categoria é obrigatória.' })
}

export const CreateProductSchema = z.object({
  id: ProductIdSchema,
  ...productBaseSchema
})

export const UpdateProductSchema = z
  .object({
    ...productBaseSchema
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'É necessário informar ao menos um campo para atualização.'
  })

export const ProductPresentationSchema = z.object({
  id: ProductIdSchema,
  name: z.string(),
  description: z.string(),
  price: z.number(),
  discount: z.number().optional(),
  stock: z.number().optional(),
  reservedStock: z.number().optional(),
  availableStock: z.number().optional(),
  brand: z.string().optional(),
  rating: z.number().nullable().optional(),
  highlights: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  category: z.string().optional(),
  categoryId: z.string().optional(),
  finalPrice: z.number().optional(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional()
})

export const ProductListResponseSchema = z.array(ProductPresentationSchema)

export const ListProductsRequestSchema = z.object({
  query: z
    .object({
      categoria: z.string().min(1, { message: 'Categoria inválida.' }).optional(),
      busca: z.string().min(1, { message: 'Busca deve conter ao menos um caractere.' }).optional()
    })
    .optional()
})

export const GetProductRequestSchema = z.object({
  params: z.object({
    id: ProductIdSchema
  })
})

export const CreateProductRequestSchema = z.object({
  body: CreateProductSchema
})

export const UpdateProductRequestSchema = z.object({
  params: z.object({
    id: ProductIdSchema
  }),
  body: UpdateProductSchema
})

export const DeleteProductRequestSchema = z.object({
  params: z.object({
    id: ProductIdSchema
  })
})

export const OrderIdSchema = z
  .string({ required_error: 'ID do pedido é obrigatório.' })
  .min(1, { message: 'ID do pedido é obrigatório.' })

export const OrderStatusSchema = z.enum([
  'processando',
  'enviado',
  'entregue',
  'cancelado',
  'aguardando_pagamento',
  'capturado'
])

export const OrderCustomerSchema = z.object({
  id: z.string().min(1, { message: 'ID do cliente é obrigatório.' }).optional(),
  name: z
    .string({ required_error: 'Nome do cliente é obrigatório.' })
    .min(1, { message: 'Nome do cliente é obrigatório.' }),
  email: z
    .string({ required_error: 'E-mail é obrigatório.' })
    .email({ message: 'E-mail inválido.' }),
  document: z.string().min(1, { message: 'Documento é obrigatório.' }).optional(),
  address: z.string().min(1, { message: 'Endereço é obrigatório.' }).optional()
})

export const OrderItemInputSchema = z.object({
  productId: z
    .string({ required_error: 'ID do produto é obrigatório.' })
    .min(1, { message: 'ID do produto é obrigatório.' }),
  quantity: z.coerce
    .number({ invalid_type_error: 'Quantidade deve ser um número.' })
    .int({ message: 'Quantidade deve ser um número inteiro.' })
    .min(1, { message: 'Quantidade deve ser maior que zero.' })
})

export const OrderItemSchema = OrderItemInputSchema.extend({
  price: z.number(),
  id: z.string().optional()
})

export const OrderItemListSchema = z.array(OrderItemSchema)

export const CreateOrderBodySchema = z.object({
  customer: OrderCustomerSchema,
  items: z
    .array(OrderItemInputSchema, {
      required_error: 'Itens do pedido são obrigatórios.'
    })
    .min(1, { message: 'Pedido deve possuir ao menos um item.' })
})

export const CreateOrderRequestSchema = z.object({
  body: CreateOrderBodySchema
})

export const UpdateOrderStatusRequestSchema = z.object({
  params: z.object({
    id: OrderIdSchema
  }),
  body: z.object({
    status: OrderStatusSchema
  })
})

export const GetOrderRequestSchema = z.object({
  params: z.object({
    id: OrderIdSchema
  })
})

export const OrderSchema = z.object({
  id: OrderIdSchema,
  status: OrderStatusSchema,
  total: z.number(),
  customer: OrderCustomerSchema.extend({
    id: z.string().optional()
  }),
  customerReference: z.string().nullable().optional(),
  items: OrderItemListSchema,
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()])
})

export const OrderListSchema = z.array(OrderSchema)

export const SubmitOrderPayloadSchema = CreateOrderBodySchema

export const AuthResponseSchema = z.object({
  token: z.string()
})

export const PaymentTransactionSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  method: z.string(),
  cardBrand: z.string().nullable().optional(),
  status: z.string(),
  amount: z.number(),
  netAmount: z.number().nullable().optional(),
  installments: z.number().nullable().optional(),
  gatewayFees: z.number().nullable().optional(),
  riskScore: z.number().nullable().optional(),
  chargeback: z.boolean().optional(),
  settlementDate: z.union([z.string(), z.date()]).nullable().optional(),
  settlementStatus: z.string().nullable().optional(),
  customerName: z.string().optional(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  authorizedAt: z.union([z.string(), z.date()]).nullable().optional(),
  capturedAt: z.union([z.string(), z.date()]).nullable().optional()
})

export const PaymentTransactionsResponseSchema = z.object({
  transactions: z.array(PaymentTransactionSchema).optional()
})

export const PaymentAlertSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  customerName: z.string(),
  mensagem: z.string(),
  status: z.string().optional(),
  riskScore: z.number().nullable().optional(),
  chargeback: z.boolean().optional()
})

export const PaymentScheduleItemSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  expectedAmount: z.number().nullable().optional(),
  settlementDate: z.union([z.string(), z.date()]).nullable().optional(),
  settlementStatus: z.string().nullable().optional()
})

export const PaymentProcessingTimelineSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  authorizationSeconds: z.number().nullable().optional(),
  captureSeconds: z.number().nullable().optional()
})

export const PaymentOverviewSchema = z.object({
  kpis: z.object({
    volumeBruto: z.number(),
    volumeLiquido: z.number(),
    taxaAprovacao: z.number(),
    taxaChargeback: z.number(),
    ticketMedioAprovado: z.number(),
    tempoMedioLiquidacao: z.number()
  }),
  metodos: z.array(
    z.object({
      method: z.string(),
      count: z.number(),
      percentual: z.number(),
      volume: z.number()
    })
  ),
  distribuicaoStatus: z.record(z.number()),
  alertas: z.array(PaymentAlertSchema),
  agendaLiquidacoes: z.array(PaymentScheduleItemSchema),
  temposProcessamento: z.array(PaymentProcessingTimelineSchema),
  transacoesRecentes: z.array(PaymentTransactionSchema)
})

export const PaymentSummarySchema = z.object({
  volumeBruto: z.number(),
  taxaAprovacao: z.number(),
  taxaChargeback: z.number(),
  liquidacoesPendentes: z.number(),
  alertasCriticos: z.number()
})

export const DashboardMetricsSchema = z.object({
  metrics: z.object({
    totalRevenue: z.number(),
    totalOrders: z.number(),
    averageTicket: z.number(),
    processingOrders: z.number(),
    awaitingPayment: z.number(),
    deliveredOrders: z.number()
  }),
  lowStock: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      stock: z.number()
    })
  ),
  paymentGateway: PaymentSummarySchema.optional(),
  generatedAt: z.union([z.string(), z.date()]).optional()
})

export const DashboardListResponseSchema = z.array(DashboardMetricsSchema)

export const DashboardSnapshotSchema = DashboardMetricsSchema

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
