'use client'
import { useEffect, useMemo, useState } from 'react'
import { api, logout as doLogout } from '../../lib/api'
import LanguageToggle from '../../components/LanguageToggle'

export default function AdminPage() {
  const [checking, setChecking] = useState(true)
  const [stats, setStats] = useState(null)
  const [members, setMembers] = useState([])
  const [levels, setLevels] = useState([])
  const [storeItems, setStoreItems] = useState([])
  const [materials, setMaterials] = useState([])
  const [kyc, setKyc] = useState([])
  const [proofs, setProofs] = useState([])
  const [ledger, setLedger] = useState([])
  const [active, setActive] = useState('dashboard')
  const [msg, setMsg] = useState('')
  const [query, setQuery] = useState('')
  const [creditChange, setCreditChange] = useState(10)
  const [creditBucket, setCreditBucket] = useState('BONUS')
  const [resetPassword, setResetPassword] = useState('member12345')
  const [createForm, setCreateForm] = useState({ email:'', password:'member12345', name:'', brandName:'', whatsapp:'', plan:'STARTER', activateFunnel:false })
  const [itemForm, setItemForm] = useState({ code:'', name:'', type:'SERVICE', price:50, billingType:'ONE_TIME', description:'', isActive:true, bonusAllowed:true })
  const [materialForm, setMaterialForm] = useState({ title:'', type:'IMAGE', platform:'Instagram', language:'ZH', fileUrl:'', caption:'', isActive:true })

  async function guard() {
    try { const me = await api('/api/auth/me'); if (me.role !== 'ADMIN') { window.location.href='/member'; return false } return true } catch { window.location.href='/login'; return false }
  }
  async function load() {
    if (!(await guard())) return
    const [s,m,l,store,mat,k,p,led] = await Promise.all([
      api('/api/admin/stats'), api('/api/admin/merchants'), api('/api/admin/level-settings'), api('/api/admin/store-items'), api('/api/admin/marketing-materials'), api('/api/admin/kyc'), api('/api/admin/social-proofs'), api('/api/admin/credit-ledger')
    ])
    setStats(s); setMembers(m); setLevels(l); setStoreItems(store); setMaterials(mat); setKyc(k); setProofs(p); setLedger(led); setChecking(false)
  }
  useEffect(() => { load() }, [])
  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return members
    return members.filter(m => [m.brandName, m.user?.email, m.user?.name, m.whatsapp, m.referralCode, m.memberTier].filter(Boolean).some(v => String(v).toLowerCase().includes(q)))
  }, [members, query])
  async function logout() { await doLogout(); window.location.href='/login' }
  async function createMember(e) { e.preventDefault(); setMsg(''); try { const r = await api('/api/admin/merchants', { method:'POST', body: JSON.stringify(createForm) }); setMsg(r.message); setCreateForm({ email:'', password:'member12345', name:'', brandName:'', whatsapp:'', plan:'STARTER', activateFunnel:false }); load() } catch(e) { setMsg(e.message) } }
  async function changeCredit(id, change) { setMsg(''); try { const r = await api(`/api/admin/merchants/${id}/credit`, { method:'PATCH', body: JSON.stringify({ change, bucket: creditBucket, note:'Super Admin adjustment' }) }); setMsg(r.message); load() } catch(e) { setMsg(e.message) } }
  async function updateTier(id, memberTier) { setMsg(''); try { const r = await api(`/api/admin/merchants/${id}/tier`, { method:'PATCH', body: JSON.stringify({ memberTier }) }); setMsg(r.message); load() } catch(e) { setMsg(e.message) } }
  async function toggleFunnel(m, active) { setMsg(''); try { const r = await api(`/api/admin/merchants/${m.id}/funnel`, { method:'PATCH', body: JSON.stringify({ plan:m.plan || 'STARTER', active }) }); setMsg(r.message); load() } catch(e) { setMsg(e.message) } }
  async function updatePassword(id) { setMsg(''); try { const r = await api(`/api/admin/merchants/${id}/password`, { method:'PATCH', body: JSON.stringify({ password: resetPassword }) }); setMsg(r.message); } catch(e) { setMsg(e.message) } }
  async function saveLevel(level) { setMsg(''); try { const r = await api(`/api/admin/level-settings/${level.tier}`, { method:'PUT', body: JSON.stringify(level) }); setMsg(r.message); load() } catch(e) { setMsg(e.message) } }
  async function saveStoreItem(e) { e.preventDefault(); setMsg(''); try { const r = await api('/api/admin/store-items', { method:'POST', body: JSON.stringify(itemForm) }); setMsg(r.message); setItemForm({ code:'', name:'', type:'SERVICE', price:50, billingType:'ONE_TIME', description:'', isActive:true, bonusAllowed:true }); load() } catch(e) { setMsg(e.message) } }
  async function saveMaterial(e) { e.preventDefault(); setMsg(''); try { const r = await api('/api/admin/marketing-materials', { method:'POST', body: JSON.stringify(materialForm) }); setMsg(r.message); setMaterialForm({ title:'', type:'IMAGE', platform:'Instagram', language:'ZH', fileUrl:'', caption:'', isActive:true }); load() } catch(e) { setMsg(e.message) } }
  async function reviewKyc(id, status) { const note = prompt('Admin note，可空') || ''; setMsg(''); try { const r = await api(`/api/admin/kyc/${id}`, { method:'PATCH', body: JSON.stringify({ status, adminNote: note }) }); setMsg(r.message); load() } catch(e) { setMsg(e.message) } }
  async function reviewProof(id, status) { const rewardCredit = status === 'APPROVED' ? Number(prompt('Reward Bonus Credit', '3') || 0) : 0; const note = prompt('Admin note，可空') || ''; setMsg(''); try { const r = await api(`/api/admin/social-proofs/${id}`, { method:'PATCH', body: JSON.stringify({ status, rewardCredit, adminNote: note }) }); setMsg(r.message); load() } catch(e) { setMsg(e.message) } }
  async function uploadMaterial(file) { if(!file) return; setMsg('Uploading...'); const fd = new FormData(); fd.append('file', file); const up = await api('/api/upload/media', { method:'POST', body:fd }); setMaterialForm(v => ({ ...v, fileUrl: up.url })); setMsg('素材上传成功。') }

  if (checking) return <main className="lf-shell"><AdminStyles /><h2>Checking admin...</h2></main>
  const tabs = [['dashboard','总览'], ['members','Members'], ['levels','等级规则'], ['store','产品/服务'], ['materials','素材库'], ['kyc','KYC审核'], ['proofs','Proof审核'], ['ledger','Ledger']]

  return <main className="lf-shell">
    <AdminStyles />
    <div className="lf-topbar"><div><p className="lf-kicker">LINKFLO SUPER ADMIN</p><h1>Member / Funnel Control</h1></div><div className="lf-actions"><LanguageToggle compact /><button className="lf-ghost" onClick={logout}>Logout</button></div></div>
    {msg && <div className={msg.includes('不足') || msg.toLowerCase().includes('error') ? 'lf-alert bad' : 'lf-alert'}>{msg}</div>}
    <div className="lf-tabs">{tabs.map(([k,l]) => <button key={k} className={active===k?'active':''} onClick={()=>setActive(k)}>{l}</button>)}</div>

    {active === 'dashboard' && <>
      <div className="lf-metrics">
        <Metric label="Members" value={stats?.merchants || 0} />
        <Metric label="Active Funnel" value={stats?.activeFunnel || 0} />
        <Metric label="Products" value={stats?.products || 0} />
        <Metric label="WA Clicks" value={stats?.whatsappClicks || 0} />
        <Metric label="Pending KYC" value={stats?.pendingKyc || 0} />
        <Metric label="Pending Proof" value={stats?.pendingProofs || 0} />
      </div>
      <section className="lf-card"><h2>系统方向</h2><p>Member 免费注册，KYC 前 Bonus 只可抵 5%；Verified 30%，Gold 40%，Diamond 50%。AI Funnel 是 Product Store 里面的一个产品，开通后才进入 `/merchant` 操作 Funnel。</p></section>
    </>}

    {active === 'members' && <section className="lf-card">
      <div className="lf-section-head"><div><p className="lf-kicker">MEMBER CONTROL</p><h2>Member 管理</h2></div><input className="lf-input" placeholder="Search member..." value={query} onChange={e=>setQuery(e.target.value)} /></div>
      <form className="lf-form-grid" onSubmit={createMember}>
        <input placeholder="Email" value={createForm.email} onChange={e=>setCreateForm({...createForm,email:e.target.value})} />
        <input placeholder="Password" value={createForm.password} onChange={e=>setCreateForm({...createForm,password:e.target.value})} />
        <input placeholder="Name" value={createForm.name} onChange={e=>setCreateForm({...createForm,name:e.target.value})} />
        <input placeholder="Brand name" value={createForm.brandName} onChange={e=>setCreateForm({...createForm,brandName:e.target.value})} />
        <input placeholder="WhatsApp" value={createForm.whatsapp} onChange={e=>setCreateForm({...createForm,whatsapp:e.target.value})} />
        <select value={createForm.plan} onChange={e=>setCreateForm({...createForm,plan:e.target.value})}><option>STARTER</option><option>GROWTH</option><option>SCALE</option></select>
        <label className="lf-check"><input type="checkbox" checked={createForm.activateFunnel} onChange={e=>setCreateForm({...createForm,activateFunnel:e.target.checked})} /> 直接开通 AI Funnel</label>
        <button className="lf-primary">Create Member</button>
      </form>
      <div className="lf-toolbar"><input type="number" step="0.1" value={creditChange} onChange={e=>setCreditChange(Number(e.target.value || 0))} /><select value={creditBucket} onChange={e=>setCreditBucket(e.target.value)}><option value="BONUS">BONUS</option><option value="PAID">PAID</option></select><input value={resetPassword} onChange={e=>setResetPassword(e.target.value)} /></div>
      <div className="lf-table">
        <div className="lf-th">Member</div><div className="lf-th">Tier/KYC</div><div className="lf-th">Credit</div><div className="lf-th">Funnel</div><div className="lf-th">Actions</div>
        {filteredMembers.map(m => <div className="lf-tr" key={m.id}>
          <div><b>{m.brandName}</b><small>{m.user?.email}</small><small>Ref: {m.referralCode || '-'}</small></div>
          <div><select value={m.memberTier || 'UNVERIFIED'} onChange={e=>updateTier(m.id, e.target.value)}><option>UNVERIFIED</option><option>VERIFIED</option><option>GOLD</option><option>DIAMOND</option></select><small>KYC: {m.kycStatus}</small></div>
          <div><b>Paid {Number(m.creditBalance || 0).toFixed(2)}</b><small>Bonus {Number(m.bonusCreditBalance || 0).toFixed(2)}</small></div>
          <div><b>{m.planStatus}</b><small>{m.plan}</small></div>
          <div className="lf-row-actions"><button className="lf-mini" onClick={()=>changeCredit(m.id, Math.abs(creditChange))}>+ Credit</button><button className="lf-mini" onClick={()=>changeCredit(m.id, -Math.abs(creditChange))}>- Credit</button><button className="lf-mini" onClick={()=>toggleFunnel(m, m.planStatus !== 'ACTIVE')}>{m.planStatus === 'ACTIVE' ? '关 Funnel' : '开 Funnel'}</button><button className="lf-mini" onClick={()=>updatePassword(m.id)}>Reset PW</button></div>
        </div>)}
      </div>
    </section>}

    {active === 'levels' && <section className="lf-card"><div className="lf-section-head"><div><p className="lf-kicker">AMBASSADOR RULES</p><h2>等级规则</h2></div></div><div className="lf-products">{levels.map((l,i) => <LevelEditor key={l.tier} level={l} onChange={next => setLevels(v => v.map((x,idx)=>idx===i?next:x))} onSave={()=>saveLevel(l)} />)}</div></section>}

    {active === 'store' && <section className="lf-card"><div className="lf-section-head"><div><p className="lf-kicker">PRODUCT STORE</p><h2>产品 / 服务设置</h2></div></div><form className="lf-form-grid" onSubmit={saveStoreItem}><input placeholder="Code" value={itemForm.code} onChange={e=>setItemForm({...itemForm,code:e.target.value.toUpperCase()})}/><input placeholder="Name" value={itemForm.name} onChange={e=>setItemForm({...itemForm,name:e.target.value})}/><select value={itemForm.type} onChange={e=>setItemForm({...itemForm,type:e.target.value})}><option>FUNNEL_PLAN</option><option>SERVICE</option><option>ACADEMY</option><option>ADDON</option></select><input type="number" step="0.1" value={itemForm.price} onChange={e=>setItemForm({...itemForm,price:Number(e.target.value)})}/><select value={itemForm.billingType} onChange={e=>setItemForm({...itemForm,billingType:e.target.value})}><option>ONE_TIME</option><option>MONTHLY</option></select><input placeholder="Description" value={itemForm.description} onChange={e=>setItemForm({...itemForm,description:e.target.value})}/><label className="lf-check"><input type="checkbox" checked={itemForm.bonusAllowed} onChange={e=>setItemForm({...itemForm,bonusAllowed:e.target.checked})}/> 允许 Bonus 抵扣</label><button className="lf-primary">Save Item</button></form><div className="lf-products">{storeItems.map(item => <div className="lf-product" key={item.id}><span className="lf-badge">{item.type}</span><h3>{item.name}</h3><p>{item.description}</p><b>{Number(item.price).toFixed(2)} credits</b><small>{item.billingType} · {item.isActive ? 'Active' : 'Hidden'}</small></div>)}</div></section>}

    {active === 'materials' && <section className="lf-card"><div className="lf-section-head"><div><p className="lf-kicker">MARKETING MATERIAL</p><h2>素材库</h2></div></div><form className="lf-form-grid" onSubmit={saveMaterial}><input placeholder="Title" value={materialForm.title} onChange={e=>setMaterialForm({...materialForm,title:e.target.value})}/><select value={materialForm.type} onChange={e=>setMaterialForm({...materialForm,type:e.target.value})}><option>IMAGE</option><option>VIDEO</option><option>CAPTION</option><option>WHATSAPP</option></select><input placeholder="Platform" value={materialForm.platform} onChange={e=>setMaterialForm({...materialForm,platform:e.target.value})}/><input placeholder="Language" value={materialForm.language} onChange={e=>setMaterialForm({...materialForm,language:e.target.value})}/><label className="lf-upload">Upload file<input type="file" accept="image/*,video/*" onChange={e=>uploadMaterial(e.target.files?.[0])}/></label><input placeholder="File URL" value={materialForm.fileUrl} onChange={e=>setMaterialForm({...materialForm,fileUrl:e.target.value})}/><textarea placeholder="Caption" value={materialForm.caption} onChange={e=>setMaterialForm({...materialForm,caption:e.target.value})}/><button className="lf-primary">Save Material</button></form><div className="lf-products">{materials.map(m => <div className="lf-product" key={m.id}><span className="lf-badge">{m.platform} · {m.type}</span><h3>{m.title}</h3><p>{m.caption}</p>{m.fileUrl && <a href={m.fileUrl} target="_blank">Open</a>}</div>)}</div></section>}

    {active === 'kyc' && <Review title="KYC Pending / History" rows={kyc} onApprove={id=>reviewKyc(id,'APPROVED')} onReject={id=>reviewKyc(id,'REJECTED')} kind="kyc" />}
    {active === 'proofs' && <Review title="Social Proof Pending / History" rows={proofs} onApprove={id=>reviewProof(id,'APPROVED')} onReject={id=>reviewProof(id,'REJECTED')} kind="proof" />}
    {active === 'ledger' && <section className="lf-card"><h2>Credit Ledger</h2><div className="lf-list">{ledger.map(l => <div className="lf-list-row" key={l.id}><b>{l.merchant?.brandName} · {l.bucket} {l.direction} {Number(l.amount).toFixed(2)}</b><span>{l.category}</span><small>{new Date(l.createdAt).toLocaleString()} ｜ After {Number(l.balanceAfter).toFixed(2)} ｜ {l.note || '-'}</small></div>)}</div></section>}
  </main>
}
function Metric({label,value}){return <div className="lf-metric"><span>{label}</span><strong>{value}</strong></div>}
function LevelEditor({level,onChange,onSave}) { return <div className="lf-product"><span className="lf-badge">{level.tier}</span><input value={level.label} onChange={e=>onChange({...level,label:e.target.value})}/><label>Bonus Cap<input type="number" min="0" max="1" step="0.01" value={level.bonusCap} onChange={e=>onChange({...level,bonusCap:Number(e.target.value)})}/></label><label>Monthly Posts<input type="number" min="0" value={level.monthlyPostRequired} onChange={e=>onChange({...level,monthlyPostRequired:Number(e.target.value)})}/></label><label className="lf-check"><input type="checkbox" checked={level.kycRequired} onChange={e=>onChange({...level,kycRequired:e.target.checked})}/> KYC Required</label><button className="lf-primary" onClick={onSave}>Save {level.tier}</button></div> }
function Review({title,rows,onApprove,onReject,kind}) { return <section className="lf-card"><h2>{title}</h2><div className="lf-list">{rows.map(r => <div className="lf-list-row" key={r.id}><b>{r.merchant?.brandName} · {r.status}</b><span>{kind==='kyc' ? r.fullName : `${r.platform} ${r.postType}`}</span><small>{kind==='kyc' ? `${r.icNumber || '-'} ｜ ${r.socialProfile || '-'}` : `${r.postUrl || '-'} ｜ ${r.caption || '-'}`}</small><div className="lf-row-actions">{(r.icFrontUrl || r.proofImageUrl) && <a href={r.icFrontUrl || r.proofImageUrl} target="_blank">Open proof</a>}<button className="lf-mini" onClick={()=>onApprove(r.id)}>Approve</button><button className="lf-mini danger" onClick={()=>onReject(r.id)}>Reject</button></div></div>)}</div></section> }
function AdminStyles(){return <style jsx global>{`
body{background:#f6f8fb}.lf-shell{max-width:1280px;margin:0 auto;padding:18px 16px 48px;color:#0f172a}.lf-topbar{position:sticky;top:0;z-index:20;display:flex;justify-content:space-between;align-items:center;padding:14px 0;background:linear-gradient(180deg,#f6f8fb 75%,rgba(246,248,251,.72));backdrop-filter:blur(12px)}.lf-topbar h1{margin:0;font-size:30px;letter-spacing:-.8px}.lf-kicker{margin:0 0 4px;color:#2563eb;font-size:12px;font-weight:900;letter-spacing:.12em}.lf-actions,.lf-row-actions,.lf-toolbar{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.lf-ghost,.lf-primary,.lf-mini{border:0;border-radius:14px;font-weight:800;cursor:pointer;text-decoration:none}.lf-ghost{background:#fff;color:#0f172a;padding:11px 14px;border:1px solid #dbe3ef}.lf-primary{background:#0b5cff;color:#fff;padding:12px 15px}.lf-mini{background:#0b5cff;color:white;padding:8px 10px;font-size:12px}.lf-mini.danger{background:#ef4444}.lf-alert{background:#ecfdf5;border:1px solid #bbf7d0;padding:12px 14px;border-radius:16px;margin-bottom:12px}.lf-alert.bad{background:#fef2f2;border-color:#fecaca;color:#991b1b}.lf-tabs{display:flex;gap:8px;overflow:auto;margin:8px 0 16px}.lf-tabs button{white-space:nowrap;border:1px solid #dbe3ef;background:#fff;border-radius:999px;padding:10px 13px;font-weight:800;cursor:pointer}.lf-tabs button.active{background:#0b5cff;color:#fff;border-color:#0b5cff}.lf-metrics{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin:10px 0 18px}.lf-metric,.lf-card,.lf-product{background:#fff;border:1px solid #e5edf7;border-radius:24px;box-shadow:0 12px 35px rgba(15,23,42,.06)}.lf-metric{padding:18px}.lf-metric span{display:block;color:#64748b;font-size:13px}.lf-metric strong{display:block;margin-top:8px;font-size:28px;letter-spacing:-.8px}.lf-card{padding:20px;margin-bottom:18px}.lf-section-head{display:flex;justify-content:space-between;gap:14px;align-items:center;margin-bottom:14px}.lf-section-head h2{margin:0}.lf-form-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px}.lf-form-grid input,.lf-form-grid select,.lf-form-grid textarea,.lf-toolbar input,.lf-toolbar select,.lf-input,.lf-product input,.lf-product select{width:100%;box-sizing:border-box;padding:12px;border:1px solid #dbe3ef;border-radius:14px;background:#fff}.lf-check{display:flex;gap:8px;align-items:center;background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:11px;font-weight:800}.lf-upload{display:grid;gap:7px;background:#f8fafc;border:1px dashed #cbd5e1;border-radius:14px;padding:11px;font-weight:800}.lf-table{min-width:1020px;display:grid;grid-template-columns:1.2fr .8fr .75fr .6fr 1.5fr;gap:0;overflow:auto}.lf-th{padding:11px 12px;background:#f8fafc;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:12px;font-weight:900;text-transform:uppercase}.lf-tr{display:contents}.lf-tr>div{padding:12px;border-bottom:1px solid #eef2f7;display:flex;flex-direction:column;gap:4px;justify-content:center}.lf-tr small{color:#64748b}.lf-products{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.lf-product{padding:16px;display:grid;gap:10px}.lf-product h3{margin:5px 0}.lf-product p{color:#64748b;margin:0;line-height:1.45}.lf-product a{font-weight:800;color:#2563eb}.lf-badge{display:inline-flex;width:max-content;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:999px;padding:4px 9px;font-weight:800;font-size:12px}.lf-list{display:grid;gap:8px}.lf-list-row{display:grid;grid-template-columns:1fr auto;gap:4px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:12px}.lf-list-row small,.lf-list-row .lf-row-actions{grid-column:1/-1;color:#64748b}@media(max-width:900px){.lf-shell{padding:12px}.lf-topbar{align-items:flex-start}.lf-metrics,.lf-products,.lf-form-grid{grid-template-columns:1fr}.lf-table{display:block;min-width:0}.lf-th{display:none}.lf-tr{display:grid;background:#fff;border:1px solid #e2e8f0;border-radius:18px;margin-bottom:10px}.lf-tr>div{border-bottom:0}.lf-section-head{display:grid}.lf-input{max-width:none}}
`}</style>}
