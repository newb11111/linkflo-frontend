"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { API_URL } from "../../../lib/config"
import { useLanguage } from "../../../components/TranslateProvider"

async function mapi(path, opt = {}) {
  const r = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...opt,
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j.message || "Failed")
  return j
}

const plans = [
  { key: "starter", name: "Starter", price: "RM49.90", amount: 49.9, limit: "3 products", rank: 1 },
  { key: "growth", name: "Growth", price: "RM3699", amount: 3699, limit: "500 SKU", rank: 2 },
  { key: "scale", name: "Scale", price: "RM12999", amount: 12999, limit: "Unlimited SKU", rank: 3 },
]

const tx = {
  zh: {
    back: "← 回 Merchant Dashboard",
    title: "配套 / 自动升级",
    eyebrow: "MERCHANT BILLING",
    current: "当前配套",
    limit: "SKU limit",
    sub: "商家登录后可以自己选择配套、自己付款。Billplz 成功后，系统会自动升级配套，不需要人工开通。",
    autoFlow: "自动流程",
    step1: "选择配套",
    step2: "进入 Billplz 付款",
    step3: "付款成功后自动升级",
    step4: "回到 Merchant 后台继续上传产品",
    choose: "选择 / 升级",
    payNow: "付款升级",
    currentPlan: "当前配套",
    downgradeBlocked: "不可降级",
    freeActivated: "Starter 已启用",
    loading: "处理中...",
    success: "付款成功，配套已经自动升级。",
    pending: "付款还没确认。如果你已经付款，请等 Billplz callback 或刷新页面。",
    error: "付款状态确认失败，请稍后再试。",
    manualMode: "Billplz 还没开启，系统已建立付款记录。开启 Billplz 后这里会自动跳付款。",
    recent: "最近配套付款记录",
    noPayments: "还没有付款记录。",
    paid: "已付款",
    pendingStatus: "等待付款",
    openPayment: "继续付款",
    updated: "配套已更新。",
    localDevNote: "本地测试时，如果 BILLPLZ_ENABLED=false，不会真的跳付款；上线打开 Billplz 后会自动化。",
  },
  en: {
    back: "← Back to Merchant Dashboard",
    title: "Plan / Auto Upgrade",
    eyebrow: "MERCHANT BILLING",
    current: "Current plan",
    limit: "SKU limit",
    sub: "Logged-in merchants can choose a plan and pay by themselves. After Billplz confirms payment, LinkFlo upgrades the package automatically.",
    autoFlow: "Auto flow",
    step1: "Choose plan",
    step2: "Pay via Billplz",
    step3: "Auto-upgrade after payment",
    step4: "Return to Merchant dashboard",
    choose: "Choose / Upgrade",
    payNow: "Pay to upgrade",
    currentPlan: "Current plan",
    downgradeBlocked: "Downgrade disabled",
    freeActivated: "Starter active",
    loading: "Processing...",
    success: "Payment successful. Your package has been upgraded automatically.",
    pending: "Payment is not confirmed yet. If you paid, wait for the Billplz callback or refresh later.",
    error: "Payment status failed. Please try again later.",
    manualMode: "Billplz is not enabled. A payment record was created. Once Billplz is enabled, this flow redirects to payment automatically.",
    recent: "Recent plan payments",
    noPayments: "No payment records yet.",
    paid: "Paid",
    pendingStatus: "Pending",
    openPayment: "Continue payment",
    updated: "Package updated.",
    localDevNote: "In local testing, BILLPLZ_ENABLED=false will not redirect to payment. Enable Billplz in production for automation.",
  },
  ms: {
    back: "← Kembali ke Dashboard Merchant",
    title: "Pakej / Naik Taraf Automatik",
    eyebrow: "BILLING MERCHANT",
    current: "Pakej semasa",
    limit: "Had SKU",
    sub: "Merchant yang sudah login boleh pilih pakej dan bayar sendiri. Selepas Billplz sahkan bayaran, LinkFlo akan naik taraf pakej secara automatik.",
    autoFlow: "Aliran automatik",
    step1: "Pilih pakej",
    step2: "Bayar melalui Billplz",
    step3: "Naik taraf automatik selepas bayaran",
    step4: "Kembali ke dashboard Merchant",
    choose: "Pilih / Naik Taraf",
    payNow: "Bayar untuk naik taraf",
    currentPlan: "Pakej semasa",
    downgradeBlocked: "Downgrade tidak dibenarkan",
    freeActivated: "Starter aktif",
    loading: "Sedang proses...",
    success: "Bayaran berjaya. Pakej anda telah dinaik taraf secara automatik.",
    pending: "Bayaran belum disahkan. Jika sudah bayar, tunggu callback Billplz atau refresh kemudian.",
    error: "Pengesahan bayaran gagal. Cuba lagi kemudian.",
    manualMode: "Billplz belum diaktifkan. Rekod bayaran telah dibuat. Selepas Billplz aktif, flow ini akan terus ke pembayaran.",
    recent: "Rekod bayaran pakej terkini",
    noPayments: "Belum ada rekod bayaran.",
    paid: "Dibayar",
    pendingStatus: "Menunggu bayaran",
    openPayment: "Sambung bayaran",
    updated: "Pakej telah dikemas kini.",
    localDevNote: "Untuk test local, BILLPLZ_ENABLED=false tidak akan redirect ke payment. Aktifkan Billplz untuk automasi penuh.",
  },
}

