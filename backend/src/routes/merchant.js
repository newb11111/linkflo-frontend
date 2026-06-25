
const router = require('express').Router()
const { z } = require('zod')
const slugify = require('slugify')
const { customAlphabet } = require('nanoid')
const prisma = require('../lib/prisma')
const { requireAuth, requireRole } = require('../middleware/auth')
const { getPlan } = require('../lib/plans')
const { writeLedger, roundCredit: roundWalletCredit } = require('../lib/wallet')

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 6)
router.use(requireAuth, requireRole('MERCHANT'))


const i18nSchema = z.object({ zh: z.string().optional(), en: z.string().optional(), bm: z.string().optional() }).passthrough().optional()
const translationsSchema = z.object({ headline: i18nSchema, subheadline: i18nSchema, description: i18nSchema, priceNote: i18nSchema }).passthrough().optional()
const sectionTranslationsSchema = z.object({ title: i18nSchema, body: i18nSchema }).passthrough().optional()
const urlOrEmptySchema = z.preprocess(
  value => value === null || value === undefined ? '' : value,
  z.union([z.string().url(), z.literal('')]).optional()
)
const stringOrEmptySchema = z.preprocess(
  value => value === null || value === undefined ? '' : value,
  z.string().optional()
)
const gallerySchema = z.preprocess(
  value => Array.isArray(value) ? value.filter(Boolean) : [],
  z.array(z.string().url()).default([])
)
const galleryOptionalSchema = z.preprocess(
  value => value === null || value === undefined ? undefined : value,
  z.array(z.string().url()).optional()
)

function cleanLines(value = '') {
  return String(value || '').split('\n').map(x => x.trim()).filter(Boolean)
}
function joinBullets(value = '') {
  return cleanLines(value).map(x => x.startsWith('- ') ? x : `- ${x}`).join('\n')
}
function mdHighlight(text) {
  return String(text || '').replace(/\[\[(.*?)\]\]/g, '**$1**')
}
function buildI18n(zh, en, bm) { return { zh: zh || '', en: en || zh || '', bm: bm || en || zh || '' } }
function fallbackFunnel(input = {}) {
  const name = input.name || input.productName || '这个产品'
  const target = input.targetCustomer || '正在寻找更好解决方案的顾客'
  const points = joinBullets(input.keyPoints || input.sellingPoints || '重点卖点\n真实使用场景\n清楚行动理由')
  const pains = joinBullets(input.painPoints || '有兴趣但不敢下单\n看了很多选择还是犹豫\n不知道这个产品适不适合自己')
  const proof = joinBullets(input.proof || input.testimonials || '真实案例 / 顾客反馈\n产品图片 / 截图证明\n清楚说明交付或使用方式')
  const offer = input.offer || input.price || '点击 WhatsApp 了解今天适合你的方案'
  return {
    headline: buildI18n(`${name}：帮${target}更快做决定`, `${name}: Help ${target} decide faster`, `${name}: Bantu ${target} buat keputusan dengan lebih yakin`),
    subheadline: buildI18n(`不是只看产品介绍，而是用 **重点理由**、案例和清楚 CTA 帮顾客行动。`, `Not just product info — use **clear reasons**, proof, and CTA to help customers take action.`, `Bukan sekadar info produk — gunakan **sebab utama**, bukti dan CTA yang jelas untuk bantu pelanggan bertindak.`),
    description: buildI18n(`## 为什么值得了解\n${points}`, `## Why it is worth checking\n${points}`, `## Kenapa berbaloi untuk tahu\n${points}`),
    priceNote: buildI18n(offer, offer, offer),
    sections: [
      { type:'PAIN', title: buildI18n('你是不是也遇到这些问题？','Are you facing these problems?','Adakah anda hadapi masalah ini?'), body: buildI18n(pains, pains, pains) },
      { type:'SOLUTION', title: buildI18n(`${name} 怎样帮到你？`, `How ${name} helps`, `Bagaimana ${name} membantu anda`), body: buildI18n(`我们把卖点讲清楚，让顾客看到 **为什么现在要行动**。\n${points}`, `We make the offer clear so customers see **why they should act now**.\n${points}`, `Kami jelaskan nilai produk supaya pelanggan nampak **kenapa perlu bertindak sekarang**.\n${points}`) },
      { type:'TRUST', title: buildI18n('为什么可以相信？','Why you can trust this','Kenapa boleh percaya?'), body: buildI18n(proof, proof, proof) },
      { type:'OFFER', title: buildI18n('现在可以拿到什么？','What you get now','Apa yang anda dapat sekarang?'), body: buildI18n(`**${offer}**\n\n点击 WhatsApp，让负责人根据你的情况给你建议。`, `**${offer}**\n\nTap WhatsApp and let the promoter guide you based on your situation.`, `**${offer}**\n\nTekan WhatsApp dan promoter akan bantu ikut situasi anda.`) },
      { type:'FAQ', title: buildI18n('我适合吗？','Is this suitable for me?','Adakah ini sesuai untuk saya?'), body: buildI18n(`如果你是${target}，可以先 WhatsApp 了解，不需要马上决定。`, `If you are ${target}, you can WhatsApp first before deciding.`, `Jika anda ${target}, boleh WhatsApp dulu sebelum buat keputusan.`) },
      { type:'CTA', title: buildI18n('现在就 WhatsApp 了解','WhatsApp now to know more','WhatsApp sekarang untuk tahu lanjut'), body: buildI18n('发送信息后，负责人会根据你的情况回复。', 'Send a message and the promoter will reply based on your situation.', 'Hantar mesej dan promoter akan balas ikut situasi anda.') }
    ]
  }
}

