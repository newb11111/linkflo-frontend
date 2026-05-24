const RESERVED_SLUGS = new Set([
  'admin','merchant','promoter','auth','api','login','register','pricing','support','uploads',
  'checkout','thank-you','rewards','account','favicon.ico','robots.txt','sitemap.xml','_next'
])

function slugify(value = '') {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || `product-${Date.now()}`
}

function isReservedSlug(slug = '') {
  return RESERVED_SLUGS.has(String(slug || '').toLowerCase().trim())
}

function safeProductSlug(value = '') {
  let base = slugify(value)
  if (isReservedSlug(base)) base = `${base}-funnel`
  return base
}

function refCode(name = '') {
  const base = slugify(name).replace(/-/g, '') || 'promoter'
  return `${base}-${Math.random().toString(36).slice(2, 7)}`
}

module.exports = { slugify, safeProductSlug, isReservedSlug, refCode, RESERVED_SLUGS }
