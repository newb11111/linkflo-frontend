const express = require('express')
const { q } = require('../lib/db')
const { requireAuth } = require('../middleware/auth')
const router = express.Router()
router.use(requireAuth('promoter'))

router.get('/me', async (req, res) => {
  const r = await q(`SELECT p.id,p.name,p.whatsapp,p.ref_code,m.brand_name FROM promoters p JOIN merchants m ON m.id=p.merchant_id WHERE p.id=$1`, [req.user.id])
  res.json(r.rows[0])
})

router.get('/products', async (req, res) => {
  const r = await q(`SELECT p.id,p.name,p.slug,p.images,p.funnel,COUNT(c.id)::int clicks
    FROM products p
    LEFT JOIN click_events c ON c.product_id=p.id AND c.promoter_id=$1
    WHERE p.merchant_id=$2 AND p.status='active'
    GROUP BY p.id ORDER BY p.created_at DESC`, [req.user.id, req.user.merchantId])
  res.json(r.rows)
})

router.get('/analytics', async (req, res) => {
  const total = await q('SELECT COUNT(*)::int clicks FROM click_events WHERE promoter_id=$1', [req.user.id])
  const products = await q(`SELECT p.name,p.slug,COUNT(c.id)::int clicks FROM products p LEFT JOIN click_events c ON c.product_id=p.id AND c.promoter_id=$1 WHERE p.merchant_id=$2 GROUP BY p.id ORDER BY clicks DESC`, [req.user.id, req.user.merchantId])
  res.json({ total_clicks: total.rows[0].clicks, products: products.rows })
})

module.exports = router
