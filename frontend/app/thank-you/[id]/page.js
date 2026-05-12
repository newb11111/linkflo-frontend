"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { API_URL } from "../../../lib/config"

function formatMoney(v) { return `RM ${Number(v || 0).toFixed(2)}` }
async function api(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, { credentials: "include", headers: { "Content-Type": "application/json", ...(options.headers || {}) }, ...options })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.message || "Failed")
  return json
}

function ThankYouContent() {
  const { id } = useParams()
  const sp = useSearchParams()
  const contact = sp.get("contact") || ""
  const [o, setO] = useState(null)
  const [e, setE] = useState("")

  useEffect(() => {
    ;(async () => {
      try {
        const path = contact ? `/api/support/orders/${id}?contact=${encodeURIComponent(contact)}` : `/api/customer/orders/${id}`
        const out = await api(path)
        setO(out.order)
      } catch (x) { setE(x.message) }
    })()
  }, [id, contact])

  if (e) return <main className="p-10 font-bold">{e}</main>
  if (!o) return <main className="p-10 font-bold">Loading...</main>

  const paymentStatus = String(o.paymentStatus || "").toUpperCase()
  const orderStatus = String(o.status || "").toUpperCase()
  const isPendingPayment = paymentStatus === "PENDING" || orderStatus === "PENDING_PAYMENT"
  const isPaid = paymentStatus === "PAID"

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-[40px] bg-white p-8 shadow-2xl">
        <span className={`rounded-full px-5 py-2 text-sm font-black ${isPaid ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
          {isPaid ? "付款成功" : "付款还没完成"}
        </span>
        <h1 className="mt-5 text-5xl font-black">{isPaid ? "谢谢购买！" : "你的订单已经保留"}</h1>
        <p className="mt-4 text-slate-600">
          {isPaid
            ? "订单已经记录。商家会在后台处理发货，并填写 tracking number。"
            : "你刚刚已经进入付款流程，但系统还没有收到付款成功通知。可以继续使用同一个 Billplz 付款链接完成付款。"}
        </p>

        <div className="mt-8 rounded-[30px] bg-slate-50 p-6">
          <h2 className="text-2xl font-black">{o.product?.name}</h2>
          <p className="mt-2 text-slate-500">Order ID：<b className="select-all text-slate-900">{o.id}</b></p>
          <p className="mt-2 text-sm font-bold text-slate-500">请保存 Order ID 和购买时使用的 Email / 电话，之后可以用来查询 tracking。</p>
          <p className="mt-3 font-black">{formatMoney(o.totalAmount)}</p>
        </div>

        {isPendingPayment ? (
          <div className="mt-8 rounded-[30px] bg-amber-50 p-6 text-amber-900">
            <h2 className="text-2xl font-black">继续付款</h2>
            <p className="mt-2 font-bold">付款成功后，商家才会开始处理订单。未付款状态不会安排发货。</p>
            {o.paymentUrl ? <a href={o.paymentUrl} className="mt-5 inline-flex rounded-full bg-amber-500 px-7 py-3 font-black text-white shadow">继续去 Billplz 付款</a> : null}
          </div>
        ) : (
          <div className="mt-8 rounded-[30px] bg-blue-50 p-6">
            <h2 className="text-2xl font-black">接下来怎样？</h2>
            <p className="mt-2 font-bold text-slate-600">你可以用 Order ID + Email / 电话 到订单售后查询页面查看状态、tracking number 和售后 WhatsApp。LinkFlo 不做站内聊天，售后由商家直接处理。</p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {o.paymentUrl && isPendingPayment ? <a href={o.paymentUrl} className="rounded-full bg-slate-950 px-6 py-3 font-black text-white">继续付款</a> : null}
          {!contact && !isPendingPayment ? <Link href={`/account/orders/${o.id}`} className="rounded-full bg-slate-950 px-6 py-3 font-black text-white">查看订单详情</Link> : null}
          <Link href="/support" className="rounded-full bg-blue-700 px-6 py-3 font-black text-white">订单售后查询</Link>
          <Link href="/" className="rounded-full bg-white px-6 py-3 font-black ring-1 ring-black/10">返回首页</Link>
        </div>
      </div>
    </main>
  )
}

export default function ThankYouPage() {
  return <Suspense fallback={<main className="p-10 font-bold">Loading...</main>}><ThankYouContent /></Suspense>
}
