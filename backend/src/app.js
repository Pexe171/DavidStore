import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import productRoutes from './routes/productRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import authRoutes from './routes/authRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js'

const app = express()

app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(morgan('dev'))

app.get('/', (req, res) => {
  res.json({
    message: 'Bem-vindo à API da David Store.',
    docs: '/docs',
    version: '1.0.0'
  })
})

app.use('/auth', authRoutes)
app.use('/produtos', productRoutes)
app.use('/categorias', categoryRoutes)
app.use('/pedidos', orderRoutes)
app.use('/dashboard', dashboardRoutes)
app.use('/gateway', paymentRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
