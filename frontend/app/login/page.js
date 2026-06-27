'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api, setToken, setUser } from '../../lib/api'
import LanguageToggle from '../../components/LanguageToggle'
import { useLanguage } from '../../lib/i18n'

const copy = {
  zh: {
    back:'返回首页', loginTab:'登录', joinTab:'加入 Member', loginTitle:'欢迎回来', joinTitle:'免费加入 Linkflo',
    loginDesc:'登录后进入 Linkflo App，管理已开通产品、奖励积分与账户。', joinDesc:'免费创建账号，从 AI Funnel 开始，未来可管理更多 AI 产品。',
    email:'邮箱', emailPh:'请输入 Email', password:'密码', passwordPh:'请输入密码', remember:'记住我', forgot:'忘记密码？',
    owner:'姓名', ownerPh:'Marcus', brand:'品牌 / 公司名', brandPh:'你的品牌名称', whatsapp:'WhatsApp', referral:'Referral Code / 推荐码', referralPh:'可空，如果朋友给你 link 会自动填',
    submitLogin:'登录', submitJoin:'创建免费账号', processing:'处理中...', noAcc:'还没有账号？', create:'创建免费账号', haveAcc:'已有账号？', goLogin:'马上登录',
    memberNote:'Member 免费加入，Bonus Credit 可用于开通 AI 产品。', giftTitle:'免费加入，先从 AI Funnel 开始。', giftDesc:'注册后进入 AI Product Hub、My AI 与 Credits。',
    errPrefix:'错误：'
  },
  en: {
    back:'Back home', loginTab:'Login', joinTab:'Join Member', loginTitle:'Welcome back', joinTitle:'Join Linkflo for free',
    loginDesc:'Log in to manage your active products, credits, rewards, and account.', joinDesc:'Create a free account, start with AI Funnel, and manage more AI products as they launch.',
    email:'Email', emailPh:'Enter your email', password:'Password', passwordPh:'Enter your password', remember:'Remember me', forgot:'Forgot password?',
    owner:'Name', ownerPh:'Marcus', brand:'Brand / Company', brandPh:'Your brand name', whatsapp:'WhatsApp', referral:'Referral Code', referralPh:'Optional. It will auto-fill from a referral link.',
    submitLogin:'Login', submitJoin:'Create free account', processing:'Processing...', noAcc:'No account yet?', create:'Create free account', haveAcc:'Already have an account?', goLogin:'Login now',
    memberNote:'Member is free. Bonus Credit can be used to activate AI products.', giftTitle:'Join free and start with AI Funnel.', giftDesc:'After registering, enter AI Product Hub, My AI, and Credits.',
    errPrefix:'Error: '
  },
  bm: {
    back:'Kembali', loginTab:'Log Masuk', joinTab:'Sertai Member', loginTitle:'Selamat kembali', joinTitle:'Sertai Linkflo secara percuma',
    loginDesc:'Log masuk untuk mengurus produk aktif, credit, ganjaran dan akaun anda.', joinDesc:'Cipta akaun percuma, bermula dengan AI Funnel dan urus lebih banyak produk AI apabila dilancarkan.',
    email:'Email', emailPh:'Masukkan email', password:'Kata laluan', passwordPh:'Masukkan kata laluan', remember:'Ingat saya', forgot:'Lupa kata laluan?',
    owner:'Nama', ownerPh:'Marcus', brand:'Jenama / Syarikat', brandPh:'Nama jenama anda', whatsapp:'WhatsApp', referral:'Kod Referral', referralPh:'Pilihan. Akan diisi automatik jika datang dari pautan referral.',
    submitLogin:'Log Masuk', submitJoin:'Cipta akaun percuma', processing:'Sedang proses...', noAcc:'Belum ada akaun?', create:'Cipta akaun percuma', haveAcc:'Sudah ada akaun?', goLogin:'Log masuk',
    memberNote:'Member adalah percuma. Bonus Credit boleh digunakan untuk aktifkan produk AI.', giftTitle:'Sertai percuma dan mula dengan AI Funnel.', giftDesc:'Selepas daftar, masuk ke AI Product Hub, My AI dan Credits.',
    errPrefix:'Ralat: '
  }
}

export default function LoginPage() {
  const { lang } = useLanguage()
  const t = copy[lang] || copy.zh
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
    if (m === 'register') setMode('register')
    setEmail(''); setPassword('')
  }, [])

  async function submit(e) {
    e.preventDefault(); setLoading(true); setError('')
    try {
      if (mode === 'register') {
        const data = await api('/api/auth/register-merchant', { method: 'POST', body: JSON.stringify({ email, password, name, brandName, whatsapp, referralCode, plan: selectedPlan }) })
        setToken(data.token); setUser(data.user); window.location.href = '/member'; return
      }
      const data = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
      setToken(data.token); setUser(data.user)
      window.location.href = data.user.role === 'ADMIN' ? '/admin' : '/member'
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  return <main className="lf-login-page">
    <section className="lf-login-phone">
      <div className="lf-login-top"><Link href="/" className="lf-login-back">‹ {t.back}</Link><LanguageToggle compact /></div>
      <div className="lf-login-logo"><img src="/linkflo-logo.png" alt="Linkflo" /></div>
      <form className="lf-login-card" onSubmit={submit}>
        <div className="lf-login-tabs">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>{t.loginTab}</button>
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>{t.joinTab}</button>
        </div>
        <h1>{mode === 'register' ? t.joinTitle : t.loginTitle}</h1>
        <p>{mode === 'register' ? t.joinDesc : t.loginDesc}</p>
        {mode === 'register' && <>
          <Field label={t.owner} value={name} onChange={setName} placeholder={t.ownerPh} icon="👤" />
          <Field label={t.brand} value={brandName} onChange={setBrandName} placeholder={t.brandPh} icon="🏷️" />
          <Field label={t.whatsapp} value={whatsapp} onChange={setWhatsapp} placeholder="6012..." icon="💬" />
          <Field label={t.referral} value={referralCode} onChange={(v)=>setReferralCode(v.toUpperCase())} placeholder={t.referralPh} icon="🎁" />
        </>}
        <Field label={t.email} value={email} onChange={setEmail} placeholder={t.emailPh} icon="✉️" />
        <Field label={t.password} value={password} onChange={setPassword} placeholder={t.passwordPh} icon="🔒" type="password" />
        {mode === 'login' && <div className="lf-login-options"><label><input type="checkbox" /> {t.remember}</label><button type="button">{t.forgot}</button></div>}
        {error && <div className="lf-login-error">{t.errPrefix}{error}</div>}
        <button disabled={loading} className="lf-login-submit">{loading ? t.processing : mode === 'register' ? t.submitJoin : t.submitLogin}</button>
        <div className="lf-login-switch">
          {mode === 'login' ? <>{t.noAcc} <button type="button" onClick={()=>setMode('register')}>{t.create} ›</button></> : <>{t.haveAcc} <button type="button" onClick={()=>setMode('login')}>{t.goLogin} ›</button></>}
        </div>
      </form>
      <div className="lf-login-note"><span>🎁</span><div><b>{t.giftTitle}</b><small>{t.giftDesc}</small></div></div>
      <p className="lf-login-foot">{t.memberNote}</p>
    </section>
  </main>
}

function Field({label, value, onChange, placeholder, type='text', icon}) {
  return <label className="lf-login-field"><span>{label}</span><div><i>{icon}</i><input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} /></div></label>
}
