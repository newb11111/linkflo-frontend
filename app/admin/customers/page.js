"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { API_URL } from "../../../lib/config"
import { getAdminHeaders } from "../../../lib/adminAuth"

export default function Customers() {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [busyId, setBusyId] = useState("")
  const router = useRouter()

  const loadPages = async () => {
    try {
      setLoading(true)
      setError("")

      const res = await fetch(`${API_URL}/api/admin/pages`, {
        headers: getAdminHeaders()
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Failed to load pages")
      }

      setPages(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || "Failed to load pages")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPages()
  }, [])

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(`Delete ${name}?`)
    if (!confirmed) return

    const res = await fetch(`${API_URL}/api/admin/page/${id}`, {
      method: "DELETE",
      headers: getAdminHeaders()
    })

    if (res.ok) {
      loadPages()
    } else {
      const data = await res.json().catch(() => ({}))
      alert(data.message || "Delete failed")
    }
  }

  const handleToggleHidden = async (page) => {
    try {
      setBusyId(page.id)
      const res = await fetch(`${API_URL}/api/admin/page/${page.id}/visibility`, {
        method: "PATCH",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ isHidden: !page.isHidden })
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.message || "Failed to update visibility")
      }

      await loadPages()
    } catch (err) {
      alert(err.message || "Failed to update visibility")
    } finally {
      setBusyId("")
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={styles.hero}>
        <div>
          <p style={styles.kicker}>Customers</p>
          <h1 style={styles.title}>Customer Pages</h1>
          <p style={styles.desc}>Preview, edit, hide, or delete every landing page from one place.</p>
        </div>
      </div>

      {loading ? <p>Loading...</p> : null}
      {error ? <p style={{ color: "#b42318" }}>{error}</p> : null}

      <div style={styles.list}>
        {pages.map((page) => (
          <div key={page.id} style={styles.card}>
            <div>
              <div style={styles.nameRow}>
                <strong>{page.name}</strong>
                <span style={styles.badge}>{page.packageType}</span>
                {page.isHidden ? <span style={styles.hiddenBadge}>Hidden</span> : null}
              </div>
              <p style={styles.meta}>/{page.slug}</p>
              <p style={styles.meta}>{page.whatsapp || "No WhatsApp"}</p>
            </div>

            <div style={styles.actions}>
              <a href={`/${page.slug}`} target="_blank" style={styles.previewButton}>Preview</a>
              <button onClick={() => router.push(`/admin/edit/${page.id}`)} style={styles.editButton}>Edit</button>
              <button
                onClick={() => handleToggleHidden(page)}
                style={page.isHidden ? styles.unhideButton : styles.hideButton}
                disabled={busyId === page.id}
              >
                {busyId === page.id ? "Saving..." : page.isHidden ? "Unhide" : "Hide"}
              </button>
              <button onClick={() => handleDelete(page.id, page.name)} style={styles.deleteButton}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  hero: {
    background: "linear-gradient(135deg, #111827, #1d4ed8)",
    color: "white",
    borderRadius: 24,
    padding: 24,
    marginBottom: 22
  },
  kicker: { margin: 0, opacity: 0.72, textTransform: "uppercase", letterSpacing: 1.1, fontSize: 12 },
  title: { margin: "8px 0", fontSize: 30 },
  desc: { margin: 0, opacity: 0.86 },
  list: { display: "grid", gap: 14 },
  card: {
    background: "white",
    borderRadius: 20,
    padding: 18,
    border: "1px solid #eaecf0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
    boxShadow: "0 16px 32px rgba(15, 23, 42, 0.06)"
  },
  nameRow: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  badge: { background: "#eef2ff", color: "#3730a3", padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, textTransform: "uppercase" },
  hiddenBadge: { background: "#fef3c7", color: "#92400e", padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, textTransform: "uppercase" },
  meta: { margin: "6px 0 0", color: "#667085" },
  actions: { display: "flex", gap: 10, flexWrap: "wrap" },
  previewButton: { textDecoration: "none", padding: "10px 14px", background: "#111827", color: "white", borderRadius: 12 },
  editButton: { padding: "10px 14px", background: "#2563eb", color: "white", border: "none", borderRadius: 12, cursor: "pointer" },
  hideButton: { padding: "10px 14px", background: "#fef3c7", color: "#92400e", border: "none", borderRadius: 12, cursor: "pointer" },
  unhideButton: { padding: "10px 14px", background: "#dcfce7", color: "#166534", border: "none", borderRadius: 12, cursor: "pointer" },
  deleteButton: { padding: "10px 14px", background: "#fee2e2", color: "#b91c1c", border: "none", borderRadius: 12, cursor: "pointer" }
}
