"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { API_URL } from "../../../lib/config"
import ClientOnly from "../../../components/ClientOnly"

function MerchantLoginContent() {
  const r = useRouter()
  const [f, setF] = useState({ email: "", password: "" })
  const [e, setE] = useState("")

  async function submit(ev) {
    ev.preventDefault()
    const res = await fetch(`${API_URL}/api/merchant/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    })
    const j = await res.json().catch(() => ({}))
    if (!res.ok) {
      setE(j.message || "Login failed")
      return
    }
    r.push("/merchant")
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-4 py-10">
      <form onSubmit={submit} className="mx-auto max-w-md rounded-[34px] bg-white p-8 shadow-2xl">
        <h1 className="text-3xl font-black">Merchant Login</h1>
        <p className="mt-2 text-slate-500">商家登录后处理订单和 tracking。</p>
        <input className="mt-6 w-full rounded-2xl border p-4" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input className="mt-4 w-full rounded-2xl border p-4" type="password" placeholder="Password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        {e ? <p className="mt-4 rounded-2xl bg-red-50 p-4 font-bold text-red-700">{e}</p> : null}
        <button className="mt-6 w-full rounded-full bg-slate-950 py-4 font-black text-white">登录</button>
      </form>
    </main>
  )
}

export default function Page() {
  return (
    <ClientOnly>
      <MerchantLoginContent />
    </ClientOnly>
  )
}
