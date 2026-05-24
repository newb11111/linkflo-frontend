'use client'
import { useEffect, useMemo, useState } from 'react'
import { API_URL } from '../lib/api'
import LanguageToggle, { getSavedLang } from './LanguageToggle'
import { localizeProduct, t } from '../lib/i18n'

function getVisitorKey() {
  if (typeof window === 'undefined') return ''
  let key = localStorage.getItem('linkflo_visitor_key')
  if (!key) {
    key = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem('linkflo_visitor_key', key)
  }
  return key
}

function normalizeMsisdn(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (digits.startsWith('0')) return `60${digits.slice(1)}`
  return digits
}

const LEGACY_EMPTY_TEXTS = new Set([
  '顾客为什么需要这个?',
  '顾客为什么需要这个？',
  '为什么需要这个?',
  '为什么需要这个？',
  '写痛点',
  '写痛点。',
  '写顾客痛点',
  '写顾客痛点。',
  '顾客痛点',
  '核心卖点',
  '写卖点',
  '写卖点。',
  '写3个容易成交的卖点',
  '写3个容易成交的卖点。',
  '写 3 个容易成交的卖点',
  '写 3 个容易成交的卖点。',
  '写3-5个容易成交的卖点',
  '写3-5个容易成交的卖点。',
  '写 3-5 个容易成交的卖点',
  '写 3-5 个容易成交的卖点。',
  '常见问题',
  '写常见问题',
  '写常见问题。',
  'faq',
  'FAQ'
])

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, '').trim()
}

function isLegacyEmptyText(value) {
  const raw = String(value || '').trim()
  if (!raw) return true
  const compact = normalizeText(raw)
  if (LEGACY_EMPTY_TEXTS.has(raw) || LEGACY_EMPTY_TEXTS.has(compact)) return true

  // Hide old builder placeholder phrases that were accidentally saved as section content.
  // Real merchant copy should not look like instructions such as “写顾客痛点”。
  if (/^写.{0,8}(顾客|客户)?(痛点|卖点|常见问题|FAQ|问题|证明|案例|保证)[。.!！?？]*$/i.test(compact)) return true
  if (/^写\d+(?:-\d+)?个容易成交的卖点[。.!！?？]*$/i.test(compact)) return true
  if (/^(顾客|客户)?为什么需要这个[。.!！?？]*$/i.test(compact)) return true

  return false
}

function isBareNumber(value) {
  return /^\d+(?:\.\d+)?$/.test(String(value || '').trim())
}

function hasText(value) {
  return !isLegacyEmptyText(value)
}

function hasMeaningfulPriceNote(value) {
  return hasText(value) && !isBareNumber(value)
}

function cleanDisplayText(value) {
  return isLegacyEmptyText(value) ? '' : String(value || '')
}

function renderRich(text = '') {
  const lines = cleanDisplayText(text).split('\n')
  return lines.map((line, idx) => {
    if (!line.trim()) return <br key={idx} />
    if (line.trim().startsWith('- ')) return <div key={idx} className="lf-bullet">{renderInline(line.trim().slice(2))}</div>
    if (line.trim().startsWith('## ')) return <h3 key={idx} className="lf-mini-heading">{renderInline(line.trim().slice(3))}</h3>
    return <p key={idx}>{renderInline(line)}</p>
  })
}

function renderInline(text) {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <mark key={i}>{part.slice(2, -2)}</mark>
    return <span key={i}>{part}</span>
  })
}

function isYoutube(url = '') {
  return /youtube\.com|youtu\.be/.test(url)
}
function youtubeEmbed(url = '') {
  const str = String(url)
  const short = str.match(/youtu\.be\/([^?&]+)/)?.[1]
  const watch = str.match(/[?&]v=([^?&]+)/)?.[1]
  const embed = str.match(/youtube\.com\/embed\/([^?&]+)/)?.[1]
  const id = short || watch || embed
  return id ? `https://www.youtube.com/embed/${id}` : url
}

