"use client"

import { useLanguage } from "./TranslateProvider"

export default function LanguageSwitch({ variant = "light" }) {
  const { lang, setLang } = useLanguage()
  const dark = variant === "dark"
  const wrap = dark
    ? "inline-flex gap-1 rounded-full border border-white/15 bg-white/10 p-1"
    : "inline-flex gap-1 rounded-full border border-blue-100 bg-white/85 p-1 shadow-sm backdrop-blur"
  const btn = (active) => dark
    ? `rounded-full px-3 py-2 text-xs font-black transition ${active ? "bg-white text-blue-700" : "text-white/80 hover:bg-white/10"}`
    : `rounded-full px-3 py-2 text-xs font-black transition ${active ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-blue-50"}`

  return (
    <div className={wrap} aria-label="Language switch">
      <button type="button" onClick={() => setLang("zh")} className={btn(lang === "zh")}>中文</button>
      <button type="button" onClick={() => setLang("en")} className={btn(lang === "en")}>EN</button>
      <button type="button" onClick={() => setLang("ms")} className={btn(lang === "ms")}>BM</button>
    </div>
  )
}
