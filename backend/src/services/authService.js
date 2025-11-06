import bcrypt from 'bcryptjs'
import { Prisma } from '@prisma/client'
import config from '../../config/default.js'
import prisma from '../lib/prisma.js'
import { issueSessionTokens, refreshSession, revokeRefreshToken } from './tokenService.js'
import { BadRequestError, UnauthorizedError } from '../utils/errors.js'

const {
  security: { saltRounds }
} = config

export const authenticate = async (email, password, context = {}) => {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new UnauthorizedError('Credenciais inválidas.')
  }
  const match = await bcrypt.compare(password, user.password)
  if (!match) {
    throw new UnauthorizedError('Credenciais inválidas.')
  }
  return issueSessionTokens(user, context)
}

export const register = async ({ name, email, password }, context = {}) => {
  try {
    const hash = await bcrypt.hash(password, saltRounds)
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hash,
        role: 'customer'
      }
    })
    return issueSessionTokens(newUser, context)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new BadRequestError('E-mail já cadastrado.')
    }
    throw error
  }
}

export const refreshTokens = async (refreshToken, context = {}) => {
  return refreshSession(refreshToken, context)
}

export const logout = async refreshToken => {
  return revokeRefreshToken(refreshToken)
}
