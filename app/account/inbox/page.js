import Link from "next/link"

export default function AccountInboxDisabledPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ee] px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-[36px] bg-white p-8 text-center shadow-2xl">
        <h1 className="text-4xl font-black">Inbox 已停用</h1>
        <p className="mt-4 font-bold leading-7 text-slate-600">LinkFlo 不做站内聊天。付款后如需售后，请到订单详情查看商家 WhatsApp 或 tracking。</p>
        <Link href="/account" className="mt-6 inline-block rounded-full bg-slate-950 px-6 py-3 font-black text-white">我的订单</Link>
      </div>
    </main>
  )
}
