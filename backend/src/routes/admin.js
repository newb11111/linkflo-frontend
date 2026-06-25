const router = require('express').Router()
const bcrypt = require('bcryptjs')
const { z } = require('zod')
const prisma = require('../lib/prisma')
const { requireAuth, requireRole } = require('../middleware/auth')
const { getPlan } = require('../lib/plans')
const { adjustCredit, ensureDefaultLevelSettings, getLevelSettings, roundCredit } = require('../lib/wallet')
const { generateReferralCode } = require('../lib/referral')

router.use(requireAuth, requireRole('ADMIN'))

router.get('/stats', async (req, res, next) => {
  try {
    const [merchants, products, links, clicks, whatsappClicks, pendingKyc, pendingProofs, activeFunnel, ledgers] = await Promise.all([
      prisma.merchant.count({ where: { isHidden: false } }),
      prisma.product.count(),
      prisma.promoterLink.count(),
      prisma.trackingEvent.count({ where: { type: 'VIEW' } }),
      prisma.trackingEvent.count({ where: { type: 'WHATSAPP_CLICK' } }),
      prisma.kycSubmission.count({ where: { status: 'PENDING' } }).catch(() => 0),
      prisma.socialProofSubmission.count({ where: { status: 'PENDING' } }).catch(() => 0),
      prisma.merchant.count({ where: { planStatus: 'ACTIVE' } }),
      prisma.creditLedger.count().catch(() => 0)
    ])
    res.json({ merchants, products, promoterLinks: links, clicks, whatsappClicks, pendingKyc, pendingProofs, activeFunnel, ledgers })
  } catch (err) { next(err) }
})

