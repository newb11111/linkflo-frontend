function billplzEnabled() {
  return !!(process.env.BILLPLZ_API_KEY && process.env.BILLPLZ_COLLECTION_ID)
}

async function createBill({ amount, email, name, callbackUrl, redirectUrl, description, referenceId }) {
  if (!billplzEnabled()) return null
  const params = new URLSearchParams()
  params.append('collection_id', process.env.BILLPLZ_COLLECTION_ID)
  params.append('email', email || process.env.ADMIN_EMAIL || 'billing@linkflo.local')
  params.append('name', name || 'LinkFlo Merchant')
  params.append('amount', String(Math.round(Number(amount) * 100)))
  params.append('callback_url', callbackUrl)
  params.append('redirect_url', redirectUrl)
  params.append('description', description || 'LinkFlo Credit Top Up')
  if (referenceId) params.append('reference_1_label', 'merchant_id'), params.append('reference_1', referenceId)

  const base = process.env.BILLPLZ_API_BASE || 'https://www.billplz.com/api/v3'
  const resp = await fetch(`${base}/bills`, {
    method: 'POST',
    headers: { Authorization: `Basic ${Buffer.from(`${process.env.BILLPLZ_API_KEY}:`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  })
  const data = await resp.json().catch(() => ({}))
  if (!resp.ok) throw new Error(data?.error?.message || `Billplz failed: ${resp.status}`)
  return data
}

module.exports = { createBill, billplzEnabled }
