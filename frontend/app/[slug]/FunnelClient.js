'use client'
import { useEffect, useState } from 'react'
import { API_URL } from '../../lib/api'
import FunnelView from '../../components/FunnelView'
export default function FunnelClient({slug,refCode}){const [product,setProduct]=useState(null),[err,setErr]=useState('');useEffect(()=>{fetch(`${API_URL}/api/public/products/${slug}${refCode?`?ref=${refCode}`:''}`).then(r=>r.json()).then(d=>{if(d.error)setErr(d.error);else setProduct(d)}); fetch(`${API_URL}/api/public/products/${slug}/click${refCode?`?ref=${refCode}`:''}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ref:refCode})}).catch(()=>{})},[slug,refCode]); if(err)return <div className="p-8">{err}</div>; if(!product)return <div className="p-8">Loading...</div>; return <FunnelView product={product}/>}
