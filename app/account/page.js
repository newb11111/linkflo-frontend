"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { API_URL } from "../../lib/config"

function formatMoney(v) { return `RM ${Number(v || 0).toFixed(2)}` }
function normalizePhone(v = "") { const n = String(v).replace(/\D/g, ""); return n.startsWith("60") ? n : `60${n.replace(/^0/, "")}` }
async function api(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, { credentials: "include", headers: { "Content-Type": "application/json", ...(options.headers || {}) }, ...options })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.message || "Failed")
  return json
}

export default function CustomerAccountPage() {
  const [u, setU] = useState(null)
  const [os, setOs] = useState([])
  const [err, setErr] = useState("")

  useEffect(() => {
    ;(async () => {
      try {
        const me = await api("/api/customer/me")
        setU(me.user)
        setOs(await api("/api/customer/orders"))
      } catch (e) { setErr(e.message) }
    })()
  }, [])

  if (err) return <main className="min-h-screen bg-[#f7f4ee] p-10"><div className="mx-auto max-w-md rounded-3xl bg-white p-8 text-center"><p className="font-bold">请先登录</p><Link href="/auth?next=/account" className="mt-5 inline-block rounded-full bg-slate-950 px-6 py-3 font-black text-white">登录 / 注册</Link></div></main>
  if (!u) return <main className="p-10 font-bold">Loading...</main>

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[36px] bg-white p-8 shadow-2xl">
          <p className="text-sm font-black text-blue-700">Customer Orders</p>
          <h1 className="mt-3 text-4xl font-black">{u.name}</h1>
          <p className="mt-2 text-slate-500">{u.email}</p>
          <p className="mt-4 rounded-2xl bg-blue-50 p-4 font-bold text-blue-800">LinkFlo final 版不做顾客积分系统。这里保留订单、tracking 和售后联系。</p>
          <div className="mt-6 flex gap-3"><Link href="/" className="rounded-full bg-slate-950 px-6 py-3 font-black text-white">LinkFlo</Link><Link href="/support" className="rounded-full bg-blue-700 px-6 py-3 font-black text-white">订单售后查询</Link></div>
        </div>
        <h2 className="mt-10 text-3xl font-black">我的订单</h2>
        <div className="mt-5 space-y-4">
          {os.map((o) => (
            <div key={o.id} className="rounded-[28px] bg-white p-5 shadow">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xl font-black">{o.product.name}</p>
                  <p className="text-sm text-slate-500">订单：{o.id}</p>
                  <p className="font-black">{formatMoney(o.totalAmount)}</p>
                  <p className="text-sm font-bold">状态：{o.status} {o.trackingNumber ? `· ${o.courier} ${o.trackingNumber}` : ""}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/account/orders/${o.id}`} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white">订单详情</Link>
                  {o.aftersalesWhatsapp ? <a target="_blank" href={`https://wa.me/${normalizePhone(o.aftersalesWhatsapp)}?text=${encodeURIComponent("Hi，我需要售后服务，订单：" + o.id)}`} className="rounded-full bg-green-600 px-5 py-3 text-sm font-black text-white">售后 WhatsApp</a> : null}
                </div>
              </div>
            </div>
          ))}
          {!os.length ? <div className="rounded-3xl bg-white p-8 text-center font-bold text-slate-500">还没有订单。</div> : null}
        </div>
      </div>
    </main>
  )
}
