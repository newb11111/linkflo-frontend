"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { API_URL, SITE_URL } from "../../lib/config"

async function iapi(path, opt = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(opt.headers || {}) },
    ...opt,
  })
  const j = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(j.message || "Failed")
  return j
}

function money(v) {
  return `RM ${Number(v || 0).toFixed(2)}`
}

const COPY_LANG = {
  zh: (p, link) => `这个 ${p.name} 可以先看一下👇\n${link}\n详情以页面为准。`,
  en: (p, link) => `Take a look at ${p.name} 👇\n${link}\nPlease refer to the page for details.`,
  ms: (p, link) => `Boleh tengok ${p.name} dulu 👇\n${link}\nSila rujuk halaman untuk maklumat lanjut.`,
}

const LABELS = {
  zh: { title: "Promoter Dashboard", orders: "佣金订单", ref: "你的 ref code", pending: "待结算", confirmed: "已确认", paid: "已付款", count: "订单数", products: "可推广产品池", promoted: "已产生订单的产品", price: "售价", commission: "佣金", earning: "预计可赚", preview: "预览 Funnel", copy: "复制专属 link", script: "复制推广文案", copied: "已复制", sales: "销售额", noProducts: "暂时没有可推广产品。", login: "Promoter Login", profile: "Profile / Bank Info" },
  en: { title: "Promoter Dashboard", orders: "Commission Orders", ref: "Your ref code", pending: "Pending", confirmed: "Confirmed", paid: "Paid", count: "Orders", products: "Products to Promote", promoted: "Products With Sales", price: "Price", commission: "Commission", earning: "Est. earning", preview: "Preview Funnel", copy: "Copy personal link", script: "Copy promo script", copied: "Copied", sales: "Sales", noProducts: "No products available yet.", login: "Promoter Login", profile: "Profile / Bank Info" },
  ms: { title: "Dashboard Promoter", orders: "Order Komisen", ref: "Kod ref anda", pending: "Menunggu", confirmed: "Disahkan", paid: "Dibayar", count: "Order", products: "Produk Untuk Dipromosi", promoted: "Produk Yang Ada Jualan", price: "Harga", commission: "Komisen", earning: "Anggaran komisen", preview: "Pratonton Funnel", copy: "Salin link sendiri", script: "Salin skrip promosi", copied: "Disalin", sales: "Jualan", noProducts: "Belum ada produk untuk dipromosi.", login: "Log Masuk Promoter" },
}