async function getMerchant(req) {
  const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id } })
  if (!merchant) { const err = new Error('Merchant profile not found'); err.status = 404; throw err }
  if (merchant.isHidden) { const err = new Error('Merchant account is hidden. Please contact Admin.'); err.status = 403; throw err }
  return merchant
}

function roundCredit(value) { return Math.round(Number(value || 0) * 10) / 10 }
const AI_GENERATE_COST = 0.1


function ensureFunnelActive(merchant) {
  if (merchant.planStatus !== 'ACTIVE') {
    const err = new Error('你还没有开通 AI Funnel。请先到 Member Dashboard 用 credit 开通 Funnel 产品。')
    err.status = 402
    err.needActivateFunnel = true
    throw err
  }
}


function stripJsonFence(text = '') {
  return String(text || '').trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim()
}

async function callOpenAiJson({ system, prompt, temperature = 0.35 }) {
  if (!process.env.OPENAI_API_KEY) {
    const err = new Error('AI 暂时未开启，请先在 backend/.env 填 OPENAI_API_KEY。')
    err.status = 503
    throw err
  }
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt }
      ]
    })
  })
  const out = await r.json().catch(() => ({}))
  if (!r.ok) {
    const err = new Error(out?.error?.message || 'AI 生成失败，本次不会扣 credit。')
    err.status = 502
    throw err
  }
  const text = stripJsonFence(out?.choices?.[0]?.message?.content || '')
  try {
    return JSON.parse(text)
  } catch {
    const err = new Error('AI 回传格式不正确，本次不会扣 credit。')
    err.status = 502
    throw err
  }
}

function ensureI18n(base = {}, zh = '') {
  const next = typeof base === 'object' && base ? { ...base } : {}
  if (zh !== undefined && zh !== null) next.zh = String(zh || '')
  return next
}

function textNeedsTranslation(value = {}) {
  return Boolean(value?.zh && (!String(value.en || '').trim() || !String(value.bm || '').trim()))
}

