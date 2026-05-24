
const router = require('express').Router()
const { z } = require('zod')
const slugify = require('slugify')
const { customAlphabet } = require('nanoid')
const prisma = require('../lib/prisma')
const { requireAuth, requireRole } = require('../middleware/auth')
const { getPlan } = require('../lib/plans')

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 6)
router.use(requireAuth, requireRole('MERCHANT'))


const i18nSchema = z.object({ zh: z.string().optional(), en: z.string().optional(), bm: z.string().optional() }).passthrough().optional()
const translationsSchema = z.object({ headline: i18nSchema, subheadline: i18nSchema, description: i18nSchema, priceNote: i18nSchema }).passthrough().optional()
const sectionTranslationsSchema = z.object({ title: i18nSchema, body: i18nSchema }).passthrough().optional()

function cleanLines(value = '') {
  return String(value || '').split('\n').map(x => x.trim()).filter(Boolean)
}
function joinBullets(value = '') {
  return cleanLines(value).map(x => x.startsWith('- ') ? x : `- ${x}`).join('\n')
}
function mdHighlight(text) {
  return String(text || '').replace(/\[\[(.*?)\]\]/g, '**$1**')
}
function buildI18n(zh, en, bm) { return { zh: zh || '', en: en || '', bm: bm || '' } }
function hasCjk(value = '') { return /[\u3400-\u9fff]/.test(String(value || '')) }
function safeNonZh(value, fallback) {
  const text = String(value || '').trim()
  if (!text || hasCjk(text)) return fallback
  return text
}
function fallbackFunnel(input = {}) {
  const name = input.name || input.productName || '这个产品'
  const targetZh = input.targetCustomer || '正在寻找更好解决方案的顾客'
  const targetEn = safeNonZh(input.targetCustomer, 'customers who want a clearer solution')
  const targetBm = safeNonZh(input.targetCustomer, 'pelanggan yang mahukan solusi lebih jelas')

  const pointsZh = joinBullets(input.keyPoints || input.sellingPoints || '重点卖点\n真实使用场景\n清楚行动理由')
  const painsZh = joinBullets(input.painPoints || '有兴趣但不敢下单\n看了很多选择还是犹豫\n不知道这个产品适不适合自己')
  const proofZh = joinBullets(input.proof || input.testimonials || '真实案例 / 顾客反馈\n产品图片 / 截图证明\n清楚说明交付或使用方式')

  // Fallback cannot truly translate merchant-written text without OpenAI.
  // To avoid Chinese placeholder/content leaking into EN/BM pages, use clean generic EN/BM copy here.
  const pointsEn = joinBullets('Clear product benefits\nReal usage context\nEasy next step through WhatsApp')
  const pointsBm = joinBullets('Manfaat produk yang jelas\nSituasi penggunaan sebenar\nLangkah seterusnya mudah melalui WhatsApp')
  const painsEn = joinBullets('Interested but still unsure\nToo many choices and hard to decide\nNot sure whether this is suitable')
  const painsBm = joinBullets('Berminat tetapi masih ragu\nTerlalu banyak pilihan dan sukar buat keputusan\nTidak pasti sama ada ini sesuai')
  const proofEn = joinBullets('Real customer feedback or examples\nProduct photos or proof screenshots\nClear explanation of how it works')
  const proofBm = joinBullets('Feedback atau contoh pelanggan sebenar\nGambar produk atau screenshot bukti\nPenerangan jelas tentang cara ia berfungsi')

  const offerZh = input.offer || input.price || '点击 WhatsApp 了解今天适合你的方案'
  const offerEn = safeNonZh(input.offer || input.price, 'WhatsApp now to get the most suitable offer today')
  const offerBm = safeNonZh(input.offer || input.price, 'WhatsApp sekarang untuk dapatkan tawaran yang sesuai hari ini')

  return {
    headline: buildI18n(`${name}：帮${targetZh}更快做决定`, `${name}: Help ${targetEn} decide faster`, `${name}: Bantu ${targetBm} buat keputusan dengan lebih yakin`),
    subheadline: buildI18n(`不是只看产品介绍，而是用 **重点理由**、案例和清楚 CTA 帮顾客行动。`, `Not just product info — use **clear reasons**, proof, and CTA to help customers take action.`, `Bukan sekadar info produk — gunakan **sebab utama**, bukti dan CTA yang jelas untuk bantu pelanggan bertindak.`),
    description: buildI18n(`## 为什么值得了解\n${pointsZh}`, `## Why it is worth checking\n${pointsEn}`, `## Kenapa berbaloi untuk tahu\n${pointsBm}`),
    priceNote: buildI18n(offerZh, offerEn, offerBm),
    sections: [
      { type:'PAIN', title: buildI18n('你是不是也遇到这些问题？','Are you facing these problems?','Adakah anda hadapi masalah ini?'), body: buildI18n(painsZh, painsEn, painsBm) },
      { type:'SOLUTION', title: buildI18n(`${name} 怎样帮到你？`, `How ${name} helps`, `Bagaimana ${name} membantu anda`), body: buildI18n(`我们把卖点讲清楚，让顾客看到 **为什么现在要行动**。\n${pointsZh}`, `We make the offer clear so customers see **why they should act now**.\n${pointsEn}`, `Kami jelaskan nilai produk supaya pelanggan nampak **kenapa perlu bertindak sekarang**.\n${pointsBm}`) },
      { type:'TRUST', title: buildI18n('为什么可以相信？','Why you can trust this','Kenapa boleh percaya?'), body: buildI18n(proofZh, proofEn, proofBm) },
      { type:'OFFER', title: buildI18n('现在可以拿到什么？','What you get now','Apa yang anda dapat sekarang?'), body: buildI18n(`**${offerZh}**\n\n点击 WhatsApp，让负责人根据你的情况给你建议。`, `**${offerEn}**\n\nTap WhatsApp and let the promoter guide you based on your situation.`, `**${offerBm}**\n\nTekan WhatsApp dan promoter akan bantu ikut situasi anda.`) },
      { type:'FAQ', title: buildI18n('我适合吗？','Is this suitable for me?','Adakah ini sesuai untuk saya?'), body: buildI18n(`如果你是${targetZh}，可以先 WhatsApp 了解，不需要马上决定。`, `If you are ${targetEn}, you can WhatsApp first before deciding.`, `Jika anda ${targetBm}, boleh WhatsApp dulu sebelum buat keputusan.`) },
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

router.get('/dashboard', async (req, res, next) => {
  try {
    const merchant = await getMerchant(req)
    const products = await prisma.product.findMany({ where: { merchantId: merchant.id }, include: { links: true, sections: { orderBy: { position: 'asc' } } }, orderBy: { createdAt: 'desc' } })
    const links = await prisma.promoterLink.findMany({ where: { merchantId: merchant.id }, include: { product: true, events: true }, orderBy: { createdAt: 'desc' } })
    const rankings = links.map(l => ({ id: l.id, promoterId: l.promoterId, code: l.code, isActive: l.isActive, promoterName: l.promoterName, promoterPhone: l.promoterPhone, productName: l.product.name, productSlug: l.product.slug, clicks: l.events.filter(e => e.type === 'VIEW').length, whatsappClicks: l.events.filter(e => e.type === 'WHATSAPP_CLICK').length }))
      .sort((a,b) => b.whatsappClicks - a.whatsappClicks || b.clicks - a.clicks)
    res.json({ merchant, plan: getPlan(merchant.plan), products, rankings, skuLimit: 1 + merchant.extraSkuCredits })
  } catch (err) { next(err) }
})

router.post('/product', async (req, res, next) => {
  try {
    const merchant = await getMerchant(req)
    const existingProducts = await prisma.product.count({ where: { merchantId: merchant.id } })
    const skuLimit = 1 + merchant.extraSkuCredits
    if (existingProducts >= skuLimit) return res.status(403).json({ message: `目前可创建 ${skuLimit} 个 SKU。增加 SKU：一次性 +RM100 / SKU，请联系 Admin 开通。` })
    const body = z.object({
      name: z.string().min(1), headline: z.string().min(1), subheadline: z.string().optional(), description: z.string().optional(), sop: z.string().optional(), priceNote: z.string().optional(), imageUrl: z.string().url().optional().or(z.literal('')), heroImageUrl: z.string().url().optional().or(z.literal('')), videoUrl: z.string().optional().or(z.literal('')), galleryImages: z.array(z.string().url()).default([]), translations: translationsSchema.default({}), isPublished: z.boolean().default(true), isHidden: z.boolean().default(false), sections: z.array(z.object({ type: z.string().default('TEXT'), title: z.string().min(1), body: z.string().min(1), position: z.number().int().default(0), isHidden: z.boolean().default(false), translations: sectionTranslationsSchema.default({}) })).default([])
    }).parse(req.body)
    const baseSlug = slugify(body.name, { lower: true, strict: true }) || 'product'
    const slug = `${baseSlug}-${nanoid()}`
    const product = await prisma.product.create({ data: { merchantId: merchant.id, name: body.name, slug, headline: body.headline, subheadline: body.subheadline, description: body.description, sop: body.sop, priceNote: body.priceNote, imageUrl: body.imageUrl || null, heroImageUrl: body.heroImageUrl || null, videoUrl: body.videoUrl || null, galleryImages: body.galleryImages || [], translations: body.translations || {}, isPublished: body.isPublished, isHidden: body.isHidden, sections: { create: body.sections.map((s, i) => ({ ...s, position: s.position ?? i })) } }, include: { sections: true } })
    res.status(201).json(product)
  } catch (err) { next(err) }
})

router.put('/product/:id', async (req, res, next) => {
  try {
    const merchant = await getMerchant(req)
    const product = await prisma.product.findFirst({ where: { id: req.params.id, merchantId: merchant.id } })
    if (!product) return res.status(404).json({ message: 'Product not found' })
    const body = z.object({ name: z.string().min(1).optional(), headline: z.string().min(1).optional(), subheadline: z.string().optional(), description: z.string().optional(), sop: z.string().optional(), priceNote: z.string().optional(), imageUrl: z.string().url().optional().or(z.literal('')), heroImageUrl: z.string().url().optional().or(z.literal('')), videoUrl: z.string().optional().or(z.literal('')), galleryImages: z.array(z.string().url()).optional(), translations: translationsSchema.optional(), isPublished: z.boolean().optional(), isHidden: z.boolean().optional(), sections: z.array(z.object({ type: z.string().default('TEXT'), title: z.string().min(1), body: z.string().min(1), position: z.number().int().default(0), isHidden: z.boolean().default(false), translations: sectionTranslationsSchema.default({}) })).optional() }).parse(req.body)
    const { sections, ...data } = body
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



function stripJsonFence(value = '') {
  return String(value || '')
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim()
}

function buildLinkFloPrompt(input = {}) {
  return `You are generating copy for LinkFlo, a lightweight AI funnel system for Malaysia merchants.

IMPORTANT BUSINESS LOGIC:
- This is NOT an ecommerce checkout page.
- There is NO online payment, cart, order system, payout system, or marketplace.
- The page goal is: customer reads the funnel -> clicks WhatsApp -> chats with the PROMOTER.
- Promoter uses an affiliate link to bring traffic and closes the customer on WhatsApp.

PRODUCT DATA:
${JSON.stringify(input, null, 2)}

OUTPUT STRICT JSON ONLY. No markdown code fence. No explanation.

Required JSON schema:
{
  "headline": { "zh": "", "en": "", "bm": "" },
  "subheadline": { "zh": "", "en": "", "bm": "" },
  "description": { "zh": "", "en": "", "bm": "" },
  "priceNote": { "zh": "", "en": "", "bm": "" },
  "sections": [
    { "type": "PAIN", "title": { "zh": "", "en": "", "bm": "" }, "body": { "zh": "", "en": "", "bm": "" } },
    { "type": "SOLUTION", "title": { "zh": "", "en": "", "bm": "" }, "body": { "zh": "", "en": "", "bm": "" } },
    { "type": "TRUST", "title": { "zh": "", "en": "", "bm": "" }, "body": { "zh": "", "en": "", "bm": "" } },
    { "type": "OFFER", "title": { "zh": "", "en": "", "bm": "" }, "body": { "zh": "", "en": "", "bm": "" } },
    { "type": "FAQ", "title": { "zh": "", "en": "", "bm": "" }, "body": { "zh": "", "en": "", "bm": "" } },
    { "type": "CTA", "title": { "zh": "", "en": "", "bm": "" }, "body": { "zh": "", "en": "", "bm": "" } }
  ]
}

COPYWRITING RULES:
1. Generate complete zh, en, and bm for EVERY text field.
2. Do not copy Chinese into English or BM. Translate meaning naturally.
3. Do not output placeholders, demo instructions, or empty filler. Forbidden examples: 写痛点, 核心卖点, 常见问题, 写 3 个卖点, 122, lorem ipsum.
4. Do not mention online checkout, payment gateway, cart, order tracking, delivery, or platform commission unless merchant explicitly provided that information.
5. Use Malaysia-friendly WhatsApp conversion copy. The CTA should guide customers to WhatsApp the promoter.
6. Keep copy direct, mobile-friendly, and easy to scan.
7. Use **highlight** markdown only for important words, not every sentence.
8. Body fields should usually use short paragraphs or bullet lines starting with "- ".
9. Preserve product names, brand names, and prices exactly when provided.
10. If product information is limited, infer safe generic benefits based on the industry, but do not invent fake testimonials, fake guarantees, fake results, or fake certifications.
11. Avoid absolute claims such as 100%, guaranteed, 一定, 肯定, 包成功, miracle, cure, sembuh pasti.
12. FAQ should contain real buyer objections and answers in the same body field, formatted as short Q/A lines.
13. priceNote should be based on price/offer if provided. If not provided, use a soft WhatsApp CTA such as asking for current details.
14. Return valid parseable JSON only.`
}

function assertValidFunnelPayload(funnel) {
  const requiredRoot = ['headline', 'subheadline', 'description', 'priceNote']
  const langs = ['zh', 'en', 'bm']
  for (const key of requiredRoot) {
    if (!funnel || typeof funnel[key] !== 'object') throw new Error(`AI output missing ${key}`)
    for (const lang of langs) {
      if (typeof funnel[key][lang] !== 'string') throw new Error(`AI output missing ${key}.${lang}`)
    }
  }
  if (!Array.isArray(funnel.sections) || !funnel.sections.length) throw new Error('AI output missing sections')
  for (const [index, section] of funnel.sections.entries()) {
    if (!section.type || typeof section.type !== 'string') throw new Error(`AI output missing sections[${index}].type`)
    for (const field of ['title', 'body']) {
      if (!section[field] || typeof section[field] !== 'object') throw new Error(`AI output missing sections[${index}].${field}`)
      for (const lang of langs) {
        if (typeof section[field][lang] !== 'string') throw new Error(`AI output missing sections[${index}].${field}.${lang}`)
      }
    }
  }
}

router.post('/ai-generate', async (req, res, next) => {
  try {
    const merchant = await getMerchant(req)
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        message: 'AI Generate 还没开启：backend/.env 需要填写 OPENAI_API_KEY。Credit 没有被扣。',
        needOpenAIKey: true
      })
    }
    if (Number(merchant.creditBalance || 0) < AI_GENERATE_COST) return res.status(402).json({ message: `Credit 不足。AI Generate 需要 ${AI_GENERATE_COST} credit，请先充值。`, needTopup: true })

    const body = z.object({
      name: z.string().min(1),
      industry: z.string().optional(),
      price: z.string().optional(),
      targetCustomer: z.string().optional(),
      keyPoints: z.string().optional(),
      painPoints: z.string().optional(),
      proof: z.string().optional(),
      offer: z.string().optional(),
      language: z.enum(['zh','en','bm']).default('zh')
    }).parse(req.body)

    const prompt = buildLinkFloPrompt(body)
    let out
    try {
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          temperature: 0.58,
          response_format: { type: 'json_object' },
          messages: [
            { role:'system', content:"You are LinkFlo's senior direct-response funnel strategist for Malaysia WhatsApp commerce. Return strict valid JSON only." },
            { role:'user', content: prompt }
          ]
        })
      })
      out = await r.json()
      if (!r.ok) {
        const detail = out?.error?.message || `OpenAI request failed with status ${r.status}`
        return res.status(502).json({ message: `AI Generate 失败：${detail}。Credit 没有被扣。`, source: 'openai_error' })
      }
    } catch (networkErr) {
      return res.status(502).json({ message: 'AI Generate 失败：无法连接 OpenAI。Credit 没有被扣。', source: 'openai_network_error' })
    }

    let parsed
    try {
      const text = stripJsonFence(out?.choices?.[0]?.message?.content || '')
      parsed = JSON.parse(text)
      assertValidFunnelPayload(parsed)
    } catch (parseErr) {
      return res.status(502).json({ message: 'AI Generate 失败：OpenAI 回传格式不正确。Credit 没有被扣。', source: 'openai_parse_error' })
    }

    await prisma.$transaction(async tx => {
      await tx.merchant.update({ where: { id: merchant.id }, data: { creditBalance: roundCredit(Number(merchant.creditBalance || 0) - AI_GENERATE_COST) } })
      await tx.billingTransaction.create({ data: { merchantId: merchant.id, type: 'AI_GENERATE', amount: AI_GENERATE_COST, creditAmount: -AI_GENERATE_COST, status: 'PAID', rawPayload: { source: 'openai', model: process.env.OPENAI_MODEL || 'gpt-4o-mini' } } })
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
