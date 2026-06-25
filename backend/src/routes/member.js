const router = require('express').Router()
const { z } = require('zod')
const prisma = require('../lib/prisma')
const { requireAuth, requireRole } = require('../middleware/auth')
const { PLANS, getPlan } = require('../lib/plans')
const { debitOrderWithBonusCap, roundCredit, getLevelSettings, ensureDefaultLevelSettings } = require('../lib/wallet')
const { generateReferralCode } = require('../lib/referral')

function addOneMonth(date = new Date()) {
  const next = new Date(date)
  next.setMonth(next.getMonth() + 1)
  return next
}
function currentMonthKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
async function getMerchant(req) {
  const merchant = await prisma.merchant.findUnique({ where: { userId: req.user.id }, include: { user: true } })
  if (!merchant) {
    const err = new Error('Member profile not found')
    err.status = 404
    throw err
  }
  if (merchant.isHidden || merchant.memberStatus === 'FROZEN') {
    const err = new Error('Member account is frozen/hidden. Please contact Admin.')
    err.status = 403
    throw err
  }
  return merchant
}
async function ensureSeedStore() {
  const count = await prisma.productStoreItem.count().catch(() => 0)
  if (count > 0) return
  await prisma.productStoreItem.createMany({
    skipDuplicates: true,
    data: [
      { code: 'FUNNEL_STARTER', name: 'AI Funnel Starter', type: 'FUNNEL_PLAN', price: 29, billingType: 'MONTHLY', description: '10 promoter links, 1 funnel SKU included.', sortOrder: 1 },
      { code: 'FUNNEL_GROWTH', name: 'AI Funnel Growth', type: 'FUNNEL_PLAN', price: 139, billingType: 'MONTHLY', description: '50 promoter links, 1 funnel SKU included.', sortOrder: 2 },
      { code: 'FUNNEL_SCALE', name: 'AI Funnel Scale', type: 'FUNNEL_PLAN', price: 259, billingType: 'MONTHLY', description: '100 promoter links, 1 funnel SKU included.', sortOrder: 3 },
      { code: 'EXTRA_SKU', name: 'Extra Funnel Slot / SKU', type: 'ADDON', price: 100, billingType: 'ONE_TIME', description: 'Add 1 extra funnel SKU slot.', sortOrder: 4 },
      { code: 'WEBSITE_AUDIT', name: 'Website / Funnel Audit', type: 'SERVICE', price: 50, billingType: 'ONE_TIME', description: 'Linkflo team reviews your page and gives improvement direction.', sortOrder: 5 },
      { code: 'WHATSAPP_SCRIPT', name: 'WhatsApp Closing Script', type: 'SERVICE', price: 30, billingType: 'ONE_TIME', description: 'Simple closing script for your offer.', sortOrder: 6 },
      { code: 'WEBSITE_BUILD', name: 'Website Build Service', type: 'SERVICE', price: 599, billingType: 'ONE_TIME', description: 'Basic website / landing page build request.', sortOrder: 7 },
      { code: 'ACADEMY_ACCESS', name: 'Academy Access', type: 'ACADEMY', price: 399, billingType: 'ONE_TIME', description: 'Academy access placeholder for future course system.', sortOrder: 8 }
    ]
  })
}

router.use(requireAuth, requireRole('MERCHANT'))

