'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { api, SITE_URL, logout as doLogout } from '../../lib/api'
import LanguageToggle from '../../components/LanguageToggle'

const tierText = {
  UNVERIFIED: 'Unverified Member',
  VERIFIED: 'Verified Member',
  GOLD: 'Gold Ambassador',
  DIAMOND: 'Diamond Ambassador'
}

const tierIcon = {
  UNVERIFIED: '🪪',
  VERIFIED: '✅',
  GOLD: '👑',
  DIAMOND: '💎'
}

function money(value) {
  return Number(value || 0).toFixed(2)
}

function pct(value) {
  return Math.round(Number(value || 0) * 100)
}

export default function MemberDashboard() {
  const [checking, setChecking] = useState(true)
  const [data, setData] = useState(null)
  const [msg, setMsg] = useState('')
  const [active, setActive] = useState('home')
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

  useEffect(() => {
    if (typeof window === 'undefined') return
    const tab = new URLSearchParams(window.location.search).get('tab')
    if (['home','earn','store','wallet','funnel','menu'].includes(tab)) setActive(tab)
  }, [])

  const member = data?.member || {}
  const activeFunnel = Boolean(member.hasActiveFunnel)
  const bonusCapPercent = pct(member.bonusCap)
  const approvedPosts = Number(member.approvedPostsThisMonth || 0)
  const requiredPosts = Number(member.monthlyPostRequired || 0)
  const missionPercent = requiredPosts > 0 ? Math.min(100, Math.round((approvedPosts / requiredPosts) * 100)) : 100

  const referralUrl = useMemo(() => {
    if (!member.referralCode) return ''
    return `${SITE_URL}/login?mode=register&ref=${encodeURIComponent(member.referralCode)}`
  }, [member.referralCode])

  const nextStep = useMemo(() => {
    if ((member.kycStatus || 'UNVERIFIED') !== 'VERIFIED') {
      return {
        title: '完成 KYC，解锁更高抵扣',
        text: '认证通过后，Bonus Credit 抵扣上限可以从 5% 提升到 30%。',
        button: '立即认证',
        target: 'menu'
      }
    }
    if (requiredPosts > 0 && approvedPosts < requiredPosts) {
      return {
        title: `再完成 ${requiredPosts - approvedPosts} 个分享任务`,
        text: `完成本月 ${requiredPosts} 个 approved posts / stories，维持或提升 Ambassador 等级。`,
        button: '上传 Story 证明',
        target: 'earn'
      }
    }
    if (!activeFunnel) {
      return {
        title: '开通 AI Funnel',
        text: '用 credit 开通 Funnel 后，就能创建产品页、Promoter link 和追踪点击。',
        button: '去开通产品',
        target: 'store'
      }
    }
    return {
      title: '继续赚 Bonus Credit',
      text: '复制 referral link 或使用素材发 story，继续累积可抵扣的 Bonus Credit。',
      button: '去 Earn',
      target: 'earn'
    }
  }, [member.kycStatus, requiredPosts, approvedPosts, activeFunnel])

  async function copyReferral() {
    try {
      await navigator.clipboard.writeText(referralUrl)
      setMsg('Referral link 已复制。')
    } catch {
      setMsg(referralUrl || '系统还没有 referral code。')
    }
  }

  async function copyText(text, success = '已复制。') {
    try { await navigator.clipboard.writeText(text || ''); setMsg(success) } catch { setMsg(text || '') }
  }

  async function upload(file, setter, key) {
    if (!file) return
    setMsg('Uploading...')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const up = await api('/api/upload/media', { method:'POST', body: fd })
      setter(v => ({ ...v, [key]: up.url }))
      setMsg('上传成功。')
    } catch (e) { setMsg(e.message) }
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
    const cap = pct(member.bonusCap)
    const maxBonus = Number(item.price || 0) * Number(member.bonusCap || 0)
    if (!confirm(`确认购买 ${item.name}?\n价格：${money(item.price)} credits\nBonus Credit 最高可抵：${money(maxBonus)} credits (${cap}%)\n剩余需要 Paid Credit。`)) return
    setMsg('')
    try {
      const result = await api('/api/member/store/purchase', { method:'POST', body: JSON.stringify({ itemId: item.id }) })
      setMsg(result.message || '购买成功。')
      await load()
    } catch (e) { setMsg(e.message) }
  }

  async function submitKyc(e) {
    e.preventDefault()
    setMsg('')
    try {
      const result = await api('/api/member/kyc', { method:'POST', body: JSON.stringify(kyc) })
      setMsg(result.message || 'KYC submitted.')
      await load()
    } catch (e) { setMsg(e.message) }
  }

  async function submitProof(e) {
    e.preventDefault()
    setMsg('')
    try {
      const result = await api('/api/member/social-proof', { method:'POST', body: JSON.stringify(proof) })
      setMsg(result.message || 'Proof submitted.')
      setProof({ platform:'Instagram', postType:'STORY', proofImageUrl:'', postUrl:'', caption:'' })
      await load()
    } catch (e) { setMsg(e.message) }
  }

  async function logout() {
    await doLogout()
    window.location.href = '/login'
  }

  if (checking) {
    return <main className="lf-phone-shell"><MemberStyles /><div className="lf-loading-card"><h2>Checking login...</h2><p>正在进入 Linkflo Member。</p></div></main>
  }

  return <main className="lf-phone-shell">
    <MemberStyles />

    <header className="lf-mobile-header">
      <button className="lf-icon-btn" onClick={() => setActive('menu')} aria-label="Menu">☰</button>
      <div>
        <strong>Linkflo Member</strong>
        <small>{tierText[member.memberTier] || member.tierLabel || 'Member'}</small>
      </div>
      <div className="lf-header-actions">
        <LanguageToggle compact />
        <button className="lf-bell" aria-label="Notifications">🔔</button>
      </div>
    </header>

    {msg && <div className={msg.toLowerCase().includes('不足') || msg.toLowerCase().includes('error') || msg.toLowerCase().includes('failed') ? 'lf-toast bad' : 'lf-toast'}>{msg}</div>}

    {active === 'home' && <>
      <section className="lf-welcome-card">
        <div>
          <p>Hi, {member.brandName || 'Member'} 👋</p>
          <h1>感谢你的支持！</h1>
          <span className="lf-pill soft">{member.kycStatus === 'VERIFIED' ? 'Verified Member' : 'Unverified Member'}</span>
        </div>
      </section>

      <section className="lf-credit-grid">
        <CreditCard title="Paid Credit" value={`RM ${money(member.paidCredit)}`} icon="💳" tone="blue" />
        <CreditCard title="Bonus Credit" value={`RM ${money(member.bonusCredit)}`} icon="🎁" tone="pink" />
      </section>

      <section className="lf-soft-card lf-bonus-card">
        <div className="lf-row between">
          <div>
            <p className="lf-label">Bonus 抵扣上限</p>
            <h2>{bonusCapPercent}%</h2>
          </div>
          <button className="lf-text-btn" onClick={() => setActive('menu')}>查看详情 ›</button>
        </div>
        <Progress value={bonusCapPercent} max={50} />
        <p className="lf-muted">等级越高，每单可用 Bonus Credit 抵扣越多。</p>
      </section>

      <section className="lf-soft-card lf-next-card">
        <p className="lf-label">下一步建议</p>
        <h2>{nextStep.title}</h2>
        <p>{nextStep.text}</p>
        <button className="lf-main-btn" onClick={() => setActive(nextStep.target)}>{nextStep.button}</button>
      </section>

      <section className="lf-soft-card mission-preview">
        <div className="lf-row between">
          <div>
            <p className="lf-label">本月任务进度</p>
            <h2>{approvedPosts} / {requiredPosts || 0}</h2>
          </div>
          <span className="lf-target">🎯</span>
        </div>
        <Progress value={missionPercent} />
        <p className="lf-muted">{requiredPosts > 0 ? `再完成 ${Math.max(0, requiredPosts - approvedPosts)} 个任务可维持当前等级。` : '当前等级没有强制发帖任务。'}</p>
        <button className="lf-light-btn" onClick={() => setActive('earn')}>上传 Story 证明</button>
      </section>

      <QuickActions setActive={setActive} />

      <section className="lf-soft-card">
        <div className="lf-section-title"><h2>我的产品</h2></div>
        <ProductStatus activeFunnel={activeFunnel} member={member} setActive={setActive} />
      </section>

      <section className="lf-soft-card">
        <div className="lf-section-title"><h2>为你推荐</h2><button onClick={() => setActive('store')}>全部 ›</button></div>
        {(data?.storeItems || []).slice(0, 2).map(item => <StoreMini key={item.id} item={item} cap={member.bonusCap} onBuy={() => purchase(item)} />)}
        {!(data?.storeItems || []).length && <p className="lf-muted">Admin 还没有上架产品。</p>}
      </section>
    </>}

    {active === 'earn' && <>
      <section className="lf-page-title"><h1>Earn Credit</h1><p>分享素材、邀请朋友、提交 proof，赚 Bonus Credit。</p></section>

      <section className="lf-soft-card">
        <p className="lf-label">My Referral Link</p>
        <div className="lf-ref-box">{referralUrl || '系统还没有 referral code，请联系 Admin。'}</div>
        <div className="lf-two-btns">
          <button className="lf-main-btn" onClick={copyReferral}>Copy Link</button>
          <button className="lf-light-btn" onClick={() => referralUrl && window.open(`https://wa.me/?text=${encodeURIComponent(referralUrl)}`,'_blank')}>Share WhatsApp</button>
        </div>
      </section>

      <section className="lf-soft-card">
        <div className="lf-row between">
          <div><p className="lf-label">Monthly Mission</p><h2>{approvedPosts} / {requiredPosts || 0} Posts</h2></div>
          <span className="lf-target">🎯</span>
        </div>
        <Progress value={missionPercent} />
      </section>

      <section className="lf-soft-card">
        <div className="lf-section-title"><h2>Marketing Materials</h2></div>
        <div className="lf-material-list">
          {(data?.materials || []).map(m => <div className="lf-material" key={m.id}>
            <span>{m.type === 'VIDEO' ? '🎬' : m.type === 'CAPTION' ? '✍️' : '🖼️'}</span>
            <div>
              <b>{m.title}</b>
              <small>{m.platform} · {m.language || 'ALL'}</small>
              {m.caption && <p>{m.caption}</p>}
            </div>
            <div className="lf-material-actions">
              {m.fileUrl && <a href={m.fileUrl} target="_blank">Open</a>}
              {m.caption && <button onClick={() => copyText(m.caption, 'Caption 已复制。')}>Copy</button>}
            </div>
          </div>)}
          {!(data?.materials || []).length && <p className="lf-muted">Admin 还没有上传素材。</p>}
        </div>
      </section>

      <section className="lf-soft-card">
        <div className="lf-section-title"><h2>Submit Proof</h2></div>
        <form className="lf-form" onSubmit={submitProof}>
          <select value={proof.platform} onChange={e=>setProof({...proof, platform:e.target.value})}><option>Instagram</option><option>Facebook</option><option>TikTok</option><option>WhatsApp Status</option><option>小红书</option></select>
          <select value={proof.postType} onChange={e=>setProof({...proof, postType:e.target.value})}><option value="STORY">Story</option><option value="POST">Post</option><option value="VIDEO">Video</option><option value="STATUS">Status</option></select>
          <input placeholder="Post URL，可空" value={proof.postUrl} onChange={e=>setProof({...proof, postUrl:e.target.value})} />
          <textarea placeholder="Caption，可空" value={proof.caption} onChange={e=>setProof({...proof, caption:e.target.value})} />
          <label className="lf-upload">上传 screenshot proof<input type="file" accept="image/*" onChange={e=>upload(e.target.files?.[0], setProof, 'proofImageUrl')} /></label>
          {proof.proofImageUrl && <small className="lf-uploaded">已上传：{proof.proofImageUrl}</small>}
          <button className="lf-main-btn">Submit Proof</button>
        </form>
      </section>

      <section className="lf-soft-card">
        <div className="lf-section-title"><h2>Proof 记录</h2></div>
        <div className="lf-list">
          {(data?.proofs || []).map(p => <div key={p.id} className="lf-list-row"><b>{p.platform} · {p.postType}</b><span>{p.status}</span><small>{p.adminNote || p.caption || '-'}</small></div>)}
          {!(data?.proofs || []).length && <p className="lf-muted">还没有提交记录。</p>}
        </div>
      </section>
    </>}

    {active === 'store' && <>
      <section className="lf-page-title"><h1>Product Store</h1><p>用 Paid Credit + Bonus Credit 开通产品或购买服务。</p></section>
      {(data?.storeItems || []).map(item => <StoreCard key={item.id} item={item} cap={member.bonusCap} onBuy={() => purchase(item)} />)}
      {!(data?.storeItems || []).length && <section className="lf-soft-card"><p className="lf-muted">Admin 还没有上架产品。</p></section>}
    </>}

    {active === 'wallet' && <>
      <section className="lf-page-title"><h1>Wallet</h1><p>查看 Paid Credit、Bonus Credit 和交易记录。</p></section>
      <section className="lf-total-card">
        <p>Total Credit</p>
        <h1>RM {money(Number(member.paidCredit || 0) + Number(member.bonusCredit || 0))}</h1>
        <div className="lf-credit-grid compact">
          <CreditCard title="Paid" value={`RM ${money(member.paidCredit)}`} icon="💳" tone="blue" />
          <CreditCard title="Bonus" value={`RM ${money(member.bonusCredit)}`} icon="🎁" tone="pink" />
        </div>
      </section>
      <section className="lf-soft-card">
        <div className="lf-section-title"><h2>Topup Paid Credit</h2></div>
        <form className="lf-form" onSubmit={topup}>
          <input type="number" min="100" value={topupAmount} onChange={e=>setTopupAmount(e.target.value)} />
          <button className="lf-main-btn">Topup</button>
        </form>
      </section>
      <section className="lf-soft-card">
        <div className="lf-section-title"><h2>Recent Transactions</h2></div>
        <div className="lf-list">
          {(data?.ledgers || []).map(l => <div className="lf-list-row" key={l.id}><b>{l.bucket} {l.direction} {money(l.amount)}</b><span>{l.category}</span><small>{new Date(l.createdAt).toLocaleString()}｜After: {money(l.balanceAfter)}</small></div>)}
          {!(data?.ledgers || []).length && <p className="lf-muted">还没有交易记录。</p>}
        </div>
      </section>
    </>}

    {active === 'funnel' && <>
      <section className="lf-page-title"><h1>AI Funnel</h1><p>开通后可以创建产品成交页、Promoter link 和追踪 WhatsApp 点击。</p></section>
      <section className="lf-soft-card">
        <ProductStatus activeFunnel={activeFunnel} member={member} setActive={setActive} large />
      </section>
    </>}

    {active === 'menu' && <>
      <section className="lf-page-title"><h1>Menu</h1><p>KYC、订单、Funnel、交易和账户设置。</p></section>

      <section className="lf-soft-card">
        <div className="lf-section-title"><h2>KYC Verification</h2><span className="lf-pill">{member.kycStatus || 'UNVERIFIED'}</span></div>
        <p className="lf-muted">不 KYC 可以使用系统，但 Bonus Credit 每单只可抵 5%。通过后可变成 Verified Member，解锁 30%。</p>
        <form className="lf-form" onSubmit={submitKyc}>
          <input placeholder="Full name / 真实姓名" value={kyc.fullName} onChange={e=>setKyc({...kyc, fullName:e.target.value})} />
          <input placeholder="IC / Passport no." value={kyc.icNumber} onChange={e=>setKyc({...kyc, icNumber:e.target.value})} />
          <input placeholder="Phone / WhatsApp" value={kyc.phone} onChange={e=>setKyc({...kyc, phone:e.target.value})} />
          <input placeholder="Social media profile link" value={kyc.socialProfile} onChange={e=>setKyc({...kyc, socialProfile:e.target.value})} />
          <label className="lf-upload">IC Front<input type="file" accept="image/*" onChange={e=>upload(e.target.files?.[0], setKyc, 'icFrontUrl')} /></label>
          <label className="lf-upload">IC Back<input type="file" accept="image/*" onChange={e=>upload(e.target.files?.[0], setKyc, 'icBackUrl')} /></label>
          <label className="lf-upload">Selfie<input type="file" accept="image/*" onChange={e=>upload(e.target.files?.[0], setKyc, 'selfieUrl')} /></label>
          <button className="lf-main-btn">Submit KYC</button>
        </form>
        {data?.kyc && <p className="lf-muted">最新 KYC 状态：<b>{data.kyc.status}</b> {data.kyc.adminNote ? `｜${data.kyc.adminNote}` : ''}</p>}
      </section>

      <section className="lf-soft-card">
        <div className="lf-menu-list">
          <Link href="/member/funnel">进入 Funnel Dashboard</Link>
          <button onClick={() => setActive('earn')}>Marketing Library / Submit Proof</button>
          <button onClick={() => setActive('wallet')}>Transaction History</button>
          <button onClick={logout}>Logout</button>
        </div>
      </section>
    </>}

    <nav className="lf-bottom-nav">
      <NavButton active={active === 'home'} icon="🏠" label="Home" onClick={() => setActive('home')} />
      <NavButton active={active === 'earn'} icon="🎯" label="Earn" onClick={() => setActive('earn')} />
      <NavButton active={active === 'store'} icon="🛒" label="Store" onClick={() => setActive('store')} />
      <NavButton active={active === 'wallet'} icon="💳" label="Wallet" onClick={() => setActive('wallet')} />
      <NavButton active={active === 'funnel'} icon="🚀" label="Funnel" onClick={() => setActive('funnel')} />
      <NavButton active={active === 'menu'} icon="☰" label="Menu" onClick={() => setActive('menu')} />
    </nav>
  </main>
}

