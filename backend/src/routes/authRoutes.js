import { Router } from 'express'
import { body } from 'express-validator'
import { login, signup } from '../controllers/authController.js'

const router = Router()

const loginValidation = [
  body('email').isEmail().withMessage('E-mail inválido.'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres.')
]

const signupValidation = [
  body('name').notEmpty().withMessage('Nome é obrigatório.'),
  body('email').isEmail().withMessage('E-mail inválido.'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres.')
]

router.post('/login', loginValidation, login)
router.post('/signup', signupValidation, signup)

export default router
