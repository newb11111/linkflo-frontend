"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { API_URL } from "../../lib/config"
import { getAdminPassword, getAdminHeaders } from "../../lib/adminAuth"
import LanguageSwitch from "../../components/LanguageSwitch"
import AdminAutoTranslator from "../../components/AdminAutoTranslator"
import { useLanguage } from "../../components/TranslateProvider"

const labels = {
  zh: {Dashboard:"仪表盘", Customers:"顾客", Products:"产品", Orders:"订单", Suspicious:"可疑订单", Merchants:"商家", Promoters:"Promoter", Wallets:"钱包", "Audit Logs":"操作日志", Reports:"报表", logout:"登出", workspace:"工作台", title:"LinkFlo 控制台", panel:"Admin 后台"},
  en: {Dashboard:"Dashboard", Customers:"Customers", Products:"Products", Orders:"Orders", Suspicious:"Suspicious", Merchants:"Merchants", Promoters:"Promoters", Wallets:"Wallets", "Audit Logs":"Audit Logs", Reports:"Reports", logout:"Logout", workspace:"Workspace", title:"LinkFlo Console", panel:"Admin Panel"},
  ms: {Dashboard:"Papan Pemuka", Customers:"Pelanggan", Products:"Produk", Orders:"Order", Suspicious:"Mencurigakan", Merchants:"Peniaga", Promoters:"Promoter", Wallets:"Wallet", "Audit Logs":"Log Aktiviti", Reports:"Laporan", logout:"Log keluar", workspace:"Ruang Kerja", title:"Konsol LinkFlo", panel:"Panel Admin"}
}

const items = [
  { label: "Dashboard", href: "/admin", key: "dashboard" },
  { label: "Products", href: "/admin/products", key: "pendingProducts" },
  { label: "Orders", href: "/admin/orders", key: "pendingOrders" },
  { label: "Merchants", href: "/admin/merchants" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Promoters", href: "/admin/promoters" },
  { label: "Suspicious", href: "/admin/suspicious", key: "suspiciousOrders" },
  { label: "Wallets", href: "/admin/wallets" },
  { label: "Audit Logs", href: "/admin/audit-logs" },
  { label: "Reports", href: "/admin/reports" }
]

const IDLE_TIMEOUT = 15 * 60 * 1000

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const { lang } = useLanguage()
  const t = labels[lang] || labels.zh

  const [menuOpen, setMenuOpen] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [notice, setNotice] = useState({ total: 0 })
  const idleTimerRef = useRef(null)
  const isLoginPage = pathname === "/admin/login"

  const logoutAndGoLogin = async () => {
    try {
      await fetch(`${API_URL}/api/admin/logout`, { method: "POST", headers: getAdminHeaders({ "Content-Type": "application/json" }) })
    } catch (_) {}
    finally {
      if (typeof window !== "undefined") localStorage.removeItem("admin_password")
      router.replace("/admin/login")
    }
  }

  useEffect(() => {
    if (isLoginPage) { setCheckingAuth(false); return }
    const checkAuth = async () => {
      try {
        if (!getAdminPassword()) { router.replace("/admin/login"); return }
        const res = await fetch(`${API_URL}/api/admin/check`, { headers: getAdminHeaders() })
        const data = await res.json()
        if (!res.ok || !data.loggedIn) {
          if (typeof window !== "undefined") localStorage.removeItem("admin_password")
          router.replace("/admin/login")
          return
        }
      } catch (_) {
        if (typeof window !== "undefined") localStorage.removeItem("admin_password")
        router.replace("/admin/login")
        return
      } finally { setCheckingAuth(false) }
    }
    checkAuth()
  }, [isLoginPage, router])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  useEffect(() => {
    if (isLoginPage || checkingAuth) return
    const loadNotices = async () => {
      try {
        const data = await fetch(`${API_URL}/api/admin/notifications/summary`, { headers: getAdminHeaders() }).then(r => r.json())
        setNotice(data || { total: 0 })
      } catch (_) {}
    }
    loadNotices()
    const timer = setInterval(loadNotices, 30000)
    return () => clearInterval(timer)
  }, [isLoginPage, checkingAuth])

  useEffect(() => {
    if (isLoginPage) return
    const resetIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      idleTimerRef.current = setTimeout(logoutAndGoLogin, IDLE_TIMEOUT)
    }
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"]
    events.forEach((event) => window.addEventListener(event, resetIdleTimer))
    resetIdleTimer()
    return () => {
      events.forEach((event) => window.removeEventListener(event, resetIdleTimer))
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [isLoginPage])

  if (isLoginPage) return <>{children}</>
  if (checkingAuth) return <div className="grid min-h-screen place-items-center bg-blue-50"><div className="rounded-3xl bg-white px-6 py-5 font-black text-slate-700 shadow-xl">Checking admin access...</div></div>

  return (
    <div data-admin-shell="true" className="min-h-screen bg-[#f4f8ff] text-slate-950">
      <AdminAutoTranslator />
      {menuOpen ? <button data-linkflo-mobile-overlay="true" className="fixed inset-0 z-30 bg-slate-950/45 md:hidden" onClick={() => setMenuOpen(false)} aria-label="Close menu" /> : null}

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col justify-between border-r border-blue-100 bg-white p-5 shadow-2xl shadow-blue-100/80 transition-transform duration-200 md:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div>
          <div className="rounded-[28px] bg-gradient-to-br from-blue-600 to-sky-400 p-5 text-white shadow-xl shadow-blue-200">
            <p className="m-0 text-xs font-black uppercase tracking-widest text-white/75">LinkFlo</p>
            <h2 className="mt-2 text-2xl font-black">{t.panel}</h2>
            <p className="mt-2 text-sm font-bold text-white/75">{notice.total || 0} {lang === "zh" ? "待处理" : lang === "ms" ? "tertunda" : "pending"}</p>
          </div>

          <div className="mt-5 grid gap-2">
            {items.map((item) => {
              const active = pathname === item.href
              const count = item.key ? Number(notice[item.key] || 0) : 0
              return (
                <button key={item.href} onClick={() => router.push(item.href)} className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-black transition active:scale-[.98] ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"}`}>
                  <span>{t[item.label] || item.label}</span>
                  {count > 0 ? <span className={`grid min-w-6 place-items-center rounded-full px-2 py-1 text-xs ${active ? "bg-white text-blue-700" : "bg-red-500 text-white"}`}>{count}</span> : null}
                </button>
              )
            })}
          </div>
        </div>
        <button onClick={logoutAndGoLogin} className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 font-black text-blue-700 transition hover:bg-blue-100 active:scale-[.98]">{t.logout}</button>
      </aside>

      <main className="min-h-screen p-4 md:pl-[304px] md:pr-6 md:py-6">
        <div className="sticky top-0 z-20 mb-6 rounded-[28px] border border-blue-100 bg-white/88 p-4 shadow-xl shadow-blue-100/60 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setMenuOpen(true)} className="relative grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-2xl font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 active:scale-[.96] md:hidden">
                ☰
                {notice.total > 0 ? <span className="absolute -right-2 -top-2 grid min-w-6 place-items-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">{notice.total}</span> : null}
              </button>
              <div>
                <p className="m-0 text-xs font-black uppercase tracking-widest text-blue-600">{t.workspace}</p>
                <h3 className="m-0 text-xl font-black text-slate-950">{t.title}</h3>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-700 sm:block">🔔 {notice.total || 0}</div>
              <LanguageSwitch />
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  )
}
