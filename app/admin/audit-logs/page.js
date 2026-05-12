"use client"
import { useEffect, useState } from "react"
import { API_URL } from "../../../lib/config"
import { getAdminHeaders } from "../../../lib/adminAuth"

export default function Page(){
  const [rows,setRows]=useState([])
  const [e,setE]=useState("")
  useEffect(()=>{(async()=>{try{const r=await fetch(`${API_URL}/api/admin/audit-logs`,{headers:getAdminHeaders(),credentials:"include"}); const j=await r.json(); if(!r.ok) throw new Error(j.message||"Failed"); setRows(Array.isArray(j)?j:[])}catch(x){setE(x.message)}})()},[])
  return <main className="p-6">
    <h1 className="text-3xl font-black">Audit Logs</h1>
    <p className="mt-2 text-sm text-slate-500">记录产品审核、商家修改、退款等关键动作，方便之后查账和追责。</p>
    {e?<p className="mt-4 rounded-xl bg-red-50 p-3 font-bold text-red-700">{e}</p>:null}
    <div className="mt-6 overflow-x-auto rounded-3xl bg-white shadow">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="bg-slate-100"><tr><th className="p-3">Time</th><th className="p-3">Actor</th><th className="p-3">Action</th><th className="p-3">Target</th><th className="p-3">After</th></tr></thead>
        <tbody>{rows.map(x=><tr key={x.id} className="border-t"><td className="p-3">{new Date(x.created_at).toLocaleString()}</td><td className="p-3">{x.actor_type}:{x.actor_id}</td><td className="p-3 font-black">{x.action}</td><td className="p-3">{x.target_type}:{x.target_id}</td><td className="p-3 max-w-[360px] truncate">{x.after_value?JSON.stringify(x.after_value):"-"}</td></tr>)}</tbody>
      </table>
    </div>
  </main>
}
