import express from 'express'
import cors from 'cors'
import studentRoutes from './routes/studentRoutes.js'

const app = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/students', studentRoutes)

app.listen(port, () => {
  console.log(`Backend running on port ${port}`)
})

export default app
