"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { API_URL } from "../../../../lib/config"

function formatMoney(v) { return `RM ${Number(v || 0).toFixed(2)}` }
function normalizePhone(v = "") { const n = String(v).replace(/\D/g, ""); return n.startsWith("60") ? n : `60${n.replace(/^0/, "")}` }
async function api(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, { credentials: "include", headers: { "Content-Type": "application/json", ...(options.headers || {}) }, ...options })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.message || "Failed")
  return json
}
function Info({ l, v }) { return <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-black uppercase tracking-wider text-slate-400">{l}</p><p className="mt-1 break-words font-black">{v || "-"}</p></div> }

export default function OrderDetailPage() {
  const { id } = useParams()
  const [o, setO] = useState(null)
  const [e, setE] = useState("")

  useEffect(() => { api(`/api/customer/orders/${id}`).then(j => setO(j.order)).catch(x => setE(x.message)) }, [id])
  if (e) return <main className="p-10 font-bold">{e}</main>
  if (!o) return <main className="p-10 font-bold">Loading...</main>

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-[36px] bg-white p-8 shadow-2xl">
        <Link href="/account" className="text-sm font-black text-blue-700">← 我的订单</Link>
        <h1 className="mt-5 text-4xl font-black">订单详情</h1>
        <div className="mt-6 rounded-[28px] bg-slate-50 p-6">
          <h2 className="text-2xl font-black">{o.product.name}</h2>
          <p className="text-slate-500">订单：{o.id}</p>
          <p className="text-2xl font-black">{formatMoney(o.totalAmount)}</p>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Info l="订单状态" v={o.status} />
          <Info l="付款状态" v={o.paymentStatus} />
          <Info l="类型" v={o.deliveryType} />
          {o.deliveryType === "PHYSICAL" ? <><Info l="Tracking Number" v={o.trackingNumber || "商家还没填写"} /><Info l="Courier" v={o.courier || "商家还没填写"} /></> : null}
        </div>
        {o.deliveryType === "DIGITAL" && o.digitalDelivery ? <div className="mt-6 whitespace-pre-wrap rounded-3xl bg-blue-50 p-5 font-bold"><b>数字产品交付：</b>\n{o.digitalDelivery}</div> : null}
        {o.deliveryType === "SERVICE" && o.serviceInstructions ? <div className="mt-6 whitespace-pre-wrap rounded-3xl bg-blue-50 p-5 font-bold"><b>服务预约说明：</b>\n{o.serviceInstructions}</div> : null}
        {o.aftersalesWhatsapp ? <a target="_blank" href={`https://wa.me/${normalizePhone(o.aftersalesWhatsapp)}?text=${encodeURIComponent("Hi，我需要售后服务，订单：" + o.id)}`} className="mt-6 inline-block rounded-full bg-green-600 px-6 py-3 font-black text-white">联系商家售后 WhatsApp</a> : <p className="mt-6 rounded-2xl bg-amber-50 p-4 font-bold text-amber-800">商家暂时还没设置售后 WhatsApp。</p>}
      </div>
    </main>
  )
}