async function translateMissingProductContent(body = {}) {
  if (!process.env.OPENAI_API_KEY) return body
  const items = []
  const addItem = (path, zh) => {
    const clean = String(zh || '').trim()
    if (clean) items.push({ path, zh: clean })
  }

  const translations = body.translations || {}
  for (const field of ['headline', 'subheadline', 'description', 'priceNote']) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      translations[field] = ensureI18n(translations[field], body[field] || '')
      if (textNeedsTranslation(translations[field])) addItem(`product.${field}`, translations[field].zh)
    }
  }

  const sections = Array.isArray(body.sections) ? body.sections : []
  sections.forEach((section, index) => {
    section.translations = section.translations || {}
    section.translations.title = ensureI18n(section.translations.title, section.title || '')
    section.translations.body = ensureI18n(section.translations.body, section.body || '')
    if (textNeedsTranslation(section.translations.title)) addItem(`sections.${index}.title`, section.translations.title.zh)
    if (textNeedsTranslation(section.translations.body)) addItem(`sections.${index}.body`, section.translations.body.zh)
  })

  body.translations = translations
  body.sections = sections
  if (!items.length) return body

  try {
    const parsed = await callOpenAiJson({
      temperature: 0.2,
      system: 'You are a careful Chinese to English and Bahasa Malaysia translator for ecommerce funnel pages. Return strict JSON only.',
      prompt: `Translate the following LinkFlo merchant-edited funnel texts from Chinese to natural English and Bahasa Malaysia. Keep brand/product names, WhatsApp, prices, numbers, emojis, markdown **bold**, and bullet formatting. Do not add claims, do not add new content. Return JSON object: {"items":[{"path":"same path","en":"...","bm":"..."}]}. Items: ${JSON.stringify(items)}`
    })
    const translated = Array.isArray(parsed.items) ? parsed.items : []
    for (const item of translated) {
      const en = String(item.en || '').trim()
      const bm = String(item.bm || '').trim()
      if (!item.path || !en || !bm) continue
      const top = /^product\.(headline|subheadline|description|priceNote)$/.exec(item.path)
      if (top) {
        const field = top[1]
        body.translations[field] = { ...(body.translations[field] || {}), en, bm }
        continue
      }
      const sec = /^sections\.(\d+)\.(title|body)$/.exec(item.path)
      if (sec) {
        const index = Number(sec[1])
        const field = sec[2]
        if (body.sections[index]) {
          body.sections[index].translations = body.sections[index].translations || {}
          body.sections[index].translations[field] = { ...(body.sections[index].translations[field] || {}), en, bm }
        }
      }
    }
  } catch (e) {
    console.warn('[translateMissingProductContent] skipped:', e.message)
  }
  return body
}

function validateFunnelShape(funnel = {}) {
  const fields = ['headline', 'subheadline', 'description', 'priceNote']
  for (const field of fields) {
    if (!funnel[field] || typeof funnel[field] !== 'object' || !funnel[field].zh || !funnel[field].en || !funnel[field].bm) return false
  }
  if (!Array.isArray(funnel.sections) || funnel.sections.length < 4) return false
  return funnel.sections.every(section => section?.type && section?.title?.zh && section?.title?.en && section?.title?.bm && section?.body?.zh && section?.body?.en && section?.body?.bm)
}

router.get('/dashboard', async (req, res, next) => {
  try {
    const merchant = await getMerchant(req)
    const merchantProfile = await prisma.merchant.findUnique({
      where: { id: merchant.id },
      include: { user: { select: { email: true, name: true } } }
    })
    const products = await prisma.product.findMany({ where: { merchantId: merchant.id }, include: { links: true, sections: { orderBy: { position: 'asc' } } }, orderBy: { createdAt: 'desc' } })
    const links = await prisma.promoterLink.findMany({ where: { merchantId: merchant.id }, include: { product: true, events: true }, orderBy: { createdAt: 'desc' } })
    const rankings = links.map(l => ({ id: l.id, promoterId: l.promoterId, code: l.code, isActive: l.isActive, promoterName: l.promoterName, promoterPhone: l.promoterPhone, productName: l.product.name, productSlug: l.product.slug, clicks: l.events.filter(e => e.type === 'VIEW').length, whatsappClicks: l.events.filter(e => e.type === 'WHATSAPP_CLICK').length }))
      .sort((a,b) => b.whatsappClicks - a.whatsappClicks || b.clicks - a.clicks)
    res.json({ merchant: merchantProfile || merchant, plan: getPlan(merchant.plan), products, rankings, skuLimit: 1 + merchant.extraSkuCredits })
  } catch (err) { next(err) }
})

