"use client"

import { useEffect, useMemo, useState } from "react"
import { API_URL } from "../../../lib/config"
import { getAdminHeaders } from "../../../lib/adminAuth"

const PRODUCT_CATEGORIES = ["Beauty / Skincare", "Health / Wellness", "Food & Beverage", "Fashion / Apparel", "Home & Living", "Digital Product / Software", "Course / Education", "Service / Appointment", "Automotive", "Baby / Kids", "Pet", "Other"]

function normalizeImages(value) {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean).slice(0, 9)
  return String(value).split("\n").map((x) => x.trim()).filter(Boolean).slice(0, 9)
}
function statusMeta(status) {
  const s = status || "APPROVED"
  if (s === "APPROVED") return ["已上线", "bg-emerald-50 text-emerald-700"]
  if (s === "PENDING") return ["待审核", "bg-amber-50 text-amber-700"]
  if (s === "REJECTED") return ["已打回", "bg-red-50 text-red-700"]
  return ["草稿", "bg-slate-100 text-slate-600"]
}
function StatusBadge({ status }) { const [text, cls] = statusMeta(status); return <span className={`rounded-full px-3 py-1 text-xs font-black ${cls}`}>{text}</span> }
const money = (v) => `RM ${Number(v || 0).toFixed(2)}`
function settlement(price, commissionRate) {
  const total = Number(price || 0)
  const promoter = total * Number(commissionRate || 0) / 100
  const platform = total * 0.115
  const merchant = Math.max(0, total - promoter - platform)
  return { total, promoter, platform, merchant }
}

