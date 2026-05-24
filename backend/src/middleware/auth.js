
const jwt = require('jsonwebtoken')
const prisma = require('../lib/prisma')

async function requireAuth(req, res, next) {
  const headerToken = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null
  const token = headerToken || req.cookies?.linkflo_token
  if (!token) return res.status(401).json({ message: 'Unauthorized' })
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await prisma.user.findUnique({ where: { id: payload.id }, include: { merchant: true } })
    if (!user) return res.status(401).json({ message: 'User no longer exists' })
    req.user = { id: user.id, email: user.email, role: user.role, merchantId: user.merchant?.id || null }
    return next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' })
    }
    return next()
  }
}

module.exports = { requireAuth, requireRole }
