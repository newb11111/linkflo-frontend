'use client'
import { useEffect, useMemo, useState } from 'react'
import { api, SITE_URL, logout as doLogout } from '../../lib/api'
import LanguageToggle from '../../components/LanguageToggle'
import { useLanguage } from '../../lib/i18n'

const emptySection = (type='PAIN', position=0) => ({ type, title:'', body:'', position, isHidden:false, translations:{} })
const defaultProduct = () => ({
  id:'', name:'', headline:'', subheadline:'', description:'', sop:'', priceNote:'', imageUrl:'', heroImageUrl:'', videoUrl:'', galleryImages:[], translations:{}, isPublished:true, isHidden:false,
  sections:[
    {type:'PAIN',title:'',body:'',position:0,isHidden:false},
    {type:'SOLUTION',title:'',body:'',position:1,isHidden:false},
    {type:'TRUST',title:'',body:'',position:2,isHidden:false},
    {type:'OFFER',title:'',body:'',position:3,isHidden:false},
    {type:'FAQ',title:'',body:'',position:4,isHidden:false},
    {type:'CTA',title:'',body:'',position:5,isHidden:false}
  ]
})

export default function MerchantPage() {
  const { tr } = useLanguage()
  const [checking, setChecking] = useState(true)
  const [data, setData] = useState(null)
  const [billing, setBilling] = useState(null)
  const [msg, setMsg] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [activePanel, setActivePanel] = useState('dashboard')
  const [productSearch, setProductSearch] = useState('')
  const [promoterSearch, setPromoterSearch] = useState('')
  const [topupAmount, setTopupAmount] = useState(100)
  const [planToApply, setPlanToApply] = useState('STARTER')
  const [extraSkuCount, setExtraSkuCount] = useState(1)
  const [product, setProduct] = useState(defaultProduct())
  const [link, setLink] = useState({ productId:'', promoterName:'', promoterPhone:'', promoterId:'' })
  const [aiInput, setAiInput] = useState({ industry:'', targetCustomer:'', keyPoints:'', painPoints:'', proof:'', offer:'', price:'' })

  async function guard(){ try{ const me = await api('/api/auth/me'); if(me.role !== 'MERCHANT'){ window.location.href='/admin'; return false } return true } catch(e){ window.location.href='/login'; return false } }
  async function load(){ try{ const [d,b] = await Promise.all([api('/api/merchant/dashboard'), api('/api/billing/merchant/summary')]); setData(d); setBilling(b); setPlanToApply(b?.merchant?.plan || d?.merchant?.plan || 'STARTER'); if(d.products?.[0]) setLink(v=>({...v,productId:v.productId || d.products[0].id})) }catch(e){ setMsg(e.message) } }
  useEffect(()=>{ (async()=>{ const ok=await guard(); if(ok){ await load(); setChecking(false) } })() },[])
  useEffect(()=>{ if(typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('billing') === 'return') setMsg(tr('returnedBilling')) },[tr])

  function patchProduct(patch){ setProduct(p=>({...p,...patch})) }
  function patchSection(i, patch){ setProduct(p=>({...p,sections:p.sections.map((s,idx)=>idx===i?{...s,...patch}:s)})) }
  function addSection(type='TEXT'){ setProduct(p=>({...p,sections:[...p.sections, emptySection(type, p.sections.length)]})) }
  function removeSection(i){ setProduct(p=>({...p,sections:p.sections.filter((_,idx)=>idx!==i).map((s,idx)=>({...s,position:idx}))})) }

  async function uploadOne(file, key){ if(!file) return; setMsg(tr('uploading')); const fd=new FormData(); fd.append('file',file); const up=await api('/api/upload/media',{method:'POST',body:fd}); patchProduct({[key]:up.url}); setMsg(tr('uploaded')) }
  async function uploadGallery(files){ const list=Array.from(files||[]).slice(0,9); if(!list.length) return; setMsg(tr('uploadingGallery')); const fd=new FormData(); list.forEach(f=>fd.append('files',f)); const up=await api('/api/upload/images',{method:'POST',body:fd}); patchProduct({galleryImages:[...(product.galleryImages||[]),...(up.urls||[])].slice(0,9)}); setMsg(tr('galleryUploaded')) }

  async function generateFunnel() {
    if (!product.name.trim()) { setMsg(tr('needProductName')); return }
    setMsg(tr('aiGenerating'))
    try {
      const result = await api('/api/merchant/ai-generate', { method:'POST', body: JSON.stringify({ name: product.name, price: product.priceNote || aiInput.price, ...aiInput }) })
      const f = result.funnel || {}
      const sections = (f.sections || []).map((sec, i) => ({
        type: sec.type || 'TEXT',
        title: sec.title?.zh || sec.title?.en || sec.title?.bm || '',
        body: sec.body?.zh || sec.body?.en || sec.body?.bm || '',
        position: i,
        isHidden: false,
        translations: { title: sec.title || {}, body: sec.body || {} }
      }))
      setProduct(p => ({
        ...p,
        headline: f.headline?.zh || f.headline?.en || f.headline?.bm || p.headline,
        subheadline: f.subheadline?.zh || f.subheadline?.en || f.subheadline?.bm || p.subheadline,
        description: f.description?.zh || f.description?.en || f.description?.bm || p.description,
        priceNote: f.priceNote?.zh || f.priceNote?.en || f.priceNote?.bm || p.priceNote,
        translations: { ...(p.translations || {}), headline: f.headline || {}, subheadline: f.subheadline || {}, description: f.description || {}, priceNote: f.priceNote || {} },
        sections: sections.length ? sections : p.sections
      }))
      setMsg(result.source === 'openai' ? tr('aiDone') : tr('aiFallback'))
      await load()
    } catch (e) { setMsg(e.message) }
  }

  async function saveProduct(e){ e.preventDefault(); setMsg(''); try{ const payload={...product, sections:product.sections.filter(s=>s.title.trim() || s.body.trim()).map((s,i)=>({...s,position:i}))}; if(product.id){ await api(`/api/merchant/product/${product.id}`,{method:'PUT',body:JSON.stringify(payload)}); setMsg(tr('skuUpdated')) } else { await api('/api/merchant/product',{method:'POST',body:JSON.stringify(payload)}); setMsg(tr('skuCreated')) } setProduct(defaultProduct()); setActivePanel('products'); await load() }catch(e){ setMsg(e.message) } }
  function editProduct(p){ setProduct({...defaultProduct(),...p, translations:p.translations||{}, galleryImages:p.galleryImages||[], sections:p.sections?.length?p.sections.map(x=>({...x,translations:x.translations||{}})):defaultProduct().sections}); setActivePanel('builder'); window.scrollTo({top:0,behavior:'smooth'}) }
  async function toggleProduct(p){ setMsg(''); try{ await api(`/api/merchant/product/${p.id}/visibility`,{method:'PATCH',body:JSON.stringify({isHidden:!p.isHidden})}); setMsg(!p.isHidden?tr('productHidden'):tr('productShown')); load() }catch(e){ setMsg(e.message) } }
  async function deleteProduct(p){ if(!confirm(tr('confirmDeleteProduct', { name: p.name }))) return; try{ await api(`/api/merchant/product/${p.id}`,{method:'DELETE'}); setMsg(tr('productDeleted')); load() }catch(e){ setMsg(e.message) } }
  async function createLink(e){ e.preventDefault(); setMsg(''); try{ const result = await api('/api/merchant/promoter-links',{method:'POST',body:JSON.stringify({...link, promoterId: link.promoterId || undefined})}); setMsg(result.message || tr('promoterLinkCreated')); setActivePanel('promoters'); load() }catch(e){ setMsg(e.message) } }
  async function deleteLink(id){ if(!confirm(tr('confirmDeleteLink'))) return; await api(`/api/merchant/promoter-links/${id}`,{method:'DELETE'}); setMsg(tr('promoterLinkDeleted')); load() }
  async function toggleLink(id,isActive){ await api(`/api/merchant/promoter-links/${id}`,{method:'PATCH',body:JSON.stringify({isActive:!isActive})}); load() }
  async function topup(e){ e.preventDefault(); setMsg(''); try{ const result = await api('/api/billing/merchant/topup',{method:'POST',body:JSON.stringify({amount:Number(topupAmount)})}); setMsg(result.message || tr('openBill')); if(result.billUrl) window.location.href = result.billUrl; await load() }catch(e){ setMsg(e.message) } }
  async function applyPlan(){ if(!confirm(tr('confirmUseCredit'))) return; setMsg(''); try{ const result = await api('/api/billing/merchant/apply-credit',{method:'POST',body:JSON.stringify({type:'PLAN_CHANGE', plan:planToApply})}); setMsg(result.message); await load() }catch(e){ setMsg(e.message) } }
  async function buySku(){ if(!confirm(tr('confirmUseCredit'))) return; setMsg(''); try{ const result = await api('/api/billing/merchant/apply-credit',{method:'POST',body:JSON.stringify({type:'SKU_CREDIT', skuCredits:Number(extraSkuCount)})}); setMsg(result.message); await load() }catch(e){ setMsg(e.message) } }
  async function logout(){ await doLogout(); window.location.href='/login' }

  const skuLimit = data?.skuLimit || 1
  const products = useMemo(()=>{ const q=productSearch.toLowerCase(); return (data?.products||[]).filter(p=>!q || [p.name,p.headline,p.slug].join(' ').toLowerCase().includes(q)) },[data,productSearch])
  const rankings = useMemo(()=>{ const q=promoterSearch.toLowerCase(); return (data?.rankings||[]).filter(r=>!q || [r.promoterName,r.promoterId,r.productName,r.code].join(' ').toLowerCase().includes(q)) },[data,promoterSearch])
  const plans = billing?.planPrices || { STARTER:29, GROWTH:139, SCALE:259 }
  const credit = billing?.merchant?.creditBalance ?? data?.merchant?.creditBalance ?? 0
  if(checking) return <main className="lf-shell"><MerchantStyles/><h2>{tr('checkingLogin')}</h2></main>

  const panels=[['dashboard',tr('totalData')],['billing',tr('billing')],['builder',tr('funnelBuilder')],['products',tr('skuList')],['promoterCreate',tr('createPromoter')],['promoters',tr('promoterList')]]
  return <main className="lf-shell"><MerchantStyles/>
    <div className="lf-topbar"><div><p>{tr('aiFunnelEngine')}</p><h1>{data?.merchant?.brandName || tr('merchantDashboard')}</h1></div><div className="lf-actions"><LanguageToggle compact /><button onClick={()=>setMenuOpen(true)} className="lf-menu-btn">{tr('menu')}</button><button onClick={logout} className="lf-ghost">{tr('logout')}</button></div></div>
    <aside className={`lf-drawer ${menuOpen?'open':''}`}><div><b>{tr('merchantMenu')}</b><button onClick={()=>setMenuOpen(false)}>×</button></div>{panels.map(([k,l])=><button key={k} className={activePanel===k?'active':''} onClick={()=>{setActivePanel(k);setMenuOpen(false)}}>{l}</button>)}<button onClick={logout} className="logout">{tr('logout')}</button></aside>{menuOpen&&<div className="lf-backdrop" onClick={()=>setMenuOpen(false)}/>} {msg&&<p className="lf-notice">{msg}</p>}

    <section className={activePanel==='dashboard'?'':'lf-hide-mobile'}><div className="lf-metrics"><Metric label={tr('creditBalance')} value={`RM ${Number(credit).toFixed(1)}`}/><Metric label={tr('package')} value={data?.merchant?.plan || 'STARTER'}/><Metric label={tr('sku')} value={`${data?.products?.length||0}/${skuLimit}`}/><Metric label={tr('promoters')} value={data?.rankings?.length||0}/><Metric label={tr('waClicksShort')} value={(data?.rankings||[]).reduce((s,r)=>s+(r.whatsappClicks||0),0)}/></div></section>

    <section className={`lf-card ${activePanel==='billing'?'':'lf-hide-mobile'}`}><div className="lf-head"><div><p>{tr('billing')}</p><h2>{tr('topupCredit')}</h2></div></div>
      <div className="lf-billing-grid">
        <div className="lf-ai-box"><b>{tr('currentPlan')}: {billing?.merchant?.plan || data?.merchant?.plan}</b><p>{tr('creditBalance')}: RM {Number(credit).toFixed(1)}</p><p>{tr('monthlyFee')}: RM {plans[billing?.merchant?.plan || data?.merchant?.plan || 'STARTER'] || 29}</p><p>{tr('planStatus')}: {billing?.merchant?.planStatus || 'ACTIVE'}</p><p>{tr('nextBilling')}: {billing?.merchant?.nextBillingAt ? new Date(billing.merchant.nextBillingAt).toLocaleDateString() : '-'}</p></div>
        <form onSubmit={topup} className="lf-ai-box"><b>{tr('topupCredit')}</b><p>{tr('minimumTopup')}</p><input className="lf-input" type="number" min="100" step="1" value={topupAmount} onChange={e=>setTopupAmount(e.target.value)} placeholder={tr('topupAmount')} /><button className="lf-primary">{tr('createBill')}</button></form>
        <div className="lf-ai-box"><b>{tr('applyPlan')}</b><select className="lf-input" value={planToApply} onChange={e=>setPlanToApply(e.target.value)}>{Object.entries(plans).map(([k,v])=><option key={k} value={k}>{k} - RM{v}/month</option>)}</select><button className="lf-primary" onClick={applyPlan}>{tr('confirmUseCredit')}</button></div>
        <div className="lf-ai-box"><b>{tr('buyExtraSku')}</b><input className="lf-input" type="number" min="1" max="20" value={extraSkuCount} onChange={e=>setExtraSkuCount(e.target.value)} /><p>{tr('pricePerSku', { price: billing?.skuCreditPrice || 100 })}</p><button className="lf-primary" onClick={buySku}>{tr('confirmUseCredit')}</button></div>
      </div>
      <h3>{tr('paymentHistory')}</h3>
      <div className="lf-mini-list">{(billing?.payments||[]).length ? billing.payments.map(p=><div key={p.id}><b>{p.type}</b><span>RM {Number(p.amount||0).toFixed(1)} · {p.status}</span></div>) : <p>{tr('noRecords')}</p>}</div>
    </section>

    <section className={`lf-card ${activePanel==='builder'?'':'lf-hide-mobile'}`}><div className="lf-head"><div><p>{tr('builderV2')}</p><h2>{product.id?tr('builderTitleEdit'):tr('builderTitleCreate')}</h2></div><button className="lf-mini muted" onClick={()=>setProduct(defaultProduct())}>{tr('resetForm')}</button></div>
      <form onSubmit={saveProduct} className="lf-builder">
        <div className="lf-ai-box"><b>{tr('aiGenerateTitle')}</b><p>{tr('aiGenerateDesc')}</p><div><input className="lf-input" placeholder={tr('industryPlaceholder')} value={aiInput.industry} onChange={e=>setAiInput({...aiInput,industry:e.target.value})}/><input className="lf-input" placeholder={tr('targetCustomer')} value={aiInput.targetCustomer} onChange={e=>setAiInput({...aiInput,targetCustomer:e.target.value})}/><textarea className="lf-input" placeholder={tr('keyPoints')} value={aiInput.keyPoints} onChange={e=>setAiInput({...aiInput,keyPoints:e.target.value})}/><textarea className="lf-input" placeholder={tr('painPoints')} value={aiInput.painPoints} onChange={e=>setAiInput({...aiInput,painPoints:e.target.value})}/><textarea className="lf-input" placeholder={tr('proof')} value={aiInput.proof} onChange={e=>setAiInput({...aiInput,proof:e.target.value})}/><input className="lf-input" placeholder={tr('offerPlaceholder')} value={aiInput.offer} onChange={e=>setAiInput({...aiInput,offer:e.target.value})}/></div><button type="button" className="lf-primary" onClick={generateFunnel}>{tr('aiGenerate')}</button></div>
        <div className="lf-grid2"><div><label>{tr('productName')}</label><input className="lf-input" value={product.name} onChange={e=>patchProduct({name:e.target.value})}/></div><div><label>{tr('priceNote')}</label><input className="lf-input" value={product.priceNote} onChange={e=>patchProduct({priceNote:e.target.value})}/></div></div>
        <label>{tr('heroHeadline')}</label><input className="lf-input" value={product.headline} onChange={e=>patchProduct({headline:e.target.value})}/>
        <label>{tr('subheadline')}</label><textarea className="lf-input" value={product.subheadline||''} onChange={e=>patchProduct({subheadline:e.target.value})}/>
        <label>{tr('description')}</label><textarea className="lf-input tall" value={product.description||''} onChange={e=>patchProduct({description:e.target.value})}/>
        <div className="lf-grid3"><label>{tr('mainImage')}<input type="file" accept="image/*" onChange={e=>uploadOne(e.target.files?.[0],'imageUrl')}/></label><label>{tr('heroImage')}<input type="file" accept="image/*" onChange={e=>uploadOne(e.target.files?.[0],'heroImageUrl')}/></label><label>{tr('video')}<input type="file" accept="video/*" onChange={e=>uploadOne(e.target.files?.[0],'videoUrl')}/></label></div>
        <label>{tr('galleryImages')}<input type="file" accept="image/*" multiple onChange={e=>uploadGallery(e.target.files)}/></label>
        {!!product.galleryImages?.length && <div className="lf-gallery-admin">{product.galleryImages.map((img,i)=><img key={`${img}-${i}`} src={img} alt="" />)}</div>}
        <div className="lf-head"><div><p>{tr('sectionContent')}</p></div><div className="lf-row-actions"><button type="button" className="lf-mini" onClick={()=>addSection('PAIN')}>{tr('addPain')}</button><button type="button" className="lf-mini" onClick={()=>addSection('SOLUTION')}>{tr('addSolution')}</button><button type="button" className="lf-mini" onClick={()=>addSection('TRUST')}>{tr('addTrust')}</button><button type="button" className="lf-mini" onClick={()=>addSection('OFFER')}>{tr('addOffer')}</button><button type="button" className="lf-mini" onClick={()=>addSection('FAQ')}>{tr('addFaq')}</button><button type="button" className="lf-mini" onClick={()=>addSection('CTA')}>{tr('addCta')}</button></div></div>
        {product.sections.map((s,i)=><div key={i} className="lf-section-edit"><div className="lf-grid2"><input className="lf-input" placeholder={tr('sectionType')} value={s.type} onChange={e=>patchSection(i,{type:e.target.value})}/><input className="lf-input" placeholder={tr('sectionTitle')} value={s.title} onChange={e=>patchSection(i,{title:e.target.value})}/></div><textarea className="lf-input tall" placeholder={tr('sectionBody')} value={s.body} onChange={e=>patchSection(i,{body:e.target.value})}/><button type="button" className="lf-mini danger" onClick={()=>removeSection(i)}>{tr('remove')}</button></div>)}
        <button className="lf-primary big">{tr('saveFunnel')}</button>
      </form>
    </section>

    <section className={`lf-card ${activePanel==='products'?'':'lf-hide-mobile'}`}><div className="lf-head"><div><p>{tr('productsTitle')}</p></div><input className="lf-input" placeholder={tr('searchSku')} value={productSearch} onChange={e=>setProductSearch(e.target.value)}/></div><div className="lf-mini-list">{products.map(p=><div key={p.id}><b>{p.name}</b><span>{p.slug} · {p.isHidden?tr('inactive'):tr('visible')}</span><div className="lf-row-actions"><a className="lf-mini link" target="_blank" href={`${SITE_URL}/p/${p.slug}`}>{tr('openFunnel')}</a><button className="lf-mini" onClick={()=>editProduct(p)}>{tr('edit')}</button><button className="lf-mini muted" onClick={()=>toggleProduct(p)}>{p.isHidden?tr('show'):tr('hide')}</button><button className="lf-mini danger" onClick={()=>deleteProduct(p)}>{tr('delete')}</button></div></div>)}</div></section>

    <section className={`lf-card ${activePanel==='promoterCreate'?'':'lf-hide-mobile'}`}><div className="lf-head"><div><p>{tr('createPromoterLink')}</p></div></div><form onSubmit={createLink} className="lf-builder"><select className="lf-input" value={link.productId} onChange={e=>setLink({...link,productId:e.target.value})}><option value="ALL">{tr('allProducts')}</option>{(data?.products||[]).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select><input className="lf-input" placeholder={tr('promoterId')} value={link.promoterId} onChange={e=>setLink({...link,promoterId:e.target.value})}/><input className="lf-input" placeholder={tr('promoterName')} value={link.promoterName} onChange={e=>setLink({...link,promoterName:e.target.value})}/><input className="lf-input" placeholder={tr('promoterPhone')} value={link.promoterPhone} onChange={e=>setLink({...link,promoterPhone:e.target.value})}/><button className="lf-primary">{tr('createLink')}</button></form></section>

    <section className={`lf-card ${activePanel==='promoters'?'':'lf-hide-mobile'}`}><div className="lf-head"><div><p>{tr('promoterRanking')}</p></div><input className="lf-input" placeholder={tr('searchPromoter')} value={promoterSearch} onChange={e=>setPromoterSearch(e.target.value)}/></div><div className="lf-mini-list">{rankings.map(r=><div key={r.id}><b>{r.promoterName} · {r.productName}</b><span>{r.promoterId} · {tr('clicks')}: {r.clicks} · {tr('waClicksShort')}: {r.whatsappClicks} · {r.isActive?tr('active'):tr('disabled')}</span><div className="lf-row-actions"><a className="lf-mini link" target="_blank" href={`${SITE_URL}/p/${r.productSlug}?ref=${r.code}`}>{tr('openFunnel')}</a><a className="lf-mini link" target="_blank" href={`${SITE_URL}/promoter/${r.promoterId}`}>{tr('promoterDashboard')}</a><button className="lf-mini muted" onClick={()=>toggleLink(r.id,r.isActive)}>{r.isActive?tr('deactivate'):tr('activate')}</button><button className="lf-mini danger" onClick={()=>deleteLink(r.id)}>{tr('delete')}</button></div></div>)}</div></section>
  </main>
}
function Metric({label,value}){return <div className="lf-metric"><span>{label}</span><strong>{value}</strong></div>}
function MerchantStyles(){return <style jsx global>{`
  .lf-shell{max-width:1180px;margin:0 auto;padding:14px 14px 60px;color:#0f172a}.lf-topbar{position:sticky;top:0;z-index:20;display:flex;justify-content:space-between;gap:12px;align-items:center;padding:14px 0;background:rgba(246,248,251,.88);backdrop-filter:blur(12px)}.lf-topbar p,.lf-head p{margin:0;color:#2563eb;font-size:12px;font-weight:950;letter-spacing:.12em}.lf-topbar h1,.lf-head h2{margin:0}.lf-actions,.lf-row-actions{display:flex;gap:8px;flex-wrap:wrap}.lf-menu-btn,.lf-ghost,.lf-primary,.lf-mini{border:0;border-radius:14px;font-weight:850;cursor:pointer}.lf-menu-btn,.lf-primary{background:#0b5cff;color:white}.lf-menu-btn,.lf-ghost{padding:11px 14px}.lf-ghost{background:white;color:#0f172a;border:1px solid #dbe3ef}.lf-primary{padding:12px 15px}.lf-primary.big{font-size:16px;padding:15px}.lf-mini{background:#0b5cff;color:white;padding:8px 10px;font-size:12px;text-decoration:none}.lf-mini.link{display:inline-flex}.lf-mini.muted{background:#e2e8f0;color:#334155}.lf-mini.danger{background:#ef4444}.lf-notice{background:#ecfdf5;border:1px solid #bbf7d0;padding:12px 14px;border-radius:16px}.lf-metrics{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin:8px 0 18px}.lf-metric,.lf-card,.lf-ai-box,.lf-section-edit{background:white;border:1px solid #e5edf7;border-radius:24px;box-shadow:0 12px 35px rgba(15,23,42,.06)}.lf-metric{padding:18px}.lf-metric span{display:block;color:#64748b}.lf-metric strong{display:block;margin-top:8px;font-size:25px}.lf-card{padding:18px;margin-bottom:18px}.lf-head{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:14px}.lf-builder{display:grid;gap:12px}.lf-ai-box{padding:16px;display:grid;gap:10px;background:#f8fbff}.lf-ai-box p{margin:0;color:#64748b;line-height:1.55}.lf-ai-box>div{display:grid;gap:8px}.lf-input{width:100%;box-sizing:border-box;padding:12px;border:1px solid #dbe3ef;border-radius:14px;background:#fff;font-size:14px}.lf-input.tall,textarea.lf-input{min-height:96px}.lf-grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}.lf-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.lf-billing-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.lf-section-edit{padding:14px;display:grid;gap:9px}.lf-gallery-admin{display:flex;gap:8px;overflow-x:auto}.lf-gallery-admin img{height:86px;width:86px;object-fit:cover;border-radius:14px}.lf-mini-list{display:grid;gap:10px}.lf-mini-list>div{background:#fff;border:1px solid #e5edf7;border-radius:18px;padding:13px;display:grid;gap:6px}.lf-mini-list span{color:#64748b;font-size:13px}.lf-drawer{position:fixed;right:-320px;top:0;width:290px;max-width:82vw;height:100vh;background:#fff;z-index:40;box-shadow:-18px 0 50px rgba(15,23,42,.18);padding:18px;transition:.2s}.lf-drawer.open{right:0}.lf-drawer>div{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.lf-drawer button{border:0;border-radius:14px;cursor:pointer}.lf-drawer>div button{font-size:24px;background:#f1f5f9;padding:4px 10px}.lf-drawer>button{display:block;width:100%;padding:13px;margin:8px 0;text-align:left;border:1px solid #e2e8f0;background:#fff;font-weight:800}.lf-drawer>button.active{background:#0b5cff;color:white}.lf-drawer .logout{background:#fee2e2;color:#991b1b}.lf-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.28);z-index:30}@media(max-width:820px){.lf-shell{padding:12px}.lf-topbar h1{font-size:22px}.lf-ghost{display:none}.lf-metrics{grid-template-columns:repeat(2,1fr)}.lf-metric:first-child{grid-column:1/-1}.lf-grid2,.lf-grid3,.lf-billing-grid{grid-template-columns:1fr}.lf-head{align-items:stretch;flex-direction:column}.lf-hide-mobile{display:none}.lf-card{border-radius:20px;padding:15px}}@media(min-width:821px){.lf-menu-btn{display:none}.lf-hide-mobile{display:block!important}}
`}</style>}
