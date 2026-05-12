"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import LanguageSwitch from "./LanguageSwitch"
import { useLanguage } from "./TranslateProvider"

// Public / account UI translator. It is intentionally separate from Product Funnel content translation.
// It skips product content containers so changing backend/UI language will not rewrite product copy or images.
const LANGS = ["zh", "en", "ms"]
const TEXT = {
  // common
  "Loading...": { zh: "加载中...", en: "Loading...", ms: "Sedang memuatkan..." },
  "Page not found.": { zh: "找不到页面。", en: "Page not found.", ms: "Halaman tidak dijumpai." },
  "Product not found": { zh: "找不到产品", en: "Product not found", ms: "Produk tidak dijumpai" },
  "Back": { zh: "返回", en: "Back", ms: "Kembali" },
  "Back home": { zh: "返回首页", en: "Back home", ms: "Kembali ke homepage" },
  "← Back home": { zh: "← 回首页", en: "← Back home", ms: "← Kembali" },
  "← 回首页": { zh: "← 回首页", en: "← Back home", ms: "← Kembali" },
  "← Kembali": { zh: "← 回首页", en: "← Back home", ms: "← Kembali" },
  "Submit": { zh: "提交", en: "Submit", ms: "Hantar" },
  "Save": { zh: "保存", en: "Save", ms: "Simpan" },
  "Cancel": { zh: "取消", en: "Cancel", ms: "Batal" },
  "Email": { zh: "Email", en: "Email", ms: "Email" },
  "Password": { zh: "密码", en: "Password", ms: "Kata Laluan" },
  "Name": { zh: "名字", en: "Name", ms: "Nama" },
  "Phone": { zh: "电话", en: "Phone", ms: "Telefon" },
  "Status": { zh: "状态", en: "Status", ms: "Status" },
  "Order": { zh: "订单", en: "Order", ms: "Order" },
  "Orders": { zh: "订单", en: "Orders", ms: "Order" },
  "Tracking": { zh: "物流追踪", en: "Tracking", ms: "Tracking" },
  "Tracking Number": { zh: "Tracking Number", en: "Tracking Number", ms: "Nombor Tracking" },
  "Customer": { zh: "顾客", en: "Customer", ms: "Pelanggan" },
  "Merchant": { zh: "商家", en: "Merchant", ms: "Peniaga" },
  "Promoter": { zh: "Promoter", en: "Promoter", ms: "Promoter" },
  "Login": { zh: "登入", en: "Login", ms: "Log masuk" },
  "Logout": { zh: "登出", en: "Logout", ms: "Log keluar" },
  "Register": { zh: "注册", en: "Register", ms: "Daftar" },
  "Apply": { zh: "申请", en: "Apply", ms: "Mohon" },
  "Dashboard": { zh: "仪表盘", en: "Dashboard", ms: "Papan Pemuka" },
  "Copy": { zh: "复制", en: "Copy", ms: "Salin" },
  "Copied": { zh: "已复制", en: "Copied", ms: "Disalin" },
  "Open": { zh: "打开", en: "Open", ms: "Buka" },
  "View": { zh: "查看", en: "View", ms: "Lihat" },

  // auth / login
  "Merchant Login": { zh: "商家登入", en: "Merchant Login", ms: "Log Masuk Peniaga" },
  "Promoter Login": { zh: "Promoter 登入", en: "Promoter Login", ms: "Log Masuk Promoter" },
  "Admin Login": { zh: "Admin 登入", en: "Admin Login", ms: "Log Masuk Admin" },
  "Customer Login": { zh: "顾客登入", en: "Customer Login", ms: "Log Masuk Pelanggan" },
  "Go to Login": { zh: "去登入", en: "Go to Login", ms: "Pergi Log Masuk" },
  "Login failed": { zh: "登入失败", en: "Login failed", ms: "Log masuk gagal" },

  "商家登录后处理订单和 tracking。": { zh: "商家登录后处理订单和 tracking。", en: "Merchants log in to manage orders and tracking.", ms: "Peniaga log masuk untuk urus order dan tracking." },
  "Promoter 端：看所有可推广产品、复制专属链接、查看佣金。": { zh: "Promoter 端：看所有可推广产品、复制专属链接、查看佣金。", en: "Promoter side: view promotable products, copy personal links and track commission.", ms: "Bahagian Promoter: lihat produk boleh promosi, salin link sendiri dan semak komisen." },
  "进入后台管理你的 landing page 客户。": { zh: "进入后台管理你的 landing page 客户。", en: "Enter the backend to manage your landing page customers.", ms: "Masuk ke backend untuk urus pelanggan landing page anda." },
  "Enter password": { zh: "输入密码", en: "Enter password", ms: "Masukkan kata laluan" },
  "Logging in...": { zh: "登入中...", en: "Logging in...", ms: "Sedang log masuk..." },
  "登录": { zh: "登录", en: "Login", ms: "Log masuk" },
  "登入": { zh: "登入", en: "Login", ms: "Log masuk" },
  "Submit Application": { zh: "提交申请", en: "Submit Application", ms: "Hantar Permohonan" },
  "Submitting...": { zh: "提交中...", en: "Submitting...", ms: "Sedang hantar..." },
  "Application submitted": { zh: "申请已提交", en: "Application submitted", ms: "Permohonan dihantar" },
  "Application failed": { zh: "申请失败", en: "Application failed", ms: "Permohonan gagal" },

  // homepage / pricing / merchant apply
  "View Pricing": { zh: "查看配套", en: "View Pricing", ms: "Lihat Pakej" },
  "Start as Merchant": { zh: "商家开始使用", en: "Start as Merchant", ms: "Mula Sebagai Peniaga" },
  "Apply as Promoter": { zh: "申请成为 Promoter", en: "Apply as Promoter", ms: "Mohon Jadi Promoter" },
  "Choose and activate": { zh: "选择并开通", en: "Choose and activate", ms: "Pilih dan aktifkan" },
  "Choose your LinkFlo plan": { zh: "选择你的 LinkFlo 配套", en: "Choose your LinkFlo plan", ms: "Pilih pakej LinkFlo" },
  "商家开始使用": { zh: "商家开始使用", en: "Start as Merchant", ms: "Mula Sebagai Peniaga" },
  "申请成为 Promoter": { zh: "申请成为 Promoter", en: "Apply as Promoter", ms: "Mohon Jadi Promoter" },
  "查看配套": { zh: "查看配套", en: "View Pricing", ms: "Lihat Pakej" },
  "选择你的 LinkFlo 配套": { zh: "选择你的 LinkFlo 配套", en: "Choose your LinkFlo plan", ms: "Pilih pakej LinkFlo" },
  "选择并开通": { zh: "选择并开通", en: "Choose and activate", ms: "Pilih dan aktifkan" },
  "商家资料": { zh: "商家资料", en: "Merchant Details", ms: "Maklumat Peniaga" },
  "选择配套": { zh: "选择配套", en: "Choose Plan", ms: "Pilih Pakej" },
  "开通账号": { zh: "开通账号", en: "Activate Account", ms: "Aktifkan Akaun" },
  "付款开通": { zh: "付款开通", en: "Pay and Activate", ms: "Bayar dan Aktifkan" },
  "免费开通": { zh: "免费开通", en: "Activate Free", ms: "Aktif Percuma" },

  // promoter pages
  "Earnings": { zh: "收益", en: "Earnings", ms: "Pendapatan" },
  "Promoted Products": { zh: "已推广产品", en: "Promoted Products", ms: "Produk Dipromosikan" },
  "Product Pool": { zh: "产品池", en: "Product Pool", ms: "Kolam Produk" },
  "Copy Link": { zh: "复制链接", en: "Copy Link", ms: "Salin Link" },
  "Copy Promo Text": { zh: "复制推广文案", en: "Copy Promo Text", ms: "Salin Teks Promosi" },
  "Funnel Preview": { zh: "Funnel 预览", en: "Funnel Preview", ms: "Pratonton Funnel" },
  "Commission": { zh: "佣金", en: "Commission", ms: "Komisen" },
  "Estimated Earning": { zh: "预计收益", en: "Estimated Earning", ms: "Anggaran Pendapatan" },
  "Sales": { zh: "销售", en: "Sales", ms: "Jualan" },

  // account / order / checkout / support / thank you
  "My Account": { zh: "我的账户", en: "My Account", ms: "Akaun Saya" },
  "My Orders": { zh: "我的订单", en: "My Orders", ms: "Order Saya" },
  "Order Detail": { zh: "订单详情", en: "Order Detail", ms: "Butiran Order" },
  "Checkout": { zh: "付款", en: "Checkout", ms: "Checkout" },
  "Pay Now": { zh: "立即付款", en: "Pay Now", ms: "Bayar Sekarang" },
  "Buy Now": { zh: "立即购买", en: "Buy Now", ms: "Beli Sekarang" },
  "Thank You": { zh: "谢谢购买", en: "Thank You", ms: "Terima Kasih" },
  "Payment Success": { zh: "付款成功", en: "Payment Success", ms: "Pembayaran Berjaya" },
  "Payment Pending": { zh: "付款处理中", en: "Payment Pending", ms: "Pembayaran Diproses" },
  "Support": { zh: "售后支持", en: "Support", ms: "Sokongan" },
  "Order Support": { zh: "订单售后", en: "Order Support", ms: "Sokongan Order" },
  "Enter order number": { zh: "输入订单号码", en: "Enter order number", ms: "Masukkan nombor order" },
  "Check Order": { zh: "查询订单", en: "Check Order", ms: "Semak Order" },
  "Contact Merchant": { zh: "联系商家", en: "Contact Merchant", ms: "Hubungi Peniaga" },
  "Rewards": { zh: "奖励", en: "Rewards", ms: "Ganjaran" },


  // admin / order management labels that may still be hardcoded in older pages
  "User / Customer 管理": { zh: "User / Customer 管理", en: "User / Customer Management", ms: "Pengurusan User / Customer" },
  "这里管理顾客账号。不要真删除顾客，因为订单和退款记录需要保留。": { zh: "这里管理顾客账号。不要真删除顾客，因为订单和退款记录需要保留。", en: "Manage customer accounts here. Do not permanently delete customers because orders and refund records must be kept.", ms: "Urus akaun pelanggan di sini. Jangan padam pelanggan secara kekal kerana rekod order dan refund perlu disimpan." },
  "Admin 创建页面已关闭": { zh: "Admin 创建页面已关闭", en: "Admin page creation is disabled", ms: "Cipta halaman oleh Admin telah dimatikan" },
  "根据现在的 LinkFlo 逻辑，产品 / Funnel Page 只能由 Merchant 端创建。Admin 负责审核、管理、搜索、处理订单和查看数据。": { zh: "根据现在的 LinkFlo 逻辑，产品 / Funnel Page 只能由 Merchant 端创建。Admin 负责审核、管理、搜索、处理订单和查看数据。", en: "In the current LinkFlo flow, product / funnel pages can only be created by merchants. Admin handles review, management, search, orders and analytics.", ms: "Dalam flow LinkFlo sekarang, halaman produk / funnel hanya boleh dibuat oleh peniaga. Admin mengurus semakan, pengurusan, carian, order dan data." },
  "订单管理": { zh: "订单管理", en: "Order Management", ms: "Pengurusan Order" },
  "搜索订单、顾客、商家、tracking、status。点卡片进去才处理。": { zh: "搜索订单、顾客、商家、tracking、status。点卡片进去才处理。", en: "Search orders, customers, merchants, tracking and status. Open a card to process it.", ms: "Cari order, pelanggan, peniaga, tracking dan status. Buka kad untuk proses." },
  "确认所有到期 commission": { zh: "确认所有到期 commission", en: "Confirm all due commissions", ms: "Sahkan semua komisen matang" },
  "Merchant 管理": { zh: "Merchant 管理", en: "Merchant Management", ms: "Pengurusan Peniaga" },
  "Admin 管理商家账号、配套和审核状态；产品由商家端上传，AI 生成后提交审核。": { zh: "Admin 管理商家账号、配套和审核状态；产品由商家端上传，AI 生成后提交审核。", en: "Admin manages merchant accounts, plans and approval status. Products are uploaded by merchants and submitted after AI generation.", ms: "Admin mengurus akaun peniaga, pakej dan status kelulusan. Produk dimuat naik oleh peniaga dan dihantar selepas AI menjana funnel." },
  "商家名字": { zh: "商家名字", en: "Merchant name", ms: "Nama peniaga" },
  "售后 WhatsApp": { zh: "售后 WhatsApp", en: "After-sales WhatsApp", ms: "WhatsApp selepas jualan" },
  "新增 Merchant": { zh: "新增 Merchant", en: "Add Merchant", ms: "Tambah Peniaga" },
  "订单详情": { zh: "订单详情", en: "Order Detail", ms: "Butiran Order" },
  "确认购买": { zh: "确认购买", en: "Confirm Purchase", ms: "Sahkan Pembelian" },
  "返回产品页": { zh: "返回产品页", en: "Back to product page", ms: "Kembali ke halaman produk" },
  "收货地址": { zh: "收货地址", en: "Shipping Address", ms: "Alamat Penghantaran" },
  "使用新地址": { zh: "使用新地址", en: "Use new address", ms: "Guna alamat baru" },
  "收件人名字": { zh: "收件人名字", en: "Recipient name", ms: "Nama penerima" },
  "谢谢购买！": { zh: "谢谢购买！", en: "Thank you for your purchase!", ms: "Terima kasih atas pembelian anda!" },
  "付款成功": { zh: "付款成功", en: "Payment Success", ms: "Pembayaran Berjaya" },
  "查看订单详情": { zh: "查看订单详情", en: "View Order Detail", ms: "Lihat Butiran Order" },
  "订单售后查询": { zh: "订单售后查询", en: "Order Support Lookup", ms: "Semakan Sokongan Order" },

  // backend common additions not always covered by layout
  "Total Sales": { zh: "总销售额", en: "Total Sales", ms: "Jumlah Jualan" },
  "Order Total": { zh: "订单总数", en: "Order Total", ms: "Jumlah Order" },
  "Conversion Rate": { zh: "转化率", en: "Conversion Rate", ms: "Kadar Konversi" },
  "Promoter Count": { zh: "Promoter 数量", en: "Promoter Count", ms: "Jumlah Promoter" },
  "Funnel Analytics": { zh: "Funnel 数据", en: "Funnel Analytics", ms: "Analitik Funnel" },
  "AI Suggestions": { zh: "AI 建议", en: "AI Suggestions", ms: "Cadangan AI" },
  "Views": { zh: "浏览", en: "Views", ms: "Paparan" },
  "Clicks": { zh: "点击", en: "Clicks", ms: "Klik" },
  "Paid Orders": { zh: "付款订单", en: "Paid Orders", ms: "Order Dibayar" },
  "Merchant Net": { zh: "商家预计到手", en: "Merchant Net", ms: "Anggaran Bersih Peniaga" },
}