router.put('/profile', async (req, res, next) => {
  try {
    const merchant = await getMerchant(req)
    const body = z.object({
      brandName: z.string().min(1, '品牌名字必须填写'),
      whatsapp: z.string().min(8, 'WhatsApp 必须填写').transform(v => v.replace(/\D/g, '')),
      ownerName: z.string().optional().default('')
    }).parse(req.body)

    const updated = await prisma.$transaction(async tx => {
      await tx.user.update({ where: { id: req.user.id }, data: { name: body.ownerName || null } })
      return tx.merchant.update({
        where: { id: merchant.id },
        data: { brandName: body.brandName, whatsapp: body.whatsapp },
        include: { user: { select: { email: true, name: true } } }
      })
    })
    res.json({ ok: true, merchant: updated, message: 'Profile 已更新。' })
  } catch (err) { next(err) }
})

router.post('/product', async (req, res, next) => {
  try {
    const merchant = await getMerchant(req)
    ensureFunnelActive(merchant)
    const existingProducts = await prisma.product.count({ where: { merchantId: merchant.id } })
    const skuLimit = 1 + merchant.extraSkuCredits
    if (existingProducts >= skuLimit) return res.status(403).json({ message: `目前可创建 ${skuLimit} 个 SKU。增加 SKU：一次性 +RM100 / SKU，请联系 Admin 开通。` })
    const body = z.object({
      name: z.string().min(1), headline: z.string().min(1), subheadline: z.string().optional(), description: z.string().optional(), sop: z.string().optional(), priceNote: z.string().optional(), imageUrl: urlOrEmptySchema, heroImageUrl: urlOrEmptySchema, videoUrl: stringOrEmptySchema, galleryImages: gallerySchema, translations: translationsSchema.default({}), isPublished: z.boolean().default(true), isHidden: z.boolean().default(false), sections: z.array(z.object({ type: z.string().default('TEXT'), title: z.string().min(1), body: z.string().min(1), position: z.number().int().default(0), isHidden: z.boolean().default(false), translations: sectionTranslationsSchema.default({}) })).default([])
    }).parse(req.body)
    const translatedBody = await translateMissingProductContent(body)
    const baseSlug = slugify(translatedBody.name, { lower: true, strict: true }) || 'product'
    const slug = `${baseSlug}-${nanoid()}`
    const product = await prisma.product.create({ data: { merchantId: merchant.id, name: translatedBody.name, slug, headline: translatedBody.headline, subheadline: translatedBody.subheadline, description: translatedBody.description, sop: translatedBody.sop, priceNote: translatedBody.priceNote, imageUrl: translatedBody.imageUrl || null, heroImageUrl: translatedBody.heroImageUrl || null, videoUrl: translatedBody.videoUrl || null, galleryImages: translatedBody.galleryImages || [], translations: translatedBody.translations || {}, isPublished: translatedBody.isPublished, isHidden: translatedBody.isHidden, sections: { create: translatedBody.sections.map((s, i) => ({ ...s, position: s.position ?? i })) } }, include: { sections: true } })
    res.status(201).json(product)
  } catch (err) { next(err) }
})

