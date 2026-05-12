"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { API_URL } from "../../../lib/config"
import { useLanguage } from "../../../components/TranslateProvider"

const money = (v) => `RM ${Number(v || 0).toFixed(2)}`

function isPaid(order = {}) {
  const ps = String(order.payment_status || "").toUpperCase()
  const st = String(order.status || "").toUpperCase()
  return ps === "PAID" && !["CANCELLED", "REFUNDED"].includes(st)
}
function isPendingPayment(order = {}) {
  const ps = String(order.payment_status || "").toUpperCase()
  const st = String(order.status || "").toUpperCase()
  return ps === "PENDING" || st === "PENDING_PAYMENT"
}
function normalizePhone(phone = "") {
  const digits = String(phone || "").replace(/\D/g, "")
  if (!digits) return ""
  if (digits.startsWith("60")) return digits
  if (digits.startsWith("0")) return `6${digits}`
  return digits
}

const copy = {
  zh: {
    back: "← 回 Merchant Dashboard",
    badge: "ORDER FULFILLMENT",
    title: "订单处理中心",
    desc: "Paid 订单才是成交。Pending Payment 是付款未完成线索，可以跟进，但不要发货。",
    paidValue: "已付款成交额",
    pendingPayment: "待付款线索",
    pendingTracking: "已付款未填 Tracking",
    shippedDone: "已出货 / 完成",
    order: "订单",
    customer: "顾客",
    status: "状态",
    payment: "付款",
    merchantNet: "商家结算参考",
    address: "收货地址",
    noAddress: "没有收货地址资料",
    digital: "数字产品：付款后顾客会看到交付内容",
    service: "服务产品：请按预约说明跟进顾客",
    pendingTitle: "付款未完成，不要发货",
    pendingDesc: "这个顾客已经进入付款流程，但系统还没收到 Billplz 付款成功通知。你可以跟进顾客继续付款。",
    copyPayment: "复制付款链接",
    copied: "付款链接已复制。",
    whatsappFollow: "WhatsApp 跟进",
    noPaymentLink: "暂无付款链接",
    trackingPlaceholder: "Tracking Number",
    courierPlaceholder: "Courier",
    whatsappPlaceholder: "售后 WhatsApp",
    save: "保存履约资料",
    saving: "保存中...",
    empty: "还没有订单。",
    updated: "订单已更新。顾客查询订单时会看到最新 tracking / courier。",
    failed: "更新失败，请再试一次。",
  },
  en: {
    back: "← Back to Merchant Dashboard",
    badge: "ORDER FULFILLMENT",
    title: "Order Fulfillment Center",
    desc: "Only paid orders are real sales. Pending Payment is an abandoned checkout lead you can follow up, but do not ship yet.",
    paidValue: "Paid Sales",
    pendingPayment: "Pending Payment Leads",
    pendingTracking: "Paid Missing Tracking",
    shippedDone: "Shipped / Completed",
    order: "Order",
    customer: "Customer",
    status: "Status",
    payment: "Payment",
    merchantNet: "Merchant net reference",
    address: "Shipping Address",
    noAddress: "No shipping address provided",
    digital: "Digital product: customers will see delivery content after payment.",
    service: "Service product: please follow up based on the appointment instructions.",
    pendingTitle: "Payment not completed. Do not ship.",
    pendingDesc: "The customer entered payment flow, but Billplz has not confirmed payment. Follow up and ask them to continue payment.",
    copyPayment: "Copy Payment Link",
    copied: "Payment link copied.",
    whatsappFollow: "WhatsApp Follow-up",
    noPaymentLink: "No payment link yet",
    trackingPlaceholder: "Tracking Number",
    courierPlaceholder: "Courier",
    whatsappPlaceholder: "After-sales WhatsApp",
    save: "Save Fulfillment",
    saving: "Saving...",
    empty: "No orders yet.",
    updated: "Order updated. Customers will see the latest tracking / courier when they check the order.",
    failed: "Update failed. Please try again.",
  },
  ms: {
    back: "← Kembali ke Dashboard Peniaga",
    badge: "PENGURUSAN ORDER",
    title: "Pusat Pengurusan Order",
    desc: "Hanya order paid dikira jualan. Pending Payment ialah lead checkout yang belum bayar; boleh follow up, tetapi jangan hantar barang lagi.",
    paidValue: "Jualan Dibayar",
    pendingPayment: "Lead Belum Bayar",
    pendingTracking: "Paid Belum Tracking",
    shippedDone: "Dihantar / Selesai",
    order: "Order",
    customer: "Pelanggan",
    status: "Status",
    payment: "Bayaran",
    merchantNet: "Rujukan hasil bersih peniaga",
    address: "Alamat Penghantaran",
    noAddress: "Tiada alamat penghantaran",
    digital: "Produk digital: pelanggan akan lihat kandungan penghantaran selepas bayaran.",
    service: "Produk servis: sila follow up pelanggan mengikut arahan tempahan.",
    pendingTitle: "Bayaran belum selesai. Jangan hantar barang.",
    pendingDesc: "Pelanggan sudah masuk flow bayaran, tetapi Billplz belum sahkan bayaran. Follow up untuk sambung bayaran.",
    copyPayment: "Salin Link Bayaran",
    copied: "Link bayaran disalin.",
    whatsappFollow: "Follow-up WhatsApp",
    noPaymentLink: "Tiada link bayaran",
    trackingPlaceholder: "Nombor Tracking",
    courierPlaceholder: "Courier",
    whatsappPlaceholder: "WhatsApp selepas jualan",
    save: "Simpan Maklumat Penghantaran",
    saving: "Menyimpan...",
    empty: "Belum ada order.",
    updated: "Order dikemas kini. Pelanggan akan nampak tracking / courier terbaru semasa semakan order.",
    failed: "Gagal kemas kini. Sila cuba lagi.",
  },
}

