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
  await prisma.productStoreItem.createMany({
    skipDuplicates: true,
    data: [
      { code: 'FUNNEL_STARTER', name: 'AI Funnel Starter', type: 'FUNNEL_PLAN', price: 29, billingType: 'MONTHLY', description: '10 promoter links, 1 funnel SKU included.', sortOrder: 1 },
      { code: 'FUNNEL_GROWTH', name: 'AI Funnel Growth', type: 'FUNNEL_PLAN', price: 139, billingType: 'MONTHLY', description: '50 promoter links, 1 funnel SKU included.', sortOrder: 2 },
      { code: 'FUNNEL_SCALE', name: 'AI Funnel Scale', type: 'FUNNEL_PLAN', price: 259, billingType: 'MONTHLY', description: '100 promoter links, 1 funnel SKU included.', sortOrder: 3 },
      { code: 'EXTRA_SKU', name: 'Extra Funnel Slot / SKU', type: 'ADDON', price: 100, billingType: 'ONE_TIME', description: 'Add 1 extra funnel SKU slot.', sortOrder: 4 },
      { code: 'WEBSITE_AUDIT', name: 'Website / Funnel Audit', type: 'SERVICE', price: 50, billingType: 'ONE_TIME', description: 'Page review and improvement direction.', sortOrder: 5 },
      { code: 'WHATSAPP_SCRIPT', name: 'WhatsApp Closing Script', type: 'SERVICE', price: 30, billingType: 'ONE_TIME', description: 'Simple closing script for your offer.', sortOrder: 6 },
      { code: 'WEBSITE_BUILD', name: 'Website Build Service', type: 'SERVICE', price: 599, billingType: 'ONE_TIME', description: 'Basic website / landing page build request.', sortOrder: 7 },
      { code: 'ACADEMY_ACCESS', name: 'Academy Access', type: 'ACADEMY', price: 399, billingType: 'ONE_TIME', description: 'Academy access placeholder.', sortOrder: 8 }
    ]
  })
  console.log('Seeded admin:', adminEmail, 'password:', adminPassword)
  console.log('Seeded default ambassador levels and product store items.')
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
