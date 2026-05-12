"use client"
import { useEffect, useMemo, useState } from "react"
import { API_URL } from "../../../lib/config"
import { getAdminHeaders } from "../../../lib/adminAuth"

const money = (v) => `RM ${Number(v || 0).toFixed(2)}`

export default function Page() {
  const [os, setOs] = useState([])
  const [edit, setEdit] = useState({})
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState(null)
  async function load() {
    const data = await fetch(`${API_URL}/api/admin/orders`, { headers: getAdminHeaders() }).then((r) => r.json())
    setOs(Array.isArray(data) ? data : [])
  }
  useEffect(() => { load() }, [])
  async function save(id) { await fetch(`${API_URL}/api/admin/orders/${id}`, { method: "PATCH", headers: getAdminHeaders({ "Content-Type": "application/json" }), body: JSON.stringify(edit[id] || {}) }); load() }
  async function refund(id) { if (!window.confirm("确定退款？系统会把订单改成 REFUNDED，并取消相关 Promoter 佣金。")) return; await fetch(`${API_URL}/api/admin/orders/${id}/refund`, { method: "POST", headers: getAdminHeaders() }); load() }
  async function confirmCommission(id) { await fetch(`${API_URL}/api/admin/orders/${id}/confirm-commission`, { method: "POST", headers: getAdminHeaders() }); load() }
  async function confirmReady() { await fetch(`${API_URL}/api/admin/orders/confirm-ready`, { method: "POST", headers: getAdminHeaders() }); load() }
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return os
    return os.filter(o => [o.id,o.product_name,o.slug,o.customer_name,o.customer_email,o.merchant_name,o.status,o.payment_status,o.tracking_number,o.ref_code].join(" ").toLowerCase().includes(q))
  }, [os, search])

  return <main>
    <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-black">订单管理</h1><p className="mt-2 font-bold text-slate-500">搜索订单、顾客、商家、tracking、status。点卡片进去才处理。</p></div><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜索订单 / 顾客 / 商家 / tracking" className="w-full rounded-2xl border border-blue-100 bg-white px-5 py-4 font-bold shadow-sm outline-none focus:border-blue-400 sm:w-[380px]" /></div>
    <button onClick={confirmReady} className="mt-4 rounded-full bg-emerald-600 px-5 py-3 font-black text-white">确认所有到期 commission</button>
    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((o) => <button key={o.id} onClick={()=>setSelected(o)} className="rounded-[30px] border border-blue-100 bg-white p-5 text-left shadow-xl shadow-blue-100/50 transition hover:-translate-y-1 hover:shadow-2xl"><div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-black text-slate-950">{o.product_name || o.slug}</h2><p className="mt-1 text-sm font-bold text-slate-500">{o.customer_name || "Customer"} · {o.customer_email || "-"}</p><p className="text-sm font-bold text-slate-400">{o.merchant_name || "No merchant"}</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">{o.status}</span></div><div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-black"><div className="rounded-2xl bg-blue-50 p-3 text-blue-700">{money(o.total_amount)}</div><div className="rounded-2xl bg-sky-50 p-3 text-sky-700">{o.delivery_type || "PHYSICAL"}</div><div className="rounded-2xl bg-slate-50 p-3 text-slate-600">{o.payment_status}</div></div>{o.is_suspicious ? <p className="mt-3 rounded-2xl bg-red-50 p-3 text-sm font-black text-red-700">可疑订单</p> : null}</button>)}</div>
    {selected ? <OrderModal o={selected} edit={edit} setEdit={setEdit} close={()=>setSelected(null)} save={save} refund={refund} confirmCommission={confirmCommission} /> : null}
  </main>
}

function OrderModal({ o, edit, setEdit, close, save, refund, confirmCommission }) {
  const set = (key, value) => setEdit({ ...edit, [o.id]: { ...(edit[o.id] || {}), [key]: value } })
  return <div className="fixed inset-0 z-50 overflow-auto bg-slate-950/55 p-4 backdrop-blur-sm"><div className="mx-auto my-6 max-w-5xl rounded-[34px] bg-white p-5 shadow-2xl"><div className="flex items-start justify-between gap-4 border-b border-blue-100 pb-4"><div><h2 className="text-2xl font-black">{o.product_name || o.slug}</h2><p className="font-bold text-slate-500">顾客：{o.customer_name} · {o.customer_email}</p><p className="font-bold text-slate-500">商家：{o.merchant_name || "-"}</p></div><button onClick={close} className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-2xl font-black">×</button></div><div className="mt-5 grid gap-5 lg:grid-cols-3"><div><p className="text-3xl font-black text-blue-700">{money(o.total_amount)}</p><div className="mt-4 rounded-3xl bg-blue-50 p-4 text-sm font-bold leading-7 text-slate-700"><p>支付手续费：<b>{money(o.payment_fee_amount)}</b>（{o.payment_fee_payer || "MERCHANT"} 顶）</p><p>平台收入：<b className="text-green-700">{money(o.platform_fee_amount)}</b></p><p>商家结算参考：<b>{money(o.merchant_net_amount || Number(o.total_amount || 0) - Number(o.payment_fee_amount || 0) - Number(o.platform_fee_amount || 0) - Number(o.commission_amount || 0))}</b></p>{o.promoter_id ? <p>Promoter：<b>{o.promoter_name || o.promoter_username}</b> · 佣金 <b>{Number(o.commission_rate || 0)}% / {money(o.commission_amount)}</b> · {o.commission_status}</p> : null}</div></div><div className="grid gap-2"><select className="rounded-xl border p-3" defaultValue={o.status || ""} onChange={(e) => set("status", e.target.value)}><option>PROCESSING</option><option>SHIPPED</option><option>DELIVERED</option><option>COMPLETED</option><option>DISPUTE</option><option>CANCELLED</option><option>REFUNDED</option></select><input className="rounded-xl border p-3" placeholder="Tracking Number" defaultValue={o.tracking_number || ""} onChange={(e) => set("trackingNumber", e.target.value)} /><input className="rounded-xl border p-3" placeholder="Courier" defaultValue={o.courier || ""} onChange={(e) => set("courier", e.target.value)} /><input className="rounded-xl border p-3" placeholder="售后 WhatsApp" defaultValue={o.aftersales_whatsapp || ""} onChange={(e) => set("aftersalesWhatsapp", e.target.value)} /></div><div className="grid content-start gap-2"><button onClick={() => save(o.id)} className="rounded-full bg-blue-600 py-3 font-black text-white">保存</button><button onClick={() => confirmCommission(o.id)} className="rounded-full bg-emerald-50 py-3 font-black text-emerald-700">确认 Promoter 佣金</button><button onClick={() => refund(o.id)} className="rounded-full bg-red-50 py-3 font-black text-red-700">退款 / 取消佣金</button></div></div></div></div>
}
