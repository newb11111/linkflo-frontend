'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { api, SITE_URL, logout as doLogout, getToken } from '../../lib/api'
import LanguageToggle from '../../components/LanguageToggle'
import { useLanguage } from '../../lib/i18n'

const SECTION_ORDER = ['PAIN', 'SOLUTION', 'TRUST', 'OFFER', 'FAQ', 'CTA']
const SECTION_GROUPS = [
  { type: 'PAIN', labelKey: 'pain', addKey: 'addPain' },
  { type: 'SOLUTION', labelKey: 'solution', addKey: 'addSolution' },
  { type: 'TRUST', labelKey: 'trust', addKey: 'addTrust' },
  { type: 'OFFER', labelKey: 'offer', addKey: 'addOffer' },
  { type: 'FAQ', labelKey: 'faq', addKey: 'addFaq' },
  { type: 'CTA', labelKey: 'ready', addKey: 'addCta' }
]
function normalizeSectionType(type = '') {
  const value = String(type || '').trim().toUpperCase()
  if (value === 'PROBLEM') return 'PAIN'
  if (value === 'BENEFIT') return 'SOLUTION'
  return SECTION_ORDER.includes(value) ? value : 'OFFER'
}
function zhText(field = {}, fallback = '') {
  if (field && typeof field === 'object' && typeof field.zh === 'string') return field.zh
  return fallback || ''
}
function sectionZhValue(section = {}, key = 'title') {
  const translations = section.translations || {}
  return zhText(translations[key], section[key] || '')
}

function sectionOrderValue(section) {
  const idx = SECTION_ORDER.indexOf(normalizeSectionType(section?.type))
  return idx === -1 ? SECTION_ORDER.length : idx
}
function normalizeSection(section = {}, position = 0) {
  const type = normalizeSectionType(section.type)
  const translations = section.translations || {}
  const title = sectionZhValue(section, 'title')
  const body = sectionZhValue(section, 'body')
  return {
    ...section,
    type,
    title,
    body,
    position,
    isHidden: Boolean(section.isHidden),
    translations: {
      ...translations,
      title: { ...(translations.title || {}), zh: title },
      body: { ...(translations.body || {}), zh: body }
    }
  }
}
function orderSections(sections = []) {
  return [...(sections || [])]
    .map((section, i) => normalizeSection(section, Number.isFinite(section?.position) ? section.position : i))
    .sort((a, b) => sectionOrderValue(a) - sectionOrderValue(b) || Number(a.position || 0) - Number(b.position || 0))
    .map((section, position) => ({ ...section, position }))
}
function syncZhTranslation(section = {}) {
  const translations = section.translations || {}
  return {
    ...section,
    translations: {
      ...translations,
      title: { ...(translations.title || {}), zh: section.title || '' },
      body: { ...(translations.body || {}), zh: section.body || '' }
    }
  }
}
function resetOtherLangs(field = {}) {
  return { zh: field?.zh || '' }
}
function syncProductTranslation(product = {}, patch = {}) {
  const translations = { ...(product.translations || {}) }
  for (const key of ['headline', 'subheadline', 'description', 'priceNote']) {
    if (Object.prototype.hasOwnProperty.call(patch, key)) {
      translations[key] = { zh: patch[key] || '' }
    }
  }
  return translations
}
const emptySection = (type='PAIN', position=0) => ({ type: normalizeSectionType(type), title:'', body:'', position, isHidden:false, translations:{} })
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


