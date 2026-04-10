require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')
const connectDB = require('./config/db')

const app = express()

// Connect DB
connectDB()

// Security middleware
app.use(helmet())

// CORS configuration - use environment variables for flexibility
const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL || 'https://the-african-store.vercel.app'
]

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true)
    if(allowedOrigins.indexOf(origin) === -1){
      console.warn(`CORS blocked origin: ${origin}. Allowed: ${allowedOrigins.join(', ')}`)
      const msg = `The CORS policy for this site does not allow access from the specified Origin.`
      return callback(new Error(msg), false)
    }
    return callback(null, true)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}))

// ✅ ADD THIS LINE — handles browser preflight OPTIONS requests
app.options('*', cors())
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { message: 'Too many requests, please try again later.' },
})
app.use('/api/', limiter)

// Body parsers
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser()) // Parse cookies from requests

// Routes
app.use('/api/auth',     require('./routes/auth'))
app.use('/api/products', require('./routes/products'))
app.use('/api/orders',   require('./routes/orders'))
app.use('/api/rfq',      require('./routes/rfq'))
app.use('/api/vendor',   require('./routes/vendor'))
app.use('/api/admin',    require('./routes/admin'))
app.use('/api/upload',   require('./routes/upload'))

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }))

// 404
app.use((req, res) => res.status(404).json({ message: 'Route not found' }))

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal server error',
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 TAS API running on port ${PORT}`))
