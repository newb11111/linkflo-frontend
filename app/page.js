'use client'
import Link from 'next/link'
import { useMemo, useRef, useState } from 'react'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../lib/i18n'

export default function Home() {
  const [selectedPlan, setSelectedPlan] = useState(null)
  const { tr } = useLanguage()
  const plans = useMemo(() => ([
    { code:'STARTER', name:'Starter', price:'RM29/mo', links:'10 promoter links', desc:tr('starterDesc') },
    { code:'GROWTH', name:'Growth', price:'RM139/mo', links:'50 promoter links', desc:tr('growthDesc') },
    { code:'SCALE', name:'Scale', price:'RM259/mo', links:'100 promoter links', desc:tr('scaleDesc') }
  ]), [tr])

  return (
    <main className="lf-home" style={wrap}>
      <HomeStyles />
      <nav className="lf-home-nav" style={nav}>
        <div className="lf-home-brand"><b style={{fontSize:22}}>LinkFlo</b><LanguageToggle compact /></div>
        <div className="lf-home-nav-actions">
          <Link href="/login" style={ghost}>{tr('homeLogin')}</Link>
          <button onClick={()=>setSelectedPlan(plans[0])} style={primary}>{tr('homeStart')}</button>
        </div>
      </nav>

      <section className="lf-home-hero" style={hero}>
        <div className="lf-home-hero-copy">
          <div style={pill}>{tr('homeBadge')}</div>
          <h1 className="lf-home-h1" style={h1}>{tr('homeHeadline')}</h1>
          <p className="lf-home-lead" style={lead}>{tr('homeLead')}</p>
          <div className="lf-home-cta-row">
            <button onClick={()=>setSelectedPlan(plans[1])} style={primaryBig}>{tr('homeCta')}</button>
            <a href="#pricing" style={ghostBig}>{tr('homePricing')}</a>
          </div>
        </div>
        <div className="lf-home-preview" style={heroCard}>
          <h3>{tr('merchantWillSee')}</h3>
          <ul style={{lineHeight:2, paddingLeft:20, marginBottom:0}}>
            <li>{tr('homeSee1')}</li>
            <li>{tr('homeSee2')}</li>
            <li>{tr('homeSee3')}</li>
            <li>{tr('homeSee4')}</li>
            <li>{tr('homeSee5')}</li>
          </ul>
        </div>
      </section>

      <section style={section}>
        <h2 className="lf-home-h2" style={h2}>{tr('homeSectionTitle')}</h2>
        <SwipeRail variant="feature">
          <Feature title={tr('featureFunnel')} text={tr('featureFunnelText')} />
          <Feature title={tr('featurePromoterLink')} text={tr('featurePromoterText')} />
          <Feature title={tr('featureTracking')} text={tr('featureTrackingText')} />
        </SwipeRail>
      </section>

      <section id="pricing" style={section}>
        <h2 className="lf-home-h2" style={h2}>{tr('pricing')}</h2>
        <p className="lf-home-muted">{tr('pricingNote')}</p>
        <SwipeRail variant="plan">
          {plans.map(p => (
            <div key={p.name} className="lf-plan-card" style={priceCard}>
              <h3>{p.name}</h3>
              <h2>{p.price}</h2>
              <b>{p.links}</b>
              <p>{p.desc}</p>
              <button onClick={()=>setSelectedPlan(p)} style={primaryFull}>{tr('choosePlan')}</button>
            </div>
          ))}
        </SwipeRail>
      </section>

      {selectedPlan && <PlanModal plan={selectedPlan} onClose={()=>setSelectedPlan(null)} tr={tr} />}
    </main>
  )
}

