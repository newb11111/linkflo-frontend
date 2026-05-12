"use client"
import { useEffect, useMemo, useState } from "react"
import { API_URL } from "../../../lib/config"
import { getAdminHeaders } from "../../../lib/adminAuth"

export default function Customers() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState("")
  const [msg, setMsg] = useState("")
  async function load() {
    const data = await fetch(`${API_URL}/api/admin/users`, { headers: getAdminHeaders() }).then((r) => r.json())
    setUsers(Array.isArray(data) ? data : [])
  }
  useEffect(() => { load() }, [])
  async function toggle(u) {
    await fetch(`${API_URL}/api/admin/users/${u.id}/status`, { method: "PATCH", headers: getAdminHeaders({ "Content-Type": "application/json" }), body: JSON.stringify({ isActive: !u.is_active }) })
    setMsg(!u.is_active ? "User 已恢复" : "User 已停用")
    load()
  }
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter(u => [u.name,u.email,u.phone,u.ref_code].join(" ").toLowerCase().includes(q))
  }, [users, search])
  return <main><div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-black">User / Customer 管理</h1><p className="mt-2 font-bold text-slate-500">这里管理顾客账号。不要真删除顾客，因为订单和退款记录需要保留。</p></div><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜索名字 / email / phone / ref" className="w-full rounded-2xl border border-blue-100 bg-white px-5 py-4 font-bold shadow-sm outline-none focus:border-blue-400 sm:w-[360px]" /></div>{msg?<p className="mt-4 rounded-2xl bg-blue-50 p-4 font-bold text-blue-700">{msg}</p>:null}<div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map(u=><div key={u.id} className="rounded-[30px] border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/50"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-xl font-black text-slate-950">{u.name}</h2><p className="font-bold text-slate-600">{u.email}</p><p className="text-sm font-bold text-slate-400">{u.phone || "No phone"}</p></div><span className={u.is_active?"rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700":"rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700"}>{u.is_active ? "Active" : "Disabled"}</span></div><div className="mt-4 rounded-2xl bg-blue-50 p-3 text-center text-sm font-black text-blue-700">Ref: {u.ref_code}</div><button onClick={()=>toggle(u)} className={u.is_active?"mt-4 w-full rounded-full bg-red-50 px-5 py-3 font-black text-red-700":"mt-4 w-full rounded-full bg-green-50 px-5 py-3 font-black text-green-700"}>{u.is_active?"停用 User":"恢复 User"}</button></div>)}</div></main>
}
