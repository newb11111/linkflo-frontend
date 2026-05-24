async function generateFunnel(input = {}) {
  const name = input.name || input.productName || '这个产品'
  const target = input.targetCustomer || '想提升销售结果的顾客'
  const pain = input.problemSolved || input.pain || '流量来了但很难成交'
  if (process.env.OPENAI_API_KEY) {
    try {
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', messages: [{ role: 'user', content: `Generate concise Chinese landing page JSON for product: ${JSON.stringify(input)}. Return JSON with heroTitle, heroSubtitle, pains array, benefits array, faq array.` }], temperature: 0.7 })
      })
      const data = await resp.json()
      const text = data?.choices?.[0]?.message?.content || ''
      const match = text.match(/\{[\s\S]*\}/)
      if (match) return JSON.parse(match[0])
    } catch (e) { console.warn('OpenAI fallback:', e.message) }
  }
  return {
    heroTitle: `${name}：把兴趣变成 WhatsApp 咨询`,
    heroSubtitle: `专为 ${target} 设计，解决「${pain}」的问题。`,
    pains: [pain, '顾客看了内容但没有行动', '团队分享时没有统一成交页面'],
    benefits: ['AI 成交页快速生成', 'Promoter 专属 link', 'WhatsApp 自动导去对应下线'],
    faq: [{ q: '怎样联系？', a: '点击页面 WhatsApp 按钮即可咨询。' }]
  }
}
module.exports = { generateFunnel }