function SwipeRail({ children, variant = 'feature' }) {
  const railRef = useRef(null)
  const move = (direction) => {
    const rail = railRef.current
    if (!rail) return
    const amount = Math.max(280, Math.floor(rail.clientWidth * 0.82))
    rail.scrollBy({ left: direction * amount, behavior: 'smooth' })
  }
  return (
    <div className={`lf-swipe-shell lf-${variant}-shell`}>
      <button type="button" className="lf-swipe-btn lf-swipe-left" aria-label="Previous" onClick={() => move(-1)}>‹</button>
      <div ref={railRef} className={`lf-swipe-rail lf-${variant}-rail`} style={railBase}>
        {children}
      </div>
      <button type="button" className="lf-swipe-btn lf-swipe-right" aria-label="Next" onClick={() => move(1)}>›</button>
    </div>
  )
}

function PlanModal({plan,onClose,tr}) {
  return <div style={modalBackdrop} onClick={onClose}>
    <div className="lf-home-modal" style={modal} onClick={e=>e.stopPropagation()}>
      <button onClick={onClose} style={closeBtn}>×</button>
      <div style={pill}>{tr('buyConfirm')}</div>
      <h2 style={{marginBottom:6}}>{tr('selectedPlan', { plan: plan.name })}</h2>
      <p style={{color:'#64748b',lineHeight:1.7}}>{tr('planModalText')}</p>
      <div style={steps}>
        <b>{tr('stepRegister')}</b>
        <b>{tr('stepTopup')}</b>
        <b>{tr('stepConfirm')}</b>
      </div>
      <div style={{display:'flex',gap:10,marginTop:18,flexWrap:'wrap'}}>
        <Link href={`/login?mode=register&plan=${plan.code}`} style={primaryBig}>{tr('newUserTopup')}</Link>
        <Link href={`/login?mode=merchant&plan=${plan.code}`} style={ghostBig}>{tr('existingLogin')}</Link>
      </div>
    </div>
  </div>
}
function Feature({title,text}) { return <div className="lf-home-card" style={featureCard}><h3>{title}</h3><p>{text}</p></div> }

function HomeStyles() { return <style jsx global>{`
  .lf-home *{box-sizing:border-box}.lf-home-brand{display:flex;gap:10px;align-items:center}.lf-home-nav-actions{display:flex;gap:12px;align-items:center}.lf-home-cta-row{display:flex;gap:12px;margin-top:26px;flex-wrap:wrap}.lf-home-muted{color:#64748b;line-height:1.7}.lf-home-card,.lf-plan-card{scroll-snap-align:start}.lf-home-card p,.lf-plan-card p{color:#475569;line-height:1.7}.lf-plan-card h2{font-size:32px;margin:8px 0}.lf-plan-card b{color:#0b5cff}.lf-swipe-shell{position:relative}.lf-swipe-rail::-webkit-scrollbar{display:none}.lf-swipe-btn{position:absolute;top:50%;transform:translateY(-50%);z-index:5;width:38px;height:38px;border-radius:999px;border:1px solid #dbeafe;background:white;color:#0b5cff;box-shadow:0 12px 30px rgba(15,23,42,.16);font-size:28px;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer}.lf-swipe-left{left:-14px}.lf-swipe-right{right:-14px}@media(max-width:900px){.lf-home-nav{padding:16px !important;gap:12px;align-items:flex-start !important}.lf-home-nav-actions{width:100%;justify-content:space-between}.lf-home-hero{grid-template-columns:1fr !important;padding:42px 16px 26px !important;gap:18px !important}.lf-home-h1{font-size:clamp(34px,10vw,54px) !important;line-height:1.08 !important;letter-spacing:-1.4px !important}.lf-home-lead{font-size:17px !important}.lf-home-preview{padding:22px !important;border-radius:24px !important}.lf-swipe-shell{margin-left:-2px;margin-right:-2px}.lf-swipe-rail{gap:14px !important;padding:4px 42px 18px 2px !important;margin-right:-18px}.lf-home-card{flex-basis:min(82vw,340px) !important}.lf-plan-card{flex-basis:min(84vw,360px) !important}.lf-swipe-left{left:4px}.lf-swipe-right{right:4px}.lf-home-h2{font-size:clamp(28px,8vw,38px) !important;line-height:1.12 !important}.lf-home-cta-row>*{width:100%;justify-content:center;text-align:center}.lf-home-modal{max-height:92vh;overflow:auto}}@media(max-width:520px){.lf-home-nav{flex-direction:column !important}.lf-home-brand{width:100%;justify-content:space-between}.lf-home-nav-actions a,.lf-home-nav-actions button{flex:1;text-align:center}.lf-home-hero{padding-top:28px !important}.lf-home-preview ul{font-size:14px}.lf-home-card,.lf-plan-card{padding:20px !important;border-radius:24px !important}.lf-swipe-btn{width:34px;height:34px;font-size:24px}.lf-home-muted{font-size:14px}.lf-home-modal{padding:22px !important;border-radius:22px !important}}
`}</style> }

