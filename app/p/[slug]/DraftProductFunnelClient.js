"use client"

import { useEffect, useMemo, useState } from "react"
import { API_URL } from "../../../lib/config"
import ProductFunnelLux from "../../../components/ProductFunnelLux"

function normalizeImages(value) {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean).slice(0, 9)
  return String(value).split("\n").map((x) => x.trim()).filter(Boolean).slice(0, 9)
}

function productFromDraft(p = {}) {
  const d = p.data || {}
  const imgs = normalizeImages(p.productImages || d.productImages || d.galleryImages)
  if (p.productImage && !imgs.includes(p.productImage)) imgs.unshift(p.productImage)
  return {
    id: p.id,
    slug: p.slug || "preview",
    name: p.name || d.brandName || d.sections?.hero?.title || "Product",
    title: p.title || p.name || d.sections?.hero?.title || "Product",
    price: Number(p.price || d.price || 0),
    category: p.category || d.category || "General",
    productType: p.productType || d.productType || "PHYSICAL",
    stock: Number(p.stock || d.stock || 0),
    productImage: p.productImage || imgs[0] || d.productImage || "",
    productImages: imgs,
    galleryImages: imgs,
    merchantName: p.merchantName || d.merchantName || "Merchant Preview",
  }
}

function pageFromDraft(p = {}) {
  const d = p.data || {}
  const imgs = normalizeImages(p.productImages || d.productImages || d.galleryImages)
  if (p.productImage && !imgs.includes(p.productImage)) imgs.unshift(p.productImage)
  return {
    id: p.id,
    slug: p.slug || "preview",
    price: Number(p.price || d.price || 0),
    category: p.category || d.category || "General",
    productType: p.productType || d.productType || "PHYSICAL",
    merchantName: p.merchantName || d.merchantName || "Merchant Preview",
    productImage: p.productImage || imgs[0] || d.productImage || "",
    productImages: imgs,
    galleryImages: imgs,
    ...(d || {}),
    // keep EN/BM translations for preview, but ProductFunnelLux will always use base data for zh.
    translations: p.translations || d.translations || {},
  }
}

export default function DraftProductFunnelClient({ draftId }) {
  const [product, setProduct] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function run() {
      setLoading(true)
      setError("")
      try {
        const res = await fetch(`${API_URL}/api/merchant/products/${draftId}`, { credentials: "include" })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json.message || "Unable to load draft preview")
        setProduct(json)
      } catch (err) {
        setError(err.message || "Unable to load draft preview")
      } finally {
        setLoading(false)
      }
    }
    if (draftId) run()
  }, [draftId])

  const draftProduct = useMemo(() => productFromDraft(product || {}), [product])
  const draftPage = useMemo(() => pageFromDraft(product || {}), [product])

  if (loading) return <main className="lux-page"><div className="lux-container"><div className="lux-error">Loading preview...</div></div></main>
  if (error) return <main className="lux-page"><div className="lux-container"><div className="lux-error">{error}</div></div></main>
  return <ProductFunnelLux product={draftProduct} page={draftPage} />
}