router.put('/product/:id', async (req, res, next) => {
  try {
    const merchant = await getMerchant(req)
    ensureFunnelActive(merchant)
    const product = await prisma.product.findFirst({ where: { id: req.params.id, merchantId: merchant.id } })
    if (!product) return res.status(404).json({ message: 'Product not found' })
    const body = z.object({ name: z.string().min(1).optional(), headline: z.string().min(1).optional(), subheadline: z.string().optional(), description: z.string().optional(), sop: z.string().optional(), priceNote: z.string().optional(), imageUrl: urlOrEmptySchema, heroImageUrl: urlOrEmptySchema, videoUrl: stringOrEmptySchema, galleryImages: galleryOptionalSchema, translations: translationsSchema.optional(), isPublished: z.boolean().optional(), isHidden: z.boolean().optional(), sections: z.array(z.object({ type: z.string().default('TEXT'), title: z.string().min(1), body: z.string().min(1), position: z.number().int().default(0), isHidden: z.boolean().default(false), translations: sectionTranslationsSchema.default({}) })).optional() }).parse(req.body)
    const translatedBody = await translateMissingProductContent(body)
    const { sections, ...data } = translatedBody
    if (data.imageUrl === '') data.imageUrl = null
    if (data.heroImageUrl === '') data.heroImageUrl = null
    if (data.videoUrl === '') data.videoUrl = null
    const updated = await prisma.$transaction(async tx => {
      if (sections) { await tx.funnelSection.deleteMany({ where: { productId: product.id } }); await tx.funnelSection.createMany({ data: sections.map((s, i) => ({ ...s, productId: product.id, position: s.position ?? i })) }) }
      return tx.product.update({ where: { id: product.id }, data, include: { sections: { orderBy: { position: 'asc' } } } })
    })
    res.json(updated)
  } catch (err) { next(err) }
})