router.get('/merchants', async (req, res, next) => {
  try {
    const merchants = await prisma.merchant.findMany({
      include: {
        user: true,
        products: true,
        links: true,
        subscriptions: { include: { productItem: true }, orderBy: { createdAt: 'desc' }, take: 5 }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(merchants.map(m => ({
      ...m,
      user: { id: m.user.id, email: m.user.email, name: m.user.name },
      paidCredit: roundCredit(m.creditBalance),
      bonusCredit: roundCredit(m.bonusCreditBalance),
      planMeta: getPlan(m.plan)
    })))
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
      plan: z.enum(['STARTER','GROWTH','SCALE']).optional(),
      activateFunnel: z.boolean().optional().default(false)
    }).parse(req.body)

    const exists = await prisma.user.findUnique({ where: { email: body.email } })
    if (exists) return res.status(409).json({ message: '这个 email 已经存在，请换一个 email 或重设密码。' })

    const password = await bcrypt.hash(body.password, 10)
    const referralCode = await generateReferralCode(prisma)
    const created = await prisma.user.create({
      data: {
        email: body.email,
        password,
        name: body.name,
        role: 'MERCHANT',
        merchant: {
          create: {
            brandName: body.brandName,
            whatsapp: body.whatsapp,
            plan: body.plan || 'STARTER',
            nextBillingAt: body.activateFunnel ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
            planStatus: body.activateFunnel ? 'ACTIVE' : 'INACTIVE',
            referralCode,
            memberTier: 'UNVERIFIED',
            kycStatus: 'UNVERIFIED'
          }
        }
      },
      include: { merchant: true }
    })
    res.status(201).json({
      id: created.merchant.id,
      userId: created.id,
      email: created.email,
      brandName: created.merchant.brandName,
      plan: created.merchant.plan,
      message: 'Member 已创建。默认不会开通 AI Funnel，除非 activateFunnel=true。'
    })
  } catch (err) { next(err) }
})

router.patch('/merchants/:id/password', async (req, res, next) => {
  try {
    const body = z.object({ password: z.string().min(8) }).parse(req.body)
    const merchant = await prisma.merchant.findUnique({ where: { id: req.params.id }, include: { user: true } })
    if (!merchant) return res.status(404).json({ message: 'Member 不存在。' })
    const password = await bcrypt.hash(body.password, 10)
    await prisma.user.update({ where: { id: merchant.userId }, data: { password } })
    res.json({ ok: true, message: 'Member 密码已更新。' })
  } catch (err) { next(err) }
})

router.patch('/merchants/:id/extra-sku', async (req, res, next) => {
  try {
    const body = z.object({ change: z.number().int().min(-50).max(50) }).parse(req.body)
    if (body.change === 0) return res.status(400).json({ message: 'SKU change 不能是 0。' })
    const merchant = await prisma.merchant.findUnique({ where: { id: req.params.id }, include: { products: true } })
    if (!merchant) return res.status(404).json({ message: 'Member 不存在。' })
    const currentProducts = merchant.products.length
    const currentCredits = merchant.extraSkuCredits || 0
    const minCreditsNeeded = Math.max(0, currentProducts - 1)
    const nextCredits = currentCredits + body.change
    if (nextCredits < minCreditsNeeded) return res.status(400).json({ message: `不能再减少 SKU quota。这个 member 现在已有 ${currentProducts} 个 SKU，至少需要 ${minCreditsNeeded} 个额外 SKU credit。` })
    if (nextCredits < 0) return res.status(400).json({ message: '额外 SKU credit 不能低于 0。' })
    const updated = await prisma.merchant.update({ where: { id: merchant.id }, data: { extraSkuCredits: nextCredits } })
    res.json({ ok: true, extraSkuCredits: updated.extraSkuCredits, skuLimit: 1 + updated.extraSkuCredits })
  } catch (err) { next(err) }
})

router.patch('/merchants/:id/credit', async (req, res, next) => {
  try {
    const body = z.object({
      change: z.coerce.number().min(-100000).max(100000),
      bucket: z.enum(['PAID', 'BONUS']).default('PAID'),
      note: z.string().max(200).optional()
    }).parse(req.body)
    const updated = await adjustCredit({
      merchantId: req.params.id,
      bucket: body.bucket,
      amount: body.change,
      category: 'ADMIN_ADJUST',
      note: body.note || 'Admin manual adjustment',
      createdByAdminId: req.user.id
    })
    res.json({ ok: true, paidCredit: roundCredit(updated.creditBalance), bonusCredit: roundCredit(updated.bonusCreditBalance), message: `${body.bucket} Credit 已更新。Paid: ${roundCredit(updated.creditBalance)} / Bonus: ${roundCredit(updated.bonusCreditBalance)}` })
  } catch (err) { next(err) }
})

router.patch('/merchants/:id/tier', async (req, res, next) => {
  try {
    const body = z.object({ memberTier: z.enum(['UNVERIFIED', 'VERIFIED', 'GOLD', 'DIAMOND']), memberStatus: z.enum(['ACTIVE','FROZEN']).optional() }).parse(req.body)
    const updated = await prisma.merchant.update({ where: { id: req.params.id }, data: { memberTier: body.memberTier, ...(body.memberStatus ? { memberStatus: body.memberStatus } : {}) } })
    res.json({ ok: true, memberTier: updated.memberTier, memberStatus: updated.memberStatus, message: 'Member level 已更新。' })
  } catch (err) { next(err) }
})

router.patch('/merchants/:id/funnel', async (req, res, next) => {
  try {
    const body = z.object({ plan: z.enum(['STARTER','GROWTH','SCALE']).default('STARTER'), active: z.boolean().default(true) }).parse(req.body)
    const updated = await prisma.merchant.update({ where: { id: req.params.id }, data: { plan: body.plan, planStatus: body.active ? 'ACTIVE' : 'INACTIVE', nextBillingAt: body.active ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null } })
    res.json({ ok: true, plan: updated.plan, planStatus: updated.planStatus, message: body.active ? 'AI Funnel 已开通。' : 'AI Funnel 已关闭。' })
  } catch (err) { next(err) }
})

router.patch('/merchants/:id/visibility', async (req, res, next) => {
  try {
    const body = z.object({ isHidden: z.boolean() }).parse(req.body)
    const merchant = await prisma.merchant.findUnique({ where: { id: req.params.id } })
    if (!merchant) return res.status(404).json({ message: 'Member 不存在。' })
    const updated = await prisma.merchant.update({ where: { id: merchant.id }, data: { isHidden: body.isHidden } })
    res.json({ ok: true, isHidden: updated.isHidden, message: updated.isHidden ? 'Member 已隐藏。' : 'Member 已显示。' })
  } catch (err) { next(err) }
})

router.delete('/merchants/:id', async (req, res, next) => {
  try {
    const merchant = await prisma.merchant.findUnique({ where: { id: req.params.id }, include: { user: true } })
    if (!merchant) return res.status(404).json({ message: 'Member 不存在。' })
    await prisma.user.delete({ where: { id: merchant.userId } })
    res.json({ ok: true, message: 'Member 已删除，相关 Funnel、Promoter links、tracking 和 ledger 已一起清理。' })
  } catch (err) { next(err) }
})

// Level settings: Super Admin can tune 5% / 30% / 40% / 50% and monthly post requirements.
router.get('/level-settings', async (req, res, next) => {
  try {
    await ensureDefaultLevelSettings(prisma)
    res.json(await getLevelSettings(prisma))
  } catch (err) { next(err) }
})
router.put('/level-settings/:tier', async (req, res, next) => {
  try {
    const tier = String(req.params.tier || '').toUpperCase()
    if (!['UNVERIFIED','VERIFIED','GOLD','DIAMOND'].includes(tier)) return res.status(400).json({ message: 'Invalid tier.' })
    const body = z.object({ label: z.string().min(1), bonusCap: z.coerce.number().min(0).max(1), kycRequired: z.boolean(), monthlyPostRequired: z.coerce.number().int().min(0).max(100), isActive: z.boolean().default(true) }).parse(req.body)
    const row = await prisma.ambassadorLevelSetting.upsert({ where: { tier }, update: body, create: { tier, ...body } })
    res.json({ ok: true, setting: row, message: 'Level setting 已更新。' })
  } catch (err) { next(err) }
})

// Store / products / services.
router.get('/store-items', async (req, res, next) => {
  try { res.json(await prisma.productStoreItem.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] })) } catch (err) { next(err) }
})
router.post('/store-items', async (req, res, next) => {
  try {
    const body = z.object({ code: z.string().min(2).transform(v => v.trim().toUpperCase()), name: z.string().min(1), type: z.string().default('SERVICE'), price: z.coerce.number().min(0), billingType: z.enum(['ONE_TIME','MONTHLY']).default('ONE_TIME'), bonusAllowed: z.boolean().default(true), normalBonusCap: z.coerce.number().min(0).max(1).default(0.3), goldBonusCap: z.coerce.number().min(0).max(1).default(0.4), diamondBonusCap: z.coerce.number().min(0).max(1).default(0.5), isActive: z.boolean().default(true), description: z.string().optional().nullable(), sortOrder: z.coerce.number().int().default(0) }).parse(req.body)
    const item = await prisma.productStoreItem.upsert({ where: { code: body.code }, update: body, create: body })
    res.status(201).json({ ok: true, item, message: 'Product / Service 已保存。' })
  } catch (err) { next(err) }
})
router.patch('/store-items/:id', async (req, res, next) => {
  try {
    const body = z.object({ name: z.string().min(1).optional(), type: z.string().optional(), price: z.coerce.number().min(0).optional(), billingType: z.enum(['ONE_TIME','MONTHLY']).optional(), bonusAllowed: z.boolean().optional(), isActive: z.boolean().optional(), description: z.string().optional().nullable(), sortOrder: z.coerce.number().int().optional() }).parse(req.body)
    const item = await prisma.productStoreItem.update({ where: { id: req.params.id }, data: body })
    res.json({ ok: true, item })
  } catch (err) { next(err) }
})

