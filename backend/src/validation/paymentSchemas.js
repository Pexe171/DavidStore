import { z } from 'zod'

const orderIdSchema = z
  .string({ required_error: 'ID do pedido é obrigatório.' })
  .min(1, { message: 'ID do pedido é obrigatório.' })

const monetarySchema = z.coerce
  .number({ invalid_type_error: 'Valor deve ser numérico.' })
  .min(0.01, { message: 'Valor deve ser maior que zero.' })

const percentageSchema = z.coerce
  .number({ invalid_type_error: 'Pontuação de risco deve ser numérica.' })
  .min(0, { message: 'Pontuação mínima é 0.' })
  .max(1, { message: 'Pontuação máxima é 1.' })

const optionalIsoDate = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) return true
    return !Number.isNaN(Date.parse(value))
  }, { message: 'Data inválida.' })
  .optional()

export const capturePaymentSchema = z.object({
  params: z.object({
    orderId: orderIdSchema
  }),
  body: z.object({
    amount: monetarySchema,
    netAmount: monetarySchema.optional(),
    method: z.string().trim().min(1, { message: 'Método de pagamento é obrigatório.' }).optional(),
    cardBrand: z.string().trim().optional(),
    installments: z.coerce
      .number({ invalid_type_error: 'Parcelas devem ser numéricas.' })
      .int({ message: 'Parcelas devem ser inteiras.' })
      .min(1, { message: 'Mínimo de 1 parcela.' })
      .max(12, { message: 'Máximo de 12 parcelas.' })
      .optional(),
    gatewayFees: z.coerce
      .number({ invalid_type_error: 'Taxa do gateway deve ser numérica.' })
      .min(0, { message: 'Taxa deve ser zero ou positiva.' })
      .optional(),
    riskScore: percentageSchema.optional(),
    settlementStatus: z.string().trim().optional(),
    settlementDate: optionalIsoDate
  })
})

export const failPaymentSchema = z.object({
  params: z.object({
    orderId: orderIdSchema
  }),
  body: z
    .object({
      reason: z.string().trim().optional(),
      chargeback: z.boolean().optional(),
      status: z.enum(['recusado', 'em_analise', 'chargeback']).optional()
    })
    .partial()
})
