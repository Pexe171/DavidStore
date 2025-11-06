import { z } from 'zod'

const emailSchema = z
  .string({ required_error: 'E-mail é obrigatório.' })
  .email({ message: 'E-mail inválido.' })

const passwordSchema = z
  .string({ required_error: 'Senha é obrigatória.' })
  .min(6, { message: 'Senha deve ter no mínimo 6 caracteres.' })

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema
  })
})

export const signupSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Nome é obrigatório.' })
      .min(2, { message: 'Nome deve ter ao menos 2 caracteres.' }),
    email: emailSchema,
    password: passwordSchema
  })
})

export const refreshSchema = z.object({
  body: z
    .object({
      refreshToken: z.string().min(10, { message: 'Refresh token inválido.' }).optional()
    })
    .optional()
})