function CreditCard({ title, value, icon, tone }) {
  return <div className={`lf-credit-card ${tone || ''}`}>
    <div><p>{title}</p><h3>{value}</h3></div>
    <span>{icon}</span>
  </div>
}

function Progress({ value, max = 100 }) {
  const width = Math.max(0, Math.min(100, Math.round((Number(value || 0) / Number(max || 100)) * 100)))
  return <div className="lf-progress"><i style={{ width: `${width}%` }} /></div>
}

function QuickActions({ setActive }) {
  return <section className="lf-quick-row">
    <button onClick={() => setActive('earn')}><span>📤</span>上传证明</button>
    <button onClick={() => setActive('earn')}><span>👥</span>邀请好友</button>
    <button onClick={() => setActive('earn')}><span>🖼️</span>素材库</button>
    <button onClick={() => setActive('store')}><span>🛒</span>买服务</button>
  </section>
}

function ProductStatus({ activeFunnel, member, setActive, large }) {
  if (!activeFunnel) {
    return <div className={large ? 'lf-product-status large' : 'lf-product-status'}>
      <div className="lf-product-icon">🚀</div>
      <div>
        <h3>AI Funnel 尚未开通</h3>
        <p>开通后可以创建 Funnel、Promoter link 和查看点击数据。</p>
      </div>
      <button className="lf-main-btn" onClick={() => setActive('store')}>开通 AI Funnel</button>
    </div>
  }
  return <div className={large ? 'lf-product-status large' : 'lf-product-status'}>
    <div className="lf-product-icon">🚀</div>
    <div>
      <h3>AI Funnel - {member.plan || 'Active'}</h3>
      <p>下次扣费：{member.nextBillingAt ? new Date(member.nextBillingAt).toLocaleDateString() : '-'}</p>
    </div>
    <Link className="lf-main-btn as-link" href="/member/funnel">进入 Funnel</Link>
  </div>
}

