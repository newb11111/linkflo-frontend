require('dotenv').config()
const bcrypt = require('bcryptjs')
const prisma = require('../src/lib/prisma')
const { ensureDefaultLevelSettings } = require('../src/lib/wallet')

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@linkflo.local'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  const hash = await bcrypt.hash(adminPassword, 10)
  await prisma.user.upsert({ where: { email: adminEmail }, update: { password: hash, role: 'ADMIN', name: 'LinkFlo Admin' }, create: { email: adminEmail, password: hash, role: 'ADMIN', name: 'LinkFlo Admin' } })
  await ensureDefaultLevelSettings(prisma)
  const storeItems = [
    { code: 'FUNNEL_STARTER', name: 'AI Funnel Starter', type: 'FUNNEL_PLAN', price: 29, billingType: 'MONTHLY', description: 'Create AI sales funnels, promoter links and WhatsApp click tracking.', sortOrder: 1, isActive: true },
    { code: 'FUNNEL_GROWTH', name: 'AI Funnel Growth', type: 'FUNNEL_PLAN', price: 139, billingType: 'MONTHLY', description: 'Grow multiple AI offers with 50 promoter links included.', sortOrder: 2, isActive: true },
    { code: 'FUNNEL_SCALE', name: 'AI Funnel Scale', type: 'FUNNEL_PLAN', price: 259, billingType: 'MONTHLY', description: 'For team promotion and higher-volume AI product tracking.', sortOrder: 3, isActive: true }
  ]
  const deprecatedDemoCodes = [
    'EXTRA_SKU', 'AI_CAPTION_GENERATOR', 'AI_POSTER_MAKER', 'WHATSAPP_SCRIPT',
    'WEBSITE_AUDIT', 'WEBSITE_BUILD', 'ACADEMY_ACCESS',
    'PARTNER_WHATSAPP_BOT', 'PARTNER_CRM_ASSISTANT'
  ]
  await prisma.productStoreItem.updateMany({ where: { code: { in: deprecatedDemoCodes } }, data: { isActive: false } })
  for (const item of storeItems) {
    await prisma.productStoreItem.upsert({ where: { code: item.code }, update: item, create: item })
  }
  console.log('Seeded admin:', adminEmail, 'password:', adminPassword)
  console.log('Seeded default ambassador levels and product store items.')
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
