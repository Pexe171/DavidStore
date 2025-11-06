import { z } from 'zod'

const orderIdSchema = z
  .string({ required_error: 'ID do pedido é obrigatório.' })
  .min(1, { message: 'ID do pedido é obrigatório.' })

const customerSchema = z.object({
  id: z.string().min(1, { message: 'ID do cliente é obrigatório.' }).optional(),
  name: z
    .string({ required_error: 'Nome do cliente é obrigatório.' })
    .min(1, { message: 'Nome do cliente é obrigatório.' }),
  email: z
    .string({ required_error: 'E-mail é obrigatório.' })
    .email({ message: 'E-mail inválido.' })
})

const orderItemSchema = z.object({
  productId: z
    .string({ required_error: 'ID do produto é obrigatório.' })
    .min(1, { message: 'ID do produto é obrigatório.' }),
  quantity: z.coerce
    .number({ invalid_type_error: 'Quantidade deve ser um número.' })
    .int({ message: 'Quantidade deve ser um número inteiro.' })
    .min(1, { message: 'Quantidade deve ser maior que zero.' })
})

const orderStatusSchema = z.enum([
  'processando',
  'enviado',
  'entregue',
  'cancelado',
  'aguardando_pagamento',
  'capturado'
])

export const getOrderSchema = z.object({
  params: z.object({
    id: orderIdSchema
  })
})

export const createOrderSchema = z.object({
  body: z.object({
    customer: customerSchema,
    items: z
      .array(orderItemSchema, {
        required_error: 'Itens do pedido são obrigatórios.'
      })
      .min(1, { message: 'Pedido deve possuir ao menos um item.' })
  })
})

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: orderIdSchema
  }),
  body: z.object({
    status: orderStatusSchema
  })
})