function langLabel(lang) {
  if (lang === "zh") return "中文"
  if (lang === "en") return "English"
  return "BM"
}
function textHasFakePrefix(value) {
  if (typeof value === "string") return value.includes("[EN]") || value.includes("[BM]")
  if (Array.isArray(value)) return value.some(textHasFakePrefix)
  if (value && typeof value === "object") return Object.values(value).some(textHasFakePrefix)
  return false
}
function flattenText(value) {
  if (typeof value === "string") return value
  if (Array.isArray(value)) return value.map(flattenText).join(" ")
  if (value && typeof value === "object") return Object.values(value).map(flattenText).join(" ")
  return ""
}
function textLooksMostlyUntranslated(value, lang) {
  if (lang === "zh") return false
  const text = flattenText(value)
  const cjk = (text.match(/[\u3400-\u9FFF]/g) || []).length
  const latin = (text.match(/[A-Za-z]/g) || []).length
  const ratio = cjk / Math.max(1, cjk + latin)
  return cjk >= 12 && ratio > 0.22
}
function textLooksLocalFallback(value) {
  const text = flattenText(value).toLowerCase()
  return [
    "helps customers understand the product before they buy",
    "is explained through a simple funnel",
    "presented in a simple product funnel",
    "so customers can understand the benefits, usage, payment flow",
    "basic questions about price, process and after-sales support",
    "review the product details, images, price and order process",
    "customer questions this funnel needs to answer",
    "questions customers need answered before buying",
    "customers need clear product information",
    "buying decisions can be slow",
    "membantu pelanggan faham produk sebelum membeli",
    "diterangkan melalui funnel ringkas",
    "dipersembahkan dalam format mudah baca",
    "soalan asas tentang harga, proses dan selepas pembelian",
    "sila semak maklumat produk, imej, harga dan proses order",
    "masalah pelanggan yang perlu dijawab",
    "pelanggan perlukan penerangan jelas",
    "keputusan membeli boleh jadi lambat",
  ].some((phrase) => text.includes(phrase))
}
function hasMeaningfulFunnelCopy(value) {
  if (!value || typeof value !== "object") return false
  return [
    value.heroTitle, value.heroSubtitle, value.problemTitle, value.problemSubtitle, value.painPoints,
    value.solutionTitle, value.solutionSubtitle, value.benefits, value.longDescription, value.faqs,
    value.sections?.hero?.title, value.sections?.hero?.subtitle, value.sections?.problem?.title, value.sections?.solution?.title,
  ].some((x) => x !== undefined && x !== null && String(x).trim() !== "")
}
function translationUsableForLang(value, lang) {
  if (!value || typeof value !== "object") return false
  if (!hasMeaningfulFunnelCopy(value)) return false
  if (textHasFakePrefix(value)) return false
  if (textLooksLocalFallback(value)) return false
  if (textLooksMostlyUntranslated(value, lang)) return false
  return true
}
function localReviewFallback(p, lang) {
  const base = p.data || p.config || {}
  const sec = base.sections || {}
  const name = p.name || base.brandName || sec.hero?.title || "Product"
  const price = Number(p.price || base.price || 0)
  const priceText = price > 0 ? `RM ${price.toFixed(2)}` : (lang === "ms" ? "harga akan dipaparkan semasa checkout" : "price will be shown at checkout")
  if (lang === "ms") {
    return {
      ...base,
      sections: {
        ...sec,
        hero: { ...(sec.hero || {}), title: `${name} membantu pelanggan faham produk sebelum membeli`, subtitle: `${name} diterangkan melalui funnel ringkas. Harga bermula pada ${priceText}.` },
        problem: { ...(sec.problem || {}), title: "Masalah pelanggan yang perlu dijawab", subtitle: "Funnel ini mengurangkan soalan berulang sebelum pelanggan membeli.", items: [
          { title: "Pelanggan perlukan penerangan jelas", desc: "Maklumat utama diterangkan lebih awal." },
          { title: "Keputusan membeli boleh jadi lambat", desc: "Manfaat dan proses bayaran dipaparkan dalam satu halaman." },
        ] },
        solution: { ...(sec.solution || {}), title: `Apa yang ${name} bantu sampaikan`, subtitle: "Disusun untuk trafik promoter, iklan dan video pendek.", items: [
          { title: "Penerangan produk lebih tersusun", desc: "Pelanggan lebih mudah faham nilai produk." },
          { title: "Kurangkan komunikasi berulang", desc: "FAQ dan jaminan menjawab keraguan asas." },
        ] },
        faq: { ...(sec.faq || {}), title: "Soalan Lazim", items: [
          { title: `Berapa harga ${name}?`, desc: `Harga yang dipaparkan ialah ${priceText}.` },
          { title: "Bagaimana saya membuat order?", desc: "Tekan butang beli dan lengkapkan bayaran melalui Billplz." },
        ] },
        cta: { ...(sec.cta || {}), title: `Bersedia untuk dapatkan ${name}?`, subtitle: "Semak maklumat produk dan teruskan checkout apabila bersedia.", buttonText: "Beli Sekarang" },
      },
    }
  }
  return {
    ...base,
    sections: {
      ...sec,
      hero: { ...(sec.hero || {}), title: `${name} helps customers understand the product before they buy`, subtitle: `${name} is explained through a simple funnel. Price starts from ${priceText}.` },
      problem: { ...(sec.problem || {}), title: "Customer questions this funnel needs to answer", subtitle: "This funnel reduces repeated questions before customers buy.", items: [
        { title: "Customers need clear product information", desc: "Key details are explained earlier." },
        { title: "Buying decisions can be slow", desc: "Benefits and payment flow are shown in one page." },
      ] },
      solution: { ...(sec.solution || {}), title: `How ${name} is presented to customers`, subtitle: "Structured for promoter traffic, ads and short videos.", items: [
        { title: "Clearer product explanation", desc: "Customers can understand the product value faster." },
        { title: "Less repeated communication", desc: "FAQ and assurance help answer common doubts." },
      ] },
      faq: { ...(sec.faq || {}), title: "Frequently Asked Questions", items: [
        { title: `How much is ${name}?`, desc: `The displayed price is ${priceText}.` },
        { title: "How do I place an order?", desc: "Click the buy button and complete payment through Billplz." },
      ] },
      cta: { ...(sec.cta || {}), title: `Ready to get ${name}?`, subtitle: "Review the product information and continue to checkout when ready.", buttonText: "Buy Now" },
    },
  }
}
function getLangFunnel(p, lang) {
  const base = p.data || p.config || {}
  if (lang === "zh") return base
  const translated = p.translations?.[lang]
  // Only show real translations. If translation is missing, old local fallback, or invalid,
  // keep the merchant's original copy instead of inventing customer-facing EN/BM text.
  if (!translationUsableForLang(translated, lang)) return base
  return translated
}
function sectionText(data = {}, path = []) {
  let cur = data
  for (const key of path) cur = cur?.[key]
  if (typeof cur === "string") return cur
  return ""
}
function listTitles(items = []) {
  return Array.isArray(items) ? items.map((x) => x?.title || x?.desc || "").filter(Boolean).join(" / ") : ""
}

