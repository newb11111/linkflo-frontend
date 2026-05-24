'use client'
import { useState } from 'react'
import LanguageSwitch from './LanguageSwitch'

export default function FunnelView({ product }) {
  const [lang,setLang]=useState('zh')
  const funnel = product?.translations?.[lang] || product?.funnel || {}
  const wa = String(product?.cta_whatsapp || '').replace(/[^0-9]/g,'')
  const msg = encodeURIComponent(`Hi, I want to know more about ${product?.name}`)
  const link = wa ? `https://wa.me/${wa}?text=${msg}` : '#'
  const imgs = Array.isArray(product?.images) ? product.images : []
  return <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
    <section className="max-w-5xl mx-auto px-5 py-8">
      <div className="flex justify-between items-center mb-6"><b>{product?.merchant_name || 'LinkFlo'}</b><LanguageSwitch lang={lang} setLang={setLang}/></div>
      <div className="card p-8 text-center">
        <div className="text-sm text-blue-700 font-bold mb-2">{product?.promoter ? `Promoter: ${product.promoter.name}` : 'Official Funnel'}</div>
        <h1 className="text-3xl md:text-5xl font-black mb-4">{funnel?.hero?.title || product?.name}</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">{funnel?.hero?.subtitle || '了解产品卖点，直接 WhatsApp 咨询。'}</p>
        {imgs[0] && <img src={imgs[0]} className="mx-auto mt-6 rounded-3xl max-h-80 object-cover"/>}
        <a href={link} className="btn inline-block mt-8">{funnel?.hero?.cta || 'WhatsApp 了解更多'}</a>
      </div>
      <Block title={funnel?.pain?.title} items={funnel?.pain?.items}/>
      <Block title={funnel?.benefits?.title} items={funnel?.benefits?.items}/>
      <Block title={funnel?.trust?.title} items={funnel?.trust?.items}/>
      {funnel?.faq?.items?.length ? <div className="card p-6 mt-6"><h2 className="text-2xl font-black mb-4">{funnel.faq.title}</h2>{funnel.faq.items.map((x,i)=><div key={i} className="border-t py-3"><b>{x.q}</b><p className="text-slate-600">{x.a}</p></div>)}</div> : null}
      <div className="text-center py-8"><a href={link} className="btn inline-block">WhatsApp Now</a></div>
    </section>
  </main>
}
function Block({title,items}) { if(!title && !items?.length) return null; return <div className="card p-6 mt-6"><h2 className="text-2xl font-black mb-4">{title}</h2><div className="grid md:grid-cols-3 gap-3">{(items||[]).map((x,i)=><div key={i} className="rounded-2xl bg-blue-50 p-4 font-semibold">{x}</div>)}</div></div> }
