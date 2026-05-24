
function notFound(req, res) {
  res.status(404).json({ message: 'Route not found' })
}

function errorHandler(err, req, res, next) {
  console.error(err)

  if (err.name === 'ZodError') {
    return res.status(400).json({ message: '输入资料格式不正确', issues: err.issues })
  }

  if (err.code === 'P2002') {
    const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : '资料'
    return res.status(409).json({ message: `${target} 已存在，请换一个。` })
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ message: '资料不存在或已经被删除。' })
  }

  if (err.code === 'P2022') {
    return res.status(500).json({ message: '数据库结构还没同步到最新版本，请在 backend 跑 npx prisma db push 后再试。' })
  }

  const status = err.status && Number(err.status) >= 400 && Number(err.status) < 600 ? Number(err.status) : 500
  if (status >= 500) return res.status(500).json({ message: '系统暂时出错，请稍后再试。' })
  return res.status(status).json({ message: err.message || '请求失败。' })
}

module.exports = { notFound, errorHandler }
