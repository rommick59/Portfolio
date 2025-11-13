import path from 'path'
import express from 'express'

// This file is provided as TypeScript source. The server will run `index.js` in production.
// It mirrors the runtime behavior of index.js for clarity.

const app = express()
const distPath = path.join(__dirname, 'node-vue-prisma', 'frontend', 'dist')
app.use(express.static(distPath))

// We require the backend app using CommonJS to avoid TS compilation here
const backendApp = require('./node-vue-prisma/backend/src/index.js')
app.use('/', backendApp)

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

const port = process.env.PORT || 4000
app.listen(port, () => console.log(`Fullstack app running at http://localhost:${port}`))
