"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { API_URL } from "../../../lib/config"

const labels = {
  zh: { title: "Promoter 资料", desc: "更新个人资料和收款银行资料。Admin 会在结算中心看到这些资料，方便人工转账。", back: "返回 Promoter Dashboard", name: "名字", email: "Email", phone: "电话", username: "Username / Ref", ref: "Ref Code", bank: "收款银行资料", bankName: "银行名字", accountName: "户口名字", accountNumber: "银行户口号码", method: "收款方式", note: "备注 / 额外说明", save: "保存资料", saving: "保存中...", saved: "资料已更新。", failed: "更新失败。", loading: "Loading...", hint: "请确保银行资料正确。LinkFlo 目前是人工 payout，不会自动银行转账。" },
  en: { title: "Promoter Profile", desc: "Update your profile and payout bank details. Admin will see these details in the Settlement Center for manual transfer.", back: "Back to Promoter Dashboard", name: "Name", email: "Email", phone: "Phone", username: "Username / Ref", ref: "Ref Code", bank: "Payout Bank Info", bankName: "Bank Name", accountName: "Account Holder Name", accountNumber: "Bank Account Number", method: "Payout Method", note: "Note / Extra Details", save: "Save Profile", saving: "Saving...", saved: "Profile updated.", failed: "Update failed.", loading: "Loading...", hint: "Please make sure bank details are correct. LinkFlo uses manual payout for now." },
  ms: { title: "Profil Promoter", desc: "Kemas kini profil dan maklumat bank payout. Admin akan lihat maklumat ini di Settlement Center untuk transfer manual.", back: "Kembali ke Dashboard Promoter", name: "Nama", email: "Email", phone: "Telefon", username: "Username / Ref", ref: "Kod Ref", bank: "Maklumat Bank Payout", bankName: "Nama Bank", accountName: "Nama Pemegang Akaun", accountNumber: "Nombor Akaun Bank", method: "Kaedah Payout", note: "Nota / Maklumat Tambahan", save: "Simpan Profil", saving: "Menyimpan...", saved: "Profil dikemas kini.", failed: "Gagal kemas kini.", loading: "Loading...", hint: "Pastikan maklumat bank betul. LinkFlo buat payout manual buat masa ini." },
}

const initial = { name: "", email: "", phone: "", username: "", ref_code: "", bank_name: "", bank_account_name: "", bank_account_number: "", payout_method: "Bank Transfer", payout_note: "" }