// Marketing library.
router.get('/marketing-materials', async (req, res, next) => {
  try { res.json(await prisma.marketingMaterial.findMany({ orderBy: { createdAt: 'desc' } })) } catch (err) { next(err) }
})
router.post('/marketing-materials', async (req, res, next) => {
  try {
    const body = z.object({ title: z.string().min(1), type: z.enum(['IMAGE','VIDEO','CAPTION','WHATSAPP']).default('IMAGE'), platform: z.string().default('ALL'), language: z.string().default('ZH'), fileUrl: z.string().url().optional().nullable(), caption: z.string().optional().nullable(), campaignId: z.string().optional().nullable(), isActive: z.boolean().default(true) }).parse(req.body)
    const item = await prisma.marketingMaterial.create({ data: body })
    res.status(201).json({ ok: true, item, message: 'Marketing 素材已新增。' })
  } catch (err) { next(err) }
})
router.patch('/marketing-materials/:id', async (req, res, next) => {
  try {
    const body = z.object({ title: z.string().min(1).optional(), type: z.enum(['IMAGE','VIDEO','CAPTION','WHATSAPP']).optional(), platform: z.string().optional(), language: z.string().optional(), fileUrl: z.string().url().optional().nullable(), caption: z.string().optional().nullable(), isActive: z.boolean().optional() }).parse(req.body)
    const item = await prisma.marketingMaterial.update({ where: { id: req.params.id }, data: body })
    res.json({ ok: true, item })
  } catch (err) { next(err) }
})

