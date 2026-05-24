const crypto = require('crypto')

function cleanString(value, max = 500) {
  return String(value || '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, max)
}

function publicVisitorKey(req, givenKey = '') {
  const raw = [
    givenKey || '',
    req.ip || '',
    String(req.headers['user-agent'] || '').slice(0, 160)
  ].join('|')
  return crypto.createHash('sha256').update(raw).digest('hex')
}

module.exports = { cleanString, publicVisitorKey }
