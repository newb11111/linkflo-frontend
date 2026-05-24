const router = require('express').Router()
const auth = require('../controllers/authController')
const { requireAuth } = require('../middleware/auth')
router.get('/admin-config', (req,res)=>res.json({ adminEmail: process.env.ADMIN_EMAIL || 'admin@linkflo.local' }))
router.post('/login', auth.login)
router.post('/register-merchant', auth.registerMerchant)
router.get('/me', requireAuth, auth.me)
router.post('/logout', auth.logout)
module.exports = router
