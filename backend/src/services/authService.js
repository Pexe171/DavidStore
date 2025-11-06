import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import config from '../../config/default.js'
import prisma from '../lib/prisma.js'

export const authenticate = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return null
  }
  const match = await bcrypt.compare(password, user.password)
  if (!match) {
    return null
  }
  const token = jwt.sign({ sub: user.id, role: user.role }, config.security.jwtSecret, {
    expiresIn: config.security.jwtExpiration
  })
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  }
}

export const register = async ({ name, email, password }) => {
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) {
    throw new Error('E-mail já cadastrado.')
  }
  const hash = await bcrypt.hash(password, config.security.saltRounds)
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hash,
      role: 'customer'
    }
  })
  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role
  }
}
