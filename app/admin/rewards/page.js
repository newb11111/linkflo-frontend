import Link from "next/link"

export default function AdminRewardsDisabledPage() {
  return (
    <main>
      <div className="rounded-[30px] border border-blue-100 bg-white p-8 shadow-xl shadow-blue-100/50">
        <h1 className="text-3xl font-black">Rewards 已从主流程移除</h1>
        <p className="mt-3 font-bold leading-7 text-slate-600">Final 版不再做顾客积分兑换系统，避免偏离商家卖货 + Promoter 分销的主轴。</p>
        <Link href="/admin" className="mt-6 inline-block rounded-full bg-blue-600 px-6 py-3 font-black text-white">回 Dashboard</Link>
      </div>
    </main>
  )
}
