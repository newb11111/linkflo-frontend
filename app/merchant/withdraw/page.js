"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { API_URL } from "../../../lib/config"
import { authHeaders } from "../../../lib/platformAuth"
export default function MerchantWithdraw(){const r=useRouter();const[f,setF]=useState({amount:"",bankName:"",bankAccountName:"",bankAccountNo:""});const[msg,setMsg]=useState("");async function submit(e){e.preventDefault();const res=await fetch(`${API_URL}/api/merchant/withdrawals`,{method:"POST",headers:authHeaders("merchant",{"Content-Type":"application/json"}),body:JSON.stringify(f)});const j=await res.json();if(!res.ok)return setMsg(j.message||"Failed");r.push("/merchant/wallet")}return <div style={s.page}><h1>商家申请提现</h1><form onSubmit={submit} style={s.form}>{["amount","bankName","bankAccountName","bankAccountNo"].map(k=><input key={k} style={s.input} placeholder={k} value={f[k]} onChange={e=>setF({...f,[k]:e.target.value})}/>) }<button style={s.btn}>Submit</button>{msg&&<p>{msg}</p>}</form></div>}
const s={page:{padding:24,maxWidth:600,margin:"0 auto",fontFamily:"Arial"},form:{display:"grid",gap:12},input:{padding:13,border:"1px solid #d0d5dd",borderRadius:12},btn:{padding:14,border:0,borderRadius:14,background:"#2563eb",color:"white",fontWeight:800}}
