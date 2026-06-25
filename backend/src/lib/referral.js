const { customAlphabet } = require('nanoid')
const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
const nanoid = customAlphabet(alphabet, 8)

async function generateReferralCode(prisma, prefix = 'LF') {
  for (let i = 0; i < 12; i++) {
    const code = `${prefix}${nanoid()}`
    const existing = await prisma.merchant.findFirst({ where: { referralCode: code } })
    if (!existing) return code
  }
  return `${prefix}${Date.now().toString(36).toUpperCase()}`
}

module.exports = { generateReferralCode }