function StoreMini({ item, cap, onBuy }) {
  const maxBonus = Number(item.price || 0) * Number(cap || 0)
  return <div className="lf-store-mini">
    <div>
      <b>{item.name}</b>
      <small>{money(item.price)} Credits</small>
      <p>Bonus 可抵扣 {money(maxBonus)} Credits ({pct(cap)}%)</p>
    </div>
    <button onClick={onBuy}>立即购买</button>
  </div>
}

function StoreCard({ item, cap, onBuy }) {
  const maxBonus = Number(item.price || 0) * Number(cap || 0)
  const needPaid = Math.max(0, Number(item.price || 0) - maxBonus)
  return <section className="lf-soft-card lf-store-card">
    <div className="lf-store-top">
      <span className="lf-store-icon">{item.type === 'FUNNEL_PLAN' ? '🚀' : item.type === 'ACADEMY' ? '🎓' : '🧩'}</span>
      <div>
        <span className="lf-pill">{item.type}</span>
        <h2>{item.name}</h2>
        <p>{item.description || 'Linkflo product / service'}</p>
      </div>
    </div>
    <div className="lf-price-box">
      <div><small>Price</small><b>{money(item.price)} Credits</b></div>
      <div><small>Bonus max</small><b>{money(maxBonus)} Credits</b></div>
      <div><small>Need Paid</small><b>{money(needPaid)} Credits</b></div>
    </div>
    <button className="lf-main-btn" onClick={onBuy}>{item.billingType === 'MONTHLY' ? 'Activate Monthly' : 'Buy Now'}</button>
  </section>
}

