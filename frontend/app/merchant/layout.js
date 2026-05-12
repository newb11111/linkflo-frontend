"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { API_URL } from "../../lib/config"
import BackendShell from "../../components/BackendShell"
import { useLanguage } from "../../components/TranslateProvider"

const labels = {
  zh: {
    Dashboard: "仪表盘",
    Products: "产品 Funnel",
    Orders: "订单履约",
    Billing: "配套 / 升级",
    Profile: "商家资料",
    Inbox: "Inbox",
    Apply: "申请",
    logout: "登出",
    panel: "Merchant 后台",
    title: "商家销售工作台",
    subtitle: "AI Funnel + Promoter 分销",
  },
  en: {
    Dashboard: "Dashboard",
    Products: "Product Funnels",
    Orders: "Order Fulfillment",
    Billing: "Plan / Upgrade",
    Profile: "Merchant Profile",
    Inbox: "Inbox",
    Apply: "Apply",
    logout: "Logout",
    panel: "Merchant Panel",
    title: "Merchant Sales Workspace",
    subtitle: "AI Funnel + Promoter Distribution",
  },
  ms: {
    Dashboard: "Papan Pemuka",
    Products: "Funnel Produk",
    Orders: "Pengurusan Order",
    Billing: "Pakej / Naik Taraf",
    Profile: "Profil Peniaga",
    Inbox: "Inbox",
    Apply: "Permohonan",
    logout: "Log keluar",
    panel: "Panel Peniaga",
    title: "Ruang Jualan Peniaga",
    subtitle: "AI Funnel + Promoter Distribution",
  },
}

const items = [
  { label: "Dashboard", href: "/merchant", icon: "📊" },
  { label: "Products", href: "/merchant#products", icon: "🧩" },
  { label: "Orders", href: "/merchant/orders", icon: "📦" },
  { label: "Billing", href: "/merchant/billing", icon: "💳" },
  { label: "Profile", href: "/merchant/profile", icon: "👤" },
]

export default function MerchantLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const { lang } = useLanguage()
  const t = labels[lang] || labels.zh
  const [notice, setNotice] = useState({ total: 0 })

  const isPlainPage = pathname === "/merchant/login" || pathname === "/merchant/apply"

  useEffect(() => {
    if (isPlainPage) return
    let alive = true
    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/merchant/orders`, { credentials: "include" })
        const orders = await res.json().catch(() => [])
        if (!alive || !Array.isArray(orders)) return
        const pendingTracking = orders.filter((o) => ["PROCESSING", "PENDING", "PAID"].includes(String(o.status || "").toUpperCase()) && !o.tracking_number).length
        setNotice({ total: pendingTracking, pendingOrders: pendingTracking })
      } catch (_) {}
    }
    load()
    const timer = setInterval(load, 30000)
    return () => { alive = false; clearInterval(timer) }
  }, [isPlainPage])

  async function logout() {
    try { await fetch(`${API_URL}/api/merchant/logout`, { method: "POST", credentials: "include" }) } catch (_) {}
    router.replace("/merchant/login")
  }

  return (
    <BackendShell
      brand="LinkFlo"
      panel={t.panel}
      title={t.title}
      subtitle={t.subtitle}
      items={items}
      labels={t}
      lang={lang}
      notice={notice}
      onLogout={logout}
      hideShell={isPlainPage}
    >
      {children}
    </BackendShell>
  )
}
