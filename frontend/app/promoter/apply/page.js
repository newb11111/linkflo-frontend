"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { API_URL } from "../../../lib/config"
import LanguageSwitch from "../../../components/LanguageSwitch"
import { useLanguage } from "../../../components/TranslateProvider"
import ClientOnly from "../../../components/ClientOnly"

const text = {
  zh: {
    back: "← 回首页",
    title: "申请成为 Promoter",
    desc: "Promoter 可以是网红、marketer、agency 或流量手。Admin approve 后才能看可推广产品和佣金。",
    name: "名字",
    email: "Email",
    phone: "Phone",
    username: "Username / ref code，例如 jack",
    password: "Password",
    channel: "你的渠道 / 资源：TikTok, 小红书, FB ads, agency, sales team...",
    submit: "提交 Promoter 申请",
    submitting: "提交中...",
    successTitle: "申请已提交",
    successDesc: "Admin approve 后才可以登录 Promoter 后台查看可推广产品。",
    login: "去 Promoter Login",
    home: "返回首页",
    again: "提交另一个申请",
    failed: "申请失败",
  },
  en: {
    back: "← Back home",
    title: "Apply as Promoter",
    desc: "Promoters can be creators, marketers, agencies or sales partners. Admin approval is required before viewing products and commission.",
    name: "Name",
    email: "Email",
    phone: "Phone",
    username: "Username / ref code, e.g. jack",
    password: "Password",
    channel: "Your channel / resources: TikTok, Xiaohongshu, FB ads, agency, sales team...",
    submit: "Submit Promoter Application",
    submitting: "Submitting...",
    successTitle: "Application submitted",
    successDesc: "After admin approval, you can log in to view promotable products.",
    login: "Go to Promoter Login",
    home: "Back home",
    again: "Submit another application",
    failed: "Application failed",
  },
  ms: {
    back: "← Kembali",
    title: "Mohon Jadi Promoter",
    desc: "Promoter boleh jadi creator, marketer, agency atau rakan jualan. Admin perlu approve sebelum produk dan komisen boleh dilihat.",
    name: "Nama",
    email: "Email",
    phone: "Telefon",
    username: "Username / kod ref, contoh jack",
    password: "Password",
    channel: "Channel / sumber anda: TikTok, Xiaohongshu, FB ads, agency, sales team...",
    submit: "Hantar Permohonan Promoter",
    submitting: "Sedang hantar...",
    successTitle: "Permohonan dihantar",
    successDesc: "Selepas admin approve, anda boleh login untuk lihat produk yang boleh dipromosikan.",
    login: "Ke Promoter Login",
    home: "Kembali ke homepage",
    again: "Hantar permohonan lain",
    failed: "Permohonan gagal",
  },
}

function resetPageLock() {
  if (typeof document === "undefined") return
  document.documentElement.style.overflow = ""
  document.body.style.overflow = ""
  document.body.style.pointerEvents = ""
  document.body.style.filter = ""
  document.body.style.opacity = ""
  document.querySelectorAll('[data-linkflo-mobile-overlay="true"]').forEach((node) => node.remove())
}

function PromoterApplyContent() {
  const { lang } = useLanguage()
  const t = text[lang] || text.zh
  const [form, setForm] = useState({ name: "", email: "", phone: "", username: "", password: "", channel: "" })
  const [msg, setMsg] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    resetPageLock()
    return () => resetPageLock()
  }, [])

  function set(k, v) {
    setForm((p) => ({ ...p, [k]: v }))
    if (msg || result) {
      setMsg('')
      setResult(null)
    }
  }

  async function submit() {
    if (loading) return
    resetPageLock()
    setLoading(true)
    setMsg(t.submitting)
    try {
      const res = await fetch(`${API_URL}/api/promoter/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        setResult(j)
        throw new Error(j.message || t.failed)
      }
      setResult(j)
      resetPageLock()
      setSubmitted(true)
      setMsg("")
      window.history.replaceState(null, "", "/promoter/apply?submitted=1")
    } catch (e) {
      resetPageLock()
      setMsg(e.message || t.failed)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f8ff] px-5 py-10 text-slate-950 md:py-14">
      <div className="mx-auto flex max-w-3xl justify-end pb-4"><LanguageSwitch /></div>
      <div className="mx-auto max-w-3xl rounded-[36px] bg-white p-7 shadow-xl md:p-8">
        <Link href="/" className="font-black text-blue-700">{t.back}</Link>

        {submitted ? (
          <div className="mt-8 rounded-[30px] bg-blue-50 p-8 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-blue-600 text-2xl font-black text-white">✓</div>
            <h1 className="mt-5 text-4xl font-black tracking-[-.04em]">{t.successTitle}</h1>
            <p className="mx-auto mt-3 max-w-xl font-bold leading-7 text-slate-600">{t.successDesc}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/promoter/login" className="rounded-full bg-blue-700 px-6 py-3 font-black text-white">{t.login}</Link>
              <Link href="/" className="rounded-full bg-white px-6 py-3 font-black text-blue-700 shadow">{t.home}</Link>
              <button type="button" onClick={() => { setSubmitted(false); setMsg(""); resetPageLock() }} className="rounded-full border border-blue-100 px-6 py-3 font-black text-slate-700">{t.again}</button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="mt-5 text-4xl font-black tracking-[-.04em]">{t.title}</h1>
            <p className="mt-3 font-bold leading-7 text-slate-500">{t.desc}</p>
            <div className="mt-6 grid gap-3">
              <input className="rounded-2xl border p-4" placeholder={t.name} value={form.name} onChange={(e) => set("name", e.target.value)} />
              <input className="rounded-2xl border p-4" placeholder={t.email} value={form.email} onChange={(e) => set("email", e.target.value)} />
              <input className="rounded-2xl border p-4" placeholder={t.phone} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              <input className="rounded-2xl border p-4" placeholder={t.username} value={form.username} onChange={(e) => set("username", e.target.value)} />
              <input className="rounded-2xl border p-4" placeholder={t.password} type="password" value={form.password} onChange={(e) => set("password", e.target.value)} />
              <textarea className="min-h-32 rounded-2xl border p-4" placeholder={t.channel} value={form.channel} onChange={(e) => set("channel", e.target.value)} />
            </div>
            <button disabled={loading} onClick={submit} className="mt-5 w-full rounded-full bg-blue-700 px-6 py-4 font-black text-white transition hover:bg-blue-800 active:scale-[.98] disabled:opacity-60">
              {loading ? t.submitting : t.submit}
            </button>
            {msg ? <p className="mt-4 rounded-2xl bg-blue-50 p-4 font-bold text-blue-700">{msg}</p> : null}
          </>
        )}
      </div>
    </main>
  )
}

export default function PromoterApply() { return <ClientOnly><PromoterApplyContent /></ClientOnly> }