function NavButton({ active, icon, label, onClick }) {
  return <button className={active ? 'active' : ''} onClick={onClick}><span>{icon}</span><small>{label}</small></button>
}

function MemberStyles(){return <style jsx global>{`
:root{--lf-bg:#f7f8fd;--lf-text:#182033;--lf-muted:#7b8497;--lf-blue:#4f8dff;--lf-purple:#8b5cf6;--lf-card:#ffffff;--lf-border:#eef1f7;--lf-shadow:0 18px 48px rgba(55,65,81,.10)}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 20% 0%,#eef6ff 0,#f7f8fd 34%,#fbfbff 100%);color:var(--lf-text)}button,input,select,textarea{font:inherit}.lf-phone-shell{width:100%;max-width:480px;min-height:100vh;margin:0 auto;padding:14px 14px 104px;background:linear-gradient(180deg,#fbfcff 0%,#f6f8ff 100%);position:relative}.lf-mobile-header{position:sticky;top:0;z-index:50;display:grid;grid-template-columns:42px 1fr auto;align-items:center;gap:10px;padding:10px 0 12px;background:linear-gradient(180deg,rgba(251,252,255,.96),rgba(251,252,255,.78));backdrop-filter:blur(16px)}.lf-mobile-header strong{display:block;text-align:center;font-size:16px}.lf-mobile-header small{display:block;text-align:center;color:var(--lf-muted);font-size:11px;margin-top:2px}.lf-icon-btn,.lf-bell{width:38px;height:38px;border:0;border-radius:15px;background:#fff;box-shadow:0 8px 22px rgba(40,50,90,.08);cursor:pointer}.lf-header-actions{display:flex;align-items:center;gap:6px}.lf-toast{position:sticky;top:64px;z-index:60;margin:4px 0 12px;padding:12px 14px;border-radius:18px;background:#ecfdf5;border:1px solid #bbf7d0;color:#065f46;font-weight:800;box-shadow:0 12px 30px rgba(16,185,129,.12)}.lf-toast.bad{background:#fff1f2;border-color:#fecdd3;color:#9f1239}.lf-loading-card,.lf-welcome-card,.lf-soft-card,.lf-total-card{background:rgba(255,255,255,.9);border:1px solid var(--lf-border);border-radius:26px;box-shadow:var(--lf-shadow);backdrop-filter:blur(14px)}.lf-loading-card{padding:28px;margin-top:30vh;text-align:center}.lf-loading-card p{color:var(--lf-muted)}.lf-welcome-card{padding:22px;margin:10px 0 14px;background:linear-gradient(135deg,#fff 0%,#fbf7ff 54%,#f1f7ff 100%)}.lf-welcome-card p{margin:0 0 4px;color:#4b5563;font-weight:800}.lf-welcome-card h1{margin:0 0 12px;font-size:24px;letter-spacing:-.7px}.lf-pill{display:inline-flex;align-items:center;gap:6px;border:1px solid #e8dcff;background:#f3edff;color:#6d28d9;border-radius:999px;padding:6px 10px;font-weight:900;font-size:12px;width:max-content}.lf-pill.soft{background:#f0edff}.lf-credit-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 14px}.lf-credit-grid.compact{margin:14px 0 0}.lf-credit-card{min-height:112px;border-radius:22px;padding:16px;display:flex;flex-direction:column;justify-content:space-between;border:1px solid var(--lf-border);box-shadow:0 12px 34px rgba(40,50,90,.08)}.lf-credit-card.blue{background:linear-gradient(135deg,#eff7ff,#f7fbff)}.lf-credit-card.pink{background:linear-gradient(135deg,#fff1f3,#fff8ef)}.lf-credit-card p{margin:0;color:#4b5563;font-weight:800;font-size:12px}.lf-credit-card h3{margin:7px 0 0;font-size:19px;letter-spacing:-.4px}.lf-credit-card span{font-size:24px}.lf-soft-card{padding:17px;margin:0 0 14px}.lf-bonus-card{background:linear-gradient(135deg,#fff,#f5f0ff)}.lf-next-card{background:linear-gradient(135deg,#fffaf1,#fff)}.mission-preview{background:linear-gradient(135deg,#eef9ff,#fff)}.lf-row{display:flex;align-items:center;gap:10px}.lf-row.between{justify-content:space-between}.lf-label{margin:0 0 5px;color:#64748b;font-size:12px;font-weight:900;letter-spacing:.03em}.lf-soft-card h2,.lf-page-title h1{margin:0;font-size:23px;letter-spacing:-.6px}.lf-soft-card p{line-height:1.45}.lf-muted{color:var(--lf-muted);font-size:13px}.lf-text-btn{border:0;background:transparent;color:#4f46e5;font-weight:900;cursor:pointer}.lf-main-btn,.lf-light-btn{border:0;border-radius:17px;font-weight:950;cursor:pointer;text-align:center;text-decoration:none}.lf-main-btn{background:linear-gradient(135deg,#6d8dff,#8b5cf6);color:#fff;padding:13px 16px;box-shadow:0 14px 30px rgba(99,102,241,.22)}.lf-main-btn.as-link{display:inline-flex;justify-content:center;align-items:center}.lf-light-btn{background:#f2f5ff;color:#4f46e5;padding:12px 14px}.lf-progress{height:9px;border-radius:999px;background:#e8ecf7;overflow:hidden;margin:13px 0}.lf-progress i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#74b6ff,#8b5cf6)}.lf-target{font-size:36px;filter:drop-shadow(0 6px 12px rgba(249,115,22,.2))}.lf-quick-row{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:0 0 14px}.lf-quick-row button{border:0;background:transparent;color:#1f2937;font-weight:800;font-size:11px;cursor:pointer}.lf-quick-row span{display:flex;align-items:center;justify-content:center;width:48px;height:48px;margin:0 auto 6px;border-radius:18px;background:linear-gradient(135deg,#e5f2ff,#f5edff);box-shadow:0 12px 26px rgba(40,50,90,.08);font-size:21px}.lf-section-title{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.lf-section-title h2{font-size:18px;margin:0}.lf-section-title button{border:0;background:transparent;color:#6d5dfc;font-weight:900;cursor:pointer}.lf-product-status{display:grid;grid-template-columns:50px 1fr;gap:12px;align-items:center}.lf-product-status.large{grid-template-columns:1fr;text-align:center}.lf-product-icon{width:50px;height:50px;border-radius:18px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#dbeafe,#ede9fe);font-size:24px}.lf-product-status h3{margin:0 0 4px}.lf-product-status p{margin:0;color:var(--lf-muted);font-size:13px}.lf-product-status .lf-main-btn{grid-column:1/-1}.lf-store-mini{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;border-radius:18px;background:#f9fbff;border:1px solid var(--lf-border);padding:13px;margin-top:10px}.lf-store-mini b{display:block}.lf-store-mini small{display:block;color:#596579;margin-top:4px}.lf-store-mini p{margin:5px 0 0;color:#7b8497;font-size:12px}.lf-store-mini button{border:0;border-radius:14px;background:#efe8ff;color:#6d28d9;padding:10px 12px;font-weight:900;cursor:pointer}.lf-page-title{padding:10px 2px 16px}.lf-page-title p{margin:6px 0 0;color:var(--lf-muted)}.lf-ref-box{padding:13px;border-radius:17px;border:1px dashed #cfd7e6;background:#f9fbff;color:#384675;font-weight:900;word-break:break-all;font-size:13px}.lf-two-btns{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.lf-material-list{display:grid;gap:10px}.lf-material{display:grid;grid-template-columns:42px 1fr auto;gap:10px;align-items:start;border:1px solid var(--lf-border);background:#fbfcff;border-radius:18px;padding:12px}.lf-material>span{width:42px;height:42px;border-radius:15px;background:#eef3ff;display:flex;align-items:center;justify-content:center;font-size:20px}.lf-material b{display:block}.lf-material small{display:block;color:var(--lf-muted);margin-top:2px}.lf-material p{margin:7px 0 0;color:#64748b;font-size:12px}.lf-material-actions{display:grid;gap:6px}.lf-material-actions a,.lf-material-actions button{border:0;border-radius:12px;background:#f2f5ff;color:#4f46e5;text-decoration:none;font-weight:900;padding:8px 9px;font-size:12px;cursor:pointer}.lf-form{display:grid;gap:10px}.lf-form input,.lf-form select,.lf-form textarea{width:100%;padding:13px 14px;border:1px solid #e1e6f2;border-radius:17px;background:#fbfcff;color:var(--lf-text);outline:none}.lf-form textarea{min-height:92px;resize:vertical}.lf-upload{display:grid;gap:8px;padding:14px;border:1px dashed #cfd7e6;border-radius:17px;background:#f9fbff;font-weight:900;color:#4b5563}.lf-upload input{padding:0;border:0;background:transparent}.lf-uploaded{color:#4f46e5;word-break:break-all}.lf-list{display:grid;gap:9px}.lf-list-row{display:grid;grid-template-columns:1fr auto;gap:5px;border:1px solid var(--lf-border);border-radius:17px;background:#fbfcff;padding:12px}.lf-list-row span{color:#6d28d9;background:#f3edff;border-radius:999px;padding:3px 8px;font-size:12px;font-weight:900}.lf-list-row small{grid-column:1/-1;color:var(--lf-muted)}.lf-store-card{overflow:hidden}.lf-store-top{display:grid;grid-template-columns:54px 1fr;gap:12px}.lf-store-icon{width:54px;height:54px;border-radius:19px;background:linear-gradient(135deg,#dbeafe,#f3e8ff);display:flex;align-items:center;justify-content:center;font-size:25px}.lf-store-top h2{margin:8px 0 5px}.lf-store-top p{margin:0;color:var(--lf-muted);font-size:13px}.lf-price-box{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0}.lf-price-box div{border-radius:16px;background:#f8faff;border:1px solid var(--lf-border);padding:10px}.lf-price-box small{display:block;color:var(--lf-muted);font-size:11px}.lf-price-box b{display:block;margin-top:4px;font-size:13px}.lf-total-card{padding:20px;margin-bottom:14px;background:linear-gradient(135deg,#fff,#f0f7ff)}.lf-total-card p{margin:0;color:var(--lf-muted);font-weight:900}.lf-total-card h1{font-size:38px;margin:6px 0 0;letter-spacing:-1.2px}.lf-menu-list{display:grid;gap:10px}.lf-menu-list a,.lf-menu-list button{display:block;width:100%;border:0;text-align:left;text-decoration:none;border-radius:18px;background:#f8faff;border:1px solid var(--lf-border);padding:15px 14px;color:#1f2937;font-weight:900;cursor:pointer}.lf-bottom-nav{position:fixed;left:50%;bottom:12px;z-index:80;transform:translateX(-50%);width:calc(100% - 24px);max-width:456px;display:grid;grid-template-columns:repeat(6,1fr);gap:4px;padding:9px;border-radius:25px;background:rgba(255,255,255,.9);border:1px solid rgba(232,236,247,.9);box-shadow:0 20px 55px rgba(40,50,90,.18);backdrop-filter:blur(20px)}.lf-bottom-nav button{border:0;background:transparent;border-radius:18px;padding:8px 2px;color:#7b8497;cursor:pointer;font-weight:800}.lf-bottom-nav button span{display:block;font-size:20px;line-height:1}.lf-bottom-nav button small{display:block;font-size:10px;margin-top:3px}.lf-bottom-nav button.active{background:linear-gradient(135deg,#ede9fe,#e0f2fe);color:#5b21b6}@media(min-width:820px){.lf-phone-shell{margin-top:18px;margin-bottom:18px;border-radius:34px;min-height:calc(100vh - 36px);box-shadow:0 30px 90px rgba(15,23,42,.16);border:1px solid #eef1f7}.lf-bottom-nav{bottom:28px}}@media(max-width:380px){.lf-phone-shell{padding-left:10px;padding-right:10px}.lf-bottom-nav{grid-template-columns:repeat(6,1fr);width:calc(100% - 16px)}.lf-bottom-nav button small{font-size:9px}.lf-quick-row{gap:4px}.lf-credit-card h3{font-size:16px}.lf-price-box{grid-template-columns:1fr}.lf-material{grid-template-columns:36px 1fr}.lf-material-actions{grid-column:1/-1;grid-template-columns:1fr 1fr}.lf-material>span{width:36px;height:36px}.lf-two-btns{grid-template-columns:1fr}}
`}</style>}
