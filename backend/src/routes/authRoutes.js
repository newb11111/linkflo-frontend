const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { q } = require('../lib/db')
const router = express.Router()
function sign(payload) { return jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '30d' }) }

router.get('/ping', (req, res) => res.json({ ok: true, service: 'auth', time: new Date().toISOString() }))

router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    return res.json({ token: sign({ role: 'admin', email }), role: 'admin' })
  }
  return res.status(401).json({ error: 'Invalid admin login. Check ADMIN_EMAIL / ADMIN_PASSWORD in backend .env.' })
})

router.post('/merchant/register', async (req, res) => {
  try {
    const { brandName, ownerName, whatsapp, email, password, planId = 'starter' } = req.body || {}
    if (!brandName || !email || !password) return res.status(400).json({ error: 'brandName, email and password are required' })
    const hash = await bcrypt.hash(password, 10)
    const r = await q(`INSERT INTO merchants (brand_name, owner_name, whatsapp, email, password_hash, plan_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id,email,brand_name,plan_id`, [brandName, ownerName || '', whatsapp || '', email, hash, planId])
    const m = r.rows[0]
    res.json({ token: sign({ role: 'merchant', merchantId: m.id }), role: 'merchant', merchant: m })
  } catch (e) {
    if (e.code === '23505') return res.status(400).json({ error: 'Email already used' })
    console.error(e); res.status(500).json({ error: 'Merchant register failed', detail: e.message })
  }
})

router.post('/merchant/login', async (req, res) => {
  try {
    const { email, password } = req.body || {}
    const r = await q(`SELECT * FROM merchants WHERE email=$1 LIMIT 1`, [email])
    const m = r.rows[0]
    if (!m) return res.status(401).json({ error: 'Invalid merchant login' })
    const ok = await bcrypt.compare(password || '', m.password_hash)
    if (!ok) return res.status(401).json({ error: 'Invalid merchant login' })
    res.json({ token: sign({ role: 'merchant', merchantId: m.id }), role: 'merchant' })
  } catch (e) { console.error(e); res.status(500).json({ error: 'Merchant login failed', detail: e.message }) }
})

router.post('/promoter/login', async (req, res) => {
  try {
    const { email, password } = req.body || {}
    const r = await q(`SELECT * FROM promoters WHERE email=$1 LIMIT 1`, [email])
    const p = r.rows[0]
    if (!p) return res.status(401).json({ error: 'Invalid promoter login' })
    const ok = await bcrypt.compare(password || '', p.password_hash)
    if (!ok) return res.status(401).json({ error: 'Invalid promoter login' })
    res.json({ token: sign({ role: 'promoter', promoterId: p.id, merchantId: p.merchant_id }), role: 'promoter' })
  } catch (e) { console.error(e); res.status(500).json({ error: 'Promoter login failed', detail: e.message }) }
})
module.exports = router
