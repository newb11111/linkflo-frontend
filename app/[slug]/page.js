export const dynamic = "force-dynamic"

import LandingPage from "../../components/LandingPage"
import { API_URL } from "../../lib/config"

async function getPage(slug) {
  try {
    const res = await fetch(`${API_URL}/api/page/${slug}`, {
      cache: "no-store"
    })

    if (!res.ok) {
      console.error("Fetch page failed:", res.status, slug)
      return null
    }

    return res.json()
  } catch (error) {
    console.error("Get page error:", error)
    return null
  }
}

export default async function Page({ params }) {
  const resolvedParams = await params
  const slug = resolvedParams?.slug
  const page = await getPage(slug)

  if (!page) {
    return <div style={{ padding: 40 }}>Page not found.</div>
  }

  return <LandingPage data={page} />
}
