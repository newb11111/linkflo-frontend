const prisma = require('./prisma')

function roundCredit(value) {
  return Math.round(Number(value || 0) * 100) / 100
}

const DEFAULT_LEVELS = {
  UNVERIFIED: { tier: 'UNVERIFIED', label: 'Unverified Member', bonusCap: 0.05, kycRequired: false, monthlyPostRequired: 0 },
  VERIFIED: { tier: 'VERIFIED', label: 'Verified Member', bonusCap: 0.30, kycRequired: true, monthlyPostRequired: 0 },
  GOLD: { tier: 'GOLD', label: 'Gold Ambassador', bonusCap: 0.40, kycRequired: true, monthlyPostRequired: 4 },
  DIAMOND: { tier: 'DIAMOND', label: 'Diamond Ambassador', bonusCap: 0.50, kycRequired: true, monthlyPostRequired: 8 }
}

async function ensureDefaultLevelSettings(db = prisma) {
  const out = []
  for (const level of Object.values(DEFAULT_LEVELS)) {
    const row = await db.ambassadorLevelSetting.upsert({
      where: { tier: level.tier },
      update: {},
      create: level
    })
    out.push(row)
  }
  return out
}

async function getLevelSettings(db = prisma) {
  const settings = await db.ambassadorLevelSetting.findMany({ orderBy: { bonusCap: 'asc' } }).catch(() => [])
  if (!settings.length) return Object.values(DEFAULT_LEVELS)
  const merged = { ...DEFAULT_LEVELS }
  for (const s of settings) merged[s.tier] = s
  return Object.values(merged)
}

function defaultLevelForTier(tier) {
  return DEFAULT_LEVELS[String(tier || 'UNVERIFIED').toUpperCase()] || DEFAULT_LEVELS.UNVERIFIED
}

async function getBonusCapForMerchant(db, merchant) {
  const tier = String(merchant?.memberTier || 'UNVERIFIED').toUpperCase()
  const setting = await db.ambassadorLevelSetting.findUnique({ where: { tier } }).catch(() => null)
  return Number((setting || defaultLevelForTier(tier)).bonusCap || 0)
}

async function writeLedger(db, { merchantId, bucket, direction, amount, balanceBefore, balanceAfter, category, referenceType, referenceId, note, createdByAdminId }) {
  return db.creditLedger.create({
    data: {
      merchantId,
      bucket,
      direction,
      amount: roundCredit(Math.abs(amount)),
      balanceBefore: roundCredit(balanceBefore),
      balanceAfter: roundCredit(balanceAfter),
      category,
      referenceType: referenceType || null,
      referenceId: referenceId || null,
      note: note || null,
      createdByAdminId: createdByAdminId || null
    }
  })
}

async function adjustCredit({ merchantId, bucket = 'PAID', amount, category = 'ADMIN_ADJUST', note, createdByAdminId, db = prisma }) {
  const cleanBucket = String(bucket || 'PAID').toUpperCase() === 'BONUS' ? 'BONUS' : 'PAID'
  const change = roundCredit(amount)
  if (!change) {
    const err = new Error('Credit change 不能是 0。')
    err.status = 400
    throw err
  }

  return db.$transaction(async tx => {
    const merchant = await tx.merchant.findUnique({ where: { id: merchantId } })
    if (!merchant) {
      const err = new Error('Member 不存在。')
      err.status = 404
      throw err
    }
    const field = cleanBucket === 'BONUS' ? 'bonusCreditBalance' : 'creditBalance'
    const before = roundCredit(merchant[field] || 0)
    const after = roundCredit(before + change)
    if (after < 0) {
      const err = new Error(`${cleanBucket} Credit 不够扣。目前 ${before}，不能扣 ${Math.abs(change)}。`)
      err.status = 400
      throw err
    }
    const updated = await tx.merchant.update({ where: { id: merchant.id }, data: { [field]: after } })
    await writeLedger(tx, {
      merchantId: merchant.id,
      bucket: cleanBucket,
      direction: change > 0 ? 'CREDIT' : 'DEBIT',
      amount: Math.abs(change),
      balanceBefore: before,
      balanceAfter: after,
      category,
      note,
      createdByAdminId
    })
    return updated
  })
}

async function debitOrderWithBonusCap({ merchantId, amount, category = 'ORDER', referenceType, referenceId, note, bonusAllowed = true, db = prisma }) {
  const price = roundCredit(amount)
  if (price <= 0) {
    const err = new Error('订单金额必须大过 0。')
    err.status = 400
    throw err
  }

  return db.$transaction(async tx => {
    const merchant = await tx.merchant.findUnique({ where: { id: merchantId } })
    if (!merchant) {
      const err = new Error('Member 不存在。')
      err.status = 404
      throw err
    }
    const cap = bonusAllowed ? await getBonusCapForMerchant(tx, merchant) : 0
    const maxBonus = roundCredit(price * cap)
    const bonusBefore = roundCredit(merchant.bonusCreditBalance || 0)
    const paidBefore = roundCredit(merchant.creditBalance || 0)
    const bonusUsed = roundCredit(Math.min(bonusBefore, maxBonus))
    const paidNeeded = roundCredit(price - bonusUsed)

    if (paidBefore < paidNeeded) {
      const err = new Error(`Paid Credit 不足。这个订单需要 ${paidNeeded} paid credit，目前只有 ${paidBefore}。Bonus Credit 最多只能抵 ${Math.round(cap * 100)}%。`)
      err.status = 402
      err.needTopup = true
      err.requiredPaidCredit = paidNeeded
      err.paidCreditBalance = paidBefore
      err.bonusCreditBalance = bonusBefore
      err.bonusCap = cap
      throw err
    }

    const data = {}
    if (bonusUsed > 0) data.bonusCreditBalance = roundCredit(bonusBefore - bonusUsed)
    if (paidNeeded > 0) data.creditBalance = roundCredit(paidBefore - paidNeeded)

    const updated = await tx.merchant.update({ where: { id: merchant.id }, data })

    if (bonusUsed > 0) {
      await writeLedger(tx, {
        merchantId: merchant.id,
        bucket: 'BONUS',
        direction: 'DEBIT',
        amount: bonusUsed,
        balanceBefore: bonusBefore,
        balanceAfter: roundCredit(bonusBefore - bonusUsed),
        category,
        referenceType,
        referenceId,
        note
      })
    }
    if (paidNeeded > 0) {
      await writeLedger(tx, {
        merchantId: merchant.id,
        bucket: 'PAID',
        direction: 'DEBIT',
        amount: paidNeeded,
        balanceBefore: paidBefore,
        balanceAfter: roundCredit(paidBefore - paidNeeded),
        category,
        referenceType,
        referenceId,
        note
      })
    }

    return { merchant: updated, price, bonusUsed, paidUsed: paidNeeded, bonusCap: cap }
  })
}

module.exports = {
  DEFAULT_LEVELS,
  roundCredit,
  ensureDefaultLevelSettings,
  getLevelSettings,
  getBonusCapForMerchant,
  adjustCredit,
  debitOrderWithBonusCap,
  writeLedger
}
