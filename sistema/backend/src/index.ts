import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import studentRoutes from './routes/studentRoutes.js'
import classRoutes from './routes/classRoutes.js'
import goalRoutes from './routes/goalRoutes.js'
import emailRoutes from './routes/emailRoutes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/students', studentRoutes)
app.use('/classes', classRoutes)
app.use('/goals', goalRoutes)
app.use('/email', emailRoutes)

export default app