export default function ProductsAdminPage() {
  const [pages, setPages] = useState([])
  const [merchants, setMerchants] = useState([])
  const [edit, setEdit] = useState({})
  const [reason, setReason] = useState({})
  const [msg, setMsg] = useState("")
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState("")

  async function load() {
    const [p, m] = await Promise.all([
      fetch(`${API_URL}/api/admin/pages`, { headers: getAdminHeaders() }).then((r) => r.json()),
      fetch(`${API_URL}/api/admin/merchants`, { headers: getAdminHeaders() }).then((r) => r.json()).catch(() => []),
    ])
    setPages(Array.isArray(p) ? p.filter((x) => !x.archivedAt && !x.archived_at) : [])
    setMerchants(Array.isArray(m) ? m : [])
  }
  useEffect(() => { load() }, [])
  function merchantName(p) { return merchants.find((m) => m.id === (p.merchantId || p.merchant_id))?.name || p.merchantName || p.merchant_name || "Admin / 未绑定" }
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return pages
    return pages.filter((p) => [p.name, p.title, p.slug, p.category, p.approvalStatus, p.approval_status, merchantName(p)].join(" ").toLowerCase().includes(q))
  }, [pages, search, merchants])
  const selected = pages.find((p) => p.id === selectedId)

  function setRow(id, key, value) { setEdit((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), [key]: value } })) }
  async function save(id) {
    const res = await fetch(`${API_URL}/api/admin/pages/${id}/product`, { method: "PATCH", headers: getAdminHeaders({ "Content-Type": "application/json" }), body: JSON.stringify(edit[id] || {}) })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) return setMsg(json.message || "保存失败")
    setMsg("产品资料已保存")
    await load()
  }
  async function approval(id, status) {
    const res = await fetch(`${API_URL}/api/admin/pages/${id}/approval`, { method: "PATCH", headers: getAdminHeaders({ "Content-Type": "application/json" }), body: JSON.stringify({ status, reason: reason[id] || "" }) })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) return setMsg(json.message || "审核失败")
    setMsg(status === "APPROVED" ? "已通过审核，产品公开上线" : status === "REJECTED" ? "已打回给商家" : "状态已更新")
    await load()
  }
  async function archivePage(id) {
    if (!window.confirm("确定归档这个产品？公开页面会隐藏，但订单记录会保留。")) return
    await fetch(`${API_URL}/api/admin/pages/${id}/archive`, { method: "PATCH", headers: getAdminHeaders({ "Content-Type": "application/json" }), body: JSON.stringify({ archive: true }) })
    setMsg("产品已归档")
    setSelectedId("")
    await load()
  }

  return (
    <main>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-3xl font-black">Products / Funnel 审核</h1><p className="mt-2 font-bold text-slate-500">先看卡片摘要，点进去才编辑，不需要一直滑长表单。</p></div>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索产品名 / slug / 商家 / 状态" className="w-full rounded-2xl border border-blue-100 bg-white px-5 py-4 font-bold shadow-sm outline-none focus:border-blue-400 sm:w-[360px]" />
      </div>
      {msg ? <p className="mt-5 rounded-2xl bg-blue-50 p-4 font-bold text-blue-700">{msg}</p> : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => {
          const imgs = normalizeImages(p.productImages || p.product_images)
          const image = p.productImage || p.product_image || imgs[0]
          return (
            <button key={p.id} onClick={() => setSelectedId(p.id)} className="overflow-hidden rounded-[30px] border border-blue-100 bg-white p-0 text-left shadow-xl shadow-blue-100/50 transition hover:-translate-y-1 hover:shadow-2xl">
              <div className="h-44 bg-blue-50">{image ? <img src={image} alt={p.name} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-sm font-black text-blue-300">No Image</div>}</div>
              <div className="p-5">
                <div className="flex items-center gap-2"><StatusBadge status={p.approvalStatus || p.approval_status} />{p.isHidden || p.is_hidden ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">Hidden</span> : null}</div>
                <h2 className="mt-3 line-clamp-2 text-xl font-black text-slate-950">{p.name}</h2>
                <p className="mt-1 text-sm font-bold text-slate-400">/p/{p.slug}</p>
                <p className="mt-3 text-sm font-bold text-slate-600">{merchantName(p)}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-black"><div className="rounded-2xl bg-blue-50 p-3 text-blue-700">RM {Number(p.price || 0).toFixed(0)}</div><div className="rounded-2xl bg-sky-50 p-3 text-sky-700">{Number(p.commissionRate || p.commission_rate || 0)}%</div><div className="rounded-2xl bg-slate-50 p-3 text-slate-600">{p.category || "General"}</div></div>
              </div>
            </button>
          )
        })}
      </div>

      {selected ? <ProductEditor p={selected} merchants={merchants} edit={edit} reason={reason} setReason={setReason} setRow={setRow} save={save} approval={approval} archivePage={archivePage} close={() => setSelectedId("")} /> : null}
    </main>
  )
}

