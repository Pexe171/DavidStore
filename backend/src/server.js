import dotenv from 'dotenv'
import app from './app.js'
import config from '../config/default.js'

dotenv.config()

const { port, name } = config.app

app.listen(port, () => {
  console.log(`${name} rodando na porta ${port}`)
})