const aliasMap = new Map()
for (const entry of Object.values(TEXT)) {
  for (const l of LANGS) {
    if (!entry[l]) continue
    const key = norm(entry[l])
    // Keep the first owner for duplicated aliases such as "Order".
    // Otherwise ms: "Order" inside the plural "Orders" entry can make EN "Order" become "Orders",
    // and the MutationObserver will keep appending "s" on every route/language refresh.
    if (!aliasMap.has(key)) aliasMap.set(key, entry)
  }
}

function norm(v) {
  return String(v || "").replace(/\s+/g, " ").trim()
}

function skip(el) {
  return !el || el.closest?.('[data-product-content="true"], [data-no-ui-translate="true"], [data-admin-translate-skip="true"], [data-no-global-translate="true"]')
}

function hasCjk(value) {
  return /[\u3400-\u9FFF]/.test(String(value || ""))
}

function allowPartialReplace(from) {
  const text = String(from || "").trim()
  if (!text) return false
  // Single short English/BM words are too ambiguous for partial replacement.
  // Example: replacing "Order" with "Orders" inside "Order Support" caused "Ordersssss...".
  if (!hasCjk(text) && /^[A-Za-z]+$/.test(text)) return false
  if (!hasCjk(text) && text.length < 6) return false
  return true
}

