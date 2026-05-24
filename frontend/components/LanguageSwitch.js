'use client'
export default function LanguageSwitch({ lang, setLang }) {
  return <div className="flex gap-2">
    {['zh','en','bm'].map(x => <button key={x} onClick={() => setLang(x)} className={lang===x?'btn':'btn2'}>{x.toUpperCase()}</button>)}
  </div>
}
