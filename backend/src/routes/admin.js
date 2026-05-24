
const router = require('express').Router()
const bcrypt = require('bcryptjs')
const { z } = require('zod')
const prisma = require('../lib/prisma')
const { requireAuth, requireRole } = require('../middleware/auth')
const { getPlan } = require('../lib/plans')

router.use(requireAuth, requireRole('ADMIN'))

router.get('/stats', async (req, res, next) => {
  try {
    const [merchants, products, links, clicks, whatsappClicks] = await Promise.all([
      prisma.merchant.count({ where: { isHidden: false } }),
      prisma.product.count(),
      prisma.promoterLink.count(),
      prisma.trackingEvent.count({ where: { type: 'VIEW' } }),
      prisma.trackingEvent.count({ where: { type: 'WHATSAPP_CLICK' } })
    ])
    res.json({ merchants, products, promoterLinks: links, clicks, whatsappClicks })
  } catch (err) { next(err) }
})

router.get('/merchants', async (req, res, next) => {
  try {
    const merchants = await prisma.merchant.findMany({ include: { user: true, products: true, links: true }, orderBy: { createdAt: 'desc' } })
    res.json(merchants.map(m => ({ ...m, user: { id: m.user.id, email: m.user.email, name: m.user.name }, planMeta: getPlan(m.plan) })))
  } catch (err) { next(err) }
})

router.post('/merchants', async (req, res, next) => {
  try {
    const body = z.object({
      email: z.string().email().transform(v => v.trim().toLowerCase()),
      password: z.string().min(8),
      name: z.string().min(1),
      brandName: z.string().min(1),
      whatsapp: z.string().min(8).transform(v => v.replace(/\D/g, '')),
      plan: z.enum(['STARTER','GROWTH','SCALE']).default('STARTER')
    }).parse(req.body)

    const exists = await prisma.user.findUnique({ where: { email: body.email } })
    if (exists) return res.status(409).json({ message: '这个 email 已经存在，请换一个 email 或重设密码。' })

    const password = await bcrypt.hash(body.password, 10)
    const created = await prisma.$transaction(async (tx) => {
      return tx.user.create({
        data: {
          email: body.email,
          password,
          name: body.name,
          role: 'MERCHANT',
          merchant: { create: { brandName: body.brandName, whatsapp: body.whatsapp, plan: body.plan, nextBillingAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), planStatus: 'ACTIVE' } }
        },
        include: { merchant: true }
      })
    })
    res.status(201).json({
      id: created.merchant.id,
      userId: created.id,
      email: created.email,
      brandName: created.merchant.brandName,
      plan: created.merchant.plan,
      message: 'Merchant 已创建，可以马上用这个 email 和 password 登录。'
    })
  } catch (err) { next(err) }
})

router.patch('/merchants/:id/password', async (req, res, next) => {
  try {
    const body = z.object({ password: z.string().min(8) }).parse(req.body)
    const merchant = await prisma.merchant.findUnique({ where: { id: req.params.id }, include: { user: true } })
    if (!merchant) return res.status(404).json({ message: 'Merchant 不存在。' })
    const password = await bcrypt.hash(body.password, 10)
    await prisma.user.update({ where: { id: merchant.userId }, data: { password } })
    res.json({ ok: true, message: 'Merchant 密码已更新。' })
  } catch (err) { next(err) }
})

router.patch('/merchants/:id/extra-sku', async (req, res, next) => {
  try {
    const body = z.object({ change: z.number().int().min(-50).max(50) }).parse(req.body)
    if (body.change === 0) return res.status(400).json({ message: 'SKU change 不能是 0。' })

    const merchant = await prisma.merchant.findUnique({
      where: { id: req.params.id },
      include: { products: true }
    })
    if (!merchant) return res.status(404).json({ message: 'Merchant 不存在。' })

    const currentProducts = merchant.products.length
    const currentCredits = merchant.extraSkuCredits || 0
    const minCreditsNeeded = Math.max(0, currentProducts - 1)
    const nextCredits = currentCredits + body.change

    if (nextCredits < minCreditsNeeded) {
      return res.status(400).json({
        message: `不能再减少 SKU quota。这个 merchant 现在已有 ${currentProducts} 个 SKU，至少需要 ${minCreditsNeeded} 个额外 SKU credit。`
      })
    }
    if (nextCredits < 0) return res.status(400).json({ message: '额外 SKU credit 不能低于 0。' })

    const updated = await prisma.merchant.update({
      where: { id: merchant.id },
      data: { extraSkuCredits: nextCredits }
    })
    res.json({ ok: true, extraSkuCredits: updated.extraSkuCredits, skuLimit: 1 + updated.extraSkuCredits })
  } catch (err) { next(err) }
})



router.patch('/merchants/:id/credit', async (req, res, next) => {
  try {
    const body = z.object({ change: z.coerce.number().min(-100000).max(100000), note: z.string().max(200).optional() }).parse(req.body)
    if (body.change === 0) return res.status(400).json({ message: 'Credit change 不能是 0。' })

    const merchant = await prisma.merchant.findUnique({ where: { id: req.params.id } })
    if (!merchant) return res.status(404).json({ message: 'Merchant 不存在。' })

    const nextBalance = (merchant.creditBalance || 0) + body.change
    if (nextBalance < 0) return res.status(400).json({ message: `Credit 不够扣。目前 RM${merchant.creditBalance || 0}，不能扣 RM${Math.abs(body.change)}。` })

    const result = await prisma.$transaction(async tx => {
      const updated = await tx.merchant.update({
        where: { id: merchant.id },
        data: { creditBalance: Math.round(nextBalance * 10) / 10 }
      })
      const record = await tx.billingTransaction.create({
        data: {
          merchantId: merchant.id,
          type: body.change > 0 ? 'ADMIN_CREDIT_ADD' : 'ADMIN_CREDIT_DEDUCT',
          amount: Math.abs(body.change),
          creditAmount: body.change,
          status: 'PAID',
          rawPayload: { note: body.note || 'Admin manual adjustment' }
        }
      })
      return { updated, record }
    })

    res.json({ ok: true, creditBalance: result.updated.creditBalance, message: `Credit 已更新：RM${Math.round(Number(result.updated.creditBalance || 0) * 10) / 10}` })
  } catch (err) { next(err) }
})


router.patch('/merchants/:id/visibility', async (req, res, next) => {
  try {
    const body = z.object({ isHidden: z.boolean() }).parse(req.body)
    const merchant = await prisma.merchant.findUnique({ where: { id: req.params.id } })
    if (!merchant) return res.status(404).json({ message: 'Merchant 不存在。' })
    const updated = await prisma.merchant.update({ where: { id: merchant.id }, data: { isHidden: body.isHidden } })
    res.json({ ok: true, isHidden: updated.isHidden, message: updated.isHidden ? 'Merchant 已隐藏。' : 'Merchant 已显示。' })
  } catch (err) { next(err) }
})

router.delete('/merchants/:id', async (req, res, next) => {
  try {
    const merchant = await prisma.merchant.findUnique({
      where: { id: req.params.id },
      include: { user: true }
    })
    if (!merchant) return res.status(404).json({ message: 'Merchant 不存在。' })

    await prisma.user.delete({ where: { id: merchant.userId } })
    res.json({ ok: true, message: 'Merchant 已删除，相关 SKU、Promoter links 和 tracking 已一起清理。' })
  } catch (err) { next(err) }
})

module.exports = router
