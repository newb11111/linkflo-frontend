export default function OrderPageDisabled() {
  return (
    <main className="rounded-[30px] border border-blue-100 bg-white p-8 shadow-xl shadow-blue-100/50">
      <h1 className="text-3xl font-black text-slate-950">Admin 创建页面已关闭</h1>
      <p className="mt-3 font-bold leading-7 text-slate-500">根据现在的 LinkFlo 逻辑，产品 / Funnel Page 只能由 Merchant 端创建。Admin 负责审核、管理、搜索、处理订单和查看数据。</p>
    </main>
  )
}
