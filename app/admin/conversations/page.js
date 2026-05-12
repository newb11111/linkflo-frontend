import Link from "next/link"

export default function AdminConversationsDisabledPage() {
  return (
    <main>
      <div className="rounded-[30px] border border-blue-100 bg-white p-8 shadow-xl shadow-blue-100/50">
        <h1 className="text-3xl font-black">Conversation 已停用</h1>
        <p className="mt-3 font-bold leading-7 text-slate-600">Final 版不提供聊天按钮。所有疑虑由 Product Funnel 提前说明，售后则通过订单号查询后交由商家 WhatsApp 处理。</p>
        <Link href="/admin" className="mt-6 inline-block rounded-full bg-blue-600 px-6 py-3 font-black text-white">回 Dashboard</Link>
      </div>
    </main>
  )
}
