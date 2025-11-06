import { Router } from 'express'
import { login, refresh, signup, signout } from '../controllers/authController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { authRateLimiter } from '../middleware/rateLimiter.js'
import { loginSchema, refreshSchema, signupSchema } from '../validation/authSchemas.js'

const router = Router()

router.post('/login', authRateLimiter, validateRequest(loginSchema), login)
router.post('/signup', authRateLimiter, validateRequest(signupSchema), signup)
router.post('/refresh', validateRequest(refreshSchema), refresh)
router.post('/logout', validateRequest(refreshSchema), signout)

export default router
