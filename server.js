const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')

// config .env to ./config/config.env
require('dotenv').config({
  path: './config/config.env'
})

const app = express()

// config for only development
if (process.env.NODE_ENV === 'development') {
  app.use(
    cors({
      origin: process.env.CLIENT_URL
    })
  )
  app.use(morgan('dev'))
  // morgan give information about each request
  // cors allow it to deal with react for localhost at port 3000 without any problem
}

// load all routes
const authRouter = require('./routes/auth.route')

// use routes
app.use('/api/', authRouter)

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Page Not Founded'
  })
})

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})
