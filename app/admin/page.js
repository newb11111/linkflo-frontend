'use client'
import { useEffect, useMemo, useState } from 'react'
import { api, logout as doLogout } from '../../lib/api'
import LanguageToggle from '../../components/LanguageToggle'
import { useLanguage } from '../../lib/i18n'

export default function AdminPage() {
  const { tr } = useLanguage()
  const [checking, setChecking] = useState(true)
  const [stats, setStats] = useState(null)
  const [merchants, setMerchants] = useState([])
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [activePanel, setActivePanel] = useState('dashboard')
  const [form, setForm] = useState({ email:'', password:'merchant123', name:'', brandName:'', whatsapp:'', plan:'STARTER' })
  const [msg, setMsg] = useState('')
  const [resetPassword, setResetPassword] = useState('merchant123')
  const [creditChange, setCreditChange] = useState(100)

  async function guard(){
    try{
      const me = await api('/api/auth/me')
      if (me.role !== 'ADMIN') { window.location.href = '/merchant'; return false }
      return true
    }catch(e){ window.location.href = '/login'; return false }
  }
  async function load(){
    setMsg('')
    try{
      setStats(await api('/api/admin/stats'))
      setMerchants(await api('/api/admin/merchants'))
    }catch(e){ setMsg(e.message) }
  }
  useEffect(()=>{ (async()=>{ const ok = await guard(); if(ok){ await load(); setChecking(false) } })() },[])

  async function createMerchant(e){
    e.preventDefault(); setMsg('')
    try{
      const created = await api('/api/admin/merchants',{method:'POST',body:JSON.stringify(form)})
      setMsg(tr('merchantCreated', { email: created.email, password: form.password }))
      setForm({ email:'', password:'merchant123', name:'', brandName:'', whatsapp:'', plan:'STARTER' })
      setActivePanel('merchants')
      load()
    }catch(e){ setMsg(e.message) }
  }
  async function changeSku(id, change){ setMsg(''); try{ await api(`/api/admin/merchants/${id}/extra-sku`,{method:'PATCH',body:JSON.stringify({change})}); setMsg(change > 0 ? tr('skuAdded') : tr('skuReduced')); load() }catch(e){ setMsg(e.message) } }
  async function changePassword(id){ setMsg(''); try{ await api(`/api/admin/merchants/${id}/password`,{method:'PATCH',body:JSON.stringify({password:resetPassword})}); setMsg(tr('passwordUpdated')) }catch(e){ setMsg(e.message) } }
  async function changeCredit(id, change){ setMsg(''); try{ const result = await api(`/api/admin/merchants/${id}/credit`,{method:'PATCH',body:JSON.stringify({change, note:'Admin manual adjustment'})}); setMsg(result.message || tr('creditUpdated')); load() }catch(e){ setMsg(e.message) } }
  async function toggleMerchant(id, isHidden){ setMsg(''); try{ await api(`/api/admin/merchants/${id}/visibility`,{method:'PATCH',body:JSON.stringify({isHidden:!isHidden})}); setMsg(!isHidden ? tr('hidden') : tr('shown')); load() }catch(e){ setMsg(e.message) } }
  async function deleteMerchant(id, brandName){ setMsg(''); if(!confirm(tr('confirmDeleteMerchant', { name: brandName }))) return; try{ await api(`/api/admin/merchants/${id}`,{method:'DELETE'}); setMsg(tr('merchantDeleted')); load() }catch(e){ setMsg(e.message) } }
  async function logout(){ await doLogout(); window.location.href='/login' }

  const filteredMerchants = useMemo(()=>{
    const q = query.trim().toLowerCase()
    if(!q) return merchants
    return merchants.filter(m => [m.brandName, m.user?.email, m.name, m.whatsapp, m.plan].filter(Boolean).join(' ').toLowerCase().includes(q))
  },[merchants, query])

  const productsCount = stats?.products ?? merchants.reduce((sum,m)=>sum+(m.products?.length||0),0)
  const promoterCount = stats?.promoterLinks ?? 0
  const whatsappClicks = stats?.whatsappClicks ?? 0

  if (checking) return <main className="lf-shell"><h2>{tr('checkingLogin')}</h2><AdminStyles /></main>

  const menuItems = [['dashboard',tr('totalData')], ['merchants',tr('merchantList')], ['create',tr('createMerchant')]]

  return <main className="lf-shell">
    <AdminStyles />
    <div className="lf-topbar">
      <div>
        <p className="lf-kicker">LINKFLO ADMIN</p>
        <h1>{tr('adminDashboard')}</h1>
      </div>
      <div className="lf-actions"><LanguageToggle compact />
        <button onClick={()=>setMenuOpen(true)} className="lf-menu-btn">{tr('menu')}</button>
        <button onClick={logout} className="lf-ghost">{tr('logout')}</button>
      </div>
    </div>

    <aside className={`lf-drawer ${menuOpen ? 'open' : ''}`}>
      <div className="lf-drawer-head"><b>{tr('adminMenu')}</b><button onClick={()=>setMenuOpen(false)}>×</button></div>
      {menuItems.map(([key,label])=><button key={key} className={activePanel===key?'active':''} onClick={()=>{setActivePanel(key);setMenuOpen(false)}}>{label}</button>)}
    </aside>
    {menuOpen && <div className="lf-backdrop" onClick={()=>setMenuOpen(false)} />}

    {msg && <p className="lf-notice">{msg}</p>}

    <section className={activePanel==='dashboard' ? '' : 'lf-hide-mobile'}>
      <div className="lf-metrics">
        <Metric label={tr('gmv')} value="RM 0" sub={tr('reservedMetric')} />
        <Metric label={tr('merchants')} value={stats?.merchants ?? merchants.length} />
        <Metric label={tr('products')} value={productsCount} />
        <Metric label={tr('promoters')} value={promoterCount} />
        <Metric label={tr('waClicks')} value={whatsappClicks} />
      </div>
    </section>

    <section className={`lf-card ${activePanel==='create' ? '' : 'lf-hide-mobile'}`}>
      <div className="lf-section-head"><div><p className="lf-kicker">{tr('create')}</p><h2>{tr('createMerchant')}</h2></div></div>
      <form onSubmit={createMerchant} className="lf-form-grid">
        <input placeholder={tr('email')} value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="lf-input" />
        <input placeholder={tr('password')} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="lf-input" />
        <input placeholder={tr('ownerName')} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="lf-input" />
        <input placeholder={tr('brandName')} value={form.brandName} onChange={e=>setForm({...form,brandName:e.target.value})} className="lf-input" />
        <input placeholder={tr('whatsapp')} value={form.whatsapp} onChange={e=>setForm({...form,whatsapp:e.target.value})} className="lf-input" />
        <select value={form.plan} onChange={e=>setForm({...form,plan:e.target.value})} className="lf-input"><option value="STARTER">RM29 / 10 links</option><option value="GROWTH">RM139 / 50 links</option><option value="SCALE">RM259 / 100 links</option></select>
        <button className="lf-primary">{tr('createMerchant')}</button>
      </form>
    </section>

    <section className={`lf-card ${activePanel==='merchants' ? '' : 'lf-hide-mobile'}`}>
      <div className="lf-section-head">
        <div><p className="lf-kicker">{tr('manage')}</p><h2>{tr('merchants')}</h2></div>
        <input className="lf-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder={tr('searchMerchant')} />
      </div>
      <div className="lf-table-wrap">
        <div className="lf-table lf-admin-table">
          <div className="lf-th">{tr('merchant')}</div><div className="lf-th">{tr('plan')}</div><div className="lf-th">{tr('credit')}</div><div className="lf-th">{tr('sku')}</div><div className="lf-th">{tr('resetPassword')}</div><div className="lf-th">{tr('actions')}</div>
          {filteredMerchants.map(m=><div className="lf-tr" key={m.id}>
            <div className="lf-main-cell"><b>{m.brandName}</b><small>{m.user.email}</small>{m.isHidden && <small className="lf-red">{tr('inactive')}</small>}</div>
            <div><span className="lf-badge">{m.plan}</span><small>{m.planMeta.promoterLimit} links</small></div>
            <div><b>RM {Number(m.creditBalance || 0).toFixed(1)}</b><small>{tr('canManualAdjust')}</small></div>
            <div><b>{m.products.length}/{1 + (m.extraSkuCredits || 0)}</b></div>
            <div><input className="lf-input compact" value={resetPassword} onChange={e=>setResetPassword(e.target.value)} /></div>
            <div className="lf-row-actions">
              <input className="lf-input tiny" type="number" step="0.1" value={creditChange} onChange={e=>setCreditChange(Number(e.target.value || 0))} />
              <button type="button" className="lf-mini" onClick={()=>changeCredit(m.id, Math.abs(creditChange || 0))}>{tr('addCredit')}</button>
              <button type="button" className="lf-mini" onClick={()=>changeCredit(m.id, -Math.abs(creditChange || 0))}>{tr('deductCredit')}</button>
              <button type="button" className="lf-mini" onClick={()=>changeSku(m.id,1)}>{tr('addSku')}</button>
              <button type="button" className="lf-mini" onClick={()=>changeSku(m.id,-1)}>{tr('removeSku')}</button>
              <button type="button" className="lf-mini" onClick={()=>changePassword(m.id)}>{tr('reset')}</button>
              <button type="button" className="lf-mini muted" onClick={()=>toggleMerchant(m.id, m.isHidden)}>{m.isHidden ? tr('show') : tr('hide')}</button>
              <button type="button" className="lf-mini danger" onClick={()=>deleteMerchant(m.id,m.brandName)}>{tr('delete')}</button>
            </div>
          </div>)}
        </div>
      </div>
    </section>
  </main>
}
function Metric({label,value,sub}){return <div className="lf-metric"><span>{label}</span><strong>{value}</strong>{sub && <small>{sub}</small>}</div>}
function AdminStyles(){return <style jsx global>{`
  .lf-shell{max-width:1180px;margin:0 auto;padding:18px 16px 48px;color:#0f172a}.lf-topbar{position:sticky;top:0;z-index:20;display:flex;justify-content:space-between;align-items:center;padding:14px 0;background:linear-gradient(180deg,#f6f8fb 75%,rgba(246,248,251,.72));backdrop-filter:blur(12px)}.lf-topbar h1{margin:0;font-size:30px;letter-spacing:-.8px}.lf-kicker{margin:0 0 4px;color:#2563eb;font-size:12px;font-weight:900;letter-spacing:.12em}.lf-actions{display:flex;gap:10px}.lf-menu-btn,.lf-ghost,.lf-primary,.lf-mini{border:0;border-radius:14px;font-weight:800;cursor:pointer}.lf-menu-btn{background:#0b5cff;color:#fff;padding:11px 14px}.lf-ghost{background:#fff;color:#0f172a;padding:11px 14px;border:1px solid #dbe3ef}.lf-primary{background:#0b5cff;color:#fff;padding:13px 16px}.lf-notice{background:#ecfdf5;border:1px solid #bbf7d0;padding:12px 14px;border-radius:16px}.lf-metrics{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin:10px 0 18px}.lf-metric,.lf-card{background:#fff;border:1px solid #e5edf7;border-radius:24px;box-shadow:0 12px 35px rgba(15,23,42,.06)}.lf-metric{padding:18px}.lf-metric span{display:block;color:#64748b;font-size:13px}.lf-metric strong{display:block;margin-top:8px;font-size:28px;letter-spacing:-.8px}.lf-metric small{display:block;color:#94a3b8;margin-top:5px}.lf-card{padding:20px;margin-bottom:18px}.lf-section-head{display:flex;justify-content:space-between;gap:14px;align-items:center;margin-bottom:14px}.lf-section-head h2{margin:0}.lf-form-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.lf-input,.lf-search{width:100%;box-sizing:border-box;padding:12px;border:1px solid #dbe3ef;border-radius:14px;background:#fff}.lf-input.compact{padding:9px}.lf-input.tiny{padding:8px;max-width:86px;font-size:12px}.lf-search{max-width:340px}.lf-table-wrap{overflow:auto}.lf-table{min-width:900px;display:grid;gap:0}.lf-admin-table{grid-template-columns:1.1fr .6fr .5fr .35fr .75fr 2fr}.lf-th{padding:11px 12px;background:#f8fafc;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:12px;font-weight:900;text-transform:uppercase}.lf-tr{display:contents}.lf-tr>div{padding:12px;border-bottom:1px solid #eef2f7;display:flex;flex-direction:column;justify-content:center;gap:4px}.lf-main-cell b{font-size:15px}.lf-main-cell small,.lf-tr small{color:#64748b}.lf-red{color:#ef4444!important}.lf-badge{display:inline-flex;width:max-content;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:999px;padding:4px 9px;font-weight:800;font-size:12px}.lf-row-actions{display:flex!important;flex-direction:row!important;flex-wrap:wrap;gap:6px}.lf-mini{background:#0b5cff;color:white;padding:8px 10px;font-size:12px}.lf-mini.muted{background:#e2e8f0;color:#334155}.lf-mini.danger{background:#ef4444}.lf-drawer{position:fixed;right:-320px;top:0;width:290px;max-width:82vw;height:100vh;background:#fff;z-index:40;box-shadow:-18px 0 50px rgba(15,23,42,.18);padding:18px;transition:.2s}.lf-drawer.open{right:0}.lf-drawer-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.lf-drawer-head button{border:0;background:#f1f5f9;border-radius:12px;font-size:24px;padding:4px 10px}.lf-drawer>button{display:block;width:100%;padding:13px;margin:8px 0;text-align:left;border:1px solid #e2e8f0;background:#fff;border-radius:14px;font-weight:800}.lf-drawer>button.active{background:#0b5cff;color:#fff}.lf-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.28);z-index:30}@media(max-width:820px){.lf-shell{padding:12px 12px 40px}.lf-topbar h1{font-size:24px}.lf-ghost{display:none}.lf-metrics{grid-template-columns:repeat(2,1fr)}.lf-metric:first-child{grid-column:1/-1}.lf-form-grid{grid-template-columns:1fr}.lf-section-head{align-items:stretch;flex-direction:column}.lf-search{max-width:none}.lf-hide-mobile{display:none}.lf-card{border-radius:20px;padding:15px}.lf-table{min-width:760px}.lf-admin-table{grid-template-columns:1.1fr .6fr .5fr .35fr .7fr 2fr}}@media(min-width:821px){.lf-menu-btn{display:none}.lf-hide-mobile{display:block!important}}
`}</style>}
