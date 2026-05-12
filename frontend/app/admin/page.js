"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { API_URL } from "../../lib/config"
import { getAdminHeaders } from "../../lib/adminAuth"
import { useLanguage } from "../../components/TranslateProvider"

const money = (v) => `RM ${Number(v || 0).toFixed(2)}`
const num = (v) => Number(v || 0).toLocaleString()

const copy = {
  zh: {
    label: "Admin Command Center",
    title: "LinkFlo 总控制台",
    desc: "先看钱、风险、待审核和表现最好的产品，不再只是 CRUD list。",
    gmv: "总 GMV",
    activeMerchants: "活跃商家",
    activePromoters: "活跃 Promoter",
    suspicious: "可疑订单",
    pendingProducts: "待审核产品",
    pendingOrders: "处理中订单",
    platformRevenue: "平台收入",
    topProducts: "Top Products",
    topProductsDesc: "按已付款订单销售额排序。",
    quickActions: "优先处理",
    reviewProducts: "审核产品 Funnel",
    reviewProductsDesc: "检查三语言内容、佣金、商家到手金额后再上线。",
    orders: "处理订单",
    ordersDesc: "查看付款、发货、tracking 和 commission 状态。",
    risk: "风控中心",
    riskDesc: "处理同 IP、多账号、重复设备、异常佣金等订单。",
    payouts: "结算中心",
    payoutsDesc: "查看商家可结算金额和 Promoter commission。",
    noTop: "还没有足够订单数据。",
    sales: "销售额",
    paidOrders: "付款订单",
    promoter: "Promoter",
    merchant: "商家",
    loading: "正在加载 Admin dashboard...",
  },
  en: {
    label: "Admin Command Center",
    title: "LinkFlo Control Dashboard",
    desc: "See money, risk, pending work and top products first — not just CRUD lists.",
    gmv: "Total GMV",
    activeMerchants: "Active Merchants",
    activePromoters: "Active Promoters",
    suspicious: "Suspicious Orders",
    pendingProducts: "Pending Products",
    pendingOrders: "Open Orders",
    platformRevenue: "Platform Revenue",
    topProducts: "Top Products",
    topProductsDesc: "Ranked by paid order sales.",
    quickActions: "Priority Actions",
    reviewProducts: "Review Product Funnels",
    reviewProductsDesc: "Check 3-language content, commission and merchant payout before publishing.",
    orders: "Manage Orders",
    ordersDesc: "Check payment, fulfillment, tracking and commission status.",
    risk: "Risk Center",
    riskDesc: "Handle same IP, multiple accounts, repeated device and abnormal commission orders.",
    payouts: "Settlement Center",
    payoutsDesc: "Review merchant payable balance and promoter commission.",
    noTop: "Not enough order data yet.",
    sales: "Sales",
    paidOrders: "Paid Orders",
    promoter: "Promoter",
    merchant: "Merchant",
    loading: "Loading Admin dashboard...",
  },
  ms: {
    label: "Admin Command Center",
    title: "Dashboard Kawalan LinkFlo",
    desc: "Lihat wang, risiko, kerja tertunda dan produk terbaik dahulu — bukan senarai CRUD sahaja.",
    gmv: "Jumlah GMV",
    activeMerchants: "Peniaga Aktif",
    activePromoters: "Promoter Aktif",
    suspicious: "Order Mencurigakan",
    pendingProducts: "Produk Menunggu Semakan",
    pendingOrders: "Order Belum Selesai",
    platformRevenue: "Hasil Platform",
    topProducts: "Produk Teratas",
    topProductsDesc: "Disusun mengikut jualan order berbayar.",
    quickActions: "Tindakan Utama",
    reviewProducts: "Semak Funnel Produk",
    reviewProductsDesc: "Semak kandungan 3 bahasa, komisen dan bayaran peniaga sebelum diterbitkan.",
    orders: "Urus Order",
    ordersDesc: "Semak bayaran, penghantaran, tracking dan status komisen.",
    risk: "Pusat Risiko",
    riskDesc: "Urus order IP sama, banyak akaun, peranti berulang dan komisen pelik.",
    payouts: "Pusat Penyelesaian",
    payoutsDesc: "Semak baki peniaga dan komisen promoter.",
    noTop: "Data order belum mencukupi.",
    sales: "Jualan",
    paidOrders: "Order Dibayar",
    promoter: "Promoter",
    merchant: "Peniaga",
    loading: "Memuatkan dashboard Admin...",
  },
}