function readCache(key, fallback = null) {
  if (typeof window === 'undefined') return fallback
  try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback } catch { return fallback }
}
function saveCache(key, value) {
  if (typeof window === 'undefined' || !value) return
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

export default function MerchantPage() {
  const { tr } = useLanguage()
  const [syncing, setSyncing] = useState(false)
  const [data, setData] = useState(() => readCache('linkflo_funnel_dashboard', null))
  const [billing, setBilling] = useState(() => readCache('linkflo_funnel_billing', null))
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
  const [aiModal, setAiModal] = useState(null)
  const [isAiGenerating, setIsAiGenerating] = useState(false)
  const [profileForm, setProfileForm] = useState({ ownerName:'', brandName:'', whatsapp:'', email:'' })

  async function guard(){
    if(!getToken()){ window.location.href='/login'; return false }
    try{ const me = await api('/api/auth/me'); if(me.role !== 'MERCHANT'){ window.location.href='/admin'; return false } return true } catch(e){ window.location.href='/login'; return false }
  }
  async function load(){
    if(!getToken()){ window.location.href='/login'; return }
    setSyncing(true)
    try{
      const [d,b] = await Promise.all([api('/api/merchant/dashboard'), api('/api/billing/merchant/summary')])
      setData(d)
      setBilling(b)
      saveCache('linkflo_funnel_dashboard', d)
      saveCache('linkflo_funnel_billing', b)
      setPlanToApply(b?.merchant?.plan || d?.merchant?.plan || 'STARTER')
      setProfileForm({
        ownerName: d?.merchant?.user?.name || '',
        brandName: d?.merchant?.brandName || '',
        whatsapp: d?.merchant?.whatsapp || '',
        email: d?.merchant?.user?.email || ''
      })
      if(d.products?.[0]) setLink(v=>({...v,productId:v.productId || d.products[0].id}))
    }catch(e){ setMsg(e.message) }
    finally{ setSyncing(false) }
  }
  useEffect(()=>{ (async()=>{ const ok=await guard(); if(ok) await load() })() },[])
  useEffect(()=>{ if(typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('billing') === 'return') setMsg(tr('returnedBilling')) },[tr])

  function patchProduct(patch){ setProduct(p=>({...p,...patch,translations:syncProductTranslation(p,patch)})) }
  function patchSection(i, patch){
    setProduct(p=>({
      ...p,
      sections: (p.sections || []).map((s,idx)=>{
        if(idx !== i) return s
        const next = { ...s, ...patch }
        const translations = next.translations || {}
        if (Object.prototype.hasOwnProperty.call(patch, 'title')) {
          next.translations = { ...translations, title: { zh: patch.title || '' } }
        }
        if (Object.prototype.hasOwnProperty.call(patch, 'body')) {
          next.translations = { ...(next.translations || translations), body: { zh: patch.body || '' } }
        }
        return next
      })
    }))
  }
  function addSection(type='PAIN'){
    const normalizedType = normalizeSectionType(type)
    setProduct(p=>{
      const current = orderSections(p.sections || [])
      const next = emptySection(normalizedType, current.length)
      const groupIndex = SECTION_ORDER.indexOf(normalizedType)
      let insertAt = current.reduce((last, section, idx) => normalizeSectionType(section.type) === normalizedType ? idx + 1 : last, -1)
      if (insertAt === -1) {
        const laterIndex = current.findIndex(section => sectionOrderValue(section) > groupIndex)
        insertAt = laterIndex === -1 ? current.length : laterIndex
      }
      const sections = [...current]
      sections.splice(insertAt, 0, next)
      return { ...p, sections: orderSections(sections) }
    })
  }
  function removeSection(i){ setProduct(p=>({...p,sections:orderSections((p.sections || []).filter((_,idx)=>idx!==i))})) }

  async function uploadOne(file, key){ if(!file) return; setMsg(tr('uploading')); const fd=new FormData(); fd.append('file',file); const up=await api('/api/upload/media',{method:'POST',body:fd}); patchProduct({[key]:up.url}); setMsg(tr('uploaded')) }
  async function uploadGallery(files){ const list=Array.from(files||[]).slice(0,9); if(!list.length) return; setMsg(tr('uploadingGallery')); const fd=new FormData(); list.forEach(f=>fd.append('files',f)); const up=await api('/api/upload/images',{method:'POST',body:fd}); patchProduct({galleryImages:[...(product.galleryImages||[]),...(up.urls||[])].slice(0,9)}); setMsg(tr('galleryUploaded')) }

  function aiRequiredMissing() {
    const missing = []
    if (!product.name.trim()) missing.push(tr('productName'))
    if (!String(aiInput.targetCustomer || '').trim()) missing.push(tr('targetCustomer'))
    if (!String(aiInput.keyPoints || '').trim()) missing.push(tr('keyPoints'))
    if (!String(aiInput.painPoints || '').trim()) missing.push(tr('painPoints'))
    if (!String(profileForm.whatsapp || '').trim()) missing.push(tr('whatsapp'))
    return missing
  }

  async function generateFunnel() {
    if (isAiGenerating) return
    const missing = aiRequiredMissing()
    if (missing.length) {
      setAiModal({ type:'missing', title:tr('aiRequiredTitle'), body:tr('aiRequiredIntro'), lines:missing })
      setMsg(tr('aiRequiredTitle'))
      return
    }
    setIsAiGenerating(true)
    setAiModal({ type:'loading', title:tr('aiGeneratingTitle'), body:tr('aiGeneratingBody') })
    setMsg(tr('aiGenerating'))
    try {
      const result = await api('/api/merchant/ai-generate', { method:'POST', body: JSON.stringify({ name: product.name, price: product.priceNote || aiInput.price, brandName: profileForm.brandName, merchantWhatsapp: profileForm.whatsapp, ...aiInput }) })
      const f = result.funnel || {}
      const sections = orderSections((f.sections || []).map((sec, i) => ({
        type: normalizeSectionType(sec.type || 'OFFER'),
        title: sec.title?.zh || sec.title?.en || sec.title?.bm || '',
        body: sec.body?.zh || sec.body?.en || sec.body?.bm || '',
        position: i,
        isHidden: false,
        translations: { title: sec.title || {}, body: sec.body || {} }
      })))
      setProduct(p => ({
        ...p,
        headline: f.headline?.zh || f.headline?.en || f.headline?.bm || p.headline,
        subheadline: f.subheadline?.zh || f.subheadline?.en || f.subheadline?.bm || p.subheadline,
        description: f.description?.zh || f.description?.en || f.description?.bm || p.description,
        priceNote: f.priceNote?.zh || f.priceNote?.en || f.priceNote?.bm || p.priceNote,
        translations: { ...(p.translations || {}), headline: f.headline || {}, subheadline: f.subheadline || {}, description: f.description || {}, priceNote: f.priceNote || {} },
        sections: sections.length ? sections : p.sections
      }))
      setAiModal({ type:'success', title:tr('aiSuccessTitle'), body:tr('aiDone') })
      setMsg(tr('aiDone'))
      await load()
    } catch (e) {
      setAiModal({ type:'error', title:tr('aiFailTitle'), body:e.message || tr('aiFailBody') })
      setMsg(e.message)
    } finally {
      setIsAiGenerating(false)
    }
  }


  async function saveProduct(e){
    e.preventDefault(); setMsg('')
    try{
      const sections = orderSections(product.sections || [])
        .filter(s=>String(s.title || '').trim() || String(s.body || '').trim())
        .map((s,i)=>syncZhTranslation({ ...s, type: normalizeSectionType(s.type), position:i }))
      const payload={
        ...product,
        imageUrl: product.imageUrl || '',
        heroImageUrl: product.heroImageUrl || '',
        videoUrl: product.videoUrl || '',
        galleryImages: Array.isArray(product.galleryImages) ? product.galleryImages.filter(Boolean) : [],
        sections
      }
      if(product.id){ await api(`/api/merchant/product/${product.id}`,{method:'PUT',body:JSON.stringify(payload)}); setMsg(tr('skuUpdated')) }
      else { await api('/api/merchant/product',{method:'POST',body:JSON.stringify(payload)}); setMsg(tr('skuCreated')) }
      setProduct(defaultProduct()); setActivePanel('products'); await load()
    }catch(e){ setMsg(e.message) }
  }
  function editProduct(p){
    setProduct({
      ...defaultProduct(),
      ...p,
      imageUrl:p.imageUrl || '',
      heroImageUrl:p.heroImageUrl || '',
      videoUrl:p.videoUrl || '',
      translations:p.translations||{},
      galleryImages:p.galleryImages||[],
      sections:p.sections?.length?orderSections(p.sections.map(x=>({...x,translations:x.translations||{}}))):defaultProduct().sections
    });
    setActivePanel('builder'); window.scrollTo({top:0,behavior:'smooth'})
  }
  async function toggleProduct(p){ setMsg(''); try{ await api(`/api/merchant/product/${p.id}/visibility`,{method:'PATCH',body:JSON.stringify({isHidden:!p.isHidden})}); setMsg(!p.isHidden?tr('productHidden'):tr('productShown')); load() }catch(e){ setMsg(e.message) } }
  async function deleteProduct(p){ if(!confirm(tr('confirmDeleteProduct', { name: p.name }))) return; try{ await api(`/api/merchant/product/${p.id}`,{method:'DELETE'}); setMsg(tr('productDeleted')); load() }catch(e){ setMsg(e.message) } }
  async function createLink(e){ e.preventDefault(); setMsg(''); try{ const result = await api('/api/merchant/promoter-links',{method:'POST',body:JSON.stringify({...link, promoterId: link.promoterId || undefined})}); setMsg(result.message || tr('promoterLinkCreated')); setActivePanel('promoters'); load() }catch(e){ setMsg(e.message) } }
  async function deleteLink(id){ if(!confirm(tr('confirmDeleteLink'))) return; await api(`/api/merchant/promoter-links/${id}`,{method:'DELETE'}); setMsg(tr('promoterLinkDeleted')); load() }
  async function toggleLink(id,isActive){ await api(`/api/merchant/promoter-links/${id}`,{method:'PATCH',body:JSON.stringify({isActive:!isActive})}); load() }
  async function topup(e){ e.preventDefault(); setMsg(''); try{ const result = await api('/api/billing/merchant/topup',{method:'POST',body:JSON.stringify({amount:Number(topupAmount)})}); setMsg(result.message || tr('openBill')); if(result.billUrl) window.location.href = result.billUrl; await load() }catch(e){ setMsg(e.message) } }
  async function applyPlan(){ if(!confirm(tr('confirmUseCredit'))) return; setMsg(''); try{ const result = await api('/api/billing/merchant/apply-credit',{method:'POST',body:JSON.stringify({type:'PLAN_CHANGE', plan:planToApply})}); setMsg(result.message); await load() }catch(e){ setMsg(e.message) } }
  async function buySku(){ if(!confirm(tr('confirmUseCredit'))) return; setMsg(''); try{ const result = await api('/api/billing/merchant/apply-credit',{method:'POST',body:JSON.stringify({type:'SKU_CREDIT', skuCredits:Number(extraSkuCount)})}); setMsg(result.message); await load() }catch(e){ setMsg(e.message) } }
  async function saveProfile(e){
    e.preventDefault()
    setMsg('')
    try{
      const result = await api('/api/merchant/profile',{method:'PUT',body:JSON.stringify(profileForm)})
      setMsg(result.message || tr('profileUpdated'))
      await load()
    }catch(e){ setMsg(e.message) }
  }
  async function logout(){ await doLogout(); window.location.href='/login' }

  const skuLimit = data?.skuLimit || 1
  const products = useMemo(()=>{ const q=productSearch.toLowerCase(); return (data?.products||[]).filter(p=>!q || [p.name,p.headline,p.slug].join(' ').toLowerCase().includes(q)) },[data,productSearch])
  const rankings = useMemo(()=>{ const q=promoterSearch.toLowerCase(); return (data?.rankings||[]).filter(r=>!q || [r.promoterName,r.promoterId,r.productName,r.code].join(' ').toLowerCase().includes(q)) },[data,promoterSearch])
  const plans = billing?.planPrices || { STARTER:29, GROWTH:139, SCALE:259 }
  const credit = billing?.merchant?.creditBalance ?? data?.merchant?.creditBalance ?? 0
  const plan = billing?.merchant?.plan || data?.merchant?.plan || 'STARTER'
  const planStatus = billing?.merchant?.planStatus || data?.merchant?.planStatus || 'ACTIVE'
  const nextBilling = billing?.merchant?.nextBillingAt || data?.merchant?.nextBillingAt
  const totalClicks = (data?.rankings||[]).reduce((sum,r)=>sum+(r.clicks||0),0)
  const waClicks = (data?.rankings||[]).reduce((sum,r)=>sum+(r.whatsappClicks||0),0)
  const promoterLimit = billing?.limits?.promoters || data?.promoterLimit || (plan === 'SCALE' ? 100 : plan === 'GROWTH' ? 50 : 10)

  const panels=[
    ['dashboard','Home','🏠'],
    ['builder','Builder','✨'],
    ['products','Products','🧩'],
    ['promoterCreate','Create','👥'],
    ['promoters','Links','🔗'],
    ['menu','Menu','☰']
  ]

  return <main className="lf-phone-shell"><MerchantStyles/>
    <header className="lf-mobile-header">
      <Link className="lf-icon-btn as-link" href="/member" aria-label="Back to Member">‹</Link>
      <div>
        <strong>AI Funnel</strong>
        <small>{plan} · {planStatus}</small>
      </div>
      <div className="lf-header-actions">
        <LanguageToggle compact />
        <button className="lf-bell" onClick={()=>setActivePanel('menu')} aria-label="Menu">☰</button>
      </div>
    </header>

    {msg&&<div className={String(msg).toLowerCase().includes('error') || String(msg).toLowerCase().includes('fail') || String(msg).toLowerCase().includes('不足') ? 'lf-toast bad' : 'lf-toast'}>{msg}</div>}
    {syncing && <div className="lf-sync-pill">同步中…</div>}

    {aiModal && <div className="lf-modal-backdrop"><div className="lf-modal"><div className="lf-modal-head"><h3>{aiModal.title}</h3>{aiModal.type!=='loading' && <button type="button" onClick={()=>setAiModal(null)}>×</button>}</div><p>{aiModal.body}</p>{aiModal.type==='loading' && <div className="lf-loading-bar"><span /></div>}{Array.isArray(aiModal.lines) && <ul>{aiModal.lines.map((line,i)=><li key={`${line}-${i}`}>{line}</li>)}</ul>} {aiModal.type!=='loading' && <button type="button" className="lf-primary" onClick={()=>setAiModal(null)}>{tr('close')}</button>}</div></div>}

    {activePanel==='dashboard' && <>
      <section className="lf-funnel-hero">
        <div>
          <p>Welcome back</p>
          <h1>{data?.merchant?.brandName || 'AI Funnel'}</h1>
          <span className="lf-pill">🚀 {plan} Plan</span>
        </div>
      </section>

      <section className="lf-soft-card lf-plan-card">
        <div className="lf-row between">
          <div>
            <p className="lf-label">Funnel Status</p>
            <h2>{planStatus}</h2>
            <p className="lf-muted">下次扣费：{nextBilling ? new Date(nextBilling).toLocaleDateString() : '-'}</p>
          </div>
          <span className="lf-rocket">🚀</span>
        </div>
        <div className="lf-two-btns">
          <Link className="lf-main-btn as-link" href="/member?tab=store">Manage Plan</Link>
          <Link className="lf-light-btn as-link" href="/member?tab=wallet">Wallet</Link>
        </div>
        <p className="lf-muted tiny-note">购买、升级、Topup、Extra SKU 全部回到 Member 处理；这里专心操作 Funnel。</p>
      </section>

      <section className="lf-stat-grid">
        <Metric label="Products" value={`${data?.products?.length||0}/${skuLimit}`} icon="🧩" />
        <Metric label="Promoters" value={`${data?.rankings?.length||0}/${promoterLimit}`} icon="👥" />
        <Metric label="Clicks" value={totalClicks} icon="📈" />
        <Metric label="WA Clicks" value={waClicks} icon="💬" />
      </section>

      <section className="lf-quick-row">
        <button onClick={()=>{setProduct(defaultProduct());setActivePanel('builder')}}><span>✨</span>Create Funnel</button>
        <button onClick={()=>setActivePanel('promoterCreate')}><span>👥</span>Create Link</button>
        <button onClick={()=>setActivePanel('products')}><span>🧩</span>Products</button>
        <button onClick={()=>setActivePanel('promoters')}><span>📊</span>Stats</button>
      </section>

      <section className="lf-soft-card">
        <div className="lf-section-title"><h2>Recent Products</h2><button onClick={()=>setActivePanel('products')}>全部 ›</button></div>
        <div className="lf-list">
          {products.slice(0,3).map(p=><ProductRow key={p.id} p={p} tr={tr} editProduct={editProduct} toggleProduct={toggleProduct} deleteProduct={deleteProduct} />)}
          {!products.length && <p className="lf-muted">还没有 Funnel 产品。先创建第一个产品成交页。</p>}
        </div>
      </section>
    </>}

    {activePanel==='builder' && <section className="lf-soft-card"><div className="lf-section-title"><div><p className="lf-label">Funnel Builder</p><h2>{product.id?tr('builderTitleEdit'):tr('builderTitleCreate')}</h2></div><button className="lf-text-btn" onClick={()=>setProduct(defaultProduct())}>{tr('resetForm')}</button></div>
      <form onSubmit={saveProduct} className="lf-form">
        <div className="lf-ai-box"><b>{tr('aiGenerateTitle')}</b><p>{tr('aiGenerateDesc')}</p><p>{tr('autoTranslateNote')}</p><div className="lf-form"><input placeholder={tr('industryPlaceholder')} value={aiInput.industry} onChange={e=>setAiInput({...aiInput,industry:e.target.value})}/><input placeholder={tr('targetCustomer')} value={aiInput.targetCustomer} onChange={e=>setAiInput({...aiInput,targetCustomer:e.target.value})}/><textarea placeholder={tr('keyPoints')} value={aiInput.keyPoints} onChange={e=>setAiInput({...aiInput,keyPoints:e.target.value})}/><textarea placeholder={tr('painPoints')} value={aiInput.painPoints} onChange={e=>setAiInput({...aiInput,painPoints:e.target.value})}/><textarea placeholder={tr('proof')} value={aiInput.proof} onChange={e=>setAiInput({...aiInput,proof:e.target.value})}/><input placeholder={tr('offerPlaceholder')} value={aiInput.offer} onChange={e=>setAiInput({...aiInput,offer:e.target.value})}/></div><button type="button" className="lf-main-btn" onClick={generateFunnel} disabled={isAiGenerating}>{isAiGenerating ? tr('aiGenerating') : tr('aiGenerate')}</button></div>
        <div className="lf-grid2"><div><label>{tr('productName')}</label><input value={product.name} onChange={e=>patchProduct({name:e.target.value})}/></div><div><label>{tr('priceNote')}</label><input value={product.priceNote} onChange={e=>patchProduct({priceNote:e.target.value})}/></div></div>
        <label>{tr('heroHeadline')}</label><input value={product.headline} onChange={e=>patchProduct({headline:e.target.value})}/>
        <label>{tr('subheadline')}</label><textarea value={product.subheadline||''} onChange={e=>patchProduct({subheadline:e.target.value})}/>
        <label>{tr('description')}</label><textarea className="tall" value={product.description||''} onChange={e=>patchProduct({description:e.target.value})}/>
        <div className="lf-grid3"><label className="lf-upload">{tr('mainImage')}<input type="file" accept="image/*" onChange={e=>uploadOne(e.target.files?.[0],'imageUrl')}/></label><label className="lf-upload">{tr('heroImage')}<input type="file" accept="image/*" onChange={e=>uploadOne(e.target.files?.[0],'heroImageUrl')}/></label><label className="lf-upload">{tr('video')}<input type="file" accept="video/*" onChange={e=>uploadOne(e.target.files?.[0],'videoUrl')}/></label></div>
        <label className="lf-upload">{tr('galleryImages')}<input type="file" accept="image/*" multiple onChange={e=>uploadGallery(e.target.files)}/></label>
        {!!product.galleryImages?.length && <div className="lf-gallery-admin">{product.galleryImages.map((img,i)=><img key={`${img}-${i}`} src={img} alt="" />)}</div>}
        <div className="lf-section-title"><h2>{tr('sectionContent')}</h2></div>
        <div className="lf-section-groups">
          {SECTION_GROUPS.map(group => {
            const items = (product.sections || []).map((section, index) => ({ section, index })).filter(({ section }) => normalizeSectionType(section.type) === group.type)
            return <div key={group.type} className="lf-section-group"><div className="lf-row between"><strong>{tr(group.labelKey)}</strong><button type="button" className="lf-mini" onClick={()=>addSection(group.type)}>{tr(group.addKey)}</button></div>
              {items.map(({ section: s, index }) => <div key={`${group.type}-${index}`} className="lf-section-edit"><input placeholder={tr('sectionTitle')} value={s.title || ''} onChange={e=>patchSection(index,{title:e.target.value})}/><textarea className="tall" placeholder={tr('sectionBody')} value={s.body || ''} onChange={e=>patchSection(index,{body:e.target.value})}/><button type="button" className="lf-mini danger" onClick={()=>removeSection(index)}>{tr('remove')}</button></div>)}
            </div>
          })}
        </div>
        <button className="lf-main-btn big">{tr('saveFunnel')}</button>
      </form>
    </section>}

    {activePanel==='products' && <section className="lf-soft-card"><div className="lf-section-title"><div><p className="lf-label">Products</p><h2>{tr('productsTitle')}</h2></div><input className="lf-search" placeholder={tr('searchSku')} value={productSearch} onChange={e=>setProductSearch(e.target.value)}/></div><div className="lf-list">{products.map(p=><ProductRow key={p.id} p={p} tr={tr} editProduct={editProduct} toggleProduct={toggleProduct} deleteProduct={deleteProduct} />)}{!products.length && <p className="lf-muted">No products yet.</p>}</div></section>}

    {activePanel==='promoterCreate' && <section className="lf-soft-card"><div className="lf-section-title"><div><p className="lf-label">Promoter</p><h2>{tr('createPromoterLink')}</h2></div></div><form onSubmit={createLink} className="lf-form"><select value={link.productId} onChange={e=>setLink({...link,productId:e.target.value})}><option value="ALL">{tr('allProducts')}</option>{(data?.products||[]).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select><input placeholder={tr('promoterId')} value={link.promoterId} onChange={e=>setLink({...link,promoterId:e.target.value})}/><input placeholder={tr('promoterName')} value={link.promoterName} onChange={e=>setLink({...link,promoterName:e.target.value})}/><input placeholder={tr('promoterPhone')} value={link.promoterPhone} onChange={e=>setLink({...link,promoterPhone:e.target.value})}/><button className="lf-main-btn">{tr('createLink')}</button></form></section>}

    {activePanel==='promoters' && <section className="lf-soft-card"><div className="lf-section-title"><div><p className="lf-label">Promoter Links</p><h2>{tr('promoterRanking')}</h2></div><input className="lf-search" placeholder={tr('searchPromoter')} value={promoterSearch} onChange={e=>setPromoterSearch(e.target.value)}/></div><div className="lf-list">{rankings.map(r=><div key={r.id} className="lf-list-row"><div><b>{r.promoterName} · {r.productName}</b><small>{r.promoterId} · {tr('clicks')}: {r.clicks} · {tr('waClicksShort')}: {r.whatsappClicks} · {r.isActive?tr('active'):tr('disabled')}</small></div><div className="lf-row-actions"><a target="_blank" href={`${SITE_URL}/p/${r.productSlug}?ref=${r.code}`}>Open</a><a target="_blank" href={`${SITE_URL}/promoter/${r.promoterId}`}>Dashboard</a><button onClick={()=>toggleLink(r.id,r.isActive)}>{r.isActive?tr('deactivate'):tr('activate')}</button><button className="danger" onClick={()=>deleteLink(r.id)}>{tr('delete')}</button></div></div>)}{!rankings.length && <p className="lf-muted">还没有 promoter link。</p>}</div></section>}

    {activePanel==='profile' && <section className="lf-soft-card"><div className="lf-section-title"><div><p className="lf-label">Profile</p><h2>{tr('merchantProfile')}</h2></div></div><form onSubmit={saveProfile} className="lf-form"><input placeholder={tr('ownerName')} value={profileForm.ownerName} onChange={e=>setProfileForm({...profileForm,ownerName:e.target.value})}/><input placeholder={tr('email')} value={profileForm.email} disabled /><input placeholder={tr('brandName')} value={profileForm.brandName} onChange={e=>setProfileForm({...profileForm,brandName:e.target.value})}/><input placeholder={tr('whatsapp')} value={profileForm.whatsapp} onChange={e=>setProfileForm({...profileForm,whatsapp:e.target.value})}/><button className="lf-main-btn">{tr('saveProfile')}</button></form></section>}

    {activePanel==='menu' && <>
      <section className="lf-page-title"><h1>Funnel Menu</h1><p>Funnel 只负责操作；购买、Topup、升级都回到 Member。</p></section>
      <section className="lf-soft-card"><div className="lf-menu-list"><button onClick={()=>setActivePanel('dashboard')}>Funnel Overview</button><button onClick={()=>setActivePanel('profile')}>Profile</button><Link href="/member?tab=store">Manage Plan / Extra SKU</Link><Link href="/member?tab=wallet">Topup / Credit Ledger</Link><Link href="/member?tab=earn">Earn Bonus Credit</Link><button onClick={logout}>Logout</button></div></section>
    </>}

    <nav className="lf-bottom-nav">
      {panels.map(([key,label,icon])=><NavButton key={key} active={activePanel===key} icon={icon} label={label} onClick={()=>setActivePanel(key)} />)}
    </nav>
  </main>
}

function Metric({label,value,icon}){return <div className="lf-metric"><span>{icon}</span><small>{label}</small><strong>{value}</strong></div>}
function NavButton({ active, icon, label, onClick }) { return <button className={active ? 'active' : ''} onClick={onClick}><span>{icon}</span><small>{label}</small></button> }
function ProductRow({ p, tr, editProduct, toggleProduct, deleteProduct }) { return <div className="lf-list-row"><div><b>{p.name}</b><small>{p.slug} · {p.isHidden?tr('inactive'):tr('visible')}</small></div><div className="lf-row-actions"><a target="_blank" href={`${SITE_URL}/p/${p.slug}`}>{tr('openFunnel')}</a><button onClick={()=>editProduct(p)}>{tr('edit')}</button><button onClick={()=>toggleProduct(p)}>{p.isHidden?tr('show'):tr('hide')}</button><button className="danger" onClick={()=>deleteProduct(p)}>{tr('delete')}</button></div></div> }
function MerchantStyles(){return <style jsx global>{`
:root{--lf-bg:#f7f8fd;--lf-text:#182033;--lf-muted:#7b8497;--lf-blue:#4f8dff;--lf-purple:#8b5cf6;--lf-card:#ffffff;--lf-border:#eef1f7;--lf-shadow:0 18px 48px rgba(55,65,81,.10)}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 20% 0%,#eef6ff 0,#f7f8fd 34%,#fbfbff 100%);color:var(--lf-text)}button,input,select,textarea{font:inherit}.lf-phone-shell{width:100%;max-width:480px;min-height:100vh;margin:0 auto;padding:14px 14px 104px;background:linear-gradient(180deg,#fbfcff 0%,#f6f8ff 100%);position:relative}.lf-mobile-header{position:sticky;top:0;z-index:50;display:grid;grid-template-columns:42px 1fr auto;align-items:center;gap:10px;padding:10px 0 12px;background:linear-gradient(180deg,rgba(251,252,255,.96),rgba(251,252,255,.78));backdrop-filter:blur(16px)}.lf-mobile-header strong{display:block;text-align:center;font-size:16px}.lf-mobile-header small{display:block;text-align:center;color:var(--lf-muted);font-size:11px;margin-top:2px}.lf-icon-btn,.lf-bell{width:38px;height:38px;border:0;border-radius:15px;background:#fff;box-shadow:0 8px 22px rgba(40,50,90,.08);cursor:pointer;text-decoration:none;color:#182033;display:flex;align-items:center;justify-content:center;font-weight:950;font-size:22px}.lf-header-actions{display:flex;align-items:center;gap:6px}.lf-toast{position:sticky;top:64px;z-index:60;margin:4px 0 12px;padding:12px 14px;border-radius:18px;background:#ecfdf5;border:1px solid #bbf7d0;color:#065f46;font-weight:800;box-shadow:0 12px 30px rgba(16,185,129,.12)}.lf-toast.bad{background:#fff1f2;border-color:#fecdd3;color:#9f1239}.lf-sync-pill{position:fixed;right:18px;top:72px;z-index:70;background:rgba(255,255,255,.92);border:1px solid #e6ebf5;border-radius:999px;padding:7px 10px;color:#6b7280;font-size:12px;font-weight:900;box-shadow:0 10px 26px rgba(40,50,90,.10);backdrop-filter:blur(12px)}.lf-funnel-hero,.lf-soft-card{background:rgba(255,255,255,.9);border:1px solid var(--lf-border);border-radius:26px;box-shadow:var(--lf-shadow);backdrop-filter:blur(14px)}.lf-funnel-hero{padding:22px;margin:10px 0 14px;background:linear-gradient(135deg,#fff 0%,#fbf7ff 54%,#f1f7ff 100%)}.lf-funnel-hero p{margin:0 0 4px;color:#4b5563;font-weight:800}.lf-funnel-hero h1{margin:0 0 12px;font-size:25px;letter-spacing:-.7px}.lf-soft-card{padding:17px;margin:0 0 14px}.lf-plan-card{background:linear-gradient(135deg,#fff,#f4f9ff)}.lf-row{display:flex;align-items:center;gap:10px}.lf-row.between{justify-content:space-between}.lf-label{margin:0 0 5px;color:#64748b;font-size:12px;font-weight:900;letter-spacing:.03em}.lf-soft-card h2,.lf-page-title h1{margin:0;font-size:23px;letter-spacing:-.6px}.lf-muted{color:var(--lf-muted);font-size:13px;line-height:1.45}.tiny-note{margin:12px 0 0}.lf-pill{display:inline-flex;align-items:center;gap:6px;border:1px solid #e8dcff;background:#f3edff;color:#6d28d9;border-radius:999px;padding:6px 10px;font-weight:900;font-size:12px;width:max-content}.lf-rocket{font-size:38px;filter:drop-shadow(0 8px 14px rgba(99,102,241,.18))}.lf-main-btn,.lf-light-btn{border:0;border-radius:17px;font-weight:950;cursor:pointer;text-align:center;text-decoration:none}.lf-main-btn{background:linear-gradient(135deg,#6d8dff,#8b5cf6);color:#fff;padding:13px 16px;box-shadow:0 14px 30px rgba(99,102,241,.22)}.lf-main-btn.as-link,.lf-light-btn.as-link{display:inline-flex;justify-content:center;align-items:center}.lf-light-btn{background:#f2f5ff;color:#4f46e5;padding:12px 14px}.lf-text-btn{border:0;background:transparent;color:#4f46e5;font-weight:900;cursor:pointer}.lf-two-btns{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.lf-stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}.lf-metric{min-height:104px;border-radius:22px;padding:14px;border:1px solid var(--lf-border);box-shadow:0 12px 34px rgba(40,50,90,.08);background:linear-gradient(135deg,#eff7ff,#fff)}.lf-metric span{font-size:22px}.lf-metric small{display:block;color:#64748b;font-weight:800;margin-top:5px}.lf-metric strong{display:block;font-size:24px;margin-top:6px}.lf-quick-row{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:0 0 14px}.lf-quick-row button{border:0;background:transparent;color:#1f2937;font-weight:800;font-size:11px;cursor:pointer}.lf-quick-row span{display:flex;align-items:center;justify-content:center;width:48px;height:48px;margin:0 auto 6px;border-radius:18px;background:linear-gradient(135deg,#e5f2ff,#f5edff);box-shadow:0 12px 26px rgba(40,50,90,.08);font-size:21px}.lf-section-title{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.lf-section-title h2{font-size:18px;margin:0}.lf-section-title button{border:0;background:transparent;color:#6d5dfc;font-weight:900;cursor:pointer}.lf-page-title{padding:10px 2px 16px}.lf-page-title p{margin:6px 0 0;color:var(--lf-muted)}.lf-list{display:grid;gap:9px}.lf-list-row{display:grid;gap:9px;border:1px solid var(--lf-border);border-radius:18px;background:#fbfcff;padding:13px}.lf-list-row b{display:block}.lf-list-row small{display:block;color:var(--lf-muted);margin-top:4px}.lf-row-actions{display:flex;gap:7px;flex-wrap:wrap}.lf-row-actions a,.lf-row-actions button,.lf-mini{border:0;border-radius:12px;background:#f2f5ff;color:#4f46e5;text-decoration:none;font-weight:900;padding:8px 9px;font-size:12px;cursor:pointer}.lf-row-actions .danger,.lf-mini.danger{background:#fff1f2;color:#be123c}.lf-form{display:grid;gap:10px}.lf-form input,.lf-form select,.lf-form textarea,.lf-search{width:100%;padding:13px 14px;border:1px solid #e1e6f2;border-radius:17px;background:#fbfcff;color:var(--lf-text);outline:none}.lf-form textarea,.lf-form textarea.tall{min-height:92px;resize:vertical}.lf-form label{font-weight:900;color:#384152;font-size:13px}.lf-grid2,.lf-grid3{display:grid;gap:10px}.lf-grid2{grid-template-columns:1fr 1fr}.lf-grid3{grid-template-columns:repeat(3,1fr)}.lf-ai-box{padding:15px;display:grid;gap:10px;background:#f8fbff;border:1px solid var(--lf-border);border-radius:22px}.lf-ai-box p{margin:0;color:#64748b;line-height:1.55}.lf-upload{display:grid;gap:8px;padding:14px;border:1px dashed #cfd7e6;border-radius:17px;background:#f9fbff;font-weight:900;color:#4b5563}.lf-upload input{padding:0;border:0;background:transparent}.lf-gallery-admin{display:flex;gap:8px;overflow-x:auto}.lf-gallery-admin img{height:86px;width:86px;object-fit:cover;border-radius:14px}.lf-section-groups{display:grid;gap:14px}.lf-section-group{background:#f8fbff;border:1px solid #e5edf7;border-radius:22px;padding:14px;display:grid;gap:10px}.lf-section-edit{padding:12px;border:1px solid var(--lf-border);border-radius:18px;background:#fff;display:grid;gap:9px}.lf-menu-list{display:grid;gap:10px}.lf-menu-list a,.lf-menu-list button{display:block;width:100%;border:0;text-align:left;text-decoration:none;border-radius:18px;background:#f8faff;border:1px solid var(--lf-border);padding:15px 14px;color:#1f2937;font-weight:900;cursor:pointer}.lf-bottom-nav{position:fixed;left:50%;bottom:12px;z-index:80;transform:translateX(-50%);width:calc(100% - 24px);max-width:456px;display:grid;grid-template-columns:repeat(6,1fr);gap:4px;padding:9px;border-radius:25px;background:rgba(255,255,255,.9);border:1px solid rgba(232,236,247,.9);box-shadow:0 20px 55px rgba(40,50,90,.18);backdrop-filter:blur(20px)}.lf-bottom-nav button{border:0;background:transparent;border-radius:18px;padding:8px 2px;color:#7b8497;cursor:pointer;font-weight:800}.lf-bottom-nav button span{display:block;font-size:20px;line-height:1}.lf-bottom-nav button small{display:block;font-size:10px;margin-top:3px}.lf-bottom-nav button.active{background:linear-gradient(135deg,#ede9fe,#e0f2fe);color:#5b21b6}.lf-modal-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.52);z-index:90;display:grid;place-items:center;padding:18px}.lf-modal{width:min(520px,100%);background:#fff;border-radius:24px;padding:18px;box-shadow:0 30px 90px rgba(15,23,42,.25);display:grid;gap:12px}.lf-modal-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.lf-modal-head h3{margin:0}.lf-modal-head button{border:0;background:#f1f5f9;border-radius:999px;width:34px;height:34px;font-size:20px;cursor:pointer}.lf-modal p{margin:0;color:#475569;line-height:1.65}.lf-modal ul{margin:0;padding-left:22px;color:#0f172a}.lf-loading-bar{height:9px;border-radius:999px;background:#e2e8f0;overflow:hidden}.lf-loading-bar span{display:block;height:100%;width:45%;border-radius:999px;background:#0b5cff;animation:lfLoad 1.2s ease-in-out infinite}@keyframes lfLoad{0%{transform:translateX(-120%)}100%{transform:translateX(240%)}}@media(min-width:820px){.lf-phone-shell{margin-top:18px;margin-bottom:18px;border-radius:34px;min-height:calc(100vh - 36px);box-shadow:0 30px 90px rgba(15,23,42,.16);border:1px solid #eef1f7}.lf-bottom-nav{bottom:28px}}@media(max-width:420px){.lf-phone-shell{padding-left:10px;padding-right:10px}.lf-bottom-nav{width:calc(100% - 16px)}.lf-bottom-nav button small{font-size:9px}.lf-grid2,.lf-grid3{grid-template-columns:1fr}.lf-stat-grid{grid-template-columns:1fr 1fr}.lf-quick-row{gap:5px}.lf-two-btns{grid-template-columns:1fr}.lf-section-title{align-items:flex-start;flex-direction:column}.lf-search{min-width:0}.lf-row-actions a,.lf-row-actions button{flex:1;text-align:center}}
`}</style>}