export default function PromoterProfilePage() {
  const [lang, setLang] = useState("zh")
  const t = labels[lang] || labels.zh
  const [form, setForm] = useState(initial)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")
  const [err, setErr] = useState("")

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/promoter/me`, { credentials: "include" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || t.failed)
      const p = data.promoter || {}
      setForm({
        name: p.name || "", email: p.email || "", phone: p.phone || "", username: p.username || "", ref_code: p.ref_code || "",
        bank_name: p.bank_name || "", bank_account_name: p.bank_account_name || "", bank_account_number: p.bank_account_number || "",
        payout_method: p.payout_method || "Bank Transfer", payout_note: p.payout_note || "",
      })
    } catch(e) { setErr(e.message || t.failed) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  function set(k,v){ setMsg(""); setErr(""); setForm(p=>({...p,[k]:v})) }
  async function save(e){
    e.preventDefault(); setSaving(true); setMsg(""); setErr("")
    try{
      const res = await fetch(`${API_URL}/api/promoter/me`, { method:"PATCH", credentials:"include", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ name:form.name, phone:form.phone, username:form.username, bankName:form.bank_name, bankAccountName:form.bank_account_name, bankAccountNumber:form.bank_account_number, payoutMethod:form.payout_method, payoutNote:form.payout_note }) })
      const data = await res.json().catch(()=>({}))
      if(!res.ok) throw new Error(data.message || t.failed)
      setForm(p=>({...p,...(data.promoter||{})}))
      setMsg(t.saved)
    }catch(e){ setErr(e.message || t.failed) }
    finally{ setSaving(false) }
  }

  if (loading) return <main className="min-h-screen bg-slate-50 p-10 font-black">{t.loading}</main>
  return <main className="min-h-screen bg-slate-50 px-4 py-10">
    <div className="mx-auto max-w-5xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link href="/promoter" className="rounded-full bg-white px-5 py-3 font-black text-slate-800 shadow">← {t.back}</Link>
        <div className="rounded-full bg-white p-1 shadow">{[["zh","中文"],["en","EN"],["ms","BM"]].map(([k,v])=><button key={k} onClick={()=>setLang(k)} className={`rounded-full px-4 py-2 text-sm font-black ${lang===k?"bg-slate-950 text-white":"text-slate-500"}`}>{v}</button>)}</div>
      </div>
      <form onSubmit={save} className="grid gap-6 lg:grid-cols-[1fr_.9fr]">
        <section className="rounded-[32px] bg-white p-6 shadow-xl">
          <p className="text-xs font-black uppercase tracking-[.24em] text-blue-700">LinkFlo</p>
          <h1 className="mt-2 text-3xl font-black">{t.title}</h1>
          <p className="mt-2 text-sm font-bold leading-7 text-slate-500">{t.desc}</p>
          <div className="mt-6 grid gap-4">
            <Field label={t.name}><input className="input" value={form.name} onChange={e=>set('name',e.target.value)} required /></Field>
            <Field label={t.email}><input className="input bg-slate-100 text-slate-500" value={form.email} disabled readOnly /></Field>
            <div className="grid gap-4 md:grid-cols-2"><Field label={t.phone}><input className="input" value={form.phone} onChange={e=>set('phone',e.target.value)} /></Field><Field label={t.username}><input className="input" value={form.username} onChange={e=>set('username',e.target.value)} required /></Field></div>
            <Field label={t.ref}><input className="input bg-slate-100 text-slate-500" value={form.ref_code} disabled readOnly /></Field>
          </div>
        </section>
        <section className="rounded-[32px] bg-slate-950 p-6 text-white shadow-xl">
          <h2 className="text-2xl font-black">{t.bank}</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-white/55">{t.hint}</p>
          <div className="mt-6 grid gap-4">
            <Field dark label={t.bankName}><input className="input" value={form.bank_name} onChange={e=>set('bank_name',e.target.value)} placeholder="Maybank / CIMB" /></Field>
            <Field dark label={t.accountName}><input className="input" value={form.bank_account_name} onChange={e=>set('bank_account_name',e.target.value)} /></Field>
            <Field dark label={t.accountNumber}><input className="input" value={form.bank_account_number} onChange={e=>set('bank_account_number',e.target.value)} /></Field>
            <Field dark label={t.method}><input className="input" value={form.payout_method} onChange={e=>set('payout_method',e.target.value)} /></Field>
            <Field dark label={t.note}><textarea className="input min-h-24" value={form.payout_note} onChange={e=>set('payout_note',e.target.value)} /></Field>
          </div>
        </section>
        <div className="lg:col-span-2">
          {msg ? <div className="mb-4 rounded-2xl bg-emerald-50 p-4 font-black text-emerald-700">{msg}</div> : null}
          {err ? <div className="mb-4 rounded-2xl bg-red-50 p-4 font-black text-red-700">{err}</div> : null}
          <button disabled={saving} className="w-full rounded-full bg-blue-600 px-6 py-4 font-black text-white shadow-lg transition hover:bg-blue-700 active:scale-[.98] disabled:opacity-60">{saving ? t.saving : t.save}</button>
        </div>
      </form>
    </div>
  </main>
}
function Field({label, children, dark}) { return <label className={`grid gap-2 text-sm font-black ${dark ? 'text-white/80' : 'text-slate-700'}`}>{label}{children}</label> }
