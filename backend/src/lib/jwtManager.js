import jwt from 'jsonwebtoken'
import config from '../../config/default.js'
import { getActiveKey, getKeyById } from './jwtKeys.js'
import { UnauthorizedError } from '../utils/errors.js'

const {
  security: {
    jwt: { issuer, audience, accessToken: accessTokenConfig }
  }
} = config

export const signAccessToken = payload => {
  const key = getActiveKey()
  if (!key) {
    throw new UnauthorizedError('Nenhuma chave ativa para assinar tokens.')
  }
  return jwt.sign(payload, key.secret, {
    algorithm: 'HS256',
    expiresIn: accessTokenConfig.expiresInSeconds,
    issuer,
    audience,
    keyid: key.id
  })
}

export const verifyAccessToken = token => {
  const decoded = jwt.decode(token, { complete: true })
  if (!decoded || !decoded.header?.kid) {
    throw new UnauthorizedError('Token sem identificador de chave.')
  }
  const key = getKeyById(decoded.header.kid)
  if (!key) {
    throw new UnauthorizedError('Chave do token não reconhecida ou expirada.')
  }
  try {
    return jwt.verify(token, key.secret, {
      algorithms: ['HS256'],
      issuer,
      audience
    })
  } catch (error) {
    throw new UnauthorizedError('Token expirado ou inválido.')
  }
}
