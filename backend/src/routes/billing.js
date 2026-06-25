const router = require('express').Router()
const crypto = require('crypto')
const axios = require('axios')
const { z } = require('zod')
const prisma = require('../lib/prisma')
const { requireAuth, requireRole } = require('../middleware/auth')
const { PLANS, getPlan } = require('../lib/plans')
const { writeLedger, roundCredit: roundWalletCredit } = require('../lib/wallet')

const PLAN_PRICES = Object.fromEntries(Object.entries(PLANS).map(([k, v]) => [k, v.price]))
const SKU_CREDIT_PRICE = 100
const MIN_TOPUP = 100

function roundCredit(value) {
  return Math.round(Number(value || 0) * 10) / 10
}
function addOneMonth(date = new Date()) {
  const next = new Date(date)
  next.setMonth(next.getMonth() + 1)
  return next
}
function getBaseUrl(req) {
  return `${req.protocol}://${req.get('host')}`
}

async function ensureMonthlyBilling(db, merchant) {
  if (merchant.planStatus !== 'ACTIVE') return merchant
  const now = new Date()
  const nextBillingAt = merchant.nextBillingAt || addOneMonth(merchant.createdAt || now)
  if (nextBillingAt > now) return merchant

  const plan = getPlan(merchant.plan)
  const cost = Number(plan.price || 0)
  const current = Number(merchant.creditBalance || 0)

  if (current < cost) {
    return db.merchant.update({
      where: { id: merchant.id },
      data: { planStatus: 'PAST_DUE', nextBillingAt }
    })
  }

  return db.$transaction(async tx => {
    const debit = await tx.merchant.updateMany({
      where: { id: merchant.id, creditBalance: { gte: cost } },
      data: {
        creditBalance: { decrement: cost },
        planStatus: 'ACTIVE',
        lastMonthlyChargeAt: now,
        nextBillingAt: addOneMonth(nextBillingAt)
      }
    })
    if (debit.count !== 1) {
      return tx.merchant.update({
        where: { id: merchant.id },
        data: { planStatus: 'PAST_DUE', nextBillingAt }
      })
    }
    const bt = await tx.billingTransaction.create({
      data: {
        merchantId: merchant.id,
        type: 'MONTHLY_PLAN_FEE',
        plan: merchant.plan,
        amount: cost,
        creditAmount: -cost,
        status: 'PAID',
        rawPayload: { autoMonthlyDeduct: true, chargedAt: now.toISOString(), atomicDebit: true }
      }
    })
    await writeLedger(tx, {
      merchantId: merchant.id,
      bucket: 'PAID',
      direction: 'DEBIT',
      amount: cost,
      balanceBefore: current,
      balanceAfter: current - cost,
      category: 'MONTHLY_PLAN_FEE',
      referenceType: 'BillingTransaction',
      referenceId: bt.id,
      note: 'Auto monthly AI Funnel plan deduction'
    })
    return tx.merchant.findUnique({ where: { id: merchant.id }, include: { user: true } })
  })
}

