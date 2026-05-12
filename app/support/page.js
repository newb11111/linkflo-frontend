"use client"

import { useState } from "react"
import { API_URL } from "../../lib/config"
import ClientOnly from "../../components/ClientOnly"
import { useLanguage } from "../../components/TranslateProvider"

function normalizePhone(phone = "") {
  const digits = String(phone || "").replace(/\D/g, "")
  if (!digits) return ""
  if (digits.startsWith("60")) return digits
  if (digits.startsWith("0")) return `6${digits}`
  return digits
}

const copy = {
  zh: {
    badge: "LINKFLO SUPPORT",
    title: "订单售后 / Tracking 查询",
    desc: "输入 Order ID 和购买时使用的 email 或电话。系统会显示 tracking 状态，并提供商家的售后 WhatsApp。",
    orderPlaceholder: "输入 Order ID",
    contactPlaceholder: "购买时的 Email 或电话",
    search: "查询",
    searching: "查询中...",
    notFound: "找不到订单。请检查 Order ID 和 email / 电话是否正确。",
    status: "状态",
    payment: "付款",
    tracking: "Tracking",
    noTracking: "商家还没有填写 tracking number",
    pendingPayment: "付款还没完成。付款成功后商家才会处理订单。",
    continuePayment: "继续付款",
    contactMerchant: "联系商家售后 WhatsApp",
    product: "产品",
    privacy: "为了保护订单隐私，查询时需要 Order ID + 购买时的 email / 电话。",
  },
  en: {
    badge: "LINKFLO SUPPORT",
    title: "Order Support / Tracking Lookup",
    desc: "Enter your Order ID and the email or phone used during checkout. The system will show tracking status and the merchant's after-sales WhatsApp.",
    orderPlaceholder: "Enter Order ID",
    contactPlaceholder: "Checkout email or phone",
    search: "Search",
    searching: "Searching...",
    notFound: "Order not found. Please check your Order ID and email / phone.",
    status: "Status",
    payment: "Payment",
    tracking: "Tracking",
    noTracking: "The merchant has not added a tracking number yet",
    pendingPayment: "Payment is not completed yet. The merchant will process the order only after payment is successful.",
    continuePayment: "Continue Payment",
    contactMerchant: "Contact Merchant WhatsApp",
    product: "Product",
    privacy: "To protect order privacy, lookup requires Order ID + checkout email / phone.",
  },
  ms: {
    badge: "SOKONGAN LINKFLO",
    title: "Semakan Order / Tracking",
    desc: "Masukkan Order ID dan email atau telefon yang digunakan semasa checkout. Sistem akan paparkan status tracking dan WhatsApp peniaga untuk sokongan selepas jualan.",
    orderPlaceholder: "Masukkan Order ID",
    contactPlaceholder: "Email atau telefon semasa checkout",
    search: "Semak",
    searching: "Menyemak...",
    notFound: "Order tidak dijumpai. Sila semak Order ID dan email / telefon.",
    status: "Status",
    payment: "Bayaran",
    tracking: "Tracking",
    noTracking: "Peniaga belum mengisi nombor tracking",
    pendingPayment: "Bayaran belum selesai. Peniaga hanya akan proses order selepas bayaran berjaya.",
    continuePayment: "Teruskan Bayaran",
    contactMerchant: "Hubungi WhatsApp Peniaga",
    product: "Produk",
    privacy: "Untuk melindungi privasi order, semakan memerlukan Order ID + email / telefon semasa checkout.",
  },
}

function SupportPageContent() {
  const { lang, setLang } = useLanguage()
  const t = copy[lang] || copy.zh
  const [orderId, setOrderId] = useState("")
  const [contact, setContact] = useState("")
  const [order, setOrder] = useState(null)
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)

  async function search(event) {
    event.preventDefault()
    setLoading(true)
    setErr("")
    setOrder(null)
    try {
      const params = new URLSearchParams({ contact: contact.trim() })
      const res = await fetch(`${API_URL}/api/support/orders/${encodeURIComponent(orderId.trim())}?${params.toString()}`, { credentials: "include" })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.message || t.notFound)
      setOrder(json.order)
    } catch (error) {
      setErr(error.message || t.notFound)
    } finally {
      setLoading(false)
    }
  }

  const wa = normalizePhone(order?.aftersalesWhatsapp)
  const text = order ? encodeURIComponent(`Hi, I need after-sales support. Order ID: ${order.id}, Product: ${order.product?.name || ""}`) : ""

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-4 py-12">
      <div className="mx-auto max-w-3xl rounded-[36px] bg-white p-8 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-black uppercase tracking-[.25em] text-blue-600">{t.badge}</p>
          <div className="rounded-full bg-slate-100 p-1">
            {[
              ["zh", "中文"],
              ["en", "EN"],
              ["ms", "BM"],
            ].map(([value, label]) => (
              <button key={value} onClick={() => setLang(value)} className={`rounded-full px-3 py-1.5 text-xs font-black ${lang === value ? "bg-blue-600 text-white" : "text-slate-500"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <h1 className="mt-4 text-4xl font-black">{t.title}</h1>
        <p className="mt-3 font-bold leading-7 text-slate-500">{t.desc}</p>
        <p className="mt-3 rounded-2xl bg-blue-50 p-3 text-sm font-bold text-blue-700">{t.privacy}</p>

        <form onSubmit={search} className="mt-6 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input className="rounded-2xl border p-4 font-bold" placeholder={t.orderPlaceholder} value={orderId} onChange={(event) => setOrderId(event.target.value)} />
          <input className="rounded-2xl border p-4 font-bold" placeholder={t.contactPlaceholder} value={contact} onChange={(event) => setContact(event.target.value)} />
          <button disabled={loading || !orderId.trim() || !contact.trim()} className="rounded-full bg-slate-950 px-7 py-4 font-black text-white transition hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50">
            {loading ? t.searching : t.search}
          </button>
        </form>

        {err ? <p className="mt-4 rounded-2xl bg-red-50 p-4 font-bold text-red-700">{err}</p> : null}

        {order ? (
          <div className="mt-6 rounded-[28px] bg-slate-50 p-5">
            <p className="text-xs font-black uppercase tracking-[.2em] text-slate-400">{t.product}</p>
            <h2 className="mt-2 text-2xl font-black">{order.product?.name}</h2>
            <p className="mt-2 font-bold text-slate-600">{t.status}: {order.status} · {t.payment}: {order.paymentStatus}</p>
            {String(order.paymentStatus || "").toUpperCase() === "PENDING" ? <p className="mt-3 rounded-2xl bg-amber-50 p-4 font-bold text-amber-800">{t.pendingPayment}</p> : null}
            <p className="mt-2 font-bold text-slate-600">
              {t.tracking}: {order.trackingNumber ? `${order.courier || "Courier"} ${order.trackingNumber}` : t.noTracking}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {order.paymentUrl ? <a href={order.paymentUrl} className="rounded-full bg-amber-500 px-6 py-3 font-black text-white">{t.continuePayment}</a> : null}
              {wa ? <a target="_blank" href={`https://wa.me/${wa}?text=${text}`} className="rounded-full bg-green-600 px-6 py-3 font-black text-white">{t.contactMerchant}</a> : null}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  )
}

export default function SupportPage() {
  return <ClientOnly><SupportPageContent /></ClientOnly>
}