function translateValue(value, lang) {
  const n = norm(value)
  if (!n) return value
  const exact = aliasMap.get(n)
  if (exact) return exact[lang] || exact.zh || value
  let next = String(value)
  const entries = Object.values(TEXT)
    .flatMap((entry) => LANGS.map((l) => ({ from: entry[l], to: entry[lang] || entry.zh })))
    .filter((x) => x.from && x.to && x.from !== x.to && allowPartialReplace(x.from))
    .sort((a, b) => String(b.from).length - String(a.from).length)
  for (const { from, to } of entries) {
    if (next.includes(from)) next = next.split(from).join(to)
  }
  return next
}

function translateRoot(root, lang) {
  if (!root || typeof document === "undefined") return
  root.querySelectorAll("input,textarea,select,button,a,[placeholder],[aria-label],[title]").forEach((el) => {
    if (skip(el)) return
    for (const attr of ["placeholder", "title", "aria-label"]) {
      const old = el.getAttribute?.(attr)
      if (old) {
        const next = translateValue(old, lang)
        if (next !== old) el.setAttribute(attr, next)
      }
    }
  })
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement
      if (!parent || skip(parent)) return NodeFilter.FILTER_REJECT
      const tag = parent.tagName?.toLowerCase()
      if (["script", "style", "textarea"].includes(tag)) return NodeFilter.FILTER_REJECT
      return norm(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
    }
  })
  const nodes = []
  while (walker.nextNode()) nodes.push(walker.currentNode)
  nodes.forEach((node) => {
    const old = node.nodeValue || ""
    const leading = old.match(/^\s*/)?.[0] || ""
    const trailing = old.match(/\s*$/)?.[0] || ""
    const body = old.trim()
    const next = translateValue(body, lang)
    if (next !== body) node.nodeValue = `${leading}${next}${trailing}`
  })
}

