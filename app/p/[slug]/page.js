import { API_URL } from '../../../lib/config'
import ProductFunnelLux from '../../../components/ProductFunnelLux'
import DraftProductFunnelClient from './DraftProductFunnelClient'

async function load(slug, sp) {
  try {
    const ref = sp?.ref ? `?ref=${encodeURIComponent(sp.ref)}` : ''
    const r = await fetch(`${API_URL}/api/products/${slug}${ref}`, { cache: 'no-store' })
    return r.ok ? r.json() : null
  } catch (error) {
    console.error('Product funnel fetch failed:', error?.message || error)
    return null
  }
}

export default async function Page({ params, searchParams }) {
  const { slug } = await params
  const sp = await searchParams

  // Merchant draft preview should still look like the real slug funnel page,
  // but it fetches draft data client-side using the merchant login cookie.
  if (sp?.draft) return <DraftProductFunnelClient draftId={sp.draft} slug={slug} />

  const d = await load(slug, sp)

  if (!d) {
    return (
      <main className="lux-page">
        <div className="lux-container">
          <div className="lux-error">Product not found</div>
        </div>
      </main>
    )
  }

  return <ProductFunnelLux product={d.product} page={d.page} refCode={d.ref || sp?.ref || ''} related={d.related || []} />
}
