"use client"

import { useEffect, useMemo, useState } from "react"
import { API_URL } from "../../../lib/config"
import { getAdminHeaders } from "../../../lib/adminAuth"
import { useLanguage } from "../../../components/TranslateProvider"

const money = (v) => `RM ${Number(v || 0).toFixed(2)}`

const copy = {
  zh: {
    badge: "PAYOUT",
    title: "结算中心",
    desc: "人工 payout 管理中心。先用银行 / TNG / 其他方式打款，再回到这里标记已付款并记录 reference，避免重复付款。",
    totalPayable: "商家待结算",
    totalPlatform: "平台收入",
    totalPendingCommission: "Promoter 待处理佣金",
    note: "建议：正式 payout 前，先确认没有退款、可疑订单、售后争议或未完成 tracking。",
    merchantSettlement: "商家结算",
    promoterCommission: "Promoter 佣金",
    payoutHistory: "Payout 历史",
    merchant: "商家",
    promoter: "Promoter",
    email: "Email",
    username: "Username",
    payable: "可结算",
    platform: "平台收入",
    paid: "已打款",
    pending: "Pending",
    available: "可打款",
    action: "操作",
    viewOrders: "查看明细",
    markPaid: "标记已付款",
    noData: "暂无资料",
    loading: "Loading...",
    confirmPayout: "确认付款记录",
    payoutTo: "付款对象",
    amount: "金额",
    method: "付款方式",
    reference: "Reference No.",
    proof: "付款证明 URL（可选）",
    remark: "备注（可选）",
    cancel: "取消",
    confirm: "确认标记已付款",
    saving: "处理中...",
    methodPlaceholder: "Bank Transfer / TNG / Manual",
    referencePlaceholder: "例如银行 transaction id",
    details: "明细",
    close: "关闭",
    product: "产品",
    status: "状态",
    payment: "付款",
    createdAt: "时间",
    commissionStatus: "佣金状态",
    orderAmount: "订单金额",
    merchantNet: "商家到手",
    commission: "佣金",
    paidOut: "已付款",
    type: "类型",
    party: "对象",
    ref: "Reference",
    modalHintMerchant: "这个动作不会自动银行转账；它只是记录你已经手动打款。",
    modalHintPromoter: "这个动作会把该 Promoter 所有 CONFIRMED 佣金标记成 PAID。",
    bankInfo: "银行资料",
    bankName: "银行",
    accountName: "户口名",
    accountNumber: "户口号码",
    payoutMethodSaved: "默认收款方式",
    payoutNote: "收款备注",
    missingBank: "还没填写银行资料",
    success: "已记录 payout。",
    fail: "操作失败，请检查金额或后台。",
  },
  en: {
    badge: "PAYOUT",
    title: "Settlement Center",
    desc: "Manual payout management. Pay by bank / TNG / other methods first, then mark it as paid here with a reference to prevent duplicate payouts.",
    totalPayable: "Merchant Payable",
    totalPlatform: "Platform Revenue",
    totalPendingCommission: "Promoter Commission",
    note: "Suggestion: before payout, confirm there are no refunds, suspicious orders, after-sales disputes, or pending tracking issues.",
    merchantSettlement: "Merchant Settlement",
    promoterCommission: "Promoter Commission",
    payoutHistory: "Payout History",
    merchant: "Merchant",
    promoter: "Promoter",
    email: "Email",
    username: "Username",
    payable: "Payable",
    platform: "Platform Revenue",
    paid: "Paid Out",
    pending: "Pending",
    available: "Available",
    action: "Action",
    viewOrders: "View Details",
    markPaid: "Mark Paid",
    noData: "No data yet",
    loading: "Loading...",
    confirmPayout: "Confirm Payout Record",
    payoutTo: "Payout To",
    amount: "Amount",
    method: "Payment Method",
    reference: "Reference No.",
    proof: "Proof URL (optional)",
    remark: "Remark (optional)",
    cancel: "Cancel",
    confirm: "Confirm Mark Paid",
    saving: "Processing...",
    methodPlaceholder: "Bank Transfer / TNG / Manual",
    referencePlaceholder: "Bank transaction id, for example",
    details: "Details",
    close: "Close",
    product: "Product",
    status: "Status",
    payment: "Payment",
    createdAt: "Date",
    commissionStatus: "Commission Status",
    orderAmount: "Order Amount",
    merchantNet: "Merchant Net",
    commission: "Commission",
    paidOut: "Paid Out",
    type: "Type",
    party: "Party",
    ref: "Reference",
    modalHintMerchant: "This does not trigger an automatic bank transfer; it only records a manual payout you already made.",
    modalHintPromoter: "This will mark all CONFIRMED commission for this promoter as PAID.",
    bankInfo: "Bank Info",
    bankName: "Bank",
    accountName: "Account Name",
    accountNumber: "Account No.",
    payoutMethodSaved: "Default Payout Method",
    payoutNote: "Payout Note",
    missingBank: "Bank info not filled",
    success: "Payout recorded.",
    fail: "Action failed. Check amount or backend response.",
  },
  ms: {
    badge: "PAYOUT",
    title: "Pusat Penyelesaian",
    desc: "Pengurusan payout manual. Bayar melalui bank / TNG / kaedah lain dahulu, kemudian tanda sudah dibayar di sini bersama reference untuk elak bayaran berulang.",
    totalPayable: "Bayaran Peniaga",
    totalPlatform: "Hasil Platform",
    totalPendingCommission: "Komisen Promoter",
    note: "Cadangan: sebelum payout, pastikan tiada refund, order mencurigakan, isu selepas jualan atau tracking belum selesai.",
    merchantSettlement: "Penyelesaian Peniaga",
    promoterCommission: "Komisen Promoter",
    payoutHistory: "Sejarah Payout",
    merchant: "Peniaga",
    promoter: "Promoter",
    email: "Email",
    username: "Username",
    payable: "Boleh Dibayar",
    platform: "Hasil Platform",
    paid: "Sudah Dibayar",
    pending: "Pending",
    available: "Available",
    action: "Tindakan",
    viewOrders: "Lihat Butiran",
    markPaid: "Tanda Dibayar",
    noData: "Tiada data lagi",
    loading: "Loading...",
    confirmPayout: "Sahkan Rekod Payout",
    payoutTo: "Bayar Kepada",
    amount: "Jumlah",
    method: "Kaedah Bayaran",
    reference: "No. Reference",
    proof: "URL Bukti Bayaran (optional)",
    remark: "Nota (optional)",
    cancel: "Batal",
    confirm: "Sahkan Sudah Dibayar",
    saving: "Sedang proses...",
    methodPlaceholder: "Bank Transfer / TNG / Manual",
    referencePlaceholder: "Contoh: transaction id bank",
    details: "Butiran",
    close: "Tutup",
    product: "Produk",
    status: "Status",
    payment: "Bayaran",
    createdAt: "Tarikh",
    commissionStatus: "Status Komisen",
    orderAmount: "Jumlah Order",
    merchantNet: "Peniaga Dapat",
    commission: "Komisen",
    paidOut: "Sudah Dibayar",
    type: "Jenis",
    party: "Pihak",
    ref: "Reference",
    modalHintMerchant: "Ini tidak membuat transfer bank automatik; ia hanya merekod payout manual yang sudah dibuat.",
    modalHintPromoter: "Ini akan menanda semua komisen CONFIRMED promoter ini sebagai PAID.",
    bankInfo: "Maklumat Bank",
    bankName: "Bank",
    accountName: "Nama Akaun",
    accountNumber: "No. Akaun",
    payoutMethodSaved: "Kaedah Payout Default",
    payoutNote: "Nota Payout",
    missingBank: "Maklumat bank belum diisi",
    success: "Payout sudah direkod.",
    fail: "Tindakan gagal. Semak jumlah atau respon backend.",
  },
}