// KYC review.
router.get('/kyc', async (req, res, next) => {
  try { res.json(await prisma.kycSubmission.findMany({ include: { merchant: { include: { user: true } } }, orderBy: { createdAt: 'desc' }, take: 100 })) } catch (err) { next(err) }
})
router.patch('/kyc/:id', async (req, res, next) => {
  try {
    const body = z.object({ status: z.enum(['APPROVED','REJECTED']), adminNote: z.string().max(500).optional().nullable() }).parse(req.body)
    const submission = await prisma.kycSubmission.findUnique({ where: { id: req.params.id } })
    if (!submission) return res.status(404).json({ message: 'KYC submission 不存在。' })
    const result = await prisma.$transaction(async tx => {
      const updated = await tx.kycSubmission.update({ where: { id: submission.id }, data: { status: body.status, adminNote: body.adminNote || null, reviewedById: req.user.id, reviewedAt: new Date() } })
      await tx.merchant.update({ where: { id: submission.merchantId }, data: body.status === 'APPROVED' ? { kycStatus: 'VERIFIED', memberTier: 'VERIFIED' } : { kycStatus: 'REJECTED' } })
      return updated
    })
    res.json({ ok: true, submission: result, message: body.status === 'APPROVED' ? 'KYC 已批准，Member 升级成 Verified。' : 'KYC 已拒绝。' })
  } catch (err) { next(err) }
})

// Social proof review.
router.get('/social-proofs', async (req, res, next) => {
  try { res.json(await prisma.socialProofSubmission.findMany({ include: { merchant: { include: { user: true } } }, orderBy: { createdAt: 'desc' }, take: 100 })) } catch (err) { next(err) }
})
router.patch('/social-proofs/:id', async (req, res, next) => {
  try {
    const body = z.object({ status: z.enum(['APPROVED','REJECTED']), rewardCredit: z.coerce.number().min(0).max(10000).default(0), adminNote: z.string().max(500).optional().nullable() }).parse(req.body)
    const proof = await prisma.socialProofSubmission.findUnique({ where: { id: req.params.id } })
    if (!proof) return res.status(404).json({ message: 'Social proof 不存在。' })
    const result = await prisma.$transaction(async tx => {
      const updated = await tx.socialProofSubmission.update({ where: { id: proof.id }, data: { status: body.status, rewardCredit: body.status === 'APPROVED' ? body.rewardCredit : 0, adminNote: body.adminNote || null, approvedById: req.user.id, approvedAt: body.status === 'APPROVED' ? new Date() : null } })
      if (body.status === 'APPROVED' && body.rewardCredit > 0) {
        const merchant = await tx.merchant.findUnique({ where: { id: proof.merchantId } })
        const before = roundCredit(merchant.bonusCreditBalance)
        const after = roundCredit(before + body.rewardCredit)
        await tx.merchant.update({ where: { id: proof.merchantId }, data: { bonusCreditBalance: after, monthlyPostCount: { increment: 1 } } })
        await tx.creditLedger.create({ data: { merchantId: proof.merchantId, bucket: 'BONUS', direction: 'CREDIT', amount: body.rewardCredit, balanceBefore: before, balanceAfter: after, category: 'SOCIAL_PROOF_APPROVED', referenceType: 'SocialProofSubmission', referenceId: proof.id, note: body.adminNote || 'Approved social proof reward', createdByAdminId: req.user.id } })
      }
      return updated
    })
    res.json({ ok: true, proof: result, message: body.status === 'APPROVED' ? 'Social proof 已批准并发放 Bonus Credit。' : 'Social proof 已拒绝。' })
  } catch (err) { next(err) }
})

router.get('/credit-ledger', async (req, res, next) => {
  try { res.json(await prisma.creditLedger.findMany({ include: { merchant: { include: { user: true } } }, orderBy: { createdAt: 'desc' }, take: 200 })) } catch (err) { next(err) }
})

module.exports = router
