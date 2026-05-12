import Link from "next/link"

export default function RewardsDisabledPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ee] px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-[36px] bg-white p-8 text-center shadow-2xl">
        <p className="text-sm font-black uppercase tracking-[.25em] text-blue-600">LinkFlo Final Flow</p>
        <h1 className="mt-4 text-4xl font-black">Rewards / Points 已停用</h1>
        <p className="mt-4 font-bold leading-7 text-slate-600">
          LinkFlo 现在专注在 AI Product Funnel + Promoter 分销成交。顾客主流程只保留：看产品、付款、查订单、售后联系商家。
        </p>
        <Link href="/support" className="mt-6 inline-block rounded-full bg-slate-950 px-6 py-3 font-black text-white">订单售后查询</Link>
      </div>
    </main>
  )
}
