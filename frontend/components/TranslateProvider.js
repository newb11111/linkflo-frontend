"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

const LanguageContext = createContext({ lang: "zh", setLang: () => {} })

export function TranslateProvider({ children }) {
  const [lang, setLangState] = useState("zh")

  useEffect(() => {
    try {
      const saved = localStorage.getItem("linkflo_lang")
      if (["zh", "en", "ms"].includes(saved)) setLangState(saved)
    } catch {}
  }, [])

  const setLang = (next) => {
    const safe = ["zh", "en", "ms"].includes(next) ? next : "zh"
    setLangState(safe)
    try { localStorage.setItem("linkflo_lang", safe) } catch {}
  }

  const value = useMemo(() => ({ lang, setLang }), [lang])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  return useContext(LanguageContext)
}
