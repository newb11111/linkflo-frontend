const express = require('express')
const bcrypt = require('bcryptjs')
const slugify = require('slugify')
const { q } = require('../lib/db')
const { requireAuth } = require('../middleware/auth')
const { generateFunnel } = require('../lib/funnelAi')
const router = express.Router()
const RESERVED = new Set(['admin','merchant','promoter','auth','api','login','register','pricing','support','checkout','account','rewards','thank-you'])
function makeSlug(name) { return `${slugify(name || 'product', { lower:true, strict:true })}-${Math.random().toString(36).slice(2,6)}` }
router.use(requireAuth('merchant'))
router.get('/me', async (req,res)=>{
 const r=await q(`SELECT m.id,m.brand_name,m.owner_name,m.whatsapp,m.email,m.plan_id,m.credit_balance,m.extra_funnel_slots,m.status,m.next_billing_at,p.monthly_price,p.promoter_limit,p.included_funnel_slots FROM merchants m JOIN plans p ON p.id=m.plan_id WHERE m.id=$1`,[req.user.merchantId]);
 res.json({merchant:r.rows[0]})
})
router.get('/products', async(req,res)=>{ const r=await q(`SELECT * FROM products WHERE merchant_id=$1 ORDER BY created_at DESC`,[req.user.merchantId]); res.json({products:r.rows}) })
router.post('/products', async(req,res)=>{
 try{
  const input=req.body||{}; const name=input.name||input.productName; if(!name) return res.status(400).json({error:'Product name required'})
  const counts=await q(`SELECT (SELECT COUNT(*)::int FROM products WHERE merchant_id=$1) product_count, p.included_funnel_slots, m.extra_funnel_slots FROM merchants m JOIN plans p ON p.id=m.plan_id WHERE m.id=$1`,[req.user.merchantId])
  const c=counts.rows[0]; const limit=Number(c.included_funnel_slots)+Number(c.extra_funnel_slots)
  if(Number(c.product_count)>=limit) return res.status(403).json({error:`Funnel slot limit reached. Current limit: ${limit}. Buy extra slot RM100.`})
  let slug=makeSlug(name); while(RESERVED.has(slug)) slug=makeSlug(name)
  const funnel=await generateFunnel(input)
  const r=await q(`INSERT INTO products (merchant_id,name,slug,whatsapp,funnel,images) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,[req.user.merchantId,name,slug,input.whatsapp||'',funnel,JSON.stringify(input.images||[])])
  res.json({product:r.rows[0]})
 }catch(e){console.error(e);res.status(500).json({error:'Create product failed',detail:e.message})}
})
router.delete('/products/:id',async(req,res)=>{await q(`DELETE FROM products WHERE id=$1 AND merchant_id=$2`,[req.params.id,req.user.merchantId]);res.json({ok:true})})
router.get('/promoters', async(req,res)=>{const r=await q(`SELECT id,name,email,whatsapp,ref_code,status,created_at FROM promoters WHERE merchant_id=$1 ORDER BY created_at DESC`,[req.user.merchantId]);res.json({promoters:r.rows})})
router.post('/promoters', async(req,res)=>{
 try{
  const {name,email,password,whatsapp}=req.body||{}; if(!name||!email||!password||!whatsapp) return res.status(400).json({error:'name, email, password, whatsapp required'})
  const lim=await q(`SELECT COUNT(pr.id)::int used, p.promoter_limit FROM merchants m JOIN plans p ON p.id=m.plan_id LEFT JOIN promoters pr ON pr.merchant_id=m.id WHERE m.id=$1 GROUP BY p.promoter_limit`,[req.user.merchantId])
  const row=lim.rows[0]; if(row && Number(row.used)>=Number(row.promoter_limit)) return res.status(403).json({error:`Promoter limit reached (${row.promoter_limit})`})
  const hash=await bcrypt.hash(password,10); const ref=`${slugify(name,{lower:true,strict:true})}-${Math.random().toString(36).slice(2,6)}`
  const r=await q(`INSERT INTO promoters (merchant_id,name,email,password_hash,whatsapp,ref_code) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id,name,email,whatsapp,ref_code`,[req.user.merchantId,name,email,hash,whatsapp,ref])
  res.json({promoter:r.rows[0]})
 }catch(e){ if(e.code==='23505') return res.status(400).json({error:'Email or ref already used'}); console.error(e);res.status(500).json({error:'Create promoter failed',detail:e.message})}
})
router.get('/clicks', async(req,res)=>{const r=await q(`SELECT p.name product_name, pr.name promoter_name, ce.ref_code, COUNT(*)::int clicks FROM click_events ce JOIN products p ON p.id=ce.product_id LEFT JOIN promoters pr ON pr.id=ce.promoter_id WHERE ce.merchant_id=$1 GROUP BY p.name,pr.name,ce.ref_code ORDER BY clicks DESC`,[req.user.merchantId]);res.json({clicks:r.rows})})
router.post('/topup-dev', async(req,res)=>{const amount=Number(req.body.amount||0); if(amount<=0) return res.status(400).json({error:'Invalid amount'}); await q(`UPDATE merchants SET credit_balance=credit_balance+$1 WHERE id=$2`,[amount,req.user.merchantId]); await q(`INSERT INTO credit_transactions (merchant_id,type,amount,description) VALUES ($1,'topup',$2,'Dev top up')`,[req.user.merchantId,amount]); res.json({ok:true})})
module.exports=router
