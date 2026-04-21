import app from './index.js'

const port = process.env.PORT || 3001

app.listen(port, () => {
  console.log(`Backend running on port ${port}`)
})
