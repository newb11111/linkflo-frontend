'use client'
import { LANGS, getSavedLang, setSavedLang, useLanguage } from '../lib/i18n'

export { getSavedLang, setSavedLang }

export default function LanguageToggle({ compact = false }) {
  const { lang, setLang } = useLanguage()
  return (
    <div style={{ display:'inline-flex', gap:6, padding:4, borderRadius:999, background:'rgba(255,255,255,.75)', border:'1px solid rgba(148,163,184,.32)', boxShadow:'0 6px 18px rgba(15,23,42,.06)' }}>
      {LANGS.map(item => (
        <button
          key={item.code}
          type="button"
          onClick={() => setLang(item.code)}
          aria-label={item.label}
          style={{
            border:0,
            cursor:'pointer',
            borderRadius:999,
            padding: compact ? '7px 9px' : '8px 12px',
            fontWeight:900,
            fontSize: compact ? 12 : 13,
            background: lang === item.code ? '#0b5cff' : 'transparent',
            color: lang === item.code ? 'white' : '#334155'
          }}
        >
          {compact ? item.short : item.label}
        </button>
      ))}
    </div>
  )
}
