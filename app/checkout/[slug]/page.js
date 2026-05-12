"use client"
import { useEffect, useRef, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { API_URL } from "../../../lib/config"
import { api, formatMoney } from "../../../lib/customerApi"

const emptyAddress = { label: "Default", name: "", phone: "", email: "", address1: "", address2: "", city: "", state: "", postcode: "", country: "Malaysia", saveAddress: true }
const emptyBuyer = { name: "", email: "", phone: "" }

function getDeviceId() {
  if (typeof window === 'undefined') return ''
  let id = window.localStorage.getItem('lf_device_id')
  if (!id) {
    id = `dev_${Date.now()}_${Math.random().toString(36).slice(2)}`
    window.localStorage.setItem('lf_device_id', id)
  }
  document.cookie = `lf_device_id=${id}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
  return id
}

function isValidEmail(v = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim())
}

export default function Page() {
  const { slug } = useParams()
  const r = useRouter()
  const sp = useSearchParams()
  const ref = sp.get("ref") || ""
  const [p, setP] = useState(null)
  const [u, setU] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [addressId, setAddressId] = useState("")
  const [address, setAddress] = useState(emptyAddress)
  const [buyer, setBuyer] = useState(emptyBuyer)
  const [e, setE] = useState("")
  const [l, setL] = useState(false)
  const checkoutKeyRef = useRef(`checkout_${Date.now()}_${Math.random().toString(36).slice(2)}`)

  useEffect(() => {
    ;(async () => {
      // Guest checkout is allowed. Customer login is optional and only used for address book / account order history.
      try {
        const me = await api("/api/customer/me")
        setU(me.user)
        setBuyer((prev) => ({
          name: prev.name || me.user?.name || "",
          email: prev.email || me.user?.email || "",
          phone: prev.phone || me.user?.phone || "",
        }))
        setAddress((prev) => ({
          ...prev,
          name: prev.name || me.user?.name || "",
          email: prev.email || me.user?.email || "",
          phone: prev.phone || me.user?.phone || "",
        }))
        const addr = await api("/api/customer/addresses").catch(() => [])
        setAddresses(Array.isArray(addr) ? addr : [])
        const def = Array.isArray(addr) ? addr.find((x) => x.is_default) || addr[0] : null
        if (def) setAddressId(def.id)
      } catch {
        setU(null)
        setAddresses([])
      }

      const res = await fetch(`${API_URL}/api/products/${slug}${ref ? `?ref=${ref}` : ""}`, { credentials: "include" })
      const j = await res.json()
      setP(j.product)
    })()
  }, [slug, ref])

  function setAddr(k, v) { setAddress((prev) => ({ ...prev, [k]: v })) }
  function setBuyerField(k, v) {
    setBuyer((prev) => ({ ...prev, [k]: v }))
    if (["name", "phone", "email"].includes(k)) setAddress((prev) => ({ ...prev, [k]: prev[k] || v }))
  }

  async function pay() {
    if (l) return
    setL(true)
    setE("")
    try {
      const finalBuyer = {
        name: String(buyer.name || address.name || "").trim(),
        email: String(buyer.email || address.email || "").trim(),
        phone: String(buyer.phone || address.phone || "").trim(),
      }
      if (!finalBuyer.name) throw new Error("请填写名字")
      if (!isValidEmail(finalBuyer.email)) throw new Error("请填写正确 Email")
      if (!finalBuyer.phone) throw new Error("请填写电话号码")

      const deviceId = getDeviceId()
      const body = { productSlug: slug, ref, customer: finalBuyer, idempotencyKey: checkoutKeyRef.current, deviceId }
      if ((p?.productType || "PHYSICAL") === "PHYSICAL") {
        if (addressId) {
          body.addressId = addressId
        } else {
          if (!address.address1) throw new Error("请填写地址 1")
          body.shippingAddress = {
            ...address,
            name: address.name || finalBuyer.name,
            email: address.email || finalBuyer.email,
            phone: address.phone || finalBuyer.phone,
          }
        }
      }
      const out = await api("/api/checkout", { method: "POST", headers: { "X-Idempotency-Key": checkoutKeyRef.current, "X-Device-Id": deviceId }, body: JSON.stringify(body) })
      if (out.paymentUrl) {
        window.location.href = out.paymentUrl
      } else {
        r.push(out.redirectUrl)
      }
    } catch (x) {
      setE(x.message)
    } finally {
      setL(false)
    }
  }

  if (!p) return <main className="p-10 font-bold">Loading...</main>
  const type = p.productType || "PHYSICAL"

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-[36px] bg-white p-8 shadow-2xl">
        <Link href={`/p/${slug}${ref ? `?ref=${ref}` : ""}`} className="text-sm font-black text-blue-700">← 返回产品页</Link>
        <h1 className="mt-5 text-4xl font-black">确认购买</h1>
        <p className="mt-3 text-sm font-bold text-slate-500">不用注册也可以下单。付款成功后，用 Order ID + Email / 电话查询订单。</p>
        <div className="mt-8 flex gap-5 rounded-[28px] bg-slate-50 p-5">
          <div className="h-24 w-24 overflow-hidden rounded-2xl bg-slate-200">{p.image ? <img src={p.image} className="h-full w-full object-cover" alt={p.name} /> : null}</div>
          <div>
            <h2 className="text-2xl font-black">{p.name}</h2>
            <p className="mt-2 text-slate-500">{p.category} · {type === "PHYSICAL" ? "实体产品" : type === "DIGITAL" ? "数字/Software" : "服务/预约"}</p>
            <p className="mt-3 text-2xl font-black">{formatMoney(p.price)}</p>
            <p className="mt-2 text-xs font-bold text-slate-500">支付通道手续费由商家结算端承担，顾客付款价格不变。</p>
          </div>
        </div>

        <section className="mt-6 rounded-3xl border p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black">联系资料</h2>
            {u ? <span className="rounded-full bg-green-50 px-4 py-2 text-xs font-black text-green-700">已登入：{u.email}</span> : <Link href={`/auth?next=/checkout/${slug}${ref ? `?ref=${ref}` : ""}`} className="rounded-full bg-blue-50 px-4 py-2 text-xs font-black text-blue-700">已有账号？可登入</Link>}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <input className="rounded-2xl border p-4" placeholder="名字" value={buyer.name} onChange={(e) => setBuyerField("name", e.target.value)} />
            <input className="rounded-2xl border p-4" placeholder="Email" value={buyer.email} onChange={(e) => setBuyerField("email", e.target.value)} />
            <input className="rounded-2xl border p-4" placeholder="电话，例如 +60184664667" value={buyer.phone} onChange={(e) => setBuyerField("phone", e.target.value)} />
          </div>
        </section>

        {type === "PHYSICAL" ? (
          <section className="mt-6 rounded-3xl border p-5">
            <h2 className="text-xl font-black">收货地址</h2>
            {addresses.length ? (
              <select className="mt-3 w-full rounded-2xl border p-4" value={addressId} onChange={(e) => setAddressId(e.target.value)}>
                {addresses.map((a) => <option key={a.id} value={a.id}>{a.label || "地址"} · {a.name} · {a.phone} · {a.address1}</option>)}
                <option value="">使用新地址</option>
              </select>
            ) : null}
            {!addressId ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input className="rounded-2xl border p-4" placeholder="收件人名字" value={address.name} onChange={(e) => setAddr("name", e.target.value)} />
                <input className="rounded-2xl border p-4" placeholder="电话" value={address.phone} onChange={(e) => setAddr("phone", e.target.value)} />
                <input className="rounded-2xl border p-4 sm:col-span-2" placeholder="地址 1" value={address.address1} onChange={(e) => setAddr("address1", e.target.value)} />
                <input className="rounded-2xl border p-4 sm:col-span-2" placeholder="地址 2" value={address.address2} onChange={(e) => setAddr("address2", e.target.value)} />
                <input className="rounded-2xl border p-4" placeholder="City" value={address.city} onChange={(e) => setAddr("city", e.target.value)} />
                <input className="rounded-2xl border p-4" placeholder="State" value={address.state} onChange={(e) => setAddr("state", e.target.value)} />
                <input className="rounded-2xl border p-4" placeholder="Postcode" value={address.postcode} onChange={(e) => setAddr("postcode", e.target.value)} />
                {u ? <label className="flex items-center gap-2 rounded-2xl bg-slate-50 p-4 font-bold"><input type="checkbox" checked={address.saveAddress} onChange={(e) => setAddr("saveAddress", e.target.checked)} /> 保存到地址簿</label> : <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">Guest checkout 不会保存地址</div>}
              </div>
            ) : null}
          </section>
        ) : (
          <p className="mt-6 rounded-2xl bg-blue-50 p-4 font-bold text-blue-700">{type === "DIGITAL" ? "付款后会在订单详情显示数字产品交付内容。" : "付款后会在订单详情显示预约/服务说明。"}</p>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-blue-50 p-5"><b className="text-blue-700">付款后</b><p className="text-xl font-black">订单进入商家后台处理</p></div>
          <div className="rounded-3xl bg-amber-50 p-5"><b className="text-amber-700">订单查询提醒</b><p className="text-xl font-black">付款后记得保存 Order ID 和 Email / 电话，用来查询 tracking。</p></div>
        </div>
        {e ? <p className="mt-5 rounded-2xl bg-red-50 p-4 font-bold text-red-700">{e}</p> : null}
        <button onClick={pay} disabled={l} className="mt-8 w-full rounded-full bg-slate-950 py-5 text-lg font-black text-white">{l ? "处理中..." : "去 Billplz 安全付款"}</button>
      </div>
    </main>
  )
}
