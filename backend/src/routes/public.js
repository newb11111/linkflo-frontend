
const router = require('express').Router()
const { z } = require('zod')
const prisma = require('../lib/prisma')
const { publicVisitorKey } = require('../lib/safe')

router.get('/products/:slug', async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({ where: { slug: req.params.slug }, include: { merchant: true, sections: { where: { isHidden: false }, orderBy: { position: 'asc' } } } })
    if (!product || !product.isPublished || product.isHidden || product.merchant?.isHidden) return res.status(404).json({ message: 'Product not found' })
    let promoter = null
    if (req.query.ref) {
      promoter = await prisma.promoterLink.findFirst({ where: { code: String(req.query.ref), productId: product.id, isActive: true } })
    }
    res.json({ product, merchant: { brandName: product.merchant.brandName }, promoter })
  } catch (err) { next(err) }
})

router.post('/track', async (req, res, next) => {
  try {
    const body = z.object({ slug: z.string().min(1), ref: z.string().max(80).optional(), type: z.enum(['VIEW','WHATSAPP_CLICK']), visitorKey: z.string().max(120).optional() }).parse(req.body)
    const product = await prisma.product.findUnique({ where: { slug: body.slug }, include: { merchant: true } })
    if (!product || !product.isPublished || product.isHidden || product.merchant?.isHidden) return res.status(404).json({ message: 'Product not found' })
    const link = body.ref ? await prisma.promoterLink.findFirst({ where: { code: body.ref, productId: product.id, isActive: true } }) : null
    if (body.ref && !link) return res.json({ ok: true, ignored: true })

    const visitorKey = publicVisitorKey(req, body.visitorKey)
    const minutes = body.type === 'WHATSAPP_CLICK' ? 60 : 20
    const since = new Date(Date.now() - minutes * 60 * 1000)
    const duplicated = await prisma.trackingEvent.findFirst({ where: { productId: product.id, promoterLinkId: link?.id || null, type: body.type, visitorKey, createdAt: { gte: since } } })
    if (duplicated) return res.json({ ok: true, duplicated: true })

    await prisma.trackingEvent.create({ data: { productId: product.id, promoterLinkId: link?.id || null, refCode: body.ref || null, type: body.type, visitorKey, ip: req.ip, userAgent: String(req.headers['user-agent'] || '').slice(0, 220) || null } })
    res.json({ ok: true })
  } catch (err) { next(err) }
})


router.get('/promoters/:promoterId', async (req, res, next) => {
  try {
    const promoterId = String(req.params.promoterId)
    const links = await prisma.promoterLink.findMany({
      where: {
        promoterId,
        isActive: true,
        merchant: { is: { isHidden: false } },
        product: { is: { isPublished: true, isHidden: false } }
      },
      include: { merchant: true, product: true, events: true },
      orderBy: { createdAt: 'desc' }
    })

    if (!links.length) return res.status(404).json({ message: 'Promoter ID not found' })

    const first = links[0]
    res.json({
      promoter: {
        promoterId,
        name: first.promoterName,
        phone: first.promoterPhone
      },
      merchant: {
        brandName: first.merchant.brandName
      },
      links: links.map(l => ({
        id: l.id,
        code: l.code,
        productName: l.product.name,
        productSlug: l.product.slug,
        headline: l.product.headline,
        imageUrl: l.product.imageUrl,
        galleryImages: l.product.galleryImages,
        clicks: l.events.filter(e => e.type === 'VIEW').length,
        whatsappClicks: l.events.filter(e => e.type === 'WHATSAPP_CLICK').length
      }))
    })
  } catch (err) { next(err) }
})


module.exports = router
