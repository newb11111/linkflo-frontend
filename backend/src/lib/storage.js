const fs = require('fs')
const path = require('path')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')

function publicBase() {
  return process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 5000}`
}

function r2Enabled() {
  return String(process.env.USE_R2 || '').toLowerCase() === 'true'
}

function getR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
  })
}

async function saveUpload(file) {
  if (!file) throw new Error('No file uploaded')
  const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '-')}`
  if (r2Enabled()) {
    const bucket = process.env.R2_BUCKET
    const publicUrl = process.env.R2_PUBLIC_BASE_URL
    if (!bucket || !publicUrl) throw new Error('R2_BUCKET and R2_PUBLIC_BASE_URL required when USE_R2=true')
    const key = `uploads/${safeName}`
    await getR2Client().send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: file.buffer, ContentType: file.mimetype }))
    return { url: `${publicUrl.replace(/\/$/, '')}/${key}`, filename: safeName, storage: 'r2' }
  }
  const uploadDir = path.join(__dirname, '../../uploads')
  fs.mkdirSync(uploadDir, { recursive: true })
  fs.writeFileSync(path.join(uploadDir, safeName), file.buffer)
  return { url: `${publicBase()}/uploads/${safeName}`, filename: safeName, storage: 'local' }
}

module.exports = { saveUpload, r2Enabled }