async function createBillplzBill({ name, email, amountRm, description, callbackUrl, redirectUrl }) {
  if (!process.env.BILLPLZ_API_KEY || !process.env.BILLPLZ_COLLECTION_ID) {
    return {
      mock: true,
      id: `mock_${Date.now()}`,
      url: redirectUrl || process.env.FRONTEND_URL || 'http://localhost:3000/merchant'
    }
  }

  const auth = Buffer.from(`${process.env.BILLPLZ_API_KEY}:`).toString('base64')
  const params = new URLSearchParams()
  params.append('collection_id', process.env.BILLPLZ_COLLECTION_ID)
  params.append('email', email)
  params.append('name', name)
  params.append('amount', String(Math.round(amountRm * 100)))
  params.append('description', description)
  params.append('callback_url', callbackUrl)
  params.append('redirect_url', redirectUrl)

  const response = await axios.post('https://www.billplz.com/api/v3/bills', params, {
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  return response.data
}

router.use('/merchant', requireAuth, requireRole('MERCHANT'))

async function getMerchant(req) {
  const merchant = await prisma.merchant.findUnique({
    where: { userId: req.user.id },
    include: { user: true }
  })
  if (!merchant) {
    const err = new Error('Merchant profile not found')
    err.status = 404
    throw err
  }
  return ensureMonthlyBilling(prisma, merchant)
}

router.get('/merchant/summary', async (req, res, next) => {
  try {
    const merchant = await getMerchant(req)
    const payments = await prisma.billingTransaction.findMany({
      where: { merchantId: merchant.id },
      orderBy: { createdAt: 'desc' },
      take: 30
    })
    res.json({
      merchant: {
        id: merchant.id,
        plan: merchant.plan,
        planStatus: merchant.planStatus,
        nextBillingAt: merchant.nextBillingAt,
        extraSkuCredits: merchant.extraSkuCredits,
        creditBalance: roundCredit(merchant.creditBalance || 0)
      },
      planPrices: PLAN_PRICES,
      skuCreditPrice: SKU_CREDIT_PRICE,
      minimumTopup: MIN_TOPUP,
      payments
    })
  } catch (err) { next(err) }
})

router.post('/merchant/apply-credit', async (req, res, next) => {
  try {
    const merchant = await getMerchant(req)
    const body = z.object({
      type: z.enum(['PLAN_CHANGE', 'SKU_CREDIT']),
      plan: z.enum(['STARTER', 'GROWTH', 'SCALE']).optional(),
      skuCredits: z.coerce.number().int().min(1).max(20).optional()
    }).parse(req.body)

    let cost = 0
    let description = ''

    if (body.type === 'PLAN_CHANGE') {
      if (!body.plan) return res.status(400).json({ message: '请选择要切换的配套。' })
      cost = PLAN_PRICES[body.plan]
      description = `配套切换：${body.plan}`
    } else {
      const credits = body.skuCredits || 1
      cost = credits * SKU_CREDIT_PRICE
      description = `额外 SKU Credit x${credits}`
    }

    if (Number(merchant.creditBalance || 0) < cost) {
      return res.status(402).json({
        message: `Credit 不足。需要 RM${cost} credit，目前只有 RM${roundCredit(merchant.creditBalance || 0)}。请先充值。`,
        needTopup: true,
        requiredCredit: cost,
        creditBalance: roundCredit(merchant.creditBalance || 0)
      })
    }

    const result = await prisma.$transaction(async db => {
      const data = { creditBalance: { decrement: cost }, planStatus: 'ACTIVE' }
      if (body.type === 'PLAN_CHANGE') {
        data.plan = body.plan
        data.nextBillingAt = addOneMonth(new Date())
        data.lastMonthlyChargeAt = new Date()
      }
      if (body.type === 'SKU_CREDIT') data.extraSkuCredits = { increment: body.skuCredits || 1 }

      const debit = await db.merchant.updateMany({
        where: { id: merchant.id, creditBalance: { gte: cost } },
        data
      })
      if (debit.count !== 1) {
        const err = new Error(`Credit 不足。需要 RM${cost} credit，目前只有 RM${roundCredit(merchant.creditBalance || 0)}。请先充值。`)
        err.status = 402
        err.needTopup = true
        throw err
      }
      const tx = await db.billingTransaction.create({
        data: {
          merchantId: merchant.id,
          type: body.type,
          plan: body.plan || null,
          skuCredits: body.type === 'SKU_CREDIT' ? (body.skuCredits || 1) : 0,
          amount: cost,
          creditAmount: -cost,
          status: 'PAID',
          rawPayload: { description, paidByCredit: true, atomicDebit: true }
        }
      })
      const before = roundWalletCredit(merchant.creditBalance || 0)
      const after = roundWalletCredit(before - cost)
      await writeLedger(db, {
        merchantId: merchant.id,
        bucket: 'PAID',
        direction: 'DEBIT',
        amount: cost,
        balanceBefore: before,
        balanceAfter: after,
        category: body.type,
        referenceType: 'BillingTransaction',
        referenceId: tx.id,
        note: description
      })
      const updated = await db.merchant.findUnique({ where: { id: merchant.id } })
      return { tx, merchant: updated }
    })

    res.json({
      ok: true,
      message: `${description} 已成功，已扣除 RM${cost} credit。`,
      merchant: {
        plan: result.merchant.plan,
        extraSkuCredits: result.merchant.extraSkuCredits,
        creditBalance: roundCredit(result.merchant.creditBalance)
      }
    })
  } catch (err) { next(err) }
})

router.post('/merchant/topup', async (req, res, next) => {
  try {
    const merchant = await getMerchant(req)
    const body = z.object({ amount: z.coerce.number().int().min(MIN_TOPUP).max(10000) }).parse(req.body)

    const tx = await prisma.billingTransaction.create({
      data: {
        merchantId: merchant.id,
        type: 'CREDIT_TOPUP',
        amount: body.amount,
        creditAmount: body.amount,
        status: 'PENDING'
      }
    })

    const callbackUrl = process.env.BILLPLZ_CALLBACK_URL || `${getBaseUrl(req)}/api/billing/billplz-callback`
    const redirectUrl = process.env.BILLPLZ_REDIRECT_URL || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/merchant?billing=return`

    const bill = await createBillplzBill({
      name: merchant.user?.name || merchant.brandName,
      email: merchant.user?.email,
      amountRm: body.amount,
      description: `LinkFlo merchant credit top up RM${body.amount}`,
      callbackUrl,
      redirectUrl
    })

    await prisma.billingTransaction.update({
      where: { id: tx.id },
      data: {
        billId: bill.id || bill.bill_id || null,
        billUrl: bill.url || null,
        rawPayload: bill
      }
    })

    res.json({
      ok: true,
      transactionId: tx.id,
      billId: bill.id || bill.bill_id || null,
      billUrl: bill.url || null,
      mock: !!bill.mock,
      message: bill.mock ? 'Billplz env 还没设置，这是 mock topup；上线接 Billplz 后会跳到真实付款链接。' : 'Topup bill created.'
    })
  } catch (err) { next(err) }
})

router.post('/billplz-callback', async (req, res, next) => {
  try {
    const payload = req.body || {}
    const billId = payload.id || payload.bill_id
    const paid = payload.paid === true || payload.paid === 'true' || payload.state === 'paid'

    if (process.env.BILLPLZ_X_SIGNATURE_KEY && req.headers['x-signature']) {
      const sorted = Object.keys(payload).sort().map(k => `${k}${payload[k]}`).join('|')
      const signature = crypto.createHmac('sha256', process.env.BILLPLZ_X_SIGNATURE_KEY).update(sorted).digest('hex')
      if (signature !== req.headers['x-signature']) return res.status(401).json({ message: 'Invalid Billplz signature' })
    }

    const tx = await prisma.billingTransaction.findFirst({ where: { billId: String(billId || '') } })
    if (!tx) return res.json({ ok: true, ignored: true })
    if (tx.status === 'PAID') return res.json({ ok: true, alreadyPaid: true })

    if (!paid) {
      await prisma.billingTransaction.update({ where: { id: tx.id }, data: { status: 'FAILED', rawPayload: payload } })
      return res.json({ ok: true })
    }

    await prisma.$transaction(async db => {
      const paidTx = await db.billingTransaction.updateMany({
        where: { id: tx.id, status: { not: 'PAID' } },
        data: { status: 'PAID', rawPayload: payload }
      })
      if (paidTx.count !== 1) return
      if (tx.merchantId && tx.type === 'CREDIT_TOPUP' && Number(tx.creditAmount) > 0) {
        const merchant = await db.merchant.findUnique({ where: { id: tx.merchantId } })
        const before = roundWalletCredit(merchant?.creditBalance || 0)
        const amount = roundWalletCredit(tx.creditAmount || 0)
        const after = roundWalletCredit(before + amount)
        await db.merchant.update({
          where: { id: tx.merchantId },
          data: { creditBalance: after }
        })
        await writeLedger(db, {
          merchantId: tx.merchantId,
          bucket: 'PAID',
          direction: 'CREDIT',
          amount,
          balanceBefore: before,
          balanceAfter: after,
          category: 'CREDIT_TOPUP',
          referenceType: 'BillingTransaction',
          referenceId: tx.id,
          note: 'Billplz paid credit topup'
        })
      }
    })

    res.json({ ok: true })
  } catch (err) { next(err) }
})

module.exports = router
