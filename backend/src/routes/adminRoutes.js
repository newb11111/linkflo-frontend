const express = require('express')
const { q } = require('../lib/db')
const { requireAuth } = require('../middleware/auth')
const router = express.Router()
router.use(requireAuth('admin'))
router.get('/overview', async(req,res)=>{
 const [m,p,pr,c,tx]=await Promise.all([
  q(`SELECT COUNT(*)::int total FROM merchants`), q(`SELECT COUNT(*)::int total FROM products`), q(`SELECT COUNT(*)::int total FROM promoters`), q(`SELECT COUNT(*)::int total FROM click_events`), q(`SELECT * FROM credit_transactions ORDER BY created_at DESC LIMIT 50`)
 ])
 res.json({totals:{merchants:m.rows[0].total,products:p.rows[0].total,promoters:pr.rows[0].total,clicks:c.rows[0].total},creditTransactions:tx.rows})
})
router.get('/merchants', async(req,res)=>{const r=await q(`SELECT id,brand_name,email,plan_id,credit_balance,status,created_at FROM merchants ORDER BY created_at DESC`); res.json({merchants:r.rows})})
module.exports=router
