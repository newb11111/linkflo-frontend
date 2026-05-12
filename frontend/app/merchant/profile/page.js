"use client"

import { useEffect, useState } from "react"
import { API_URL } from "../../../lib/config"
import { useLanguage } from "../../../components/TranslateProvider"

const UI = {
  zh: {
    title: "商家资料",
    desc: "更新商家显示资料和收款银行资料。Email 是登入 ID，建议不要在这里更改，避免订单和付款记录混乱。",
    businessName: "商家 / 品牌名称",
    email: "登入 Email",
    phone: "电话",
    whatsapp: "WhatsApp",
    package: "当前配套",
    productLimit: "SKU / Product Limit",
    save: "保存资料",
    saving: "保存中...",
    saved: "商家资料已更新。",
    failed: "更新失败，请再试一次。",
    loading: "Loading...",
    lockedEmail: "Email 是登入 ID。如果需要更改 email，建议由 Admin 后台处理。",
    accountCard: "账号状态",
    active: "已启用",
    inactive: "未启用",
    profileCard: "基本资料",
    payoutCard: "收款银行资料",
    payoutDesc: "Admin 会在结算中心看到这些资料，方便人工转账给你。",
    bankName: "银行名字",
    bankAccountName: "户口名字",
    bankAccountNumber: "银行户口号码",
    payoutMethod: "收款方式",
    payoutNote: "备注 / 额外说明",
    bankHint: "请确认户口名字和号码正确。LinkFlo 目前是人工 payout，不会自动银行转账。",
  },
  en: {
    title: "Merchant Profile",
    desc: "Update merchant display details and payout bank information. Email is used for login and should not be changed here.",
    businessName: "Merchant / Brand Name",
    email: "Login Email",
    phone: "Phone",
    whatsapp: "WhatsApp",
    package: "Current Package",
    productLimit: "SKU / Product Limit",
    save: "Save Profile",
    saving: "Saving...",
    saved: "Merchant profile updated.",
    failed: "Update failed. Please try again.",
    loading: "Loading...",
    lockedEmail: "Email is your login ID. Ask Admin to change it if needed.",
    accountCard: "Account Status",
    active: "Active",
    inactive: "Inactive",
    profileCard: "Basic Profile",
    payoutCard: "Payout Bank Info",
    payoutDesc: "Admin will see these details in the Settlement Center for manual transfer.",
    bankName: "Bank Name",
    bankAccountName: "Account Holder Name",
    bankAccountNumber: "Bank Account Number",
    payoutMethod: "Payout Method",
    payoutNote: "Note / Extra Details",
    bankHint: "Please make sure the account name and number are correct. LinkFlo uses manual payout for now.",
  },
  ms: {
    title: "Profil Peniaga",
    desc: "Kemas kini maklumat paparan peniaga dan maklumat bank payout. Email digunakan untuk login dan tidak digalakkan diubah di sini.",
    businessName: "Nama Peniaga / Jenama",
    email: "Email Login",
    phone: "Telefon",
    whatsapp: "WhatsApp",
    package: "Pakej Semasa",
    productLimit: "Had SKU / Produk",
    save: "Simpan Profil",
    saving: "Menyimpan...",
    saved: "Profil peniaga telah dikemas kini.",
    failed: "Gagal kemas kini. Sila cuba lagi.",
    loading: "Loading...",
    lockedEmail: "Email ialah ID login. Minta Admin tukar jika perlu.",
    accountCard: "Status Akaun",
    active: "Aktif",
    inactive: "Tidak aktif",
    profileCard: "Profil Asas",
    payoutCard: "Maklumat Bank Payout",
    payoutDesc: "Admin akan melihat maklumat ini di Settlement Center untuk transfer manual.",
    bankName: "Nama Bank",
    bankAccountName: "Nama Pemegang Akaun",
    bankAccountNumber: "Nombor Akaun Bank",
    payoutMethod: "Kaedah Payout",
    payoutNote: "Nota / Maklumat Tambahan",
    bankHint: "Pastikan nama akaun dan nombor akaun betul. LinkFlo buat payout manual buat masa ini.",
  },
}

const initial = {
  name: "", email: "", phone: "", whatsapp: "", package_type: "", product_limit: 0, is_active: true,
  bank_name: "", bank_account_name: "", bank_account_number: "", payout_method: "Bank Transfer", payout_note: "",
}