function planRank(key) {
  return plans.find((p) => p.key === String(key || "starter").toLowerCase())?.rank || 1
}

function money(v) {
  return `RM ${Number(v || 0).toFixed(2)}`
}

export default function Billing() {
  const { lang } = useLanguage()
  const t = tx[lang] || tx.zh
  const [me, setMe] = useState(null)
  const [payments, setPayments] = useState([])
  const [msg, setMsg] = useState("")
  const [loading, setLoading] = useState("")

  const currentRank = useMemo(() => planRank(me?.package_type), [me?.package_type])

  async function refresh() {
    const fresh = await mapi("/api/merchant/me")
    setMe(fresh.merchant)
    const pay = await mapi("/api/merchant/plan-payments").catch(() => [])
    setPayments(Array.isArray(pay) ? pay : [])
  }

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search)
    const payment = qs.get("payment")
    if (payment === "success") setMsg(t.success)
    if (payment === "pending") setMsg(t.pending)
    if (payment === "error") setMsg(t.error)
    refresh().catch((e) => setMsg(e.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  async function requestUpgrade(p) {
    const rank = planRank(p.key)
    if (rank < currentRank) {
      setMsg(t.downgradeBlocked)
      return
    }
    if (rank === currentRank) {
      setMsg(t.currentPlan)
      return
    }
    setLoading(p.key)
    setMsg(t.loading)
    try {
      const res = await mapi("/api/merchant/package-checkout", {
        method: "POST",
        body: JSON.stringify({ packageType: p.key, useCurrentMerchant: true, mode: 'upgrade', context: 'billing' }),
      })
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl
        return
      }
      if (res.manualMode) setMsg(res.message || t.manualMode)
      else setMsg(res.message || t.updated)
      await refresh()
    } catch (e) {
      setMsg(e.message)
    } finally {
      setLoading("")
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f8ff] px-5 py-10">
      <div className="mx-auto max-w-6xl">
        <Link href="/merchant" className="font-black text-blue-700">{t.back}</Link>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-[36px] bg-white p-8 shadow-xl">
            <p className="text-sm font-black tracking-[.25em] text-blue-700">{t.eyebrow}</p>
            <h1 className="mt-2 text-4xl font-black tracking-[-.04em]">{t.title}</h1>
            <p className="mt-3 max-w-2xl font-bold text-slate-500">{t.sub}</p>
            <div className="mt-6 rounded-3xl bg-slate-950 p-5 text-white">
              <p className="font-black">{t.current}: {me?.package_type || "starter"}</p>
              <p className="mt-1 text-sm font-bold text-white/70">{t.limit}: {me?.product_limit || 3}</p>
            </div>
            {msg ? <p className="mt-4 rounded-2xl bg-blue-50 p-4 font-bold text-blue-700">{msg}</p> : null}
          </div>

          <div className="rounded-[36px] bg-slate-950 p-7 text-white shadow-xl">
            <h2 className="text-xl font-black">{t.autoFlow}</h2>
            {[t.step1, t.step2, t.step3, t.step4].map((x, i) => (
              <div key={x} className="mt-4 flex items-center gap-3 rounded-2xl bg-white/10 p-4">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 font-black">{i + 1}</span>
                <p className="font-bold">{x}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {plans.map((p) => {
            const rank = planRank(p.key)
            const isCurrent = rank === currentRank
            const isLower = rank < currentRank
            const disabled = loading === p.key || isCurrent || isLower
            return (
              <div key={p.key} className={`rounded-[34px] bg-white p-7 shadow-xl ${p.key === 'growth' ? 'ring-4 ring-blue-100' : ''}`}>
                <p className="text-sm font-black text-blue-700">{p.name}</p>
                <h2 className="mt-2 text-4xl font-black">{p.price}</h2>
                <p className="mt-2 font-bold text-slate-500">{p.limit}</p>
                <button
                  disabled={disabled}
                  onClick={() => requestUpgrade(p)}
                  className="mt-7 w-full rounded-full bg-blue-700 px-5 py-4 font-black text-white transition hover:-translate-y-0.5 hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 active:translate-y-0"
                >
                  {loading === p.key ? t.loading : isCurrent ? t.currentPlan : isLower ? t.downgradeBlocked : p.amount > 0 ? t.payNow : t.choose}
                </button>
              </div>
            )
          })}
        </div>

        <section className="mt-8 rounded-[36px] bg-white p-7 shadow-xl">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-black">{t.recent}</h2>
              <p className="mt-1 text-sm font-bold text-slate-500">{t.localDevNote}</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {payments.length ? payments.map((p) => (
              <div key={p.id} className="flex flex-col justify-between gap-3 rounded-2xl bg-slate-50 p-4 md:flex-row md:items-center">
                <div>
                  <p className="font-black">{p.package_type} · {money(p.amount)}</p>
                  <p className="text-sm font-bold text-slate-500">{p.status === 'PAID' ? t.paid : t.pendingStatus} · {p.created_at ? new Date(p.created_at).toLocaleString() : ''}</p>
                </div>
                {p.status !== 'PAID' && p.billplz_url ? <a href={p.billplz_url} className="rounded-full bg-slate-950 px-5 py-3 text-center font-black text-white">{t.openPayment}</a> : null}
              </div>
            )) : <p className="rounded-2xl bg-slate-50 p-4 font-bold text-slate-500">{t.noPayments}</p>}
          </div>
        </section>
      </div>
    </main>
  )
}
