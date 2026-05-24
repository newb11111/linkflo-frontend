import FunnelClient from '../../../components/FunnelClient'
import { API_URL } from '../../../lib/api'

export default async function ProductPage({ params, searchParams }) {
  const { slug } = await params
  const sp = await searchParams
  const ref = sp?.ref || ''
  let data = null
  try {
    const res = await fetch(`${API_URL}/api/public/products/${encodeURIComponent(slug)}${ref ? `?ref=${encodeURIComponent(ref)}` : ''}`, { cache: 'no-store' })
    if (res.ok) data = await res.json()
  } catch {}
  if (!data) return <main style={{ padding: 40 }}><h1>Product not found</h1></main>
  return <FunnelClient data={data} slug={slug} refCode={ref} />
}
