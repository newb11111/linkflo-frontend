"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { API_URL } from "../../../../lib/config"
import ProductFunnelLux from "../../../../components/ProductFunnelLux"
import { useLanguage } from "../../../../components/TranslateProvider"

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
    translations: p.translations || d.translations || {},
  }
}

const COPY = {
  zh: { loading: "正在加载预览...", error: "无法加载草稿预览", badge: "草稿 / 待审核预览", desc: "这个预览不需要 Admin approve。只有商家登录后可以看，用来检查顾客最终会看到的页面。", back: "返回编辑", publicTip: "公开顾客页只有 approve 后才会使用 /p/slug。" },
  en: { loading: "Loading preview...", error: "Unable to load draft preview", badge: "Draft / Pending Preview", desc: "This preview does not require Admin approval. Only logged-in merchants can view it to check what customers will see.", back: "Back to edit", publicTip: "The public customer page /p/slug is only available after approval." },
  ms: { loading: "Memuatkan pratonton...", error: "Tidak dapat memuat pratonton draft", badge: "Pratonton Draft / Pending", desc: "Pratonton ini tidak memerlukan kelulusan Admin. Hanya peniaga yang login boleh melihatnya untuk semak paparan pelanggan.", back: "Kembali edit", publicTip: "Halaman pelanggan awam /p/slug hanya aktif selepas diluluskan." },
}

export default function MerchantDraftPreviewPage() {
  const params = useParams()
  const { lang } = useLanguage()
  const t = COPY[lang] || COPY.zh
  const [product, setProduct] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function run() {
      setLoading(true)
      setError("")
      try {
        const res = await fetch(`${API_URL}/api/merchant/products/${params.id}`, { credentials: "include" })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json.message || t.error)
        setProduct(json)
      } catch (err) {
        setError(err.message || t.error)
      } finally {
        setLoading(false)
      }
    }
    if (params?.id) run()
  }, [params?.id])

  const draftProduct = useMemo(() => productFromDraft(product || {}), [product])
  const draftPage = useMemo(() => pageFromDraft(product || {}), [product])

  if (loading) return <main className="min-h-screen bg-slate-950 p-6 text-white"><p className="font-black">{t.loading}</p></main>
  if (error) return <main className="min-h-screen bg-slate-950 p-6 text-white"><p className="font-black text-red-300">{error}</p><Link href="/merchant" className="mt-4 inline-flex rounded-full bg-white px-5 py-3 font-black text-slate-950">{t.back}</Link></main>

  return (
    <main className="bg-slate-950">
      <div className="fixed left-4 top-4 z-[90] flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/80 px-3 py-2 text-xs font-black text-white shadow-2xl backdrop-blur">
        <span className="rounded-full bg-amber-400/20 px-2 py-1 text-amber-200">{t.badge}</span>
        <Link href="/merchant#create" className="rounded-full bg-white px-3 py-1.5 text-slate-950">{t.back}</Link>
      </div>
      <ProductFunnelLux product={draftProduct} page={draftPage} />
    </main>
  )
}