export default function FunnelClient({ data, slug, refCode }) {
  const { merchant, promoter } = data
  const [lang, setLang] = useState('zh')
  const [lightbox, setLightbox] = useState(null)
  const product = useMemo(() => {
    const localized = localizeProduct(data.product, lang)
    return {
      ...localized,
      sections: (localized.sections || [])
        .filter(s => !s.isHidden)
        .map(s => ({ ...s, title: cleanDisplayText(s.title), body: cleanDisplayText(s.body) }))
        .filter(s => hasText(s.title) || hasText(s.body))
    }
  }, [data.product, lang])
  const gallery = useMemo(() => {
    const imgs = [...(product.galleryImages || [])]
    if (product.imageUrl && !imgs.includes(product.imageUrl)) imgs.unshift(product.imageUrl)
    if (product.heroImageUrl && !imgs.includes(product.heroImageUrl)) imgs.unshift(product.heroImageUrl)
    return imgs.filter(Boolean)
  }, [product])

  useEffect(() => {
    setLang(getSavedLang())
    const handler = (e) => setLang(e.detail || getSavedLang())
    window.addEventListener('linkflo-language-change', handler)
    return () => window.removeEventListener('linkflo-language-change', handler)
  }, [])

  useEffect(() => { track('VIEW') }, [])
  async function track(type) {
    try {
      await fetch(`${API_URL}/api/public/track`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ slug, ref: refCode || undefined, type, visitorKey: getVisitorKey() })
      })
    } catch {}
  }

  const phone = promoter?.promoterPhone
  const normalizedPhone = phone ? normalizeMsisdn(phone) : ''
  const msg = encodeURIComponent(`Hi ${promoter?.promoterName || ''}, saya berminat dengan ${product.name}. LinkFlo ref: ${refCode || '-'}`)
  const wa = normalizedPhone ? `https://wa.me/${normalizedPhone}?text=${msg}` : '#'
  async function clickWhatsapp(){ if (!normalizedPhone) return; await track('WHATSAPP_CLICK'); window.location.href = wa }

  const sections = (product.sections || []).filter(s => hasText(s.title) || hasText(s.body))
  const grouped = (type) => sections.filter(s => String(s.type || '').toUpperCase() === type)
  const otherSections = sections.filter(s => !['PAIN','PROBLEM','SOLUTION','TRUST','OFFER','FAQ','CTA','BENEFIT'].includes(String(s.type || '').toUpperCase()))
  const ctaSection = grouped('CTA')[0]
  const hasIntro = hasText(product.description) || hasMeaningfulPriceNote(product.priceNote)
  const hasCta = hasText(ctaSection?.title) || hasText(ctaSection?.body)
  const heroBg = product.heroImageUrl || product.imageUrl || gallery[0]

  return <main className="lf-funnel">
    <FunnelStyles />
    <section className="lf-hero" style={heroBg ? { backgroundImage:`linear-gradient(135deg, rgba(2,6,23,.78), rgba(11,92,255,.46)), url(${heroBg})` } : {}}>
      <div className="lf-language-corner"><LanguageToggle compact /></div>
      <div className="lf-hero-inner">
        <div className="lf-hero-top"><p className="lf-brand">{merchant.brandName}</p></div>
        <h1>{renderInline(product.headline || product.name)}</h1>
        {hasText(product.subheadline) && <div className="lf-hero-sub">{renderRich(product.subheadline)}</div>}
        {promoter && <p className="lf-promoter-pill">{t(lang, 'promoterHandled', { name: promoter.promoterName })}</p>}
        <div className="lf-hero-actions"><button onClick={clickWhatsapp} disabled={!normalizedPhone}>{t(lang, 'wa')}</button></div>
      </div>
      <a className="lf-keep-reading" href="#first-content"><span>{t(lang, 'scroll')}</span><b>⌄</b></a>
    </section>

    <div id="first-content" className="lf-scroll-anchor" />

    {hasText(product.videoUrl) && <section id="video" className="lf-section lf-video-section">
      <div className="lf-section-head"><p>{t(lang, 'watchFirst')}</p><h2>{t(lang, 'watch')}</h2></div>
      <VideoBlock url={product.videoUrl} />
    </section>}

    {!!gallery.length && <section id="gallery" className="lf-section">
      <div className="lf-section-head"><p>{t(lang, 'galleryKicker')}</p><h2>{t(lang, 'gallery')}</h2></div>
      <div className="lf-gallery">{gallery.map((img,i)=><button key={`${img}-${i}`} onClick={()=>setLightbox(img)}><img src={img} alt={`${product.name} ${i+1}`} /></button>)}</div>
    </section>}

    {hasIntro && <section id="intro" className="lf-section lf-intro">{hasText(product.description) && <><h2>{t(lang, 'intro')}</h2><div>{renderRich(product.description)}</div></>}{hasMeaningfulPriceNote(product.priceNote) && <b className="lf-price-note">{cleanDisplayText(product.priceNote)}</b>}</section>}

    <SectionGroup title={t(lang, 'pain')} kicker={t(lang, 'pain')} items={[...grouped('PAIN'), ...grouped('PROBLEM')]} dark />
    <SectionGroup title={t(lang, 'solution')} kicker={t(lang, 'solution')} items={[...grouped('SOLUTION'), ...grouped('BENEFIT')]} />
    <SectionGroup title={t(lang, 'trust')} kicker={t(lang, 'trust')} items={grouped('TRUST')} />
    <SectionGroup title={t(lang, 'offer')} kicker={t(lang, 'offer')} items={grouped('OFFER')} dark />
    <FAQ items={grouped('FAQ')} title={t(lang, 'faq')} />
    <SectionGroup title={t(lang, 'details')} kicker={t(lang, 'details')} items={otherSections} />

    {hasCta && <section className="lf-final-cta">
      <p>{t(lang, 'readyKicker')}</p>{hasText(ctaSection?.title) && <h2>{cleanDisplayText(ctaSection.title)}</h2>}
      {hasText(ctaSection?.body) && <div>{renderRich(ctaSection.body)}</div>}
      <button onClick={clickWhatsapp} disabled={!normalizedPhone}>{t(lang, 'wa')}</button>
    </section>}

    <button className="lf-sticky-wa" onClick={clickWhatsapp} disabled={!normalizedPhone}>{t(lang, 'wa')}</button>
    {lightbox && <div className="lf-lightbox" onClick={()=>setLightbox(null)}><img src={lightbox} alt={t(lang, 'preview')} /><button>×</button></div>}
  </main>
}

