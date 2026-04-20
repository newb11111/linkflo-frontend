"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { API_URL } from "../../lib/config"
import { getAdminPassword, getAdminHeaders } from "../../lib/adminAuth"

const items = [
  { label: "Dashboard", href: "/admin" },
  { label: "Create Page", href: "/admin/orderpage" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Reports", href: "/admin/reports" }
]

const IDLE_TIMEOUT = 15 * 60 * 1000 // 15 分钟

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()

  const [menuOpen, setMenuOpen] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const idleTimerRef = useRef(null)

  const isLoginPage = pathname === "/admin/login"

  const logoutAndGoLogin = async () => {
    const password = getAdminPassword()

    try {
      await fetch(`${API_URL}/api/admin/logout`, {
        method: "POST",
        headers: getAdminHeaders({
          "Content-Type": "application/json"
        })
      })
    } catch (error) {
      // 忽略 logout 失败，前端照样跳转
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("admin_password")
      }
      router.replace("/admin/login")
    }
  }

  useEffect(() => {
    if (isLoginPage) {
      setCheckingAuth(false)
      return
    }

    const checkAuth = async () => {
      try {
        const password = getAdminPassword()

        if (!password) {
          router.replace("/admin/login")
          return
        }

        const res = await fetch(`${API_URL}/api/admin/check`, {
          headers: getAdminHeaders()
        })

        const data = await res.json()

        if (!res.ok || !data.loggedIn) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("admin_password")
          }
          router.replace("/admin/login")
          return
        }
      } catch (error) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("admin_password")
        }
        router.replace("/admin/login")
        return
      } finally {
        setCheckingAuth(false)
      }
    }

    checkAuth()
  }, [isLoginPage, router])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (isLoginPage) return

    const resetIdleTimer = () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
      }

      idleTimerRef.current = setTimeout(() => {
        logoutAndGoLogin()
      }, IDLE_TIMEOUT)
    }

    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"]

    events.forEach((event) => {
      window.addEventListener(event, resetIdleTimer)
    })

    resetIdleTimer()

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetIdleTimer)
      })

      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
      }
    }
  }, [isLoginPage])

  if (isLoginPage) {
    return <>{children}</>
  }

  if (checkingAuth) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.loadingCard}>Checking admin access...</div>
      </div>
    )
  }

  return (
    <div style={styles.shell}>
      {menuOpen && (
        <div
          style={styles.backdrop}
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        style={{
          ...styles.sidebar,
          ...(menuOpen ? styles.sidebarOpen : styles.sidebarClosed)
        }}
      >
        <div>
          <div style={styles.brandBox}>
            <p style={styles.brandMini}>LinkFlo</p>
            <h2 style={styles.brandTitle}>Admin Panel</h2>
          </div>

          <div style={styles.menuList}>
            {items.map((item) => {
              const active = pathname === item.href

              return (
                <button
                  key={item.href}
                  onClick={() => {
                    router.push(item.href)
                    setMenuOpen(false)
                  }}
                  style={{
                    ...styles.menuItem,
                    ...(active ? styles.menuItemActive : {})
                  }}
                >
                  <span style={styles.menuDot}>•</span>
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div style={styles.sidebarFooter}>
          <button onClick={logoutAndGoLogin} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </aside>

      <main style={styles.main}>
        <div style={styles.topbar}>
          <div style={styles.topbarLeft}>
            <button onClick={() => setMenuOpen(true)} style={styles.menuBtn}>
              ☰
            </button>

            <div>
              <p style={styles.topLabel}>Workspace</p>
              <h3 style={styles.topTitle}>Landing Page System</h3>
            </div>
          </div>
        </div>

        <div>{children}</div>
      </main>
    </div>
  )
}

const styles = {
  loadingWrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f4f7fb"
  },
  loadingCard: {
    background: "white",
    padding: "18px 24px",
    borderRadius: 16,
    boxShadow: "0 12px 32px rgba(15,23,42,.08)",
    color: "#0f172a",
    fontWeight: 600
  },
  shell: {
    minHeight: "100vh",
    background: "#f4f7fb",
    color: "#101828",
    position: "relative"
  },
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.45)",
    zIndex: 30
  },
  sidebar: {
    width: 260,
    background: "#0f172a",
    color: "white",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 40,
    transition: "transform 0.28s ease",
    overflow: "hidden",
    boxSizing: "border-box"
  },
  sidebarOpen: {
    transform: "translateX(0)"
  },
  sidebarClosed: {
    transform: "translateX(-100%)"
  },
  brandBox: {
    padding: 12,
    borderRadius: 20,
    background: "linear-gradient(135deg, rgba(37,99,235,.3), rgba(17,24,39,.3))",
    marginBottom: 18
  },
  brandMini: {
    margin: 0,
    opacity: 0.75,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.2
  },
  brandTitle: {
    margin: "6px 0 0",
    fontSize: 24
  },
  menuList: {
    display: "grid",
    gap: 10
  },
  menuItem: {
    textAlign: "left",
    padding: "14px 16px",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "transparent",
    color: "white",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 10,
    transition: "all 0.2s ease"
  },
  menuItemActive: {
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.16)"
  },
  menuDot: {
    fontSize: 18,
    lineHeight: 1
  },
  sidebarFooter: {
    marginTop: 20
  },
  logoutBtn: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    cursor: "pointer"
  },
  main: {
    minHeight: "100vh",
    padding: 20
  },
  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 20
  },
  topbarLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12
  },
  menuBtn: {
    border: "none",
    borderRadius: 14,
    background: "white",
    boxShadow: "0 10px 24px rgba(15,23,42,.06)",
    width: 44,
    height: 44,
    cursor: "pointer"
  },
  topLabel: {
    margin: 0,
    fontSize: 12,
    color: "#667085",
    textTransform: "uppercase",
    letterSpacing: 1.1
  },
  topTitle: {
    margin: 0
  }
}
