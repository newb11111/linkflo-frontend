const express = require('express')
const { q } = require('../lib/db')
const router = express.Router()
router.get('/funnel/:slug', async(req,res)=>{
 try{
  const { slug } = req.params; const ref = String(req.query.ref || '').trim()
  const pr = await q(`SELECT p.*, m.brand_name, m.whatsapp merchant_whatsapp, m.id merchant_id FROM products p JOIN merchants m ON m.id=p.merchant_id WHERE p.slug=$1 AND p.status='active' LIMIT 1`,[slug])
  const product = pr.rows[0]; if(!product) return res.status(404).json({error:'Product not found'})
  let promoter=null
  if(ref){ const rr=await q(`SELECT id,name,whatsapp,ref_code FROM promoters WHERE merchant_id=$1 AND ref_code=$2 AND status='active' LIMIT 1`,[product.merchant_id,ref]); promoter=rr.rows[0]||null }
  res.json({ product, promoter, whatsapp: promoter?.whatsapp || product.whatsapp || product.merchant_whatsapp })
 }catch(e){console.error(e);res.status(500).json({error:'Fetch funnel failed',detail:e.message})}
})
router.post('/click', async(req,res)=>{
 try{
  const { slug, ref, visitorKey } = req.body || {}
  const pr = await q(`SELECT id,merchant_id FROM products WHERE slug=$1 LIMIT 1`,[slug])
  const product = pr.rows[0]; if(!product) return res.status(404).json({error:'Product not found'})
  let promoter=null
  if(ref){ const rr=await q(`SELECT id FROM promoters WHERE merchant_id=$1 AND ref_code=$2 LIMIT 1`,[product.merchant_id,ref]); promoter=rr.rows[0]||null }
  try { await q(`INSERT INTO click_events (merchant_id,product_id,promoter_id,ref_code,visitor_key,ip,user_agent) VALUES ($1,$2,$3,$4,$5,$6,$7)`,[product.merchant_id,product.id,promoter?.id||null,ref||'',visitorKey||'',req.ip,req.headers['user-agent']||'']) } catch(e) { if(e.code!=='23505') throw e }
  res.json({ok:true})
 }catch(e){console.error(e);res.status(500).json({error:'Track click failed',detail:e.message})}
})
module.exports=router
