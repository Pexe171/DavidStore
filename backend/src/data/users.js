import bcrypt from 'bcryptjs'
import config from '../../config/default.js'

const adminPassword = bcrypt.hashSync('admin123', config.security.saltRounds)
const customerPassword = bcrypt.hashSync('cliente123', config.security.saltRounds)

export const users = [
  {
    id: 'admin-001',
    name: 'David Admin',
    email: 'admin@davidstore.com',
    password: adminPassword,
    role: 'admin'
  },
  {
    id: 'user-001',
    name: 'Ana Beatriz',
    email: 'ana.b@davidstore.com',
    password: customerPassword,
    role: 'customer',
    addresses: [
      {
        id: 'addr-001',
        street: 'Av. Paulista, 1000',
        city: 'São Paulo',
        state: 'SP',
        zip: '01310-100'
      }
    ]
  }
]