export default function PromoterHome() {
  const [me, setMe] = useState(null)
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [earn, setEarn] = useState(null)
  const [err, setErr] = useState("")
  const [copied, setCopied] = useState("")
  const [lang, setLang] = useState("zh")
  const L = LABELS[lang] || LABELS.zh

  async function load() {
    try {
      const [m, p, e, o] = await Promise.all([
        iapi("/api/promoter/me"),
        iapi("/api/promoter/products"),
        iapi("/api/promoter/earnings"),
        iapi("/api/promoter/orders"),
      ])
      setMe(m.promoter || null)
      setProducts(Array.isArray(p) ? p : [])
      setEarn(e || {})
      setOrders(Array.isArray(o) ? o : [])
    } catch (x) {
      setErr(x.message)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const promotedProducts = useMemo(() => {
    const map = new Map()
    for (const o of orders) {
      const key = o.product_id || o.slug || o.product_name || "unknown"
      const row = map.get(key) || { name: o.product_name || o.slug || "Product", sales: 0, orders: 0, commission: 0 }
      row.sales += Number(o.total_amount || 0)
      row.commission += Number(o.commission_amount || 0)
      row.orders += 1
      map.set(key, row)
    }
    return [...map.values()].sort((a, b) => b.sales - a.sales).slice(0, 6)
  }, [orders])

  function productLink(slug) {
    const base = SITE_URL || (typeof window !== "undefined" ? window.location.origin : "")
    return `${base}/p/${slug}?ref=${me?.ref_code || ""}`
  }

  async function copyLink(slug) {
    const link = productLink(slug)
    await navigator.clipboard.writeText(link)
    setCopied(link)
  }

  async function copyScript(p) {
    const link = productLink(p.slug)
    const text = (COPY_LANG[lang] || COPY_LANG.zh)(p, link)
    await navigator.clipboard.writeText(text)
    setCopied(text)
  }

  if (err) {
    return (
      <main className="min-h-screen bg-slate-50 p-10">
        <div className="mx-auto max-w-md rounded-[32px] bg-white p-8 shadow-xl">
          <h1 className="text-3xl font-black">{L.login}</h1>
          <p className="mt-3 text-slate-500">Approved promoter 才能进入产品池。</p>
          <Link href="/promoter/login" className="mt-6 block rounded-full bg-slate-950 px-6 py-3 text-center font-black text-white">{L.login}</Link>
        </div>
      </main>
    )
  }

  if (!me) return <main className="p-10 font-bold">Loading...</main>

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[36px] bg-white p-8 shadow-2xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[.2em] text-blue-700">{L.title}</p>
              <h1 className="mt-2 text-4xl font-black tracking-[-.04em]">{me.name}</h1>
              <p className="mt-2 text-slate-500">{L.ref}：<b>{me.ref_code}</b></p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[["zh", "中文"], ["en", "EN"], ["ms", "BM"]].map(([k, v]) => (
                <button key={k} onClick={() => setLang(k)} className={`rounded-full border px-4 py-2 font-black ${lang === k ? "bg-slate-950 text-white" : "bg-white"}`}>{v}</button>
              ))}
              <Link href="/promoter/profile" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-center font-black text-slate-800">{L.profile}</Link>
              <Link href="/promoter/orders" className="rounded-full bg-blue-700 px-6 py-3 text-center font-black text-white">{L.orders}</Link>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            <div className="rounded-3xl bg-amber-50 p-5"><b>{L.pending}</b><p className="text-2xl font-black">{money(earn?.pending)}</p></div>
            <div className="rounded-3xl bg-green-50 p-5"><b>{L.confirmed}</b><p className="text-2xl font-black">{money(earn?.confirmed)}</p></div>
            <div className="rounded-3xl bg-blue-50 p-5"><b>{L.paid}</b><p className="text-2xl font-black">{money(earn?.paid)}</p></div>
            <div className="rounded-3xl bg-slate-50 p-5"><b>{L.count}</b><p className="text-2xl font-black">{earn?.orders || 0}</p></div>
          </div>
        </section>

        {copied ? <p className="mt-5 rounded-2xl bg-blue-50 p-4 font-bold text-blue-700">{L.copied}：{copied}</p> : null}

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            <h2 className="text-3xl font-black">{L.products}</h2>
            {products.length === 0 ? <div className="mt-5 rounded-3xl bg-white p-8 font-bold text-slate-500 shadow">{L.noProducts}</div> : null}
            <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((p) => (
                <div key={p.id} className="rounded-[28px] bg-white p-5 shadow">
                  <div className="h-44 overflow-hidden rounded-3xl bg-slate-100">{p.image ? <img src={p.image} className="h-full w-full object-cover" alt="" /> : null}</div>
                  <h3 className="mt-4 text-xl font-black">{p.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{p.category} · {p.productType}</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-slate-50 p-3"><b>{L.price}</b><p className="font-black">{money(p.price)}</p></div>
                    <div className="rounded-2xl bg-amber-50 p-3"><b>{L.earning}</b><p className="font-black">{Number(p.commissionRate || 0)}% / {money(p.estimatedCommission)}</p></div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link href={`/p/${p.slug}?ref=${me.ref_code}`} className="flex-1 rounded-full border px-4 py-3 text-center text-sm font-black">{L.preview}</Link>
                    <button onClick={() => copyLink(p.slug)} className="flex-1 rounded-full bg-slate-950 px-4 py-3 text-sm font-black text-white">{L.copy}</button>
                  </div>
                  <button onClick={() => copyScript(p)} className="mt-2 w-full rounded-full bg-amber-500 px-4 py-3 text-sm font-black text-white">{L.script}</button>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[32px] bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-black">{L.promoted}</h2>
            <div className="mt-4 space-y-3">
              {promotedProducts.length === 0 ? <p className="font-bold text-slate-500">还没有成交记录。</p> : null}
              {promotedProducts.map((p, i) => (
                <div key={`${p.name}-${i}`} className="rounded-2xl bg-slate-50 p-4">
                  <b>{p.name}</b>
                  <p className="mt-1 text-sm text-slate-500">{p.orders} orders · {L.sales} {money(p.sales)}</p>
                  <p className="mt-1 font-black text-amber-700">{money(p.commission)}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}
