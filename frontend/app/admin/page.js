"use client"

import { useEffect, useState } from "react"
import { API_URL } from "@/lib/config"
import { getAdminHeaders } from "@/lib/adminAuth"

export default function AdminHome() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/stats`, {
          headers: getAdminHeaders()
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.message || "Failed to load stats")
        }

        setStats(data)
      } catch (err) {
        setError(err.message || "Failed to load stats")
      }
    }

    fetchStats()
  }, [])

  if (error) return <div style={{ padding: 24 }}>{error}</div>
  if (!stats) return <div style={{ padding: 24 }}>Loading...</div>

  return (
    <div style={{ padding: 24 }}>
      <div style={styles.hero}>
        <p style={styles.kicker}>Dashboard</p>
        <h1 style={styles.title}>Landing Page Overview</h1>
        <p style={styles.subtitle}>快速看到你现在签了多少配套，以及目前总销售额。</p>
      </div>

      <div style={styles.grid}>
        <Card title="Starter" value={stats.starter} />
        <Card title="Pro" value={stats.pro} />
        <Card title="Pro+" value={stats.proPlus} />
        <Card title="Total Sales" value={`RM ${stats.totalSales}`} />
      </div>
    </div>
  )
}

function Card({ title, value }) {
  return (
    <div style={styles.card}>
      <p style={styles.cardLabel}>{title}</p>
      <p style={styles.number}>{value}</p>
    </div>
  )
}

const styles = {
  hero: { background: "linear-gradient(135deg, #111827, #2563eb)", color: "white", borderRadius: 24, padding: 24, marginBottom: 20 },
  kicker: { margin: 0, textTransform: "uppercase", letterSpacing: 1.2, fontSize: 12, opacity: 0.72 },
  title: { margin: "8px 0", fontSize: 30 },
  subtitle: { margin: 0, opacity: 0.86 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 },
  card: { background: "white", padding: 20, borderRadius: 20, boxShadow: "0 14px 30px rgba(15, 23, 42, 0.08)" },
  cardLabel: { margin: 0, color: "#667085" },
  number: { margin: "8px 0 0", fontSize: 30, fontWeight: 800 }
}
