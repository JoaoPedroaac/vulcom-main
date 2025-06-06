import dotenv from 'dotenv'
dotenv.config()


import cookieParser from 'cookie-parser'
import express, { json, urlencoded } from 'express'
import logger from 'morgan'
const app = express()
app.disable('x-powered-by')
import cors from 'cors'
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true
}))

app.use(logger('dev'))
app.use(json())
app.use(urlencoded({ extended: false }))
app.use(cookieParser())
import { rateLimit } from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 60 * 1000,    
  limit: 20            
})

app.use(limiter)
import authMiddleware from './middleware/auth.js'
 app.use(authMiddleware)
  import carsRouter from './routes/cars.js'
   app.use('/cars', carsRouter)
    import customersRouter from './routes/customers.js'
     app.use('/customers', customersRouter)
      import usersRouter from './routes/users.js'
       app.use('/users', usersRouter)

export default app
