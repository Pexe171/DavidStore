import { z } from 'zod'

const productIdSchema = z
  .string({ required_error: 'ID do produto é obrigatório.' })
  .min(1, { message: 'ID do produto é obrigatório.' })

const monetarySchema = z.coerce
  .number({ invalid_type_error: 'Valor deve ser numérico.' })
  .refine((value) => Number.isFinite(value), { message: 'Valor deve ser numérico.' })

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

const baseProductSchema = {
  name: z
    .string({ required_error: 'Nome é obrigatório.' })
    .min(1, { message: 'Nome é obrigatório.' }),
  description: z
    .string({ required_error: 'Descrição é obrigatória.' })
    .min(1, { message: 'Descrição é obrigatória.' }),
  price: monetarySchema.min(0.01, { message: 'Preço deve ser maior que zero.' }),
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

export const listProductsSchema = z.object({
  query: z
    .object({
      categoria: z.string().min(1, { message: 'Categoria inválida.' }).optional(),
      busca: z.string().min(1, { message: 'Busca deve conter ao menos um caractere.' }).optional()
    })
    .optional()
})

export const getProductSchema = z.object({
  params: z.object({
    id: productIdSchema
  })
})

export const createProductSchema = z.object({
  body: z.object({
    id: productIdSchema,
    ...baseProductSchema
  })
})

export const updateProductSchema = z.object({
  params: z.object({
    id: productIdSchema
  }),
  body: z
    .object({
      ...baseProductSchema,
      id: z.never()
    })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: 'É necessário informar ao menos um campo para atualização.'
    })
})

export const deleteProductSchema = z.object({
  params: z.object({
    id: productIdSchema
  })
})