export default function GlobalUiTranslator() {
  const { lang } = useLanguage()
  const pathname = usePathname() || ""
  const adminArea = pathname.startsWith("/admin") && !pathname.endsWith("/login")
  const merchantArea = pathname.startsWith("/merchant") && !pathname.endsWith("/login") && pathname !== "/merchant/apply"
  const productFunnel = pathname.startsWith("/p/") || (/^\/[^/]+$/.test(pathname) && pathname !== "/" && pathname !== "/pricing" && pathname !== "/auth" && pathname !== "/support")
  const hasOwnSwitch = ["/", "/pricing", "/auth", "/merchant/apply", "/promoter/apply"].includes(pathname)

  useEffect(() => {
    if (merchantArea || productFunnel || hasOwnSwitch || typeof document === "undefined") return
    const run = () => translateRoot(document.body, lang)
    run()
    const observer = new MutationObserver(() => window.requestAnimationFrame(run))
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["placeholder", "aria-label", "title"] })
    return () => observer.disconnect()
  }, [lang, merchantArea, productFunnel, hasOwnSwitch])

  if (adminArea || merchantArea || productFunnel || hasOwnSwitch) return null
  return (
    <div className="fixed right-4 top-4 z-[80]" data-no-global-translate="true">
      <LanguageSwitch />
    </div>
  )
}