router.post('/ai-generate', async (req, res, next) => {
  try {
    const merchant = await getMerchant(req)
    ensureFunnelActive(merchant)
    if (!process.env.OPENAI_API_KEY) return res.status(503).json({ message: 'AI 暂时未开启，请先在 backend/.env 填 OPENAI_API_KEY。本次不会扣 credit。' })
    if (Number(merchant.creditBalance || 0) < AI_GENERATE_COST) return res.status(402).json({ message: `Credit 不足。AI Generate 需要 ${AI_GENERATE_COST} credit，请先充值。`, needTopup: true })
    const body = z.object({
      name: z.string().min(1),
      industry: z.string().optional(),
      price: z.string().optional(),
      targetCustomer: z.string().min(1, '目标客户必须填写'),
      keyPoints: z.string().min(1, '产品重点必须填写'),
      painPoints: z.string().min(1, '顾客痛点必须填写'),
      proof: z.string().optional(),
      offer: z.string().optional(),
      brandName: z.string().optional(),
      merchantWhatsapp: z.string().optional(),
      language: z.enum(['zh','en','bm']).default('zh')
    }).parse(req.body)

    const prompt = `You are generating a LinkFlo funnel for a lightweight Malaysian promoter-selling system.

Business rules:
- LinkFlo is NOT a marketplace, NOT a checkout, and NOT customer online payment.
- The final action is WhatsApp to the assigned promoter.
- The funnel must help a normal promoter explain the product clearly and make the customer willing to WhatsApp.
- Generate natural Chinese, English, and Bahasa Malaysia. Do not copy Chinese into English or BM.
- Keep markdown **bold** for important selling words.
- Avoid illegal or exaggerated claims: no 100%, guaranteed, sure win, cure, or over-promising.
- Do not output placeholder/demo text such as 写痛点, 核心卖点, 常见问题, 122, lorem ipsum.
- Return only strict JSON with this shape:
{
  "headline": {"zh":"","en":"","bm":""},
  "subheadline": {"zh":"","en":"","bm":""},
  "description": {"zh":"","en":"","bm":""},
  "priceNote": {"zh":"","en":"","bm":""},
  "sections": [
    {"type":"PAIN","title":{"zh":"","en":"","bm":""},"body":{"zh":"","en":"","bm":""}},
    {"type":"SOLUTION","title":{"zh":"","en":"","bm":""},"body":{"zh":"","en":"","bm":""}},
    {"type":"TRUST","title":{"zh":"","en":"","bm":""},"body":{"zh":"","en":"","bm":""}},
    {"type":"OFFER","title":{"zh":"","en":"","bm":""},"body":{"zh":"","en":"","bm":""}},
    {"type":"FAQ","title":{"zh":"","en":"","bm":""},"body":{"zh":"","en":"","bm":""}},
    {"type":"CTA","title":{"zh":"","en":"","bm":""},"body":{"zh":"","en":"","bm":""}}
  ]
}

Merchant/product data:
${JSON.stringify(body)}`

    const parsed = await callOpenAiJson({
      temperature: 0.65,
      system: 'You are a direct response funnel copywriter for Malaysia. Output strict JSON only.',
      prompt
    })
    if (!validateFunnelShape(parsed)) return res.status(502).json({ message: 'AI 回传内容不完整，本次不会扣 credit。请再试一次。' })

    await prisma.$transaction(async tx => {
      const before = roundWalletCredit(merchant.creditBalance || 0)
      const after = roundWalletCredit(before - AI_GENERATE_COST)
      const debit = await tx.merchant.updateMany({
        where: { id: merchant.id, creditBalance: { gte: AI_GENERATE_COST } },
        data: { creditBalance: after }
      })
      if (debit.count !== 1) {
        const err = new Error(`Credit 不足。AI Generate 需要 ${AI_GENERATE_COST} credit，请先充值。`)
        err.status = 402
        throw err
      }
      const bt = await tx.billingTransaction.create({
        data: {
          merchantId: merchant.id,
          type: 'AI_GENERATE',
          amount: AI_GENERATE_COST,
          creditAmount: -AI_GENERATE_COST,
          status: 'PAID',
          rawPayload: { source: 'openai', atomicDebit: true }
        }
      })
      await writeLedger(tx, {
        merchantId: merchant.id,
        bucket: 'PAID',
        direction: 'DEBIT',
        amount: AI_GENERATE_COST,
        balanceBefore: before,
        balanceAfter: after,
        category: 'AI_GENERATE',
        referenceType: 'BillingTransaction',
        referenceId: bt.id,
        note: 'AI funnel generation cost'
      })
    })
    res.json({ source: 'openai', funnel: parsed })
  } catch (err) { next(err) }
})

router.delete('/product/:id', async (req, res, next) => {
  try {
    const merchant = await getMerchant(req)
    const product = await prisma.product.findFirst({ where: { id: req.params.id, merchantId: merchant.id } })
    if (!product) return res.status(404).json({ message: 'Product not found' })
    await prisma.product.delete({ where: { id: product.id } })
    res.json({ ok: true, message: 'SKU 已删除。' })
  } catch (err) { next(err) }
})

router.patch('/product/:id/visibility', async (req, res, next) => {
  try {
    const merchant = await getMerchant(req)
    const body = z.object({ isHidden: z.boolean().optional(), isPublished: z.boolean().optional() }).parse(req.body)
    const product = await prisma.product.findFirst({ where: { id: req.params.id, merchantId: merchant.id } })
    if (!product) return res.status(404).json({ message: 'Product not found' })
    const updated = await prisma.product.update({ where: { id: product.id }, data: body })
    res.json(updated)
  } catch (err) { next(err) }
})

