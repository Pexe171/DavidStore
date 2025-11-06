import crypto from 'crypto'
import config from '../../config/default.js'
import prisma from '../lib/prisma.js'
import { signAccessToken } from '../lib/jwtManager.js'
import { UnauthorizedError } from '../utils/errors.js'

const {
  security: {
    jwt: {
      accessToken: { expiresInSeconds },
      refreshToken: refreshConfig
    }
  }
} = config

const hashToken = token => crypto.createHash('sha512').update(token).digest('hex')

const buildRefreshTokenPayload = (userId, context = {}) => {
  const token = crypto.randomBytes(64).toString('hex')
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + refreshConfig.expirationMs)
  return {
    token,
    tokenHash,
    expiresAt,
    userId,
    ipAddress: context.ip,
    userAgent: context.userAgent
  }
}

export const issueSessionTokens = async (user, context = {}) => {
  const payload = { sub: user.id, role: user.role }
  const accessToken = signAccessToken(payload)
  const refreshTokenData = buildRefreshTokenPayload(user.id, context)

  await prisma.refreshToken.create({
    data: {
      tokenHash: refreshTokenData.tokenHash,
      userId: refreshTokenData.userId,
      expiresAt: refreshTokenData.expiresAt,
      ipAddress: refreshTokenData.ipAddress,
      userAgent: refreshTokenData.userAgent
    }
  })

  return {
    accessToken,
    expiresIn: expiresInSeconds,
    refreshToken: refreshTokenData.token,
    refreshTokenExpiresAt: refreshTokenData.expiresAt,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  }
}

const findRefreshToken = async token => {
  const tokenHash = hashToken(token)
  return prisma.refreshToken.findUnique({ where: { tokenHash } })
}

const ensureRefreshTokenIsValid = async storedToken => {
  if (!storedToken) {
    throw new UnauthorizedError('Refresh token inválido ou não encontrado.')
  }
  if (storedToken.revokedAt) {
    throw new UnauthorizedError('Refresh token revogado.')
  }
  if (storedToken.expiresAt <= new Date()) {
    throw new UnauthorizedError('Refresh token expirado.')
  }
}

export const refreshSession = async (refreshToken, context = {}) => {
  const storedToken = await findRefreshToken(refreshToken)
  await ensureRefreshTokenIsValid(storedToken)

  const user = await prisma.user.findUnique({ where: { id: storedToken.userId } })
  if (!user) {
    throw new UnauthorizedError('Usuário associado ao token não encontrado.')
  }

  const newRefreshToken = buildRefreshTokenPayload(user.id, context)

  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: {
        revokedAt: new Date(),
        revokedReason: 'rotated',
        replacedByTokenHash: newRefreshToken.tokenHash
      }
    }),
    prisma.refreshToken.create({
      data: {
        tokenHash: newRefreshToken.tokenHash,
        userId: newRefreshToken.userId,
        expiresAt: newRefreshToken.expiresAt,
        ipAddress: newRefreshToken.ipAddress,
        userAgent: newRefreshToken.userAgent
      }
    })
  ])

  return {
    accessToken: signAccessToken({ sub: user.id, role: user.role }),
    expiresIn: expiresInSeconds,
    refreshToken: newRefreshToken.token,
    refreshTokenExpiresAt: newRefreshToken.expiresAt,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  }
}

export const revokeRefreshToken = async (refreshToken, reason = 'logout') => {
  const storedToken = await findRefreshToken(refreshToken)
  if (!storedToken) {
    return
  }
  if (storedToken.revokedAt) {
    return
  }
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: {
      revokedAt: new Date(),
      revokedReason: reason
    }
  })
}

export const getRefreshCookieOptions = () => {
  const secure = process.env.NODE_ENV === 'production'
  return {
    ...refreshConfig.cookieOptions,
    httpOnly: true,
    secure,
    maxAge: refreshConfig.expirationMs
  }
}

export const getRefreshCookieName = () => refreshConfig.cookieName
