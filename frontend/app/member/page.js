'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { api, SITE_URL, logout as doLogout } from '../../lib/api'
import LanguageToggle from '../../components/LanguageToggle'

const tierColor = {
  UNVERIFIED: '#64748b',
  VERIFIED: '#2563eb',
  GOLD: '#b45309',
  DIAMOND: '#7c3aed'
}

export default function MemberDashboard() {
  const [checking, setChecking] = useState(true)
  const [data, setData] = useState(null)
  const [msg, setMsg] = useState('')
  const [active, setActive] = useState('dashboard')
  const [topupAmount, setTopupAmount] = useState(100)
  const [kyc, setKyc] = useState({ fullName:'', icNumber:'', phone:'', socialProfile:'', icFrontUrl:'', icBackUrl:'', selfieUrl:'' })
  const [proof, setProof] = useState({ platform:'Instagram', postType:'STORY', proofImageUrl:'', postUrl:'', caption:'' })

  async function load() {
    try {
      const me = await api('/api/auth/me')
      if (me.role === 'ADMIN') { window.location.href = '/admin'; return }
      const summary = await api('/api/member/summary')
      setData(summary)
    } catch (e) {
      window.location.href = '/login'
    } finally {
      setChecking(false)
    }
  }
  useEffect(() => { load() }, [])

  const member = data?.member || {}
  const referralUrl = useMemo(() => {
    if (!member.referralCode) return ''
    return `${SITE_URL}/login?mode=register&ref=${encodeURIComponent(member.referralCode)}`
  }, [member.referralCode])

  async function copyReferral() {
    try { await navigator.clipboard.writeText(referralUrl); setMsg('Referral link 已复制。') } catch { setMsg(referralUrl) }
  }
  async function upload(file, setter, key) {
    if (!file) return
    setMsg('Uploading...')
    const fd = new FormData(); fd.append('file', file)
    const up = await api('/api/upload/media', { method:'POST', body: fd })
    setter(v => ({ ...v, [key]: up.url }))
    setMsg('上传成功。')
  }
  async function topup(e) {
    e.preventDefault()
    setMsg('')
    try {
      const result = await api('/api/billing/merchant/topup', { method:'POST', body: JSON.stringify({ amount: Number(topupAmount) }) })
      setMsg(result.message || 'Topup bill created.')
      if (result.billUrl) window.location.href = result.billUrl
      else load()
    } catch (e) { setMsg(e.message) }
  }
  async function purchase(item) {
    const cap = Math.round(Number(member.bonusCap || 0) * 100)
    if (!confirm(`确认购买 ${item.name}?\n价格：${item.price} credits\n你的等级 Bonus Credit 最高可抵 ${cap}%\n剩余需要 Paid Credit。`)) return
    setMsg('')
    try {
      const result = await api('/api/member/store/purchase', { method:'POST', body: JSON.stringify({ itemId: item.id }) })
      setMsg(result.message || '购买成功。')
      await load()
    } catch (e) { setMsg(e.message) }
  }
  async function submitKyc(e) {
    e.preventDefault(); setMsg('')
    try {
      const result = await api('/api/member/kyc', { method:'POST', body: JSON.stringify(kyc) })
      setMsg(result.message || 'KYC submitted.')
      await load()
    } catch (e) { setMsg(e.message) }
  }
  async function submitProof(e) {
    e.preventDefault(); setMsg('')
    try {
      const result = await api('/api/member/social-proof', { method:'POST', body: JSON.stringify(proof) })
      setMsg(result.message || 'Proof submitted.')
      setProof({ platform:'Instagram', postType:'STORY', proofImageUrl:'', postUrl:'', caption:'' })
      await load()
    } catch (e) { setMsg(e.message) }
  }
  async function logout() { await doLogout(); window.location.href = '/login' }

  if (checking) return <main className="lf-member"><MemberStyles /><h2>Checking login...</h2></main>

  const tabs = [
    ['dashboard','Dashboard'], ['store','Product Store'], ['materials','Marketing 素材'], ['mission','任务 / Proof'], ['kyc','KYC'], ['wallet','Wallet Ledger']
  ]
  const activeFunnel = member.hasActiveFunnel

  return <main className="lf-member">
    <MemberStyles />
    <div className="lf-topbar">
      <div><p className="lf-kicker">LINKFLO MEMBER</p><h1>Member Dashboard</h1></div>
      <div className="lf-actions"><LanguageToggle compact /><Link className="lf-ghost" href="/merchant">进入 Funnel</Link><button className="lf-ghost" onClick={logout}>Logout</button></div>
    </div>

    {msg && <div className={msg.toLowerCase().includes('不足') || msg.toLowerCase().includes('error') ? 'lf-alert bad' : 'lf-alert'}>{msg}</div>}

    <div className="lf-tabs">{tabs.map(([k,l]) => <button key={k} onClick={()=>setActive(k)} className={active===k?'active':''}>{l}</button>)}</div>

    {active === 'dashboard' && <>
      <section className="lf-hero-card">
        <div>
          <p className="lf-kicker">WELCOME</p>
          <h2>{member.brandName}</h2>
          <p>免费 Member 入口。产品和服务用 credit 开通；AI Funnel 是其中一个产品。</p>
        </div>
        <div className="lf-level" style={{borderColor:tierColor[member.memberTier] || '#e2e8f0'}}>
          <span>{member.tierLabel || member.memberTier}</span>
          <strong>{Math.round(Number(member.bonusCap || 0) * 100)}%</strong>
          <small>Bonus Credit 每单最高抵扣</small>
        </div>
      </section>

      <section className="lf-grid-4">
        <Metric label="Paid Credit" value={Number(member.paidCredit || 0).toFixed(2)} sub="充值 / Admin 加的真实 credit" />
        <Metric label="Bonus Credit" value={Number(member.bonusCredit || 0).toFixed(2)} sub="Referral / 发 story / campaign reward" />
        <Metric label="KYC" value={member.kycStatus || 'UNVERIFIED'} sub="Verified 后可升更高等级" />
        <Metric label="AI Funnel" value={activeFunnel ? 'ACTIVE' : '未开通'} sub={activeFunnel ? `${member.plan} / ${member.planStatus}` : '去 Product Store 开通'} />
      </section>

      <section className="lf-card">
        <div className="lf-section-head"><div><p className="lf-kicker">REFERRAL</p><h2>你的推荐 Link</h2></div><button className="lf-primary" onClick={copyReferral}>Copy Link</button></div>
        <div className="lf-refbox">{referralUrl || '系统还没有 referral code，请联系 Admin。'}</div>
        <div className="lf-grid-3 small">
          <Metric label="Referral 注册" value={member.referralCount || 0} />
          <Metric label="Referral 付费" value={member.paidReferralCount || 0} />
          <Metric label="本月 Approved Posts" value={`${member.approvedPostsThisMonth || 0}/${member.monthlyPostRequired || 0}`} />
        </div>
      </section>
    </>}

    {active === 'store' && <section className="lf-card">
      <div className="lf-section-head"><div><p className="lf-kicker">PRODUCT STORE</p><h2>开通产品 / 购买服务</h2></div></div>
      <div className="lf-products">
        {(data?.storeItems || []).map(item => <div className="lf-product" key={item.id}>
          <div><span className="lf-badge">{item.type}</span><h3>{item.name}</h3><p>{item.description || 'No description'}</p></div>
          <div><strong>{Number(item.price).toFixed(2)} credits</strong><small>{item.billingType === 'MONTHLY' ? 'Monthly' : 'One-time'}</small></div>
          <button className="lf-primary" onClick={()=>purchase(item)}>用 Credit 开通 / 购买</button>
        </div>)}
      </div>
    </section>}

    {active === 'materials' && <section className="lf-card">
      <div className="lf-section-head"><div><p className="lf-kicker">MARKETING LIBRARY</p><h2>素材库</h2></div></div>
      <div className="lf-products">
        {(data?.materials || []).map(m => <div className="lf-product" key={m.id}>
          <div><span className="lf-badge">{m.platform} · {m.type}</span><h3>{m.title}</h3><p>{m.caption || '没有 caption'}</p>{m.fileUrl && <a href={m.fileUrl} target="_blank">Open material</a>}</div>
          {m.caption && <button className="lf-mini" onClick={()=>navigator.clipboard.writeText(m.caption)}>Copy caption</button>}
        </div>)}
        {!(data?.materials || []).length && <p>Admin 还没有上传素材。</p>}
      </div>
    </section>}

    {active === 'mission' && <section className="lf-card">
      <div className="lf-section-head"><div><p className="lf-kicker">SOCIAL MISSION</p><h2>提交 Story / Post 证明</h2></div></div>
      <form className="lf-form" onSubmit={submitProof}>
        <select value={proof.platform} onChange={e=>setProof({...proof, platform:e.target.value})}><option>Instagram</option><option>Facebook</option><option>TikTok</option><option>WhatsApp Status</option><option>小红书</option></select>
        <select value={proof.postType} onChange={e=>setProof({...proof, postType:e.target.value})}><option value="STORY">Story</option><option value="POST">Post</option><option value="VIDEO">Video</option><option value="STATUS">Status</option></select>
        <input placeholder="Post URL，可空" value={proof.postUrl} onChange={e=>setProof({...proof, postUrl:e.target.value})} />
        <textarea placeholder="Caption，可空" value={proof.caption} onChange={e=>setProof({...proof, caption:e.target.value})} />
        <label className="lf-upload">上传 screenshot proof<input type="file" accept="image/*" onChange={e=>upload(e.target.files?.[0], setProof, 'proofImageUrl')} /></label>
        {proof.proofImageUrl && <small>已上传：{proof.proofImageUrl}</small>}
        <button className="lf-primary">Submit Proof</button>
      </form>
      <h3>我的 Proof 记录</h3>
      <div className="lf-list">{(data?.proofs || []).map(p => <div key={p.id} className="lf-list-row"><b>{p.platform} · {p.postType}</b><span>{p.status}</span><small>{p.adminNote || p.caption || '-'}</small></div>)}</div>
    </section>}

    {active === 'kyc' && <section className="lf-card">
      <div className="lf-section-head"><div><p className="lf-kicker">VERIFICATION</p><h2>KYC / Verified Member</h2><p>不 KYC 也能免费使用，但 Bonus Credit 每单只可抵 5%。通过 KYC 后可升级 Verified 30%。</p></div></div>
      <form className="lf-form" onSubmit={submitKyc}>
        <input placeholder="Full name / 真实姓名" value={kyc.fullName} onChange={e=>setKyc({...kyc, fullName:e.target.value})} />
        <input placeholder="IC / Passport no." value={kyc.icNumber} onChange={e=>setKyc({...kyc, icNumber:e.target.value})} />
        <input placeholder="Phone / WhatsApp" value={kyc.phone} onChange={e=>setKyc({...kyc, phone:e.target.value})} />
        <input placeholder="Social media profile link" value={kyc.socialProfile} onChange={e=>setKyc({...kyc, socialProfile:e.target.value})} />
        <label className="lf-upload">IC Front<input type="file" accept="image/*" onChange={e=>upload(e.target.files?.[0], setKyc, 'icFrontUrl')} /></label>
        <label className="lf-upload">IC Back<input type="file" accept="image/*" onChange={e=>upload(e.target.files?.[0], setKyc, 'icBackUrl')} /></label>
        <label className="lf-upload">Selfie<input type="file" accept="image/*" onChange={e=>upload(e.target.files?.[0], setKyc, 'selfieUrl')} /></label>
        <button className="lf-primary">Submit KYC</button>
      </form>
      {data?.kyc && <p>最新 KYC 状态：<b>{data.kyc.status}</b> {data.kyc.adminNote ? `｜${data.kyc.adminNote}` : ''}</p>}
    </section>}

    {active === 'wallet' && <section className="lf-card">
      <div className="lf-section-head"><div><p className="lf-kicker">WALLET</p><h2>Topup / Ledger</h2></div></div>
      <form className="lf-inline" onSubmit={topup}>
        <input type="number" min="100" value={topupAmount} onChange={e=>setTopupAmount(e.target.value)} />
        <button className="lf-primary">Topup Paid Credit</button>
      </form>
      <div className="lf-list">{(data?.ledgers || []).map(l => <div className="lf-list-row" key={l.id}><b>{l.bucket} {l.direction} {Number(l.amount).toFixed(2)}</b><span>{l.category}</span><small>{new Date(l.createdAt).toLocaleString()}｜After: {Number(l.balanceAfter).toFixed(2)}</small></div>)}</div>
    </section>}
  </main>
}
function Metric({label,value,sub}){return <div className="lf-metric"><span>{label}</span><strong>{value}</strong>{sub && <small>{sub}</small>}</div>}
function MemberStyles(){return <style jsx global>{`
body{background:#f6f8fb}.lf-member{max-width:1180px;margin:0 auto;padding:18px 16px 48px;color:#0f172a}.lf-topbar{position:sticky;top:0;z-index:10;display:flex;justify-content:space-between;align-items:center;background:linear-gradient(180deg,#f6f8fb 75%,rgba(246,248,251,.75));backdrop-filter:blur(12px);padding:14px 0}.lf-topbar h1{margin:0;font-size:30px;letter-spacing:-.8px}.lf-kicker{margin:0 0 4px;color:#2563eb;font-size:12px;font-weight:900;letter-spacing:.12em}.lf-actions{display:flex;gap:10px;align-items:center}.lf-ghost,.lf-primary,.lf-mini{border:0;border-radius:14px;font-weight:800;cursor:pointer;text-decoration:none}.lf-ghost{background:#fff;color:#0f172a;padding:11px 14px;border:1px solid #dbe3ef}.lf-primary{background:#0b5cff;color:#fff;padding:12px 15px}.lf-mini{background:#e2e8f0;color:#334155;padding:9px 11px}.lf-alert{background:#ecfdf5;border:1px solid #bbf7d0;padding:12px 14px;border-radius:16px;margin-bottom:12px}.lf-alert.bad{background:#fef2f2;border-color:#fecaca;color:#991b1b}.lf-tabs{display:flex;gap:8px;overflow:auto;margin:8px 0 16px}.lf-tabs button{white-space:nowrap;border:1px solid #dbe3ef;background:#fff;border-radius:999px;padding:10px 13px;font-weight:800;cursor:pointer}.lf-tabs button.active{background:#0b5cff;color:#fff;border-color:#0b5cff}.lf-hero-card,.lf-card,.lf-metric,.lf-product{background:#fff;border:1px solid #e5edf7;border-radius:24px;box-shadow:0 12px 35px rgba(15,23,42,.06)}.lf-hero-card{display:flex;justify-content:space-between;gap:20px;padding:24px;margin-bottom:14px}.lf-hero-card h2{font-size:34px;letter-spacing:-1px;margin:0 0 6px}.lf-level{min-width:180px;border:2px solid #e2e8f0;border-radius:22px;padding:18px;text-align:center}.lf-level span,.lf-metric span{display:block;color:#64748b;font-size:13px}.lf-level strong{display:block;font-size:44px;letter-spacing:-1px}.lf-level small,.lf-metric small{color:#94a3b8}.lf-grid-4,.lf-grid-3{display:grid;gap:12px;margin-bottom:14px}.lf-grid-4{grid-template-columns:repeat(4,1fr)}.lf-grid-3{grid-template-columns:repeat(3,1fr)}.lf-grid-3.small .lf-metric strong{font-size:24px}.lf-metric{padding:18px}.lf-metric strong{display:block;margin-top:8px;font-size:30px;letter-spacing:-.8px}.lf-card{padding:20px;margin-bottom:18px}.lf-section-head{display:flex;justify-content:space-between;gap:14px;align-items:center;margin-bottom:14px}.lf-section-head h2{margin:0}.lf-refbox{background:#f8fafc;border:1px dashed #cbd5e1;border-radius:16px;padding:14px;word-break:break-all;font-weight:800;color:#1e3a8a}.lf-products{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.lf-product{padding:17px;display:grid;gap:10px}.lf-product h3{margin:8px 0 4px}.lf-product p{color:#64748b;margin:0;line-height:1.5}.lf-product a{color:#2563eb;font-weight:800}.lf-badge{display:inline-flex;width:max-content;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:999px;padding:4px 9px;font-weight:800;font-size:12px}.lf-form{display:grid;gap:10px;max-width:720px}.lf-form input,.lf-form select,.lf-form textarea,.lf-inline input{padding:12px;border:1px solid #dbe3ef;border-radius:14px;background:#fff;font:inherit}.lf-form textarea{min-height:90px}.lf-upload{display:grid;gap:8px;padding:14px;border:1px dashed #cbd5e1;border-radius:14px;background:#f8fafc;font-weight:800}.lf-inline{display:flex;gap:10px;margin-bottom:14px}.lf-list{display:grid;gap:8px;margin-top:12px}.lf-list-row{display:grid;grid-template-columns:1fr auto;gap:4px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:12px}.lf-list-row small{grid-column:1/-1;color:#64748b}@media(max-width:820px){.lf-member{padding:12px}.lf-topbar{align-items:flex-start;gap:10px}.lf-topbar h1{font-size:24px}.lf-actions{flex-wrap:wrap;justify-content:flex-end}.lf-hero-card{display:grid}.lf-level{min-width:0}.lf-grid-4,.lf-grid-3,.lf-products{grid-template-columns:1fr}.lf-section-head{align-items:stretch;flex-direction:column}.lf-inline{display:grid}}
`}</style>}
