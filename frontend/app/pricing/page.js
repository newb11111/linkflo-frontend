"use client"

import Link from "next/link"
import LanguageSwitch from "../../components/LanguageSwitch"
import { useLanguage } from "../../components/TranslateProvider"
import ClientOnly from "../../components/ClientOnly"

const plans = [
  { key: "starter", name: "Starter", price: "RM49.90", limit: "3 SKU", zh: "低门槛测试 AI Funnel 和产品成交链接。", en: "Low-entry plan to test AI Funnel and product conversion links.", ms: "Pakej permulaan untuk uji AI Funnel dan link jualan produk." },
  { key: "growth", name: "Growth", price: "RM3699", limit: "500 SKU", zh: "适合认真建立多一个销售渠道的商家。", en: "For merchants serious about building another sales channel.", ms: "Untuk peniaga yang serius mahu bina saluran jualan tambahan." },
  { key: "scale", name: "Scale", price: "RM12999", limit: "Unlimited SKU", zh: "适合产品线多、想长期做分销渠道的团队。", en: "For teams with many products and long-term distribution plans.", ms: "Untuk pasukan dengan banyak produk dan rancangan pengedaran jangka panjang." },
]

const text = {
  zh: { back: "← 回首页", title: "选择你的 LinkFlo 配套", sub: "Starter / Growth / Scale 都会进入付款流程，付款成功后系统自动开通账号。", choose: "选择并开通", safe: "这里不会公开商家利润、Promoter 佣金或内部结算给顾客。" },
  en: { back: "← Back Home", title: "Choose your LinkFlo plan", sub: "Starter / Growth / Scale all go through payment, then the system activates the account automatically.", choose: "Choose and activate", safe: "Customer-facing pages will not expose merchant profit, promoter commission or internal settlement details." },
  ms: { back: "← Kembali", title: "Pilih pakej LinkFlo", sub: "Starter / Growth / Scale semua melalui pembayaran, kemudian sistem aktifkan akaun secara automatik.", choose: "Pilih dan aktifkan", safe: "Halaman pelanggan tidak akan memaparkan keuntungan peniaga, komisen promoter atau penyelesaian dalaman." },
}

function PricingContent() {
  const { lang } = useLanguage()
  const t = text[lang] || text.zh
  return (
    <main className="min-h-screen bg-[#f4f8ff] px-5 py-10 text-slate-950">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="font-black text-blue-700">{t.back}</Link>
          <LanguageSwitch />
        </div>
        <h1 className="mt-8 max-w-3xl text-5xl font-black tracking-[-.05em]">{t.title}</h1>
        <p className="mt-3 max-w-3xl font-bold leading-7 text-slate-600">{t.sub}</p>
        <p className="mt-4 inline-flex rounded-full bg-white px-5 py-3 text-sm font-black text-slate-600 shadow">{t.safe}</p>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {plans.map((p) => (
            <div key={p.key} className="rounded-[34px] bg-white p-7 shadow-xl">
              <p className="text-sm font-black text-blue-700">{p.name}</p>
              <h2 className="mt-2 text-4xl font-black">{p.price}</h2>
              <p className="mt-1 font-black text-slate-500">{p.limit}</p>
              <p className="mt-4 min-h-[64px] font-bold text-slate-600">{p[lang] || p.zh}</p>
              <Link href={`/merchant/apply?plan=${p.key}`} className="mt-7 block rounded-full bg-blue-700 px-5 py-4 text-center font-black text-white shadow-lg shadow-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-800 active:translate-y-0">{t.choose}</Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

export default function Pricing() { return <ClientOnly><PricingContent /></ClientOnly> }
