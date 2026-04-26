"use client"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
export default function Success(){const q=useSearchParams();const order=q.get("order")||"";return <div style={{minHeight:"100vh",display:"grid",placeItems:"center",fontFamily:"Arial",padding:24}}><div style={{maxWidth:520,border:"1px solid #e5e7eb",borderRadius:28,padding:30,textAlign:"center",boxShadow:"0 20px 50px rgba(15,23,42,.08)"}}><h1>付款成功</h1><p>订单编号：</p><code style={{background:"#f1f5f9",padding:10,borderRadius:10,display:"block"}}>{order}</code>{order&&<Link href={`/order/${order}`} style={{display:"block",marginTop:20,background:"#111827",color:"white",padding:14,borderRadius:14,textDecoration:"none",fontWeight:800}}>查看订单 / Tracking</Link>}</div></div>}
