'use client'
import { useEffect, useMemo, useState } from 'react'
import { api, SITE_URL } from '../../../lib/api'
import LanguageToggle from '../../../components/LanguageToggle'
import { useLanguage } from '../../../lib/i18n'

export default function PromoterPage({ params }) {
  const { tr } = useLanguage()
  const [data, setData] = useState(null)
  const [msg, setMsg] = useState('Loading...')
  const [query, setQuery] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const resolved = await params
        const result = await api(`/api/public/promoters/${encodeURIComponent(resolved.promoterId)}`)
        setData(result)
        setMsg('')
      } catch (e) {
        setMsg(e.message)
      }
    })()
  }, [params])

  const links = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = data?.links || []
    if (!q) return list
    return list.filter(item => [item.productName, item.headline, item.code].filter(Boolean).join(' ').toLowerCase().includes(q))
  }, [data, query])

  const totalClicks = (data?.links || []).reduce((sum, item) => sum + (item.clicks || 0), 0)
  const totalWhatsapp = (data?.links || []).reduce((sum, item) => sum + (item.whatsappClicks || 0), 0)

  if (msg) return <main className="pf-shell"><PromoterStyles /><h1>{tr('promoterDashboard')}</h1><p className="pf-notice">{msg === 'Loading...' ? tr('processing') : msg}</p></main>

  return <main className="pf-shell">
    <PromoterStyles />
    <section className="pf-hero">
      <div>
        <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}><p className="pf-kicker">PROMOTER CENTER</p><LanguageToggle compact /></div>
        <h1>{data.promoter.name}</h1>
        <p className="pf-muted">ID: <b>{data.promoter.promoterId}</b> · {tr('merchant')}: <b>{data.merchant.brandName}</b></p>
        <p className="pf-muted">{tr('promoterSub')}</p>
      </div>
      <div className="pf-hero-card"><span>{tr('products')}</span><strong>{data.links.length}</strong></div>
    </section>

    <section className="pf-metrics">
      <Metric label={tr('handledProducts')} value={data.links.length} />
      <Metric label={tr('clicks')} value={totalClicks} />
      <Metric label={tr('waClicks')} value={totalWhatsapp} />
    </section>

    <section className="pf-card">
      <div className="pf-section-head"><div><p className="pf-kicker">PRODUCT POOL</p><h2>{tr('productLinks')}</h2></div><input className="pf-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder={tr('searchSku')} /></div>
      <div className="pf-table-wrap"><div className="pf-table">
        <div className="pf-th">{tr('product')}</div><div className="pf-th">{tr('clicks')}</div><div className="pf-th">WhatsApp</div><div className="pf-th">{tr('link')}</div><div className="pf-th">{tr('actions')}</div>
        {links.map(link => {
          const url = `${SITE_URL}/p/${encodeURIComponent(link.productSlug)}?ref=${encodeURIComponent(link.code)}`
          return <div className="pf-tr" key={link.id}>
            <div className="pf-product"><b>{link.productName}</b><small>{link.headline}</small></div>
            <div><b>{link.clicks}</b></div>
            <div><b>{link.whatsappClicks}</b></div>
            <div><input readOnly className="pf-input" value={url} /></div>
            <div className="pf-actions"><button className="pf-btn" onClick={() => navigator.clipboard?.writeText(url)}>{tr('copyAffiliateLink')}</button><a className="pf-btn open" href={`/p/${encodeURIComponent(link.productSlug)}?ref=${encodeURIComponent(link.code)}`} target="_blank">{tr('openPage')}</a></div>
          </div>
        })}
      </div></div>
      {!links.length && <p className="pf-muted">{tr('noPromoterProducts')}</p>}
    </section>
  </main>
}

function Metric({label,value}){return <div className="pf-metric"><span>{label}</span><strong>{value}</strong></div>}
function PromoterStyles(){return <style jsx global>{`
  .pf-shell{max-width:1120px;margin:0 auto;padding:18px 16px 48px;color:#0f172a}.pf-hero{display:grid;grid-template-columns:1fr 180px;gap:16px;align-items:stretch;background:linear-gradient(135deg,#0b5cff,#082b80);border-radius:28px;padding:24px;color:#fff;box-shadow:0 18px 45px rgba(11,92,255,.2)}.pf-kicker{margin:0 0 5px;font-size:12px;font-weight:900;letter-spacing:.12em;color:#93c5fd}.pf-hero h1{margin:0;font-size:34px;letter-spacing:-1px}.pf-muted{color:#64748b;line-height:1.6}.pf-hero .pf-muted{color:#dbeafe}.pf-hero-card{background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.22);border-radius:24px;padding:18px;display:flex;flex-direction:column;justify-content:center}.pf-hero-card span{opacity:.78}.pf-hero-card strong{font-size:42px}.pf-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:14px 0}.pf-card,.pf-metric{background:#fff;border:1px solid #e5edf7;border-radius:24px;box-shadow:0 12px 35px rgba(15,23,42,.06)}.pf-metric{padding:18px}.pf-metric span{display:block;color:#64748b;font-size:13px}.pf-metric strong{display:block;margin-top:8px;font-size:28px}.pf-card{padding:20px}.pf-section-head{display:flex;justify-content:space-between;gap:14px;align-items:center;margin-bottom:14px}.pf-section-head h2{margin:0}.pf-search,.pf-input{width:100%;box-sizing:border-box;padding:12px;border:1px solid #dbe3ef;border-radius:14px;background:#fff}.pf-search{max-width:320px}.pf-input{font-size:12px}.pf-table-wrap{overflow:auto}.pf-table{min-width:840px;display:grid;grid-template-columns:1.3fr .35fr .45fr 1.8fr .75fr}.pf-th{padding:11px 12px;background:#f8fafc;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:12px;font-weight:900;text-transform:uppercase}.pf-tr{display:contents}.pf-tr>div{padding:12px;border-bottom:1px solid #eef2f7;display:flex;flex-direction:column;justify-content:center;gap:4px}.pf-product small{color:#64748b}.pf-actions{flex-direction:row!important;gap:6px;flex-wrap:wrap}.pf-btn{border:0;border-radius:12px;background:#0b5cff;color:#fff;padding:9px 11px;font-weight:800;text-decoration:none;font-size:12px;cursor:pointer}.pf-btn.open{background:#0f172a}.pf-notice{background:#eff6ff;border:1px solid #bfdbfe;padding:12px 14px;border-radius:16px}@media(max-width:760px){.pf-shell{padding:12px}.pf-hero{grid-template-columns:1fr;border-radius:22px}.pf-hero h1{font-size:26px}.pf-metrics{grid-template-columns:1fr}.pf-section-head{align-items:stretch;flex-direction:column}.pf-search{max-width:none}.pf-card{padding:14px;border-radius:20px}.pf-table{min-width:760px;grid-template-columns:1.2fr .35fr .45fr 1.7fr .75fr}}
`}</style>}
