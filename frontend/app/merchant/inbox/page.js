import Link from "next/link"

export default function MerchantInboxDisabledPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ee] px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-[36px] bg-white p-8 text-center shadow-2xl">
        <h1 className="text-4xl font-black">Merchant Inbox 已停用</h1>
        <p className="mt-4 font-bold leading-7 text-slate-600">Final 版让 Product Funnel 提前处理顾客疑虑。售后由订单详情里的 WhatsApp 交给商家处理。</p>
        <Link href="/merchant/orders" className="mt-6 inline-block rounded-full bg-slate-950 px-6 py-3 font-black text-white">处理订单</Link>
      </div>
    </main>
  )
}