export default function AdminHome() {
  const { lang } = useLanguage()
  const t = copy[lang] || copy.zh
  const [stats, setStats] = useState(null)
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [merchants, setMerchants] = useState([])
  const [promoters, setPromoters] = useState([])
  const [error, setError] = useState("")

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        const [s, o, p, m, pr] = await Promise.all([
          fetch(`${API_URL}/api/admin/stats`, { headers: getAdminHeaders() }).then((r) => r.json()),
          fetch(`${API_URL}/api/admin/orders`, { headers: getAdminHeaders() }).then((r) => r.json()).catch(() => []),
          fetch(`${API_URL}/api/admin/pages`, { headers: getAdminHeaders() }).then((r) => r.json()).catch(() => []),
          fetch(`${API_URL}/api/admin/merchants`, { headers: getAdminHeaders() }).then((r) => r.json()).catch(() => []),
          fetch(`${API_URL}/api/admin/promoters`, { headers: getAdminHeaders() }).then((r) => r.json()).catch(() => []),
        ])
        if (!alive) return
        if (s?.error || s?.message) throw new Error(s.error || s.message)
        setStats(s || {})
        setOrders(Array.isArray(o) ? o : [])
        setProducts(Array.isArray(p) ? p : [])
        setMerchants(Array.isArray(m) ? m : [])
        setPromoters(Array.isArray(pr) ? pr : [])
      } catch (err) {
        if (alive) setError(err.message || "Failed to load dashboard")
      }
    }
    load()
    return () => { alive = false }
  }, [])

  const paidOrders = useMemo(() => orders.filter((o) => String(o.payment_status || "").toUpperCase() === "PAID" && !["CANCELLED", "REFUNDED"].includes(String(o.status || "").toUpperCase())), [orders])
  const topProducts = useMemo(() => {
    const map = new Map()
    paidOrders.forEach((o) => {
      const key = o.product_id || o.slug || o.product_name || "unknown"
      const prev = map.get(key) || { key, name: o.product_name || o.slug || key, merchant: o.merchant_name || "-", promoter: o.promoter_name || o.promoter_username || "-", sales: 0, paid: 0 }
      prev.sales += Number(o.total_amount || 0)
      prev.paid += 1
      map.set(key, prev)
    })
    return Array.from(map.values()).sort((a, b) => b.sales - a.sales).slice(0, 5)
  }, [paidOrders])

  if (error) return <div className="rounded-3xl bg-red-50 p-6 font-bold text-red-700">{error}</div>
  if (!stats) return <div className="rounded-3xl bg-white p-6 font-black text-slate-600 shadow">{t.loading}</div>

  const activeMerchants = merchants.filter((m) => m.is_active !== false).length || Number(stats.activeMerchants || 0)
  const activePromoters = promoters.filter((p) => p.is_active !== false).length || Number(stats.activePromoters || stats.promoters || 0)
  const pendingProducts = Number(stats.pendingProducts || products.filter((p) => (p.approvalStatus || p.approval_status) === "PENDING").length || 0)
  const pendingOrders = Number(stats.pendingOrders || orders.filter((o) => !["COMPLETED", "CANCELLED", "REFUNDED"].includes(String(o.status || "").toUpperCase())).length || 0)

  const cards = [
    { title: t.gmv, value: money(stats.totalGMV), desc: t.sales, tone: "blue" },
    { title: t.activeMerchants, value: num(activeMerchants), desc: `${num(merchants.length || stats.merchants)} total`, tone: "emerald" },
    { title: t.activePromoters, value: num(activePromoters), desc: `${num(promoters.length || stats.promoters)} total`, tone: "sky" },
    { title: t.suspicious, value: num(stats.suspiciousOrders), desc: t.risk, tone: "red" },
    { title: t.pendingProducts, value: num(pendingProducts), desc: t.reviewProducts, tone: "amber" },
    { title: t.pendingOrders, value: num(pendingOrders), desc: t.orders, tone: "purple" },
    { title: t.platformRevenue, value: money(stats.platformRevenue), desc: "LinkFlo 11.5%", tone: "slate" },
    { title: "Paid Orders", value: num(paidOrders.length), desc: t.paidOrders, tone: "green" },
  ]

  return (
    <main className="space-y-6">
      <section className="overflow-hidden rounded-[36px] bg-slate-950 p-8 text-white shadow-2xl shadow-blue-200">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-300">{t.label}</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">{t.title}</h1>
          <p className="mt-4 font-bold leading-7 text-white/70">{t.desc}</p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => <StatCard key={card.title} {...card} />)}
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-[32px] border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/50">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black">{t.topProducts}</h2>
              <p className="mt-1 text-sm font-bold text-slate-500">{t.topProductsDesc}</p>
            </div>
            <Link href="/admin/products" className="rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700 active:scale-[.98]">{t.reviewProducts}</Link>
          </div>
          <div className="mt-5 space-y-3">
            {topProducts.length ? topProducts.map((p, index) => (
              <div key={p.key} className="grid gap-3 rounded-3xl bg-slate-50 p-4 md:grid-cols-[48px_1fr_140px] md:items-center">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-lg font-black text-blue-700 shadow-sm">#{index + 1}</div>
                <div>
                  <h3 className="font-black text-slate-950">{p.name}</h3>
                  <p className="mt-1 text-sm font-bold text-slate-500">{t.merchant}: {p.merchant} · {t.promoter}: {p.promoter}</p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-xl font-black text-emerald-700">{money(p.sales)}</p>
                  <p className="text-xs font-bold text-slate-400">{p.paid} {t.paidOrders}</p>
                </div>
              </div>
            )) : <div className="rounded-3xl bg-slate-50 p-6 font-bold text-slate-500">{t.noTop}</div>}
          </div>
        </div>

        <div className="rounded-[32px] border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/50">
          <h2 className="text-2xl font-black">{t.quickActions}</h2>
          <div className="mt-5 grid gap-3">
            <ActionCard href="/admin/products" title={t.reviewProducts} value={pendingProducts} desc={t.reviewProductsDesc} />
            <ActionCard href="/admin/orders" title={t.orders} value={pendingOrders} desc={t.ordersDesc} />
            <ActionCard href="/admin/suspicious" title={t.risk} value={stats.suspiciousOrders} desc={t.riskDesc} />
            <ActionCard href="/admin/wallets" title={t.payouts} value="RM" desc={t.payoutsDesc} />
          </div>
        </div>
      </section>
    </main>
  )
}

function StatCard({ title, value, desc, tone }) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    sky: "bg-sky-50 text-sky-700",
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
    purple: "bg-purple-50 text-purple-700",
    slate: "bg-slate-100 text-slate-700",
    green: "bg-green-50 text-green-700",
  }[tone] || "bg-blue-50 text-blue-700"
  return (
    <div className="rounded-[30px] border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/50">
      <p className="text-sm font-black text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
      <p className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-black ${toneClass}`}>{desc}</p>
    </div>
  )
}

function ActionCard({ href, title, value, desc }) {
  return (
    <Link href={href} className="block rounded-3xl bg-slate-50 p-4 transition hover:bg-blue-50 active:scale-[.98]">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-black text-slate-950">{title}</h3>
        <span className="grid min-w-9 place-items-center rounded-full bg-blue-600 px-3 py-1 text-sm font-black text-white">{value}</span>
      </div>
      <p className="mt-2 text-sm font-bold leading-6 text-slate-500">{desc}</p>
    </Link>
  )
}
