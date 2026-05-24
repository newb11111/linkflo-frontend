const express = require('express')
const { q } = require('../lib/db')
const { requireAuth } = require('../middleware/auth')
const router = express.Router()
router.use(requireAuth('promoter'))
router.get('/me', async(req,res)=>{ const r=await q(`SELECT pr.id,pr.name,pr.email,pr.whatsapp,pr.ref_code,m.brand_name merchant_name FROM promoters pr JOIN merchants m ON m.id=pr.merchant_id WHERE pr.id=$1`,[req.user.promoterId]); res.json({promoter:r.rows[0]}) })
router.get('/products', async(req,res)=>{ const r=await q(`SELECT id,name,slug,funnel,created_at FROM products WHERE merchant_id=$1 AND status='active' ORDER BY created_at DESC`,[req.user.merchantId]); res.json({products:r.rows}) })
router.get('/clicks', async(req,res)=>{ const r=await q(`SELECT p.name product_name, p.slug, COUNT(ce.id)::int clicks FROM products p LEFT JOIN click_events ce ON ce.product_id=p.id AND ce.promoter_id=$1 WHERE p.merchant_id=$2 GROUP BY p.name,p.slug ORDER BY clicks DESC`,[req.user.promoterId,req.user.merchantId]); res.json({clicks:r.rows}) })
module.exports=router