function VideoBlock({ url }) {
  if (isYoutube(url)) return <div className="lf-video-wrap"><iframe src={youtubeEmbed(url)} title={t(getSavedLang(), 'productVideo')} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>
  return <div className="lf-video-wrap"><video src={url} controls playsInline /></div>
}

function SectionGroup({ kicker, title, items, dark=false }) {
  const visibleItems = (items || []).filter(s => hasText(s.title) || hasText(s.body))
  if (!visibleItems.length) return null
  return <section className={`lf-section ${dark ? 'lf-dark' : ''}`}><div className="lf-section-head"><p>{kicker}</p><h2>{title}</h2></div><div className="lf-card-grid">{visibleItems.map(s=><article key={s.id || `${s.type}-${s.title}`} className="lf-copy-card">{hasText(s.title) && <h3>{cleanDisplayText(s.title)}</h3>}{hasText(s.body) && <div>{renderRich(s.body)}</div>}</article>)}</div></section>
}

function FAQ({ items, title }) {
  const visibleItems = (items || []).filter(s => hasText(s.title) && hasText(s.body))
  if (!visibleItems.length) return null
  return <section className="lf-section"><div className="lf-section-head"><p>{title}</p><h2>{title}</h2></div><div className="lf-faq-list">{visibleItems.map((s,i)=><details key={s.id || i}><summary>{cleanDisplayText(s.title)}</summary><div>{renderRich(s.body)}</div></details>)}</div></section>
}