const wrap={fontFamily:'Arial,sans-serif',background:'#f6f9ff',minHeight:'100vh',color:'#0f172a'}
const nav={maxWidth:1180,margin:'0 auto',padding:'22px 28px',display:'flex',justifyContent:'space-between',alignItems:'center'}
const hero={maxWidth:1180,margin:'0 auto',padding:'60px 28px 40px',display:'grid',gridTemplateColumns:'1.25fr .75fr',gap:28,alignItems:'center'}
const pill={display:'inline-block',padding:'8px 12px',borderRadius:999,background:'#e8f0ff',color:'#0b5cff',fontWeight:800}
const h1={fontSize:58,lineHeight:1.05,letterSpacing:-2,margin:'18px 0'}
const lead={fontSize:19,lineHeight:1.75,color:'#475569',maxWidth:720}
const heroCard={background:'white',borderRadius:28,padding:28,boxShadow:'0 24px 70px rgba(15,23,42,.10)',border:'1px solid #e2e8f0'}
const section={maxWidth:1180,margin:'0 auto',padding:'42px 28px'}
const h2={fontSize:34,letterSpacing:-1}
const railBase={display:'flex',gap:18,overflowX:'auto',scrollSnapType:'x mandatory',WebkitOverflowScrolling:'touch',overscrollBehaviorX:'contain',touchAction:'pan-x',scrollbarWidth:'none',padding:'4px 4px 20px'}
const card={background:'white',borderRadius:22,padding:22,boxShadow:'0 10px 30px rgba(15,23,42,.06)'}
const featureCard={...card,flex:'1 0 min(82vw,340px)'}
const priceCard={...card,border:'1px solid #dbeafe',flex:'1 0 min(84vw,360px)'}
const primary={padding:'10px 15px',borderRadius:12,background:'#0b5cff',color:'white',fontWeight:800,textDecoration:'none',border:0,cursor:'pointer'}
const ghost={padding:'10px 15px',borderRadius:12,background:'white',color:'#0f172a',fontWeight:700,textDecoration:'none',border:'1px solid #dbe3ef'}
const primaryBig={...primary,padding:'15px 22px',display:'inline-flex'}
const ghostBig={...ghost,padding:'15px 22px',display:'inline-flex'}
const primaryFull={...primary,display:'block',textAlign:'center',marginTop:18,width:'100%'}
const modalBackdrop={position:'fixed',inset:0,background:'rgba(15,23,42,.45)',display:'grid',placeItems:'center',padding:18,zIndex:50}
const modal={position:'relative',background:'white',borderRadius:28,padding:28,maxWidth:560,width:'100%',boxShadow:'0 30px 90px rgba(15,23,42,.25)'}
const closeBtn={position:'absolute',right:18,top:14,border:0,background:'#f1f5f9',borderRadius:12,fontSize:24,padding:'3px 11px',cursor:'pointer'}
const steps={display:'grid',gap:8,background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:18,padding:16,color:'#334155'}
