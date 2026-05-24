require('dotenv').config()
const bcrypt = require('bcryptjs')
const prisma = require('../src/lib/prisma')

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@linkflo.local'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  const hash = await bcrypt.hash(adminPassword, 10)
  await prisma.user.upsert({ where: { email: adminEmail }, update: { password: hash, role: 'ADMIN', name: 'LinkFlo Admin' }, create: { email: adminEmail, password: hash, role: 'ADMIN', name: 'LinkFlo Admin' } })
  console.log('Seeded admin:', adminEmail, 'password:', adminPassword)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
