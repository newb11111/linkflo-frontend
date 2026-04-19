export const dynamic = "force-dynamic"

import LandingPage from "../components/LandingPage"
import { API_URL } from "../lib/config"

async function getHomepageData() {
  try {
    const res = await fetch(`${API_URL}/api/page/linkflo`, {
      cache: "no-store"
    })

    if (!res.ok) {
      throw new Error("Failed to load homepage data")
    }

    return res.json()
  } catch (err) {
    console.error("Homepage fetch error:", err)
    return null
  }
}

export default async function HomePage() {
  const data = await getHomepageData()

  if (!data) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Homepage error</h1>
        <p>Failed to load LinkFlo homepage.</p>
      </div>
    )
  }

  return <LandingPage data={data} />
}
