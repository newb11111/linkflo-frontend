"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { API_URL } from "../../../lib/config"

export default function LoginPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password })
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Wrong password")
      }

      // ✅ 存 password（重点）
      localStorage.setItem("admin_password", password)

      router.replace("/admin")
    } catch (err) {
      setError(err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <form style={styles.card} onSubmit={handleLogin}>
        <p style={styles.kicker}>LinkFlo</p>
        <h1 style={styles.title}>Admin Login</h1>
        <p style={styles.subtitle}>进入后台管理你的 landing page 客户。</p>

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        {error ? <p style={styles.error}>{error}</p> : null}

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  )
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #0f172a, #1d4ed8)",
    padding: 24
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "rgba(255,255,255,.96)",
    borderRadius: 24,
    padding: 28,
    boxShadow: "0 30px 60px rgba(0,0,0,.18)"
  },
  kicker: {
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "#667085",
    fontSize: 12
  },
  title: {
    margin: "8px 0",
    fontSize: 32
  },
  subtitle: {
    margin: "0 0 18px",
    color: "#667085"
  },
  input: {
    width: "100%",
    padding: 14,
    borderRadius: 14,
    border: "1px solid #d0d5dd",
    marginTop: 10,
    boxSizing: "border-box"
  },
  button: {
    width: "100%",
    padding: 14,
    marginTop: 16,
    background: "#111827",
    color: "white",
    border: "none",
    borderRadius: 14,
    fontWeight: 700,
    cursor: "pointer",
    opacity: 1
  },
  error: {
    color: "#b42318",
    marginTop: 10
  }
}