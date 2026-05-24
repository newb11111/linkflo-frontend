function list(value) {
  return String(value || '')
    .split(',')
    .map(x => x.trim())
    .filter(Boolean)
}

function getAllowedOrigins() {
  const defaults = ['http://localhost:3000']
  return Array.from(new Set([...defaults, ...list(process.env.FRONTEND_URL)]))
}

function getPublicBaseUrl() {
  return (process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, '')
}

function requireProductionEnv() {
  const missing = []
  if (!process.env.JWT_SECRET) missing.push('JWT_SECRET')
  if (!process.env.DATABASE_URL) missing.push('DATABASE_URL')
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.FRONTEND_URL) missing.push('FRONTEND_URL')
    if (!process.env.PUBLIC_BASE_URL) missing.push('PUBLIC_BASE_URL')
  }
  if (missing.length) throw new Error(`Missing required env: ${missing.join(', ')}`)
}

module.exports = { getAllowedOrigins, getPublicBaseUrl, requireProductionEnv }