async function mapi(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.message || "Failed")
  return json
}

export default function MerchantOrdersPage() {
  const { lang } = useLanguage()
  const t = copy[lang] || copy.zh
  const [orders, setOrders] = useState([])
  const [edit, setEdit] = useState({})
  const [error, setError] = useState("")
  const [msg, setMsg] = useState("")
  const [savingId, setSavingId] = useState("")

  async function load() {
    try {
      setError("")
      const data = await mapi("/api/merchant/orders")
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || "Failed")
    }
  }

  useEffect(() => { load() }, [])

  const stats = useMemo(() => {
    const paid = orders.filter(isPaid)
    const paidValue = paid.reduce((sum, order) => sum + Number(order.total_amount || 0), 0)
    const pendingPayment = orders.filter(isPendingPayment).length
    const pendingTracking = paid.filter((order) => !order.tracking_number && ["PROCESSING", "SHIPPED"].includes(String(order.status || "").toUpperCase())).length
    const shipped = paid.filter((order) => ["SHIPPED", "DELIVERED", "COMPLETED"].includes(String(order.status || "").toUpperCase())).length
    return { paidValue, pendingPayment, pendingTracking, shipped }
  }, [orders])

  function patchEdit(id, patch) {
    setEdit((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), ...patch } }))
  }

  async function copyPaymentLink(url) {
    if (!url) return
    await navigator.clipboard?.writeText(url)
    setMsg(t.copied)
  }

  async function save(id) {
    try {
      setSavingId(id)
      setMsg("")
      await mapi(`/api/merchant/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify(edit[id] || {}),
      })
      setMsg(t.updated)
      await load()
    } catch (err) {
      setMsg(err.message || t.failed)
    } finally {
      setSavingId("")
    }
  }

  if (error) return <main className="p-10 font-bold text-red-700">{error}</main>

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <Link href="/merchant" className="font-black text-blue-700 transition hover:text-blue-900">{t.back}</Link>

        <section className="mt-5 rounded-[36px] bg-slate-950 p-8 text-white shadow-2xl">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-300">{t.badge}</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-.04em]">{t.title}</h1>
          <p className="mt-2 max-w-3xl font-bold leading-7 text-slate-300">{t.desc}</p>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-4">
          <StatCard label={t.paidValue} value={money(stats.paidValue)} />
          <StatCard label={t.pendingPayment} value={stats.pendingPayment} tone="amber" />
          <StatCard label={t.pendingTracking} value={stats.pendingTracking} tone="blue" />
          <StatCard label={t.shippedDone} value={stats.shipped} tone="green" />
        </section>

        {msg ? <p className="mt-5 rounded-2xl bg-blue-50 p-4 font-bold text-blue-700">{msg}</p> : null}

        <div className="mt-6 space-y-4">
          {orders.map((order) => {
            const pending = isPendingPayment(order)
            const paid = isPaid(order)
            const net = paid ? Number(order.merchant_net_amount || Math.max(0, Number(order.total_amount || 0) - Number(order.platform_fee_amount || 0) - Number(order.commission_amount || 0))) : 0
            const phone = order.customer_phone || order.shipping_address?.phone || ""
            const wa = normalizePhone(phone)
            const followText = encodeURIComponent(`Hi ${order.customer_name || ""}, your order ${order.id} is not paid yet. You can continue payment here: ${order.billplz_url || ""}`)
            return (
              <article key={order.id} className={`rounded-[30px] bg-white p-5 shadow ${pending ? "ring-2 ring-amber-200" : ""}`}>
                <div className="grid gap-4 lg:grid-cols-[1fr_1fr_280px]">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[.16em] text-slate-400">{t.order} #{String(order.id).slice(0, 8)}</p>
                    <h2 className="mt-1 text-xl font-black">{order.product_name || "Product"}</h2>
                    <p className="mt-1 text-sm font-bold text-slate-500">{t.customer}: {order.customer_name || "-"} · {order.customer_email || order.customer_phone || "-"}</p>
                    <p className="mt-2 text-2xl font-black">{money(order.total_amount)}</p>
                    <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${pending ? "bg-amber-50 text-amber-800" : "bg-slate-50 text-slate-600"}`}>
                      <p>{t.status}: {order.status || "-"} · {t.payment}: {order.payment_status || "-"}</p>
                      <p>{t.merchantNet}: {money(net)}</p>
                    </div>
                    {pending ? (
                      <div className="mt-3 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-900">
                        <p className="text-base font-black">{t.pendingTitle}</p>
                        <p className="mt-1">{t.pendingDesc}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {order.billplz_url ? <button onClick={() => copyPaymentLink(order.billplz_url)} className="rounded-full bg-amber-500 px-4 py-2 font-black text-white">{t.copyPayment}</button> : <span className="rounded-full bg-white px-4 py-2 text-amber-700">{t.noPaymentLink}</span>}
                          {wa && order.billplz_url ? <a target="_blank" href={`https://wa.me/${wa}?text=${followText}`} className="rounded-full bg-green-600 px-4 py-2 font-black text-white">{t.whatsappFollow}</a> : null}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="grid gap-2">
                    {order.shipping_address ? (
                      <div className="rounded-2xl bg-slate-50 p-3 text-sm">
                        <b>{t.address}</b>
                        <p>{order.shipping_address.name} · {order.shipping_address.phone}</p>
                        <p>{order.shipping_address.address1} {order.shipping_address.address2}</p>
                        <p>{order.shipping_address.postcode} {order.shipping_address.city} {order.shipping_address.state}</p>
                      </div>
                    ) : <div className="rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-500">{t.noAddress}</div>}
                    {order.delivery_type === "DIGITAL" ? <div className="rounded-2xl bg-blue-50 p-3 text-sm font-bold text-blue-800">{t.digital}</div> : null}
                    {order.delivery_type === "SERVICE" ? <div className="rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-800">{t.service}</div> : null}
                  </div>

                  <div className="grid gap-2 opacity-100">
                    <select disabled={pending} className="rounded-xl border p-3 disabled:bg-slate-100 disabled:text-slate-400" defaultValue={order.status || "PROCESSING"} onChange={(event) => patchEdit(order.id, { status: event.target.value })}>
                      <option>PROCESSING</option>
                      <option>SHIPPED</option>
                      <option>DELIVERED</option>
                      <option>COMPLETED</option>
                      <option>DISPUTE</option>
                    </select>
                    <input disabled={pending} className="rounded-xl border p-3 disabled:bg-slate-100" placeholder={t.trackingPlaceholder} defaultValue={order.tracking_number || ""} onChange={(event) => patchEdit(order.id, { trackingNumber: event.target.value })} />
                    <input disabled={pending} className="rounded-xl border p-3 disabled:bg-slate-100" placeholder={t.courierPlaceholder} defaultValue={order.courier || ""} onChange={(event) => patchEdit(order.id, { courier: event.target.value })} />
                    <input disabled={pending} className="rounded-xl border p-3 disabled:bg-slate-100" placeholder={t.whatsappPlaceholder} defaultValue={order.aftersales_whatsapp || ""} onChange={(event) => patchEdit(order.id, { aftersalesWhatsapp: event.target.value })} />
                    <button onClick={() => save(order.id)} disabled={pending || savingId === order.id} className="rounded-full bg-slate-950 py-3 font-black text-white transition hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50">{savingId === order.id ? t.saving : t.save}</button>
                  </div>
                </div>
              </article>
            )
          })}
          {!orders.length ? <div className="rounded-[30px] bg-white p-8 text-center font-bold text-slate-500 shadow">{t.empty}</div> : null}
        </div>
      </div>
    </main>
  )
}

function StatCard({ label, value, tone = "slate" }) {
  const color = tone === "amber" ? "text-amber-600" : tone === "green" ? "text-emerald-700" : tone === "blue" ? "text-blue-700" : "text-slate-950"
  return <div className="rounded-[30px] bg-white p-5 shadow"><p className="text-sm font-black text-slate-400">{label}</p><h3 className={`mt-2 text-3xl font-black ${color}`}>{value}</h3></div>
}
