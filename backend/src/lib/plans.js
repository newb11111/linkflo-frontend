const PLANS = {
  STARTER: { code: 'STARTER', price: 29, promoterLimit: 10, skuIncluded: 1 },
  GROWTH: { code: 'GROWTH', price: 139, promoterLimit: 50, skuIncluded: 1 },
  SCALE: { code: 'SCALE', price: 259, promoterLimit: 100, skuIncluded: 1 }
}
function getPlan(code = 'STARTER') { return PLANS[code] || PLANS.STARTER }
module.exports = { PLANS, getPlan }