function ProductEditor({ p, merchants, edit, reason, setReason, setRow, save, approval, archivePage, close }) {
  const [lang, setLang] = useState("zh")
  const row = edit[p.id] || {}
  const productType = row.productType ?? p.productType ?? p.product_type ?? "PHYSICAL"
  const imgs = normalizeImages(p.productImages || p.product_images)
  const visiblePrice = row.price !== undefined && row.price !== "" ? row.price : p.price
  const visibleCommission = row.commissionRate !== undefined && row.commissionRate !== "" ? row.commissionRate : (p.commissionRate || p.commission_rate || 0)
  const calc = settlement(visiblePrice, visibleCommission)
  const langData = getLangFunnel(p, lang)
  const sections = langData.sections || {}
  const hasTranslations = Boolean(p.translations?.en && p.translations?.ms)
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="mx-auto my-6 max-w-5xl rounded-[34px] bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-blue-100 pb-4">
          <div><div className="flex items-center gap-2"><StatusBadge status={p.approvalStatus || p.approval_status} /></div><h2 className="mt-2 text-2xl font-black">{p.name}</h2><p className="text-sm font-bold text-slate-400">/p/{p.slug}</p></div>
          <button onClick={close} className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-2xl font-black">×</button>
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <div>
            {(p.productImage || p.product_image || imgs[0]) ? <img src={p.productImage || p.product_image || imgs[0]} alt={p.name} className="h-52 w-full rounded-3xl object-cover" /> : <div className="grid h-52 place-items-center rounded-3xl bg-blue-50 font-black text-blue-300">No Product Image</div>}
            <p className="mt-3 font-bold text-slate-500">Merchant：{merchants.find((m) => m.id === (p.merchantId || p.merchant_id))?.name || p.merchantName || p.merchant_name || "Admin / 未绑定"}</p>
            {(p.approvalStatus || p.approval_status) === "APPROVED" ? <a href={`/p/${p.slug}`} target="_blank" className="mt-3 inline-block rounded-full bg-blue-50 px-4 py-3 text-sm font-black text-blue-700">打开公开 Funnel</a> : <p className="mt-3 text-sm font-bold text-orange-600">还没公开。</p>}
            <div className="mt-4 rounded-3xl bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-black">三语 Funnel 审核</h3>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${hasTranslations ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{hasTranslations ? "EN + BM Ready" : "缺翻译"}</span>
              </div>
              <div className="mt-3 flex rounded-full bg-white p-1">
                {["zh", "en", "ms"].map((x) => (
                  <button key={x} onClick={() => setLang(x)} className={`flex-1 rounded-full px-3 py-2 text-xs font-black ${lang === x ? "bg-slate-950 text-white" : "text-slate-500"}`}>{langLabel(x)}</button>
                ))}
              </div>
              <div className="mt-3 space-y-2 text-sm font-bold text-slate-600">
                <p><span className="text-slate-400">Hero：</span>{sectionText(sections, ["hero", "title"]) || "-"}</p>
                <p><span className="text-slate-400">Subtitle：</span>{sectionText(sections, ["hero", "subtitle"]) || "-"}</p>
                <p><span className="text-slate-400">Pain：</span>{listTitles(sections.problem?.items) || "-"}</p>
                <p><span className="text-slate-400">Benefits：</span>{listTitles(sections.solution?.items) || "-"}</p>
                <p><span className="text-slate-400">FAQ：</span>{Array.isArray(sections.faq?.items) ? sections.faq.items.length : 0} 条</p>
              </div>
            </div>
          </div>
          <div className="grid gap-2">
            <input className="rounded-xl border p-3" placeholder={`价格：${p.price || 0}`} value={row.price ?? ""} onChange={(e) => setRow(p.id, "price", e.target.value)} />
            <select className="rounded-xl border p-3" value={row.category ?? p.category ?? "Beauty / Skincare"} onChange={(e) => setRow(p.id, "category", e.target.value)}>{PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
            <input className="rounded-xl border p-3" placeholder={`Promoter 佣金 %：${p.commissionRate || p.commission_rate || 0}`} value={row.commissionRate ?? ""} onChange={(e) => setRow(p.id, "commissionRate", e.target.value)} />
            <select className="rounded-xl border p-3" value={productType} onChange={(e) => setRow(p.id, "productType", e.target.value)}><option value="PHYSICAL">实体产品</option><option value="DIGITAL">数字/Software</option><option value="SERVICE">服务/预约</option></select>
            <input className="rounded-xl border p-3" placeholder="产品主图 URL" value={row.productImage ?? ""} onChange={(e) => setRow(p.id, "productImage", e.target.value)} />
            <textarea className="rounded-xl border p-3" placeholder="产品图片 URLs（一行一个，最多9张）" value={row.productImages ?? imgs.join("\n")} onChange={(e) => setRow(p.id, "productImages", e.target.value.split("\n").map((x) => x.trim()).filter(Boolean).slice(0,9))} />
            <select className="rounded-xl border p-3" value={row.merchantId ?? p.merchantId ?? p.merchant_id ?? ""} onChange={(e) => setRow(p.id, "merchantId", e.target.value)}><option value="">选择商家</option>{merchants.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
            {productType === "PHYSICAL" ? <input className="rounded-xl border p-3" placeholder={`库存：${p.stock || 0}`} value={row.stock ?? ""} onChange={(e) => setRow(p.id, "stock", e.target.value)} /> : null}
            <input className="rounded-xl border p-3" placeholder="售后 WhatsApp" value={row.aftersalesWhatsapp ?? ""} onChange={(e) => setRow(p.id, "aftersalesWhatsapp", e.target.value)} />
            {productType === "DIGITAL" ? <textarea className="rounded-xl border p-3" placeholder="数字产品交付内容" value={row.digitalDelivery ?? ""} onChange={(e) => setRow(p.id, "digitalDelivery", e.target.value)} /> : null}
            {productType === "SERVICE" ? <textarea className="rounded-xl border p-3" placeholder="服务/预约说明" value={row.serviceInstructions ?? ""} onChange={(e) => setRow(p.id, "serviceInstructions", e.target.value)} /> : null}
            <label className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 font-bold"><input type="checkbox" checked={row.isHidden ?? p.isHidden ?? p.is_hidden ?? false} onChange={(e) => setRow(p.id, "isHidden", e.target.checked)} /> Hide 公开页面</label>
            <button onClick={() => save(p.id)} className="rounded-full bg-blue-600 py-3 font-black text-white">保存产品资料</button>
          </div>
          <div className="rounded-3xl bg-blue-50 p-4">
            <h3 className="font-black">审核动作</h3>
            <div className="mt-3 rounded-2xl bg-white p-3 text-sm font-black text-slate-700">
              <p>售价：{money(calc.total)}</p>
              <p>Promoter commission：{Number(visibleCommission || 0)}% = {money(calc.promoter)}</p>
              <p>LinkFlo 11.5%：{money(calc.platform)}</p>
              <p className="text-emerald-700">商家预计到手：{money(calc.merchant)}</p>
            </div>
            {p.rejectionReason || p.rejection_reason ? <p className="mt-2 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">上次打回：{p.rejectionReason || p.rejection_reason}</p> : null}
            <textarea className="mt-3 min-h-24 w-full rounded-2xl border p-3" placeholder="打回原因" value={reason[p.id] || ""} onChange={(e) => setReason((prev) => ({ ...prev, [p.id]: e.target.value }))} />
            <div className="mt-3 grid gap-2">
              <button onClick={() => approval(p.id, "APPROVED")} className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white">Approve 上线</button>
              <button onClick={() => approval(p.id, "REJECTED")} className="rounded-full bg-red-600 px-5 py-3 text-sm font-black text-white">Reject 打回</button>
              <button onClick={() => approval(p.id, "PENDING")} className="rounded-full border border-blue-200 bg-white px-5 py-3 text-sm font-black text-blue-700">设为待审核</button>
              <button onClick={() => archivePage(p.id)} className="rounded-full bg-red-50 px-5 py-3 text-sm font-black text-red-700">归档/删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