function FunnelStyles(){return <style jsx global>{`
  html{scroll-behavior:smooth}.lf-funnel{background:#050816;color:#e5edff;min-height:100vh;padding-bottom:96px}.lf-hero{min-height:100vh;background:linear-gradient(135deg,#020617,#0b5cff);background-size:cover;background-position:center;display:flex;align-items:center;padding:24px;position:relative;overflow:hidden}.lf-hero:after{content:"";position:absolute;inset:auto -20% -25% -20%;height:45%;background:radial-gradient(circle,rgba(59,130,246,.36),transparent 65%);filter:blur(30px)}.lf-language-corner{position:absolute;top:18px;right:18px;z-index:5}.lf-hero-inner{position:relative;z-index:2;max-width:980px;margin:0 auto;width:100%;padding-top:44px}.lf-hero-top{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}.lf-brand{font-weight:900;letter-spacing:.16em;color:#bfdbfe;margin:0;padding-right:120px}.lf-hero h1{font-size:clamp(42px,8vw,92px);line-height:.95;margin:12px 0;letter-spacing:-.06em;max-width:930px}.lf-hero-sub{font-size:clamp(17px,2.7vw,25px);line-height:1.6;color:#dbeafe;max-width:760px}.lf-hero-sub p{margin:0 0 8px}.lf-promoter-pill{display:inline-flex;margin-top:16px;padding:10px 14px;border:1px solid rgba(255,255,255,.24);background:rgba(255,255,255,.12);border-radius:999px;backdrop-filter:blur(12px)}.lf-hero-actions{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:26px}.lf-hero button,.lf-final-cta button,.lf-sticky-wa{border:0;border-radius:999px;background:#22c55e;color:#fff;font-weight:950;cursor:pointer;box-shadow:0 18px 45px rgba(34,197,94,.28)}.lf-hero button{padding:16px 24px;font-size:17px}.lf-keep-reading{position:absolute;left:50%;bottom:104px;transform:translateX(-50%);z-index:4;color:#bfdbfe;text-decoration:none;font-weight:950;display:flex;flex-direction:column;align-items:center;gap:4px;letter-spacing:.04em;text-align:center;animation:lfFloat 1.25s ease-in-out infinite}.lf-keep-reading b{font-size:28px;line-height:1}.lf-scroll-anchor{height:1px;margin-top:-1px}@keyframes lfFloat{0%,100%{transform:translate(-50%,0)}50%{transform:translate(-50%,10px)}}.lf-section{max-width:1080px;margin:0 auto;padding:68px 20px}.lf-section-head p,.lf-final-cta p{margin:0 0 8px;color:#60a5fa;letter-spacing:.16em;font-size:12px;font-weight:950}.lf-section-head h2,.lf-final-cta h2{margin:0 0 24px;font-size:clamp(28px,5vw,52px);line-height:1;letter-spacing:-.04em}.lf-video-wrap{position:relative;width:100%;aspect-ratio:16/9;border-radius:28px;overflow:hidden;background:#0f172a;border:1px solid rgba(255,255,255,.12);box-shadow:0 24px 70px rgba(0,0,0,.35)}.lf-video-wrap iframe,.lf-video-wrap video{width:100%;height:100%;border:0;display:block}.lf-empty-media{border:1px dashed rgba(255,255,255,.24);border-radius:28px;padding:42px;text-align:center;color:#bfdbfe;background:rgba(255,255,255,.05)}.lf-gallery{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:14px;-webkit-overflow-scrolling:touch}.lf-gallery button{min-width:min(78vw,360px);height:430px;border:0;border-radius:28px;overflow:hidden;padding:0;background:#111827;scroll-snap-align:start;cursor:zoom-in}.lf-gallery img{width:100%;height:100%;object-fit:cover;display:block;transition:.2s}.lf-gallery button:hover img{transform:scale(1.04)}.lf-intro,.lf-copy-card,details,.lf-final-cta{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:30px;box-shadow:0 20px 55px rgba(0,0,0,.22);backdrop-filter:blur(14px)}.lf-intro{padding:34px}.lf-intro h2{font-size:34px;margin:0 0 14px}.lf-price-note{display:inline-flex;margin-top:12px;background:#fef3c7;color:#92400e;padding:10px 14px;border-radius:999px}.lf-dark{max-width:none;background:linear-gradient(135deg,#061b45,#030712);padding-left:max(20px,calc((100vw - 1080px)/2));padding-right:max(20px,calc((100vw - 1080px)/2))}.lf-card-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.lf-copy-card{padding:24px}.lf-copy-card h3{font-size:24px;margin:0 0 12px}.lf-copy-card p,.lf-intro p,details p,.lf-final-cta p:not(:first-child){color:#dbeafe;line-height:1.75;margin:0 0 9px}.lf-bullet{position:relative;padding-left:30px;margin:10px 0;color:#dbeafe;line-height:1.6}.lf-bullet:before{content:"✓";position:absolute;left:0;top:0;width:22px;height:22px;border-radius:999px;background:#22c55e;color:white;display:grid;place-items:center;font-size:12px;font-weight:900}.lf-mini-heading{font-size:21px;margin:18px 0 8px}.lf-faq-list{display:grid;gap:12px}details{padding:20px}summary{cursor:pointer;font-size:19px;font-weight:900}details div{margin-top:12px}mark{background:linear-gradient(90deg,#60a5fa,#22c55e);color:white;border-radius:10px;padding:0 .25em;box-decoration-break:clone;-webkit-box-decoration-break:clone}.lf-final-cta{max-width:1080px;margin:70px auto 20px;padding:42px 24px;text-align:center}.lf-final-cta button{padding:16px 24px;font-size:17px;margin-top:14px}.lf-sticky-wa{position:fixed;left:16px;right:16px;bottom:16px;z-index:30;padding:16px 20px;font-size:16px}.lf-lightbox{position:fixed;inset:0;background:rgba(2,6,23,.9);z-index:50;display:grid;place-items:center;padding:20px}.lf-lightbox img{max-width:96vw;max-height:88vh;border-radius:22px}.lf-lightbox button{position:fixed;top:18px;right:18px;border:0;background:white;color:#0f172a;border-radius:999px;width:44px;height:44px;font-size:30px;cursor:pointer}@media(max-width:760px){.lf-language-corner{top:12px;right:12px}.lf-hero{padding:18px}.lf-hero-inner{padding-top:56px}.lf-brand{padding-right:112px;font-size:12px;letter-spacing:.12em}.lf-hero h1{font-size:clamp(38px,14vw,58px);letter-spacing:-.05em}.lf-card-grid{grid-template-columns:1fr}.lf-section{padding:52px 14px}.lf-gallery button{height:360px}.lf-intro{padding:24px}.lf-dark{padding-left:14px;padding-right:14px}.lf-copy-card{padding:20px;border-radius:24px}.lf-section-head h2,.lf-final-cta h2{font-size:34px}.lf-keep-reading{bottom:98px;font-size:13px}.lf-sticky-wa{left:12px;right:12px;bottom:12px}}
`}</style>}