router.get('/summary', async (req, res, next) => {
  try {
    let merchant = await getMerchant(req)
    await Promise.all([ensureDefaultLevelSettings(prisma), ensureSeedStore()])
    if (!merchant.referralCode) {
      merchant = await prisma.merchant.update({ where: { id: merchant.id }, data: { referralCode: await generateReferralCode(prisma) }, include: { user: true } })
    }
    const [levels, storeItems, subscriptions, ledgers, materials, proofs, kyc, referralCount, paidReferralCount] = await Promise.all([
      getLevelSettings(prisma),
      prisma.productStoreItem.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] }),
      prisma.memberProductSubscription.findMany({ where: { merchantId: merchant.id }, include: { productItem: true }, orderBy: { createdAt: 'desc' } }),
      prisma.creditLedger.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: 'desc' }, take: 40 }),
      prisma.marketingMaterial.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' }, take: 30 }),
      prisma.socialProofSubmission.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: 'desc' }, take: 30 }),
      prisma.kycSubmission.findFirst({ where: { merchantId: merchant.id }, orderBy: { createdAt: 'desc' } }),
      prisma.referralEvent.count({ where: { referrerMerchantId: merchant.id, eventType: 'REGISTER' } }),
      prisma.referralEvent.count({ where: { referrerMerchantId: merchant.id, eventType: 'PURCHASE' } })
    ])

    const activeFunnel = subscriptions.find(s => s.productCode.startsWith('FUNNEL_') && s.status === 'ACTIVE')
    const tier = levels.find(x => x.tier === merchant.memberTier) || levels.find(x => x.tier === 'UNVERIFIED')
    const approvedThisMonth = proofs.filter(p => p.status === 'APPROVED' && p.createdAt && new Date(p.createdAt).toISOString().slice(0,7) === currentMonthKey()).length

    res.json({
      member: {
        id: merchant.id,
        name: merchant.user?.name,
        email: merchant.user?.email,
        brandName: merchant.brandName,
        whatsapp: merchant.whatsapp,
        paidCredit: roundCredit(merchant.creditBalance),
        bonusCredit: roundCredit(merchant.bonusCreditBalance),
        totalCredit: roundCredit(Number(merchant.creditBalance || 0) + Number(merchant.bonusCreditBalance || 0)),
        memberTier: merchant.memberTier,
        tierLabel: tier?.label || merchant.memberTier,
        bonusCap: Number(tier?.bonusCap || 0),
        kycStatus: merchant.kycStatus,
        referralCode: merchant.referralCode,
        referralCount,
        paidReferralCount,
        plan: merchant.plan,
        planStatus: merchant.planStatus,
        nextBillingAt: merchant.nextBillingAt,
        extraSkuCredits: merchant.extraSkuCredits,
        approvedPostsThisMonth: approvedThisMonth,
        monthlyPostRequired: Number(tier?.monthlyPostRequired || 0),
        hasActiveFunnel: Boolean(activeFunnel || merchant.planStatus === 'ACTIVE')
      },
      levels,
      storeItems,
      subscriptions,
      ledgers,
      materials,
      proofs,
      kyc
    })
  } catch (err) { next(err) }
})

router.post('/kyc', async (req, res, next) => {
  try {
    const merchant = await getMerchant(req)
    const body = z.object({
      fullName: z.string().min(2),
      icNumber: z.string().max(80).optional().nullable(),
      phone: z.string().max(80).optional().nullable(),
      socialProfile: z.string().max(300).optional().nullable(),
      icFrontUrl: z.string().url().optional().nullable(),
      icBackUrl: z.string().url().optional().nullable(),
      selfieUrl: z.string().url().optional().nullable()
    }).parse(req.body)
    const submission = await prisma.$transaction(async tx => {
      await tx.merchant.update({ where: { id: merchant.id }, data: { kycStatus: 'PENDING' } })
      return tx.kycSubmission.create({ data: { merchantId: merchant.id, ...body, status: 'PENDING' } })
    })
    res.status(201).json({ ok: true, submission, message: 'KYC 已提交，等待 Super Admin 审核。' })
  } catch (err) { next(err) }
})

router.post('/social-proof', async (req, res, next) => {
  try {
    const merchant = await getMerchant(req)
    const body = z.object({
      campaignId: z.string().optional().nullable(),
      materialId: z.string().optional().nullable(),
      platform: z.string().min(2),
      postType: z.enum(['STORY', 'POST', 'VIDEO', 'STATUS']),
      proofImageUrl: z.string().url().optional().nullable(),
      postUrl: z.string().url().optional().nullable(),
      caption: z.string().max(1000).optional().nullable()
    }).parse(req.body)
    const proof = await prisma.socialProofSubmission.create({ data: { merchantId: merchant.id, ...body, status: 'PENDING' } })
    res.status(201).json({ ok: true, proof, message: 'Social proof 已提交，审核通过后会计算任务和 Bonus Credit。' })
  } catch (err) { next(err) }
})