export default function Page() {
  const { lang } = useLanguage()
  const t = copy[lang] || copy.zh
  const [merchants, setMerchants] = useState([])
  const [promoters, setPromoters] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState("")
  const [modal, setModal] = useState(null)
  const [details, setDetails] = useState(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const [m, p, h] = await Promise.all([
        fetch(`${API_URL}/api/admin/wallets/merchants`, { headers: getAdminHeaders() }).then((r) => r.json()).catch(() => []),
        fetch(`${API_URL}/api/admin/wallets/promoters`, { headers: getAdminHeaders() }).then((r) => r.json()).catch(() => []),
        fetch(`${API_URL}/api/admin/wallets/payouts`, { headers: getAdminHeaders() }).then((r) => r.json()).catch(() => []),
      ])
      setMerchants(Array.isArray(m) ? m : [])
      setPromoters(Array.isArray(p) ? p : [])
      setHistory(Array.isArray(h) ? h : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const totals = useMemo(() => ({
    merchantPayable: merchants.reduce((s, m) => s + Number(m.pending_balance || 0), 0),
    platform: merchants.reduce((s, m) => s + Number(m.platform_revenue || 0), 0),
    pendingCommission: promoters.reduce((s, p) => s + Number(p.pending_commission || 0), 0),
    availableCommission: promoters.reduce((s, p) => s + Number(p.available_commission || 0), 0),
  }), [merchants, promoters])

  async function openDetails(type, row) {
    const url = type === "merchant"
      ? `${API_URL}/api/admin/wallets/merchants/${row.id}/orders`
      : `${API_URL}/api/admin/wallets/promoters/${row.id}/orders`
    const data = await fetch(url, { headers: getAdminHeaders() }).then((r) => r.json()).catch(() => [])
    setDetails({ type, row, rows: Array.isArray(data) ? data : [] })
  }

  function openPayout(type, row) {
    const amount = type === "merchant" ? Number(row.pending_balance || 0) : Number(row.available_commission || 0)
    setModal({
      type,
      row,
      amount: money(amount).replace("RM ", ""),
      method: row.payout_method || "Bank Transfer",
      reference: "",
      proofUrl: "",
      note: "",
    })
  }

  async function submitPayout() {
    if (!modal || saving) return
    setSaving(true)
    setToast("")
    try {
      const url = modal.type === "merchant"
        ? `${API_URL}/api/admin/wallets/merchants/${modal.row.id}/mark-paid`
        : `${API_URL}/api/admin/wallets/promoters/${modal.row.id}/mark-paid`
      const body = {
        amount: Number(modal.amount || 0),
        method: modal.method,
        reference: modal.reference,
        proofUrl: modal.proofUrl,
        note: modal.note,
      }
      const res = await fetch(url, {
        method: "POST",
        headers: { ...getAdminHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || t.fail)
      setModal(null)
      setToast(t.success)
      await load()
    } catch (e) {
      setToast(e.message || t.fail)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="space-y-6">
      <section className="rounded-[34px] bg-slate-950 p-7 text-white shadow-2xl shadow-blue-100">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-300">{t.badge}</p>
        <h1 className="mt-3 text-3xl font-black md:text-4xl">{t.title}</h1>
        <p className="mt-3 max-w-4xl font-bold leading-7 text-white/70">{t.desc}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Metric label={t.totalPayable} value={money(totals.merchantPayable)} />
        <Metric label={t.totalPlatform} value={money(totals.platform)} />
        <Metric label={t.totalPendingCommission} value={money(totals.pendingCommission + totals.availableCommission)} />
      </section>

      {toast ? <div className="rounded-3xl bg-blue-50 p-4 font-black text-blue-700">{toast}</div> : null}
      <div className="rounded-3xl bg-amber-50 p-4 font-bold text-amber-800">{t.note}</div>
      {loading ? <div className="rounded-3xl bg-white p-6 font-black text-slate-500 shadow">{t.loading}</div> : null}

      <section className="rounded-[32px] border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/50">
        <h2 className="text-2xl font-black">{t.merchantSettlement}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-3">{t.merchant}</th><th>{t.email}</th><th>{t.bankInfo}</th><th>{t.payable}</th><th>{t.platform}</th><th>{t.paid}</th><th>{t.action}</th>
              </tr>
            </thead>
            <tbody>
              {merchants.map((m) => (
                <tr key={m.id} className="border-t border-slate-100">
                  <td className="py-4 font-black">{m.name}</td>
                  <td className="font-bold text-slate-500">{m.email}</td>
                  <td><BankInfo t={t} row={m} /></td>
                  <td className="font-black text-emerald-700">{money(m.pending_balance)}</td>
                  <td className="font-black text-blue-700">{money(m.platform_revenue)}</td>
                  <td className="font-bold text-slate-500">{money(m.paid_out)}</td>
                  <td className="flex gap-2 py-3">
                    <button onClick={() => openDetails("merchant", m)} className="rounded-full border border-slate-200 px-4 py-2 font-black text-slate-700 transition hover:bg-slate-50 active:scale-[.98]">{t.viewOrders}</button>
                    <button disabled={Number(m.pending_balance || 0) <= 0} onClick={() => openPayout("merchant", m)} className="rounded-full bg-slate-950 px-4 py-2 font-black text-white transition hover:bg-blue-700 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-40">{t.markPaid}</button>
                  </td>
                </tr>
              ))}
              {!merchants.length && !loading ? <tr><td className="py-5 font-bold text-slate-500" colSpan="7">{t.noData}</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-[32px] border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/50">
        <h2 className="text-2xl font-black">{t.promoterCommission}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-3">{t.promoter}</th><th>{t.username}</th><th>{t.bankInfo}</th><th>{t.pending}</th><th>{t.available}</th><th>{t.paid}</th><th>{t.action}</th>
              </tr>
            </thead>
            <tbody>
              {promoters.map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="py-4 font-black">{p.name}</td>
                  <td className="font-bold text-slate-500">{p.username}</td>
                  <td><BankInfo t={t} row={p} /></td>
                  <td className="font-black text-amber-700">{money(p.pending_commission)}</td>
                  <td className="font-black text-emerald-700">{money(p.available_commission)}</td>
                  <td className="font-bold text-slate-500">{money(p.paid_commission)}</td>
                  <td className="flex gap-2 py-3">
                    <button onClick={() => openDetails("promoter", p)} className="rounded-full border border-slate-200 px-4 py-2 font-black text-slate-700 transition hover:bg-slate-50 active:scale-[.98]">{t.viewOrders}</button>
                    <button disabled={Number(p.available_commission || 0) <= 0} onClick={() => openPayout("promoter", p)} className="rounded-full bg-slate-950 px-4 py-2 font-black text-white transition hover:bg-blue-700 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-40">{t.markPaid}</button>
                  </td>
                </tr>
              ))}
              {!promoters.length && !loading ? <tr><td className="py-5 font-bold text-slate-500" colSpan="7">{t.noData}</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-[32px] border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/50">
        <h2 className="text-2xl font-black">{t.payoutHistory}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead><tr className="text-left text-slate-500"><th className="py-3">{t.type}</th><th>{t.party}</th><th>{t.amount}</th><th>{t.method}</th><th>{t.ref}</th><th>{t.createdAt}</th></tr></thead>
            <tbody>
              {history.map((h) => <tr key={h.type + h.id} className="border-t border-slate-100"><td className="py-4 font-black">{h.type}</td><td className="font-bold text-slate-700">{h.party_name || "-"}</td><td className="font-black text-emerald-700">{money(h.amount)}</td><td className="font-bold text-slate-500">{h.payout_method || "-"}</td><td className="font-bold text-slate-500">{h.payout_reference || "-"}</td><td className="font-bold text-slate-500">{h.created_at ? new Date(h.created_at).toLocaleString() : "-"}</td></tr>)}
              {!history.length && !loading ? <tr><td className="py-5 font-bold text-slate-500" colSpan="6">{t.noData}</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>

      {modal ? <PayoutModal t={t} modal={modal} setModal={setModal} saving={saving} submit={submitPayout} /> : null}
      {details ? <DetailsModal t={t} details={details} setDetails={setDetails} /> : null}
    </main>
  )
}

function Metric({ label, value }) {
  return <div className="rounded-[28px] border border-blue-100 bg-white p-5 shadow-xl shadow-blue-100/50"><p className="text-sm font-black text-slate-500">{label}</p><p className="mt-3 text-3xl font-black text-slate-950">{value}</p></div>
}

function PayoutModal({ t, modal, setModal, saving, submit }) {
  const partyName = modal.row.name || modal.row.username || modal.row.email || "-"
  const hint = modal.type === "merchant" ? t.modalHintMerchant : t.modalHintPromoter
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[32px] bg-white p-6 shadow-2xl">
        <h3 className="text-2xl font-black">{t.confirmPayout}</h3>
        <p className="mt-2 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-800">{hint}</p>
        <div className="mt-4 space-y-3">
          <Info label={t.payoutTo} value={partyName} />
          <div className="rounded-2xl bg-blue-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-blue-700">{t.bankInfo}</p><BankInfo t={t} row={modal.row} large /></div>
          <label className="block"><span className="text-sm font-black text-slate-500">{t.amount}</span><input value={modal.amount} onChange={(e)=>setModal({...modal,amount:e.target.value})} disabled={modal.type === "promoter"} className="mt-2 w-full rounded-2xl border p-4 font-black disabled:bg-slate-100" /></label>
          <label className="block"><span className="text-sm font-black text-slate-500">{t.method}</span><input value={modal.method} onChange={(e)=>setModal({...modal,method:e.target.value})} placeholder={t.methodPlaceholder} className="mt-2 w-full rounded-2xl border p-4 font-bold" /></label>
          <label className="block"><span className="text-sm font-black text-slate-500">{t.reference}</span><input value={modal.reference} onChange={(e)=>setModal({...modal,reference:e.target.value})} placeholder={t.referencePlaceholder} className="mt-2 w-full rounded-2xl border p-4 font-bold" /></label>
          <label className="block"><span className="text-sm font-black text-slate-500">{t.proof}</span><input value={modal.proofUrl} onChange={(e)=>setModal({...modal,proofUrl:e.target.value})} className="mt-2 w-full rounded-2xl border p-4 font-bold" /></label>
          <label className="block"><span className="text-sm font-black text-slate-500">{t.remark}</span><textarea value={modal.note} onChange={(e)=>setModal({...modal,note:e.target.value})} className="mt-2 w-full rounded-2xl border p-4 font-bold" rows={3} /></label>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button onClick={() => setModal(null)} className="flex-1 rounded-full border border-slate-200 px-5 py-3 font-black transition hover:bg-slate-50 active:scale-[.98]">{t.cancel}</button>
          <button onClick={submit} disabled={saving} className="flex-1 rounded-full bg-slate-950 px-5 py-3 font-black text-white transition hover:bg-blue-700 active:scale-[.98] disabled:opacity-50">{saving ? t.saving : t.confirm}</button>
        </div>
      </div>
    </div>
  )
}

function DetailsModal({ t, details, setDetails }) {
  const isMerchant = details.type === "merchant"
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[85vh] w-full max-w-5xl overflow-hidden rounded-[32px] bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <div><h3 className="text-2xl font-black">{t.details}</h3><p className="mt-1 font-bold text-slate-500">{details.row.name || details.row.username || details.row.email}</p></div>
          <button onClick={() => setDetails(null)} className="rounded-full bg-slate-950 px-5 py-3 font-black text-white">{t.close}</button>
        </div>
        <div className="mt-5 max-h-[60vh] overflow-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead><tr className="text-left text-slate-500"><th className="py-3">{t.product}</th><th>{t.orderAmount}</th><th>{isMerchant ? t.merchantNet : t.commission}</th><th>{isMerchant ? t.status : t.commissionStatus}</th><th>{t.payment}</th><th>{t.createdAt}</th></tr></thead>
            <tbody>
              {details.rows.map((o) => <tr key={o.id} className="border-t border-slate-100"><td className="py-4 font-black">{o.product_name || o.id}</td><td className="font-bold text-slate-500">{money(o.total_amount)}</td><td className="font-black text-emerald-700">{money(isMerchant ? o.merchant_net_amount : o.commission_amount)}</td><td className="font-bold text-slate-500">{isMerchant ? o.status : o.commission_status}</td><td className="font-bold text-slate-500">{o.payment_status}</td><td className="font-bold text-slate-500">{o.created_at ? new Date(o.created_at).toLocaleString() : "-"}</td></tr>)}
              {!details.rows.length ? <tr><td colSpan="6" className="py-5 font-bold text-slate-500">{t.noData}</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function BankInfo({ t, row, large }) {
  const has = row?.bank_name || row?.bank_account_name || row?.bank_account_number
  if (!has) return <div className={`font-bold ${large ? "text-blue-800" : "text-slate-400"}`}>{t.missingBank}</div>
  return <div className={`${large ? "text-sm" : "text-xs"} leading-6`}>
    <p className="font-black text-slate-800">{row.bank_name || "-"}</p>
    <p className="font-bold text-slate-600">{t.accountName}: {row.bank_account_name || "-"}</p>
    <p className="break-all font-bold text-slate-600">{t.accountNumber}: {row.bank_account_number || "-"}</p>
    {row.payout_method ? <p className="font-bold text-slate-500">{t.payoutMethodSaved}: {row.payout_method}</p> : null}
    {row.payout_note ? <p className="font-bold text-slate-400">{t.payoutNote}: {row.payout_note}</p> : null}
  </div>
}

function Info({ label, value }) {
  return <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 font-black text-slate-950">{value}</p></div>
}