router.post('/promoter-links', async (req, res, next) => {
  try {
    const merchant = await getMerchant(req)
    ensureFunnelActive(merchant)
    const body = z.object({
      productId: z.string(),
      promoterName: z.string().min(1),
      promoterPhone: z.string().min(8).transform(v => v.replace(/\D/g, '')),
      promoterId: z.string().min(3).max(40).optional()
    }).parse(req.body)

    const products = body.productId === 'ALL'
      ? await prisma.product.findMany({ where: { merchantId: merchant.id, isPublished: true }, orderBy: { createdAt: 'desc' } })
      : await prisma.product.findMany({ where: { id: body.productId, merchantId: merchant.id } })
    if (!products.length) return res.status(404).json({ message: 'Product not found' })

    const existingPromoter = body.promoterId
      ? await prisma.promoterLink.findFirst({ where: { merchantId: merchant.id, promoterId: body.promoterId } })
      : await prisma.promoterLink.findFirst({ where: { merchantId: merchant.id, promoterPhone: body.promoterPhone } })

    const promoterId = existingPromoter?.promoterId || body.promoterId || `P-${nanoid()}`
    const safe = slugify(body.promoterName, { lower: true, strict: true }) || 'promoter'
    const limit = getPlan(merchant.plan).promoterLimit
    const created = []
    const skipped = []

    for (const product of products) {
      const existingSameProduct = await prisma.promoterLink.findFirst({
        where: {
          merchantId: merchant.id,
          productId: product.id,
          OR: [{ promoterPhone: body.promoterPhone }, { promoterId }]
        }
      })
      if (existingSameProduct) { skipped.push(product.name); continue }

      const linkCount = await prisma.promoterLink.count({ where: { merchantId: merchant.id, productId: product.id, isActive: true } })
      if (linkCount >= limit) { skipped.push(`${product.name}（已达配套上限）`); continue }

      const link = await prisma.promoterLink.create({
        data: {
          promoterId,
          merchantId: merchant.id,
          productId: product.id,
          promoterName: body.promoterName,
          promoterPhone: body.promoterPhone,
          code: `${safe}-${nanoid()}`
        }
      })
      created.push(link)
    }

    if (!created.length) return res.status(409).json({ message: `没有创建新 link。可能这个 promoter 已经拥有这些 SKU，或产品已达配套 promoter 上限。跳过：${skipped.join(', ')}` })
    res.status(201).json({ promoterId, created, skipped, message: `已为 ${body.promoterName} 创建 ${created.length} 个 product link。${skipped.length ? `跳过：${skipped.join(', ')}` : ''}` })
  } catch (err) { next(err) }
})

router.patch('/promoter-links/:id', async (req, res, next) => {
  try {
    const merchant = await getMerchant(req)
    const body = z.object({ promoterName: z.string().min(1).optional(), promoterPhone: z.string().min(8).transform(v => v.replace(/\D/g, '')).optional(), isActive: z.boolean().optional() }).parse(req.body)
    const link = await prisma.promoterLink.findFirst({ where: { id: req.params.id, merchantId: merchant.id } })
    if (!link) return res.status(404).json({ message: 'Promoter link 不存在。' })
    if (body.isActive === true && !link.isActive) {
      const activeCount = await prisma.promoterLink.count({ where: { merchantId: merchant.id, productId: link.productId, isActive: true } })
      const limit = getPlan(merchant.plan).promoterLimit
      if (activeCount >= limit) return res.status(403).json({ message: `Your ${merchant.plan} plan supports ${limit} active promoter links.` })
    }
    const updated = await prisma.promoterLink.update({ where: { id: link.id }, data: body })
    res.json(updated)
  } catch (err) { next(err) }
})

router.delete('/promoter-links/:id', async (req, res, next) => {
  try {
    const merchant = await getMerchant(req)
    const link = await prisma.promoterLink.findFirst({ where: { id: req.params.id, merchantId: merchant.id } })
    if (!link) return res.status(404).json({ message: 'Promoter link 不存在。' })

    await prisma.promoterLink.delete({ where: { id: link.id } })
    res.json({ ok: true, message: 'Promoter link 已删除。历史 tracking 会保留在产品数据里，但不再绑定这个 link。' })
  } catch (err) { next(err) }
})

module.exports = router
