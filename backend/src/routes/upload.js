const path = require('path')
const fs = require('fs')
const multer = require('multer')
const router = require('express').Router()
const { requireAuth, requireRole } = require('../middleware/auth')
const { getPublicBaseUrl } = require('../lib/env')

const uploadDir = path.join(process.cwd(), 'uploads')
fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase()
    const safeExt = ['.png','.jpg','.jpeg','.webp','.gif','.mp4','.webm','.mov'].includes(ext) ? ext : '.bin'
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${safeExt}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024, files: 9 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(png|jpe?g|webp|gif)$/i.test(file.mimetype)) return cb(null, true)
    if (/^video\/(mp4|webm|quicktime)$/i.test(file.mimetype)) return cb(null, true)
    cb(new Error('Only image/video uploads are allowed'))
  }
})

function fileUrl(file) {
  return `${getPublicBaseUrl()}/uploads/${file.filename}`
}

router.post('/image', requireAuth, requireRole('ADMIN','MERCHANT'), upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
  res.json({ url: fileUrl(req.file) })
})

router.post('/images', requireAuth, requireRole('ADMIN','MERCHANT'), upload.array('files', 9), (req, res) => {
  const files = req.files || []
  if (!files.length) return res.status(400).json({ message: 'No files uploaded' })
  const images = files.filter(f => /^image\//i.test(f.mimetype)).map(fileUrl)
  res.json({ urls: images })
})

router.post('/media', requireAuth, requireRole('ADMIN','MERCHANT'), upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
  res.json({ url: fileUrl(req.file), type: req.file.mimetype.startsWith('video/') ? 'video' : 'image' })
})

module.exports = router
