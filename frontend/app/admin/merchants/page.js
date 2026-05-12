"use client"
import { useEffect, useMemo, useState } from "react"
import { API_URL } from "../../../lib/config"
import { getAdminHeaders } from "../../../lib/adminAuth"

const packages = [
  { value: "starter", label: "STARTER · RM49.90", limit: 3 },
  { value: "growth", label: "GROWTH · RM3699", limit: 500 },
  { value: "scale", label: "SCALE · RM12999", limit: 999999 },
  { value: "custom", label: "Custom", limit: 999999 },
]
const packageLimit = (pkg, custom) => pkg === "custom" ? Number(custom || 999999) : packages.find(p => p.value === pkg)?.limit || 3

export default function Page() {
  const [ms, setMs] = useState([])
  const [search, setSearch] = useState("")
  const [f, setF] = useState({ name: "", email: "", phone: "", whatsapp: "", password: "", packageType: "starter", productLimit: 3 })
  const [msg, setMsg] = useState("")
  async function load() { setMs(await fetch(`${API_URL}/api/admin/merchants`, { headers: getAdminHeaders() }).then((r) => r.json())) }
  useEffect(() => { load() }, [])
  async function save(e) {
    e.preventDefault()
    const payload = { ...f, productLimit: packageLimit(f.packageType, f.productLimit) }
    const r = await fetch(`${API_URL}/api/admin/merchants`, { method: "POST", headers: getAdminHeaders({ "Content-Type": "application/json" }), body: JSON.stringify(payload) })
    const j = await r.json()
    if (!r.ok) { setMsg(j.message); return }
    setF({ name: "", email: "", phone: "", whatsapp: "", password: "", packageType: "starter", productLimit: 3 })
    setMsg("Merchant 已新增")
    load()
  }
  async function toggle(m) {
    await fetch(`${API_URL}/api/admin/merchants/${m.id}/status`, { method: "PATCH", headers: getAdminHeaders({ "Content-Type": "application/json" }), body: JSON.stringify({ isActive: !m.is_active }) })
    load()
  }
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return Array.isArray(ms) ? ms : []
    return (Array.isArray(ms) ? ms : []).filter(m => [m.name, m.email, m.phone, m.whatsapp, m.package_type].join(" ").toLowerCase().includes(q))
  }, [ms, search])
  return <main>
    <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-black">Merchant 管理</h1><p className="mt-2 font-bold text-slate-500">Admin 管理商家账号、配套和审核状态；产品由商家端上传，AI 生成后提交审核。</p></div><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜索商家名字 / email / package" className="w-full rounded-2xl border border-blue-100 bg-white px-5 py-4 font-bold shadow-sm outline-none focus:border-blue-400 sm:w-[360px]" /></div>
    <form onSubmit={save} className="mt-6 grid gap-3 rounded-[30px] border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/50 sm:grid-cols-2 lg:grid-cols-3">
      <input className="rounded-xl border p-3" placeholder="商家名字" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>
      <input className="rounded-xl border p-3" placeholder="Email" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/>
      <input className="rounded-xl border p-3" placeholder="Phone" value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/>
      <input className="rounded-xl border p-3" placeholder="售后 WhatsApp" value={f.whatsapp} onChange={e=>setF({...f,whatsapp:e.target.value})}/>
      <input className="rounded-xl border p-3" placeholder="Password" value={f.password} onChange={e=>setF({...f,password:e.target.value})}/>
      <select className="rounded-xl border p-3" value={f.packageType} onChange={e=>setF({...f,packageType:e.target.value,productLimit:packageLimit(e.target.value,f.productLimit)})}>{packages.map(p=><option key={p.value} value={p.value}>{p.label} · {p.limit >= 999999 ? "Unlimited" : `${p.limit} products`}</option>)}</select>
      {f.packageType === "custom" ? <input className="rounded-xl border p-3" placeholder="Custom product limit" value={f.productLimit} onChange={e=>setF({...f,productLimit:e.target.value})}/> : null}
      <button className="rounded-full bg-blue-600 px-5 py-3 font-black text-white">新增 Merchant</button>{msg?<p className="p-3 font-bold text-blue-700">{msg}</p>:null}
    </form>
    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map(m=><div key={m.id} className="rounded-[30px] border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/50"><div className="flex items-start justify-between gap-3"><div><h2 className="text-xl font-black text-slate-950">{m.name}</h2><p className="mt-1 font-bold text-slate-500">{m.email}</p><p className="text-sm font-bold text-slate-400">{m.whatsapp || m.phone || "No phone"}</p></div><span className={m.is_active?"rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700":"rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700"}>{m.is_active?"Active":"Disabled"}</span></div><div className="mt-4 grid grid-cols-2 gap-3 text-center text-sm font-black"><div className="rounded-2xl bg-blue-50 p-3 text-blue-700">{m.package_type || "starter"}</div><div className="rounded-2xl bg-sky-50 p-3 text-sky-700">{Number(m.product_count||0)} / {m.product_limit || 3}</div></div><div className="mt-4 rounded-2xl bg-emerald-50 p-3 text-xs font-bold leading-5 text-slate-600"><p className="font-black text-emerald-700">Bank / Payout</p><p>{m.bank_name || "No bank info"}</p><p>{m.bank_account_name || "-"}</p><p className="break-all">{m.bank_account_number || "-"}</p></div><p className="mt-4 break-all text-xs font-bold text-slate-400">merchant_id: {m.id}</p><button onClick={()=>toggle(m)} className={m.is_active?"mt-4 w-full rounded-full bg-red-50 px-5 py-3 font-black text-red-700":"mt-4 w-full rounded-full bg-green-50 px-5 py-3 font-black text-green-700"}>{m.is_active?"停用 / Hide 他的商品":"恢复启用"}</button></div>)}</div>
  </main>
}
