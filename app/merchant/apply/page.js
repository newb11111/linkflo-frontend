"use client"

import { Suspense, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import LanguageSwitch from "../../../components/LanguageSwitch"
import { useLanguage } from "../../../components/TranslateProvider"
import { API_URL } from "../../../lib/config"
import ClientOnly from "../../../components/ClientOnly"

const plans = {
  starter: { name: "Starter", price: "RM49.90" },
  growth: { name: "Growth", price: "RM3699" },
  scale: { name: "Scale", price: "RM12999" },
}

const tx = {
  zh: { back: "← 查看配套", title: "商家开通 LinkFlo", sub: "填写资料后，Starter / Growth / Scale 都会进入付款流程。付款成功后系统会开通账号，并把登录资料发送到 email。", plan: "选择配套", brand: "公司 / 品牌名", email: "Email（用于登录和接收资料）", phone: "Phone", whatsapp: "WhatsApp", password: "Password（可留空，系统自动生成）", submit: "继续开通 / 付款", loading: "处理中...", login: "去 Merchant Login", billing: "去 Merchant Billing 升级", credentials: "登录资料", note: "请先保存这组资料；如果 SMTP 已设置，系统也会 email 给你。", existsTitle: "这个商家账号已经存在", existsNote: "系统不会重复创建账号，也不会用 Starter 覆盖原本配套。请直接登录，或登录后到 Billing 升级配套。", successTitle: "开通成功" },
  en: { back: "← View pricing", title: "Activate LinkFlo Merchant", sub: "Fill in your details. Starter / Growth / Scale all go to payment. After successful payment, the system activates the account and sends login details by email.", plan: "Choose plan", brand: "Company / Brand name", email: "Email (login and account details)", phone: "Phone", whatsapp: "WhatsApp", password: "Password (optional, system can generate)", submit: "Continue / Pay", loading: "Processing...", login: "Go to Merchant Login", billing: "Go to Merchant Billing", credentials: "Login Details", note: "Please save these details. If SMTP is configured, the system will also email them to you.", existsTitle: "Merchant account already exists", existsNote: "The system will not create a duplicate account or overwrite the current package with Starter. Please login, then upgrade from Billing if needed.", successTitle: "Activation Successful" },
  ms: { back: "← Lihat pakej", title: "Aktifkan Merchant LinkFlo", sub: "Isi maklumat. Starter / Growth / Scale semua akan ke pembayaran. Selepas bayaran berjaya, sistem aktifkan akaun dan hantar maklumat login melalui email.", plan: "Pilih pakej", brand: "Nama syarikat / jenama", email: "Email (login dan maklumat akaun)", phone: "Telefon", whatsapp: "WhatsApp", password: "Password (pilihan, sistem boleh jana)", submit: "Teruskan / Bayar", loading: "Sedang proses...", login: "Ke Merchant Login", billing: "Ke Merchant Billing", credentials: "Maklumat Login", note: "Sila simpan maklumat ini. Jika SMTP diset, sistem juga akan email kepada anda.", existsTitle: "Akaun merchant sudah wujud", existsNote: "Sistem tidak akan cipta akaun berganda atau tukar pakej sedia ada kepada Starter. Sila login, kemudian upgrade melalui Billing jika perlu.", successTitle: "Aktif Berjaya" },
}

function Inner() {
  const params = useSearchParams()
  const initialPlan = params.get("plan") || "starter"
  const { lang } = useLanguage()
  const t = tx[lang] || tx.zh
  const [form, setForm] = useState({ name: "", email: "", phone: "", whatsapp: "", password: "", packageType: initialPlan })
  const [state, setState] = useState({ loading: false, message: "", result: null })
  const selected = useMemo(() => plans[form.packageType] || plans.starter, [form.packageType])
  function set(k, v) {
    setForm((p) => ({ ...p, [k]: v }))
    // When users edit fields after a result, clear old result so we never show credentials/email from a previous submission.
    setState((prev) => prev.result || prev.message ? { loading: false, message: "", result: null } : prev)
  }

  async function submit() {
    setState({ loading: true, message: t.loading, result: null })
    try {
      const res = await fetch(`${API_URL}/api/merchant/package-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setState({ loading: false, message: json.message || "Failed", result: json })
        return
      }
      if (json.paymentUrl) {
        window.location.href = json.paymentUrl
        return
      }
      setState({ loading: false, message: json.message || "Account created", result: json })
    } catch (e) {
      setState({ loading: false, message: e.message || "Failed", result: null })
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f8ff] px-5 py-10 text-slate-950">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <Link href="/pricing" className="font-black text-blue-700">{t.back}</Link>
          <LanguageSwitch />
        </div>
        <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_.7fr]">
          <div className="rounded-[36px] bg-white p-8 shadow-xl">
            <p className="text-sm font-black uppercase tracking-[.18em] text-blue-700">{selected.name} · {selected.price}</p>
            <h1 className="mt-4 text-4xl font-black tracking-[-.04em]">{t.title}</h1>
            <p className="mt-3 font-bold leading-7 text-slate-500">{t.sub}</p>
            <div className="mt-6 grid gap-3">
              <select className="rounded-2xl border p-4 font-bold" value={form.packageType} onChange={(e) => set("packageType", e.target.value)}>
                <option value="starter">Starter - RM49.90 / 3 products</option>
                <option value="growth">Growth - RM3699 / 500 SKU</option>
                <option value="scale">Scale - RM12999 / Unlimited SKU</option>
              </select>
              <input className="rounded-2xl border p-4" placeholder={t.brand} value={form.name} onChange={(e) => set("name", e.target.value)} />
              <input className="rounded-2xl border p-4" placeholder={t.email} value={form.email} onChange={(e) => set("email", e.target.value)} />
              <input className="rounded-2xl border p-4" placeholder={t.phone} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              <input className="rounded-2xl border p-4" placeholder={t.whatsapp} value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
              <input className="rounded-2xl border p-4" placeholder={t.password} type="password" value={form.password} onChange={(e) => set("password", e.target.value)} />
            </div>
            <button disabled={state.loading} onClick={submit} className="mt-5 w-full rounded-full bg-blue-700 px-6 py-4 font-black text-white shadow-lg shadow-blue-100 transition hover:-translate-y-0.5 disabled:opacity-60 active:translate-y-0">
              {state.loading ? t.loading : t.submit}
            </button>
            {state.message ? (
              <p className={`mt-4 rounded-2xl p-4 font-bold ${state.result?.code === "MERCHANT_EMAIL_EXISTS" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}>
                {state.message}
              </p>
            ) : null}
          </div>
          <div className="rounded-[36px] bg-slate-950 p-7 text-white shadow-xl">
            <h2 className="text-2xl font-black">
              {state.result?.code === "MERCHANT_EMAIL_EXISTS" ? t.existsTitle : state.result?.credentials ? t.successTitle : t.credentials}
            </h2>
            <p className="mt-3 text-sm font-bold leading-6 text-white/60">
              {state.result?.code === "MERCHANT_EMAIL_EXISTS" ? t.existsNote : t.note}
            </p>
            {state.result?.code === "MERCHANT_EMAIL_EXISTS" ? (
              <div className="mt-5 space-y-3 rounded-3xl bg-white/10 p-5 font-bold">
                <p>Email: {state.result.existingEmail || form.email}</p>
                <p>Package: {state.result.existingMerchant?.package_type || "-"}</p>
                <Link href="/merchant/login" className="block rounded-full bg-white px-5 py-3 text-center font-black text-blue-700">{t.login}</Link>
                <Link href="/merchant/billing" className="block rounded-full border border-white/20 px-5 py-3 text-center font-black text-white">{t.billing}</Link>
              </div>
            ) : state.result?.credentials ? (
              <div className="mt-5 space-y-3 rounded-3xl bg-white/10 p-5 font-bold">
                <p>Email: {state.result.credentials.email}</p>
                <p>Password: {state.result.credentials.password}</p>
                <Link href="/merchant/login" className="block rounded-full bg-white px-5 py-3 text-center font-black text-blue-700">{t.login}</Link>
              </div>
            ) : (
              <div className="mt-5 rounded-3xl bg-white/10 p-5 text-sm font-bold leading-6 text-white/70">{selected.name} · {selected.price}</div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default function Page() { return <ClientOnly><Suspense><Inner /></Suspense></ClientOnly> }
