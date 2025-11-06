import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { users } from '../data/users.js'
import config from '../../config/default.js'

export const authenticate = async (email, password) => {
  const user = users.find((candidate) => candidate.email === email)
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
  const exists = users.some((candidate) => candidate.email === email)
  if (exists) {
    throw new Error('E-mail já cadastrado.')
  }
  const hash = await bcrypt.hash(password, config.security.saltRounds)
  const newUser = {
    id: `user-${users.length + 1}`,
    name,
    email,
    password: hash,
    role: 'customer',
    addresses: []
  }
  users.push(newUser)
  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role
  }
}
