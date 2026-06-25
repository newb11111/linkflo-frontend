require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const morgan = require('morgan')
const path = require('path')
const { notFound, errorHandler } = require('./middleware/error')
const { getAllowedOrigins, requireProductionEnv } = require('./lib/env')

requireProductionEnv()

const app = express()
app.set('trust proxy', 1)
const allowedOrigins = getAllowedOrigins()

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    return cb(new Error(`CORS blocked for origin: ${origin}`))
  },
  credentials: true
}))
app.use(express.json({ limit: '1mb' }))
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))
app.use(express.urlencoded({ extended: false, limit: '1mb' }))
app.use(cookieParser())
app.use(morgan('dev'))
app.use(rateLimit({ windowMs: 60 * 1000, limit: 180, standardHeaders: true, legacyHeaders: false }))

app.get('/', (req, res) => res.json({ message: 'LinkFlo API running', version: 'light-funnel-i18n-credit-ready' }))
app.get('/api/health', (req, res) => res.json({ ok: true, api: 'running', env: process.env.NODE_ENV || 'development' }))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/merchant', require('./routes/merchant'))
app.use('/api/member', require('./routes/member'))
app.use('/api/public', require('./routes/public'))
app.use('/api/upload', require('./routes/upload'))
app.use('/api/billing', require('./routes/billing'))
app.use(notFound)
app.use(errorHandler)

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`LinkFlo backend running on ${port}`))