router.post('/store/purchase', async (req, res, next) => {
  try {
    const merchant = await getMerchant(req)
    const body = z.object({ itemId: z.string() }).parse(req.body)
    const item = await prisma.productStoreItem.findUnique({ where: { id: body.itemId } })
    if (!item || !item.isActive) return res.status(404).json({ message: '这个产品 / 服务不存在或已经下架。' })

    const result = await debitOrderWithBonusCap({
      merchantId: merchant.id,
      amount: item.price,
      category: `STORE_${item.type}`,
      referenceType: 'ProductStoreItem',
      referenceId: item.id,
      bonusAllowed: item.bonusAllowed,
      note: `Purchase ${item.name}`
    })

    let subscription = null
    let updatedMerchant = result.merchant
    if (item.type === 'FUNNEL_PLAN') {
      const planCode = item.code.includes('SCALE') ? 'SCALE' : item.code.includes('GROWTH') ? 'GROWTH' : 'STARTER'
      subscription = await prisma.memberProductSubscription.create({
        data: {
          merchantId: merchant.id,
          productItemId: item.id,
          productCode: item.code,
          planCode,
          status: 'ACTIVE',
          monthlyPrice: item.billingType === 'MONTHLY' ? item.price : 0,
          nextBillingAt: item.billingType === 'MONTHLY' ? addOneMonth(new Date()) : null
        }
      })
      updatedMerchant = await prisma.merchant.update({
        where: { id: merchant.id },
        data: { plan: planCode, planStatus: 'ACTIVE', nextBillingAt: addOneMonth(new Date()), lastMonthlyChargeAt: new Date() }
      })
    } else if (item.code === 'EXTRA_SKU') {
      updatedMerchant = await prisma.merchant.update({ where: { id: merchant.id }, data: { extraSkuCredits: { increment: 1 } } })
      subscription = await prisma.memberProductSubscription.create({ data: { merchantId: merchant.id, productItemId: item.id, productCode: item.code, status: 'COMPLETED' } })
    } else {
      subscription = await prisma.memberProductSubscription.create({ data: { merchantId: merchant.id, productItemId: item.id, productCode: item.code, status: item.billingType === 'MONTHLY' ? 'ACTIVE' : 'COMPLETED', monthlyPrice: item.billingType === 'MONTHLY' ? item.price : 0, nextBillingAt: item.billingType === 'MONTHLY' ? addOneMonth(new Date()) : null } })
    }

    const referrerId = merchant.referredById
    if (referrerId && referrerId !== merchant.id) {
      const reward = roundCredit(Number(item.price || 0) * 0.1)
      await prisma.referralEvent.create({ data: { referrerMerchantId: referrerId, referredMerchantId: merchant.id, eventType: 'PURCHASE', rewardStatus: 'APPROVED', rewardCredit: reward, orderAmount: item.price } })
      const { adjustCredit } = require('../lib/wallet')
      await adjustCredit({ merchantId: referrerId, bucket: 'BONUS', amount: reward, category: 'REFERRAL_PURCHASE', note: `10% purchase reward from ${merchant.brandName}` })
    }

    res.json({
      ok: true,
      message: `${item.name} 已购买 / 开通。已扣 Bonus ${result.bonusUsed} + Paid ${result.paidUsed} credit。`,
      subscription,
      merchant: { paidCredit: roundCredit(updatedMerchant.creditBalance), bonusCredit: roundCredit(updatedMerchant.bonusCreditBalance), plan: updatedMerchant.plan, planStatus: updatedMerchant.planStatus },
      payment: { price: result.price, bonusUsed: result.bonusUsed, paidUsed: result.paidUsed, bonusCap: result.bonusCap }
    })
  } catch (err) { next(err) }
})

module.exports = router
