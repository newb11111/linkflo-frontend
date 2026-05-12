"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { api } from "../../lib/customerApi"
import { useLanguage } from "../../components/TranslateProvider"
import LanguageSwitch from "../../components/LanguageSwitch"

const COPY = {
  zh: {
    back: "← LinkFlo",
    loginTitle: "登录账号",
    registerTitle: "注册账号",
    desc: "购买和订单记录都在这里。",
    login: "登录",
    register: "注册",
    name: "名字",
    phone: "电话",
    password: "Password",
    processing: "处理中...",
    failed: "登录失败",
  },
  en: {
    back: "← LinkFlo",
    loginTitle: "Login Account",
    registerTitle: "Register Account",
    desc: "Your purchases and order records are kept here.",
    login: "Login",
    register: "Register",
    name: "Name",
    phone: "Phone",
    password: "Password",
    processing: "Processing...",
    failed: "Login failed",
  },
  ms: {
    back: "← LinkFlo",
    loginTitle: "Log Masuk Akaun",
    registerTitle: "Daftar Akaun",
    desc: "Pembelian dan rekod order anda disimpan di sini.",
    login: "Log masuk",
    register: "Daftar",
    name: "Nama",
    phone: "Telefon",
    password: "Password",
    processing: "Sedang proses...",
    failed: "Log masuk gagal",
  },
}

function AuthContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") || "/account"
  const { lang } = useLanguage()
  const t = COPY[lang] || COPY.zh
  const [mode, setMode] = useState("login")
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setLoading(true)
    setError("")
    try {
      await api(`/api/customer/${mode}`, { method: "POST", body: JSON.stringify(form) })
      router.push(next)
    } catch (err) {
      setError(err?.message || t.failed)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-4 py-10">
      <div className="mx-auto mb-4 flex max-w-md justify-end">
        <LanguageSwitch />
      </div>
      <form onSubmit={submit} className="mx-auto max-w-md rounded-[34px] bg-white p-8 shadow-2xl">
        <Link href="/" className="text-sm font-black text-blue-700">{t.back}</Link>
        <h1 className="mt-5 text-3xl font-black">{mode === "login" ? t.loginTitle : t.registerTitle}</h1>
        <p className="mt-2 text-slate-500">{t.desc}</p>
        <div className="mt-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1 font-black">
          <button type="button" onClick={() => setMode("login")} className={mode === "login" ? "rounded-xl bg-white py-3 shadow" : "py-3"}>{t.login}</button>
          <button type="button" onClick={() => setMode("register")} className={mode === "register" ? "rounded-xl bg-white py-3 shadow" : "py-3"}>{t.register}</button>
        </div>
        {mode === "register" ? (
          <input className="mt-5 w-full rounded-2xl border p-4" placeholder={t.name} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        ) : null}
        <input className="mt-4 w-full rounded-2xl border p-4" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        {mode === "register" ? (
          <input className="mt-4 w-full rounded-2xl border p-4" placeholder={t.phone} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        ) : null}
        <input className="mt-4 w-full rounded-2xl border p-4" type="password" placeholder={t.password} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error ? <p className="mt-4 rounded-2xl bg-red-50 p-4 font-bold text-red-700">{error}</p> : null}
        <button disabled={loading} className="mt-6 w-full rounded-full bg-slate-950 py-4 font-black text-white disabled:opacity-60">{loading ? t.processing : mode === "login" ? t.login : t.register}</button>
      </form>
    </main>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#f7f4ee] p-10" />}>
      <AuthContent />
    </Suspense>
  )
}
