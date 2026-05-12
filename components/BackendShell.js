"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import LanguageSwitch from "./LanguageSwitch"
import AdminAutoTranslator from "./AdminAutoTranslator"

const shellText = {
  zh: { workspace: "工作台", menu: "菜单", close: "关闭", logout: "登出", pending: "待处理" },
  en: { workspace: "Workspace", menu: "Menu", close: "Close", logout: "Logout", pending: "pending" },
  ms: { workspace: "Ruang Kerja", menu: "Menu", close: "Tutup", logout: "Log keluar", pending: "tertunda" },
}

export default function BackendShell({
  brand = "LinkFlo",
  panel = "Dashboard",
  title = "Workspace",
  subtitle = "",
  items = [],
  labels = {},
  lang = "zh",
  notice = {},
  children,
  onLogout,
  hideShell = false,
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const t = shellText[lang] || shellText.zh
  const total = Number(notice.total || 0)

  useEffect(() => { setOpen(false) }, [pathname])

  if (hideShell) return <>{children}</>

  return (
    <div data-backend-ui-shell="true" className="min-h-screen bg-[#f4f8ff] text-slate-950">
      <AdminAutoTranslator />
      {open ? (
        <button
          type="button"
          data-linkflo-mobile-overlay="true"
          className="fixed inset-0 z-30 bg-slate-950/45 md:hidden"
          onClick={() => setOpen(false)}
          aria-label={t.close}
        />
      ) : null}

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[286px] flex-col justify-between border-r border-blue-100 bg-white p-5 shadow-2xl shadow-blue-100/70 transition-transform duration-200 md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div>
          <div className="rounded-[28px] bg-gradient-to-br from-blue-700 via-blue-600 to-sky-400 p-5 text-white shadow-xl shadow-blue-200">
            <p className="m-0 text-xs font-black uppercase tracking-[.18em] text-white/75">{brand}</p>
            <h2 className="mt-2 text-2xl font-black leading-tight">{panel}</h2>
            {subtitle ? <p className="mt-2 text-sm font-bold text-white/75">{subtitle}</p> : null}
            {total > 0 ? <p className="mt-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-black">{total} {t.pending}</p> : null}
          </div>

          <nav className="mt-5 grid gap-2">
            {items.map((item) => {
              const active = pathname === item.href || (item.href !== "/admin" && item.href !== "/merchant" && pathname?.startsWith(item.href))
              const count = item.key ? Number(notice[item.key] || 0) : 0
              const label = labels[item.label] || item.label
              return (
                <button
                  type="button"
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`group flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-black transition active:scale-[.98] ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"}`}
                >
                  <span className="flex items-center gap-3"><span className="text-base">{item.icon || "•"}</span>{label}</span>
                  {count > 0 ? <span className={`grid min-w-6 place-items-center rounded-full px-2 py-1 text-xs ${active ? "bg-white text-blue-700" : "bg-red-500 text-white"}`}>{count}</span> : null}
                </button>
              )
            })}
          </nav>
        </div>

        {onLogout ? (
          <button
            type="button"
            onClick={onLogout}
            className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 font-black text-blue-700 transition hover:bg-blue-100 active:scale-[.98]"
          >
            {labels.logout || t.logout}
          </button>
        ) : null}
      </aside>

      <div className="min-h-screen md:pl-[286px]">
        <header className="sticky top-0 z-20 border-b border-blue-100 bg-white/88 px-4 py-3 shadow-sm shadow-blue-100/50 backdrop-blur-xl md:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="relative grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-2xl font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 active:scale-[.96] md:hidden"
                aria-label={t.menu}
              >
                ☰
                {total > 0 ? <span className="absolute -right-2 -top-2 grid min-w-6 place-items-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">{total}</span> : null}
              </button>
              <div className="min-w-0">
                <p className="m-0 text-xs font-black uppercase tracking-[.18em] text-blue-600">{t.workspace}</p>
                <h1 className="m-0 truncate text-xl font-black text-slate-950 md:text-2xl">{title}</h1>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {total > 0 ? <div className="hidden rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-700 sm:block">🔔 {total}</div> : null}
              <LanguageSwitch />
            </div>
          </div>
        </header>
        <main className="px-4 py-6 md:px-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
