"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { API_URL } from "../../../lib/config"
import ClientOnly from "../../../components/ClientOnly"

function PromoterLoginContent(){
  const r=useRouter(); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [err,setErr]=useState(""); const [loading,setLoading]=useState(false)
  async function login(e){e.preventDefault(); setLoading(true); setErr(""); try{const res=await fetch(`${API_URL}/api/promoter/login`,{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})}); const j=await res.json().catch(()=>({})); if(!res.ok) throw new Error(j.message||"Login failed"); r.push('/promoter')}catch(x){setErr(x.message)}finally{setLoading(false)}}
  return <main className="min-h-screen bg-[#f7f4ee] px-4 py-16"><form onSubmit={login} className="mx-auto max-w-md rounded-[36px] bg-white p-8 shadow-2xl"><h1 className="text-4xl font-black">Promoter Login</h1><p className="mt-2 text-slate-500">Promoter 端：看所有可推广产品、复制专属链接、查看佣金。</p><input className="mt-8 w-full rounded-2xl border p-4" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/><input className="mt-3 w-full rounded-2xl border p-4" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)}/>{err?<p className="mt-4 rounded-2xl bg-red-50 p-4 font-bold text-red-700">{err}</p>:null}<button disabled={loading} className="mt-6 w-full rounded-full bg-slate-950 py-4 font-black text-white">{loading?'Loading...':'Login'}</button></form></main>
}

export default function PromoterLogin(){return <ClientOnly><PromoterLoginContent /></ClientOnly>}