export default function MerchantProfilePage() {
  const { lang } = useLanguage()
  const t = UI[lang] || UI.zh
  const [form, setForm] = useState(initial)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function load() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${API_URL}/api/merchant/me`, { credentials: "include" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || t.failed)
      const m = data.merchant || {}
      setForm({
        name: m.name || "",
        email: m.email || "",
        phone: m.phone || "",
        whatsapp: m.whatsapp || "",
        package_type: m.package_type || "starter",
        product_limit: m.product_limit || 0,
        is_active: m.is_active !== false,
        bank_name: m.bank_name || "",
        bank_account_name: m.bank_account_name || "",
        bank_account_number: m.bank_account_number || "",
        payout_method: m.payout_method || "Bank Transfer",
        payout_note: m.payout_note || "",
      })
    } catch (err) {
      setError(err.message || t.failed)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function set(key, value) {
    setMessage("")
    setError("")
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    setMessage("")
    setError("")
    try {
      const res = await fetch(`${API_URL}/api/merchant/me`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          whatsapp: form.whatsapp,
          bankName: form.bank_name,
          bankAccountName: form.bank_account_name,
          bankAccountNumber: form.bank_account_number,
          payoutMethod: form.payout_method,
          payoutNote: form.payout_note,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || t.failed)
      const m = data.merchant || {}
      setForm((prev) => ({ ...prev, ...m }))
      setMessage(t.saved)
    } catch (err) {
      setError(err.message || t.failed)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="rounded-[28px] bg-white p-8 font-black shadow">{t.loading}</div>

  return (
    <form onSubmit={save} className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
      <section className="rounded-[32px] bg-white p-6 shadow-xl shadow-blue-100/60">
        <p className="text-xs font-black uppercase tracking-[.22em] text-blue-600">LinkFlo</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">{t.title}</h1>
        <p className="mt-2 max-w-2xl text-sm font-bold leading-7 text-slate-500">{t.desc}</p>

        <div className="mt-6 grid gap-6">
          <div className="rounded-[28px] border border-slate-100 bg-slate-50 p-5">
            <h2 className="text-xl font-black text-slate-950">{t.profileCard}</h2>
            <div className="mt-4 grid gap-4">
              <Field label={t.businessName}><input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} required /></Field>
              <Field label={t.email}><input className="input bg-slate-100 text-slate-500" value={form.email} disabled readOnly /><span className="text-xs font-bold leading-5 text-slate-400">{t.lockedEmail}</span></Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={t.phone}><input className="input" value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} /></Field>
                <Field label={t.whatsapp}><input className="input" value={form.whatsapp || ""} onChange={(e) => set("whatsapp", e.target.value)} /></Field>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-emerald-100 bg-emerald-50/60 p-5">
            <h2 className="text-xl font-black text-slate-950">{t.payoutCard}</h2>
            <p className="mt-2 text-sm font-bold leading-6 text-slate-500">{t.payoutDesc}</p>
            <div className="mt-4 grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={t.bankName}><input className="input" value={form.bank_name || ""} onChange={(e) => set("bank_name", e.target.value)} placeholder="Maybank / CIMB / Public Bank" /></Field>
                <Field label={t.payoutMethod}><input className="input" value={form.payout_method || ""} onChange={(e) => set("payout_method", e.target.value)} placeholder="Bank Transfer" /></Field>
              </div>
              <Field label={t.bankAccountName}><input className="input" value={form.bank_account_name || ""} onChange={(e) => set("bank_account_name", e.target.value)} /></Field>
              <Field label={t.bankAccountNumber}><input className="input" value={form.bank_account_number || ""} onChange={(e) => set("bank_account_number", e.target.value)} /></Field>
              <Field label={t.payoutNote}><textarea className="input min-h-24" value={form.payout_note || ""} onChange={(e) => set("payout_note", e.target.value)} /></Field>
              <div className="rounded-2xl bg-white p-4 text-sm font-bold leading-6 text-amber-700">{t.bankHint}</div>
            </div>
          </div>

          {message ? <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-black text-emerald-700">{message}</div> : null}
          {error ? <div className="rounded-2xl bg-red-50 p-4 text-sm font-black text-red-700">{error}</div> : null}

          <button disabled={saving} className="rounded-2xl bg-blue-600 px-5 py-4 font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 active:scale-[.98] disabled:opacity-60">
            {saving ? t.saving : t.save}
          </button>
        </div>
      </section>

      <aside className="rounded-[32px] bg-slate-950 p-6 text-white shadow-xl shadow-slate-200">
        <p className="text-xs font-black uppercase tracking-[.22em] text-blue-300">{t.accountCard}</p>
        <div className="mt-6 grid gap-4">
          <SideMetric label={t.package} value={(form.package_type || "starter").toUpperCase()} />
          <SideMetric label={t.productLimit} value={Number(form.product_limit || 0)} />
          <div className="rounded-3xl bg-white/8 p-5"><p className="text-sm font-bold text-white/50">Status</p><h2 className={`mt-2 text-2xl font-black ${form.is_active ? "text-emerald-300" : "text-red-300"}`}>{form.is_active ? t.active : t.inactive}</h2></div>
          <div className="rounded-3xl bg-white/8 p-5"><p className="text-sm font-bold text-white/50">{t.payoutCard}</p><p className="mt-2 text-sm font-black text-white">{form.bank_name || "-"}</p><p className="mt-1 break-all text-sm font-bold text-white/60">{form.bank_account_name || "-"}<br />{form.bank_account_number || "-"}</p></div>
        </div>
      </aside>
    </form>
  )
}

function Field({ label, children }) {
  return <label className="grid gap-2 text-sm font-black text-slate-700">{label}{children}</label>
}
function SideMetric({ label, value }) {
  return <div className="rounded-3xl bg-white/8 p-5"><p className="text-sm font-bold text-white/50">{label}</p><h2 className="mt-2 text-2xl font-black">{value}</h2></div>
}
