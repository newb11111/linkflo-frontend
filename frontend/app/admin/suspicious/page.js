"use client"

import { useEffect, useMemo, useState } from "react"
import { API_URL } from "../../../lib/config"
import { getAdminHeaders } from "../../../lib/adminAuth"
import { useLanguage } from "../../../components/TranslateProvider"

const money = (v) => `RM ${Number(v || 0).toFixed(2)}`

const copy = {
  zh: { title: "可疑订单 / 防刷中心", desc: "优先处理同 IP、多账号、同设备、同电话、同地址等高风险订单。严格模式下，这些订单不会自动发 referral Promoter 佣金。", total: "风险订单", hold: "佣金冻结", clear: "解除可疑标记", empty: "暂时没有可疑订单。", score: "风险分", reason: "原因", customer: "顾客", merchant: "商家", orderId: "订单ID", commission: "Commission", loading: "Loading...", confirm: "确认解除这个订单的可疑标记？解除后如果佣金是 ON_HOLD 会回到 PENDING。" },
  en: { title: "Suspicious Orders / Anti-Abuse Center", desc: "Prioritize high-risk orders such as same IP, multiple accounts, same device, phone or address. In strict mode, referral promoter commission will not be released automatically.", total: "Risk Orders", hold: "Commission On Hold", clear: "Clear Suspicious Flag", empty: "No suspicious orders for now.", score: "Risk Score", reason: "Reason", customer: "Customer", merchant: "Merchant", orderId: "Order ID", commission: "Commission", loading: "Loading...", confirm: "Clear this suspicious flag? If commission is ON_HOLD, it will return to PENDING." },
  ms: { title: "Order Mencurigakan / Pusat Anti-Abuse", desc: "Utamakan order berisiko tinggi seperti IP sama, banyak akaun, peranti, telefon atau alamat yang sama. Dalam mod ketat, komisen promoter referral tidak dilepaskan secara automatik.", total: "Order Risiko", hold: "Komisen Ditahan", clear: "Buang Tanda Mencurigakan", empty: "Tiada order mencurigakan buat masa ini.", score: "Skor Risiko", reason: "Sebab", customer: "Pelanggan", merchant: "Peniaga", orderId: "ID Order", commission: "Komisen", loading: "Loading...", confirm: "Buang tanda mencurigakan ini? Jika komisen ON_HOLD, ia akan kembali kepada PENDING." }
}

export default function Page() {
  const { lang } = useLanguage()
  const t = copy[lang] || copy.zh
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState("")

  async function load() {
    setLoading(true)
    try {
      const data = await fetch(`${API_URL}/api/admin/orders/suspicious`, { headers: getAdminHeaders() }).then((r) => r.json())
      setOrders(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
      setOrders([])
    } finally { setLoading(false) }
  }

  async function clear(id) {
    if (!window.confirm(t.confirm)) return
    await fetch(`${API_URL}/api/admin/orders/${id}/clear-suspicious`, { method: "PATCH", headers: getAdminHeaders() })
    setMsg(t.clear)
    load()
  }

  useEffect(() => { load() }, [])

  const onHold = useMemo(() => orders.filter((o) => String(o.commission_status || "").toUpperCase() === "ON_HOLD").length, [orders])

  return (
    <main className="space-y-6">
      <section className="rounded-[34px] bg-slate-950 p-7 text-white shadow-2xl shadow-red-100">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-red-300">Risk Center</p>
        <h1 className="mt-3 text-3xl font-black md:text-4xl">{t.title}</h1>
        <p className="mt-3 max-w-3xl font-bold leading-7 text-white/70">{t.desc}</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Metric label={t.total} value={orders.length} tone="red" />
        <Metric label={t.hold} value={onHold} tone="amber" />
        <Metric label="Total Amount" value={money(orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0))} tone="blue" />
      </section>

      {msg ? <div className="rounded-2xl bg-emerald-50 p-4 font-black text-emerald-700">{msg}</div> : null}
      {loading ? <p className="rounded-3xl bg-white p-6 font-black text-slate-600 shadow">{t.loading}</p> : null}
      {!loading && orders.length === 0 ? <div className="rounded-3xl bg-white p-6 font-bold text-slate-500 shadow">{t.empty}</div> : null}

      <div className="grid gap-4">
        {orders.map((o) => {
          const reasons = [...(Array.isArray(o.abuse_reasons) ? o.abuse_reasons : []), ...(Array.isArray(o.fraud_flags) ? o.fraud_flags : [])]
          return (
            <div key={o.id} className="rounded-[30px] border border-red-100 bg-white p-5 shadow-xl shadow-red-50">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">{t.score}: {o.abuse_score || 0}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{o.status || "-"}</span>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">{o.payment_status || "-"}</span>
                  </div>
                  <h2 className="mt-3 break-words text-xl font-black text-slate-950">{o.product_name || o.slug || o.product_id}</h2>
                  <p className="mt-2 text-sm font-bold text-slate-500">{t.customer}: {o.customer_name || "-"} · {o.customer_email || "-"}</p>
                  <p className="text-sm font-bold text-slate-500">{t.merchant}: {o.merchant_name || "-"} · Promoter: {o.promoter_name || o.promoter_username || "-"}</p>
                  <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
                    <p>{t.reason}: {reasons.length ? reasons.join(", ") : "-"}</p>
                    <p>IP: {o.ip_address || "-"}</p>
                    <p>Device: {o.device_id || "-"}</p>
                  </div>
                </div>
                <div className="w-full rounded-3xl bg-slate-50 p-4 text-sm font-bold xl:w-[280px]">
                  <p>{t.orderId}: {o.id}</p>
                  <p>Referral: {o.ref_code || "-"}</p>
                  <p>{t.commission}: {money(o.commission_amount)} · {o.commission_status || "-"}</p>
                  <p className="mt-2 text-xl font-black text-slate-950">{money(o.total_amount)}</p>
                  <button onClick={() => clear(o.id)} className="mt-4 w-full rounded-full bg-slate-950 px-4 py-3 font-black text-white transition hover:bg-slate-800 active:scale-[.98]">{t.clear}</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}

function Metric({ label, value, tone }) {
  const cls = tone === "red" ? "bg-red-50 text-red-700" : tone === "amber" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"
  return <div className="rounded-[28px] border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/40"><p className="text-sm font-black text-slate-500">{label}</p><p className={`mt-3 inline-block rounded-2xl px-4 py-2 text-2xl font-black ${cls}`}>{value}</p></div>
}
