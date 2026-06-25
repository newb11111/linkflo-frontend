const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { z } = require('zod')
const prisma = require('../lib/prisma')
const { generateReferralCode } = require('../lib/referral')
const { adjustCredit, ensureDefaultLevelSettings } = require('../lib/wallet')

const loginSchema = z.object({
  email: z.string().email().transform(v => v.trim().toLowerCase()),
  password: z.string().min(6)
})

function envAdminEmail() {
  return String(process.env.ADMIN_EMAIL || 'admin@linkflo.local').trim().toLowerCase()
}

function envAdminPassword() {
  return String(process.env.ADMIN_PASSWORD || 'admin123')
}

async function ensureEnvAdmin(email, password) {
  const adminEmail = envAdminEmail()
  const adminPassword = envAdminPassword()

  if (email !== adminEmail || password !== adminPassword) return null

  const hash = await bcrypt.hash(adminPassword, 10)
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hash,
      role: 'ADMIN',
      name: 'LinkFlo Admin'
    },
    create: {
      email: adminEmail,
      password: hash,
      role: 'ADMIN',
      name: 'LinkFlo Admin'
    },
    include: { merchant: true }
  })

  return admin
}

function signUser(user) {
  return jwt.sign(
    { id: user.id, role: user.role, merchantId: user.merchant?.id || null },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

exports.login = async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body)

    let user = await prisma.user.findUnique({
      where: { email: body.email },
      include: { merchant: true }
    })

    // This prevents local/dev admin login from breaking just because seed was not run
    // or ADMIN_PASSWORD was changed in .env after the old hash was created.
    if (!user || (user.role === 'ADMIN' && body.email === envAdminEmail())) {
      const ensuredAdmin = await ensureEnvAdmin(body.email, body.password)
      if (ensuredAdmin) user = ensuredAdmin
    }

    if (!user) return res.status(401).json({ message: 'Invalid email or password' })

    let ok = await bcrypt.compare(body.password, user.password)

    // If this is env admin and password matches .env, resync the hash then allow login.
    if (!ok && user.role === 'ADMIN') {
      const ensuredAdmin = await ensureEnvAdmin(body.email, body.password)
      if (ensuredAdmin) {
        user = ensuredAdmin
        ok = true
      }
    }

    if (!ok) return res.status(401).json({ message: 'Invalid email or password' })

    const token = signUser(user)
    const isProd = process.env.NODE_ENV === 'production'
    res.cookie('linkflo_token', token, {
      httpOnly: true,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        merchantId: user.merchant?.id || null
      }
    })
  } catch (err) { next(err) }
}

exports.me = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { merchant: true }
    })
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      merchant: user.merchant
    })
  } catch (err) { next(err) }
}

exports.logout = (req, res) => {
  const isProd = process.env.NODE_ENV === 'production'
  res.clearCookie('linkflo_token', {
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd
  })
  res.json({ ok: true })
}

exports.registerMerchant = async (req, res, next) => {
  try {
    const body = z.object({
      email: z.string().email().transform(v => v.trim().toLowerCase()),
      password: z.string().min(8),
      name: z.string().min(1),
      brandName: z.string().min(1),
      whatsapp: z.string().min(8).transform(v => v.replace(/\D/g, '')),
      referralCode: z.string().max(40).optional().nullable(),
      plan: z.enum(['STARTER', 'GROWTH', 'SCALE']).optional()
    }).parse(req.body)

    const exists = await prisma.user.findUnique({ where: { email: body.email } })
    if (exists) return res.status(409).json({ message: '这个 email 已经注册，请直接登录。' })

    await ensureDefaultLevelSettings(prisma)

    let referrer = null
    const inputReferral = String(body.referralCode || '').trim().toUpperCase()
    if (inputReferral) {
      referrer = await prisma.merchant.findFirst({ where: { referralCode: inputReferral } })
    }

    const password = await bcrypt.hash(body.password, 10)
    const referralCode = await generateReferralCode(prisma)

    const user = await prisma.user.create({
      data: {
        email: body.email,
        password,
        name: body.name,
        role: 'MERCHANT',
        merchant: {
          create: {
            brandName: body.brandName,
            whatsapp: body.whatsapp,
            plan: 'STARTER',
            creditBalance: 0,
            bonusCreditBalance: 20,
            extraSkuCredits: 0,
            planStatus: 'INACTIVE',
            nextBillingAt: null,
            memberStatus: 'ACTIVE',
            memberTier: 'UNVERIFIED',
            kycStatus: 'UNVERIFIED',
            referralCode,
            referredById: referrer?.id || null
          }
        }
      },
      include: { merchant: true }
    })

    await prisma.creditLedger.create({
      data: {
        merchantId: user.merchant.id,
        bucket: 'BONUS',
        direction: 'CREDIT',
        amount: 20,
        balanceBefore: 0,
        balanceAfter: 20,
        category: 'WELCOME_BONUS',
        note: 'Free member welcome bonus credit'
      }
    })

    if (referrer && referrer.id !== user.merchant.id) {
      await prisma.referralEvent.create({
        data: {
          referrerMerchantId: referrer.id,
          referredMerchantId: user.merchant.id,
          eventType: 'REGISTER',
          rewardStatus: 'APPROVED',
          rewardCredit: 20
        }
      })
      await adjustCredit({
        merchantId: referrer.id,
        bucket: 'BONUS',
        amount: 20,
        category: 'REFERRAL_REGISTER',
        note: `Referral register reward for ${body.email}`
      })
    }

    const token = signUser(user)
    const isProd = process.env.NODE_ENV === 'production'
    res.cookie('linkflo_token', token, {
      httpOnly: true,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(201).json({
      token,
      selectedPlan: body.plan || null,
      message: 'Linkflo Member 注册成功。你已获得 20 Bonus Credit，AI Funnel 需要在 Member Dashboard 里面开通。',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        merchantId: user.merchant?.id || null,
        referralCode: user.merchant?.referralCode || null
      }
    })
  } catch (err) { next(err) }
}
