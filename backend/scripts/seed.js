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
    { code: 'FUNNEL_STARTER', name: 'AI Funnel Starter', type: 'FUNNEL_PLAN', price: 29, billingType: 'MONTHLY', description: 'Create AI sales funnels, promoter links and WhatsApp click tracking.', sortOrder: 1 },
    { code: 'FUNNEL_GROWTH', name: 'AI Funnel Growth', type: 'FUNNEL_PLAN', price: 139, billingType: 'MONTHLY', description: 'Grow multiple AI offers with 50 promoter links included.', sortOrder: 2 },
    { code: 'FUNNEL_SCALE', name: 'AI Funnel Scale', type: 'FUNNEL_PLAN', price: 259, billingType: 'MONTHLY', description: 'For team promotion and higher-volume AI product tracking.', sortOrder: 3 },
    { code: 'EXTRA_SKU', name: 'Extra AI Product Funnel Slot', type: 'ADDON', price: 100, billingType: 'ONE_TIME', description: 'Add 1 extra AI product funnel slot.', sortOrder: 4 },
    { code: 'AI_CAPTION_GENERATOR', name: 'AI Caption Generator', type: 'SERVICE', price: 19, billingType: 'MONTHLY', description: 'Generate social captions for campaigns quickly.', sortOrder: 5 },
    { code: 'AI_POSTER_MAKER', name: 'AI Poster Maker', type: 'SERVICE', price: 15, billingType: 'MONTHLY', description: 'Create promotional posters for AI products quickly.', sortOrder: 6 },
    { code: 'WHATSAPP_SCRIPT', name: 'AI WhatsApp Closing Script', type: 'SERVICE', price: 30, billingType: 'ONE_TIME', description: 'Generate WhatsApp closing scripts for your AI product.', sortOrder: 7 },
    { code: 'WEBSITE_AUDIT', name: 'AI Funnel Audit', type: 'SERVICE', price: 50, billingType: 'ONE_TIME', description: 'Linkflo reviews your AI product page, offer and conversion flow.', sortOrder: 8 },
    { code: 'WEBSITE_BUILD', name: 'AI Landing Page Builder Service', type: 'SERVICE', price: 599, billingType: 'ONE_TIME', description: 'Linkflo helps build a sales page for your AI product.', sortOrder: 9 },
    { code: 'ACADEMY_ACCESS', name: 'AI Academy Access', type: 'ACADEMY', price: 399, billingType: 'ONE_TIME', description: 'Learn AI products, AI funnels, promotion and monetization.', sortOrder: 10 },
    { code: 'PARTNER_WHATSAPP_BOT', name: 'Partner AI WhatsApp Reply Bot', type: 'PARTNER_PRODUCT', price: 99, billingType: 'MONTHLY', description: 'Partner product: reply to customer questions for sales and support.', sortOrder: 11 },
    { code: 'PARTNER_CRM_ASSISTANT', name: 'Partner AI CRM Assistant', type: 'PARTNER_PRODUCT', price: 129, billingType: 'MONTHLY', description: 'Partner product: follow up leads, record customers and trigger sales reminders.', sortOrder: 12 }
  ]
  for (const item of storeItems) {
    await prisma.productStoreItem.upsert({ where: { code: item.code }, update: item, create: item })
  }
  console.log('Seeded admin:', adminEmail, 'password:', adminPassword)
  console.log('Seeded default ambassador levels and product store items.')
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
