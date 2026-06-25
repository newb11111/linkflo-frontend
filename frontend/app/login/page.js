'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api, setToken, setUser } from '../../lib/api'
import LanguageToggle from '../../components/LanguageToggle'
import { useLanguage } from '../../lib/i18n'

export default function LoginPage() {
  const { tr } = useLanguage()
  const [mode, setMode] = useState('login')
  const [selectedPlan, setSelectedPlan] = useState('STARTER')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [brandName, setBrandName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const plan = params.get('plan')
    const ref = params.get('ref') || params.get('r')
    const m = params.get('mode')
    if (ref) setReferralCode(ref)
    if (['STARTER', 'GROWTH', 'SCALE'].includes(plan)) setSelectedPlan(plan)
    if (m === 'register') {
      setMode('register')
      setEmail('')
      setPassword('')
    } else if (m === 'merchant') {
      setEmail('')
      setPassword('')
    }
  }, [])

  async function submit(e) {
    e.preventDefault(); setLoading(true); setError('')
    try {
      if (mode === 'register') {
        const data = await api('/api/auth/register-merchant', { method: 'POST', body: JSON.stringify({ email, password, name, brandName, whatsapp, referralCode, plan: selectedPlan }) })
        setToken(data.token); setUser(data.user)
        window.location.href = '/member'
        return
      }
      const data = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
      setToken(data.token); setUser(data.user)
      if (data.user.role === 'ADMIN') window.location.href = '/admin'
      else window.location.href = '/member'
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  return <main style={wrap}>
    <form onSubmit={submit} style={card}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><Link href="/" style={back}>{tr('backHome')}</Link><LanguageToggle compact /></div>
      <div style={tabs}>
        <button type="button" onClick={()=>setMode('login')} style={mode==='login'?tabActive:tab}>{tr('login')}</button>
        <button type="button" onClick={()=>setMode('register')} style={mode==='register'?tabActive:tab}>Join Member</button>
      </div>
      <h1 style={{marginBottom:0}}>{mode === 'register' ? 'Join Linkflo Member' : tr('loginTitle')}</h1>
      <p style={{color:'#64748b',marginTop:4}}>{mode === 'register' ? '免费加入 Linkflo Member。AI Funnel 可以进入会员后台后再用 credit 开通。' : tr('loginNote')}</p>
      {mode === 'register' && <>
        <label>{tr('ownerName')}</label><input value={name} onChange={e=>setName(e.target.value)} style={input} placeholder="Marcus" />
        <label>{tr('brandName')}</label><input value={brandName} onChange={e=>setBrandName(e.target.value)} style={input} placeholder={tr('brandName')} />
        <label>{tr('whatsapp')}</label><input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} style={input} placeholder="6012..." />
        <label>Referral Code / 推荐码</label><input value={referralCode} onChange={e=>setReferralCode(e.target.value.toUpperCase())} style={input} placeholder="可空，如果朋友给你 link 会自动填" />
      </>}
      <label>{tr('email')}</label><input value={email} onChange={e=>setEmail(e.target.value)} style={input} placeholder="merchant@email.com" />
      <label>{tr('password')}</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={input} placeholder={tr('passwordHint')} />
      {mode === 'register' && <div style={info}>注册后会进入 Member Dashboard。默认不收 Member 月费，AI Funnel / 服务 / 课程在里面用 credit 开通。</div>}
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}
      <button disabled={loading} style={btn}>{loading ? tr('processing') : mode === 'register' ? '免费注册 Member' : tr('login')}</button>
      <p style={{fontSize:13,color:'#64748b'}}>Member 免费进入；Credit 可用于开通 AI Funnel、服务、课程和素材任务。</p>
    </form>
  </main>
}
const wrap={minHeight:'100vh',display:'grid',placeItems:'center',padding:24,background:'#f6f9ff'}
const card={background:'white',width:'100%',maxWidth:480,padding:28,borderRadius:24,boxShadow:'0 16px 40px rgba(15,23,42,.08)',display:'grid',gap:12,color:'#0f172a'}
const input={padding:13,border:'1px solid #dbe3ef',borderRadius:12,fontSize:16,background:'white'}
const btn={padding:14,border:0,borderRadius:12,background:'#0b5cff',color:'white',fontWeight:800,cursor:'pointer'}
const tabs={display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,background:'#f1f5f9',padding:6,borderRadius:16}
const tab={border:0,borderRadius:12,padding:11,fontWeight:800,background:'transparent',cursor:'pointer'}
const tabActive={...tab,background:'#0b5cff',color:'white'}
const back={textDecoration:'none',color:'#2563eb',fontWeight:800}
const info={background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:14,padding:12,color:'#1e3a8a',lineHeight:1.5}
