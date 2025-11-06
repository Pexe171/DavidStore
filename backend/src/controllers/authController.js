import { validationResult } from 'express-validator'
import { authenticate, register } from '../services/authService.js'

export const login = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  const { email, password } = req.body
  const authResult = await authenticate(email, password)
  if (!authResult) {
    return res.status(401).json({ message: 'Credenciais inválidas.' })
  }
  res.json(authResult)
}

export const signup = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  try {
    const user = await register(req.body)
    res.status(201).json(user)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}
