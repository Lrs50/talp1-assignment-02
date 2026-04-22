import express from 'express'
import cors from 'cors'
import studentRoutes from './routes/studentRoutes.js'
import assessmentRoutes from './routes/assessmentRoutes.js'
import classRoutes from './routes/classRoutes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/students', studentRoutes)
app.use('/assessments', assessmentRoutes)
app.use('/classes', classRoutes)

export default app
