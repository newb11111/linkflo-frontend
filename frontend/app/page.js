"use client"

import Link from "next/link"
import { useEffect, useMemo } from "react"
import LanguageSwitch from "../components/LanguageSwitch"
import { useLanguage } from "../components/TranslateProvider"
import ClientOnly from "../components/ClientOnly"

// 过后要在 Hero 下方放 YouTube 影片，就填这里。
// Example: const HOMEPAGE_YOUTUBE_URL = "https://www.youtube.com/watch?v=xxxxxxx"
const HOMEPAGE_YOUTUBE_URL = "https://www.youtube.com/watch?v=9KRYi9EbHE0"

function youtubeEmbed(url) {
  if (!url) return ""
  try {
    const u = new URL(url)
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v")
      return id ? `https://www.youtube.com/embed/${id}` : ""
    }
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "")
      return id ? `https://www.youtube.com/embed/${id}` : ""
    }
  } catch {}
  return ""
}

function Highlight({ children, className = "" }) {
  const text = String(children || "")
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, index) => {
        const isHighlight = part.startsWith("**") && part.endsWith("**")
        const clean = isHighlight ? part.slice(2, -2) : part
        return isHighlight ? (
          <span
            key={`${clean}-${index}`}
            className={`font-black text-blue-600 ${className}`}
          >
            {clean}
          </span>
        ) : (
          <span key={`${clean}-${index}`}>{clean}</span>
        )
      })}
    </>
  )
}

const copy = {
  zh: {
    navPricing: "查看配套",
    navMerchant: "商家开始使用",
    navSupport: "订单售后 / Tracking",
    footerSupport: "顾客订单售后与 Tracking 查询",
    badge: "AI Product Funnel System",
    headline: "在 AI 时代，电商不只是把产品放上网。",
    headline2: "而是要让顾客 **更快理解、更快相信、更快下单**。",
    sub: "LinkFlo 用 AI 帮商家生成产品成交 Funnel 页面，把 **产品卖点**、**购买理由**、**顾客痛点**、**信任感** 和 **下单路径** 整理清楚，让顾客在付款前先理解产品价值，减少犹豫，更愿意直接下单。",
    ctaMerchant: "商家开始使用",
    ctaPricing: "查看配套",
    ctaSupport: "订单查询",
    stat1: "三语 AI Funnel",
    stat1s: "中文 / English / BM 自动生成成交内容",
    stat2: "减少重复沟通",
    stat2s: "FAQ、保障、付款、售后提前讲清楚",
    stat3: "流量更容易变订单",
    stat3s: "让顾客先理解价值，再进入付款动作",
    storyTitle: "电商的形式一直在变，但赚钱的底层逻辑没有变。",
    story1: "从网店、Shopee、Lazada、Marketplace，到内容电商、直播电商、TikTok 电商、Affiliate 电商，形式一直在变。",
    story2: "可是电商赚钱的底层逻辑依然是：找到一个 **有利润的产品**，透过 **线上流量卖出去**，赚售价和成本之间的差价。",
    story3: "问题是：来到 AI 时代，顾客看到产品，不代表他会马上买。他还需要被说服。",
    problemTitle: "为什么有流量，却没有订单？",
    problemSub: "很多商家不是产品不好，而是产品没有被讲清楚。顾客看到了，但还没有足够理由相信和下单。",
    problem1: "顾客不知道产品 **解决什么问题**",
    problem1s: "只放图片和价格，顾客很难理解这个产品为什么适合他。",
    problem2: "卖点没有变成 **购买理由**",
    problem2s: "产品有价值，但页面没有把价值讲到顾客愿意付款。",
    problem3: "WhatsApp 一直重复解释",
    problem3s: "每个顾客都问类似问题，成交速度变慢，也容易流失。",
    solutionTitle: "LinkFlo 做的事情很简单：把产品讲到顾客愿意下单。",
    solutionSub: "商家输入产品资料，AI 会整理成一个专门成交的 Funnel 页面。顾客看到的不只是产品，而是完整的理解、信任和下单路径。",
    previewTag: "Funnel Preview",
    previewTitle: "顾客看到的是 **产品价值**，不是后台分佣结构。",
    previewSub: "Hero、痛点、卖点、使用方式、FAQ、图片、Video、付款、售后与 Tracking 都集中在一个成交页。",
    previewHero: "这个产品适合 **想更快做决定** 的顾客",
    previewPoint1: "产品解决什么问题",
    previewPoint2: "为什么适合他",
    previewPoint3: "为什么值得买",
    previewPoint4: "付款和售后怎样处理",
    systemTitle: "不是普通网站，是 AI 成交 Funnel。",
    systemCard1: "AI 整理产品卖点",
    systemCard1s: "把原本零散的产品资料，整理成顾客看得懂的价值表达。",
    systemCard2: "建立购买信任",
    systemCard2s: "FAQ、保障、案例、使用方式和售后说明，减少顾客疑虑。",
    systemCard3: "清楚下单路径",
    systemCard3s: "顾客理解后可以直接付款，订单进入商家后台处理。",
    howTitle: "商家怎样开始？",
    step1: "选择配套",
    step1s: "Starter / Growth / Scale",
    step2: "填写商家资料",
    step2s: "系统生成登录账号",
    step3: "上传产品资料",
    step3s: "AI 生成三语成交 Funnel",
    step4: "上线并测试成交",
    step4s: "顾客进入页面理解产品并付款",
    pricingTitle: "选择适合你现在阶段的配套",
    pricingSub: "Promoter / 网红对接是配套里的加值服务，不是首页公开产品池。首页主轴是：用 AI 把产品讲清楚，让流量更容易成交。",
    choose: "选择",
    free1: "上传 3 个产品",
    free2: "AI 三语成交 Funnel",
    free3: "产品成交链接",
    free4: "订单 / Tracking 基础功能",
    growth1: "最多 500 SKU",
    growth2: "AI 三语成交 Funnel",
    growth3: "1 对 1 教导",
    growth4: "加值：协助对接网红推广 1 个产品",
    scale1: "无限 SKU",
    scale2: "AI 三语成交 Funnel",
    scale3: "1 对 1 成交渠道规划",
    scale4: "加值：协助对接网红推广 5 个产品",
    faqTitle: "常见问题",
    q1: "LinkFlo 是电商平台吗？",
    a1: "不是。LinkFlo 更像 AI 产品成交 Funnel 系统，帮助商家把产品讲清楚，让流量更容易变成订单。",
    q2: "Promoter 产品池会公开吗？",
    a2: "不会。Promoter 相关功能放在配套和后台里，可推广产品只给审核后的 Promoter 登录查看。",
    q3: "顾客会看到佣金或商家到手吗？",
    a3: "不会。顾客页只展示产品价值、价格、付款、FAQ 和售后说明，不展示后台结算结构。",
    q4: "商家需要自己处理物流吗？",
    a4: "需要。LinkFlo 负责 funnel、付款记录和订单系统；商家负责发货并填写 tracking number。",
    finalTitle: "准备把产品讲清楚，让流量更容易成交？",
    finalSub: "先从一个产品开始，让 AI 生成成交 Funnel，再看顾客是否更愿意理解、相信和下单。",
    finalCta: "现在开始",
  },
  en: {
    navPricing: "View Pricing",
    navMerchant: "Start as Merchant",
    navSupport: "Order Support / Tracking",
    footerSupport: "Customer order support and tracking lookup",
    badge: "AI Product Funnel System",
    headline: "In the AI era, ecommerce is not just putting products online.",
    headline2: "It is about helping customers **understand faster, trust faster, and buy faster**.",
    sub: "LinkFlo uses AI to generate product conversion funnel pages. It organizes **product benefits**, **buying reasons**, **customer pain points**, **trust elements**, and the **checkout path** so customers understand the product value before payment and feel more ready to order.",
    ctaMerchant: "Start as Merchant",
    ctaPricing: "View Pricing",
    ctaSupport: "Order Support",
    stat1: "3-language AI Funnel",
    stat1s: "Chinese / English / BM conversion content",
    stat2: "Less repetitive explanation",
    stat2s: "FAQ, guarantee, payment and after-sales explained early",
    stat3: "Turn traffic into orders",
    stat3s: "Help customers understand value before checkout",
    storyTitle: "Ecommerce keeps changing, but the core way to make money stays the same.",
    story1: "From online stores, Shopee, Lazada and marketplaces to content commerce, live commerce, TikTok commerce and affiliate commerce — the formats keep changing.",
    story2: "But the foundation is still this: find a **profitable product**, sell it through **online traffic**, and earn the gap between selling price and cost.",
    story3: "The problem is: in the AI era, customers do not buy just because they see a product. They still need to be convinced.",
    problemTitle: "Why does traffic not become orders?",
    problemSub: "Many merchants do not have a product problem. The product simply has not been explained clearly enough for customers to trust and buy.",
    problem1: "Customers do not know **what problem the product solves**",
    problem1s: "Images and price alone are not enough for customers to understand why the product fits them.",
    problem2: "Product benefits are not turned into **buying reasons**",
    problem2s: "The product has value, but the page does not explain it in a way that drives payment.",
    problem3: "WhatsApp explanations repeat again and again",
    problem3s: "Customers ask similar questions, which slows down conversion and causes drop-off.",
    solutionTitle: "LinkFlo does one simple thing: explain products until customers are ready to order.",
    solutionSub: "Merchants enter product details, and AI turns them into a conversion-focused funnel page. Customers see understanding, trust, and a clear checkout path — not just a product listing.",
    previewTag: "Funnel Preview",
    previewTitle: "Customers see **product value**, not internal commission structure.",
    previewSub: "Hero, pain points, benefits, usage, FAQ, images, video, payment, after-sales and tracking are combined into one conversion page.",
    previewHero: "This product is for customers who want to **decide faster**",
    previewPoint1: "What problem it solves",
    previewPoint2: "Why it fits them",
    previewPoint3: "Why it is worth buying",
    previewPoint4: "How payment and after-sales work",
    systemTitle: "Not a normal website. An AI conversion funnel.",
    systemCard1: "AI organizes product benefits",
    systemCard1s: "Turn scattered product details into value that customers can understand.",
    systemCard2: "Build buying trust",
    systemCard2s: "FAQ, assurance, proof, usage and after-sales details reduce hesitation.",
    systemCard3: "Clear checkout path",
    systemCard3s: "Customers can pay after understanding. Orders enter the merchant dashboard.",
    howTitle: "How merchants start",
    step1: "Choose plan",
    step1s: "Starter / Growth / Scale",
    step2: "Fill merchant info",
    step2s: "System creates login account",
    step3: "Upload product details",
    step3s: "AI generates 3-language funnel",
    step4: "Launch and test conversion",
    step4s: "Customers understand the product and pay",
    pricingTitle: "Choose the package that fits your current stage",
    pricingSub: "Promoter / creator support is a package add-on, not a public product pool. The homepage focus is AI explaining products clearly so traffic can convert better.",
    choose: "Choose",
    free1: "Upload 3 products",
    free2: "AI 3-language funnel",
    free3: "Product conversion link",
    free4: "Basic order / tracking tools",
    growth1: "Up to 500 SKU",
    growth2: "AI 3-language funnel",
    growth3: "1-to-1 guidance",
    growth4: "Add-on: creator support for 1 product",
    scale1: "Unlimited SKU",
    scale2: "AI 3-language funnel",
    scale3: "1-to-1 conversion channel planning",
    scale4: "Add-on: creator support for 5 products",
    faqTitle: "FAQ",
    q1: "Is LinkFlo an ecommerce marketplace?",
    a1: "No. LinkFlo is an AI product conversion funnel system that helps merchants explain products clearly and turn traffic into orders.",
    q2: "Is the promoter product pool public?",
    a2: "No. Promoter features are inside packages and dashboards. Promotable products are visible only to approved promoters after login.",
    q3: "Will customers see commission or merchant net?",
    a3: "No. Customer pages only show product value, price, payment, FAQ and after-sales information, not internal settlement structure.",
    q4: "Does the merchant handle delivery?",
    a4: "Yes. LinkFlo handles funnel, payment records and orders. Merchants fulfill orders and update tracking numbers.",
    finalTitle: "Ready to explain your product clearly and convert traffic better?",
    finalSub: "Start with one product. Let AI create the funnel, then see whether customers understand, trust and order faster.",
    finalCta: "Start Now",
  },
  ms: {
    navPricing: "Lihat Pakej",
    navMerchant: "Mula Sebagai Peniaga",
    navSupport: "Sokongan Order / Tracking",
    footerSupport: "Semak sokongan order dan tracking pelanggan",
    badge: "Sistem AI Product Funnel",
    headline: "Dalam era AI, e-dagang bukan sekadar letak produk online.",
    headline2: "Ia tentang bantu pelanggan **lebih cepat faham, lebih cepat percaya, dan lebih cepat beli**.",
    sub: "LinkFlo menggunakan AI untuk jana halaman funnel produk. Sistem menyusun **kelebihan produk**, **sebab membeli**, **masalah pelanggan**, **elemen kepercayaan**, dan **laluan checkout** supaya pelanggan faham nilai produk sebelum bayar dan lebih yakin untuk order.",
    ctaMerchant: "Mula Sebagai Peniaga",
    ctaPricing: "Lihat Pakej",
    ctaSupport: "Sokongan Order",
    stat1: "AI Funnel 3 bahasa",
    stat1s: "Kandungan jualan 中文 / English / BM",
    stat2: "Kurangkan penerangan berulang",
    stat2s: "FAQ, jaminan, bayaran dan selepas jualan diterangkan awal",
    stat3: "Tukar traffic jadi order",
    stat3s: "Bantu pelanggan faham nilai sebelum checkout",
    storyTitle: "Bentuk e-dagang sentiasa berubah, tetapi asas untuk buat duit tetap sama.",
    story1: "Daripada kedai online, Shopee, Lazada dan marketplace kepada content commerce, live commerce, TikTok commerce dan affiliate commerce — bentuknya sentiasa berubah.",
    story2: "Tetapi asasnya masih sama: cari **produk yang ada margin**, jual melalui **traffic online**, dan jana keuntungan daripada beza harga jualan dan kos.",
    story3: "Masalahnya: dalam era AI, pelanggan tidak semestinya beli hanya kerana mereka nampak produk. Mereka masih perlu diyakinkan.",
    problemTitle: "Kenapa traffic tidak menjadi order?",
    problemSub: "Ramai peniaga bukan ada masalah produk. Produk itu cuma belum diterangkan dengan cukup jelas untuk pelanggan percaya dan beli.",
    problem1: "Pelanggan tidak tahu **produk ini selesaikan masalah apa**",
    problem1s: "Gambar dan harga sahaja tidak cukup untuk buat pelanggan faham kenapa produk ini sesuai untuk mereka.",
    problem2: "Kelebihan produk tidak menjadi **sebab membeli**",
    problem2s: "Produk ada nilai, tetapi halaman tidak menerangkan nilai itu sehingga pelanggan mahu bayar.",
    problem3: "Penerangan WhatsApp berulang-ulang",
    problem3s: "Pelanggan tanya soalan yang hampir sama, menyebabkan conversion lambat dan pelanggan mudah hilang.",
    solutionTitle: "LinkFlo buat satu perkara: terangkan produk sampai pelanggan bersedia untuk order.",
    solutionSub: "Peniaga masukkan maklumat produk, AI akan jadikan ia halaman funnel yang fokus kepada conversion. Pelanggan nampak kefahaman, kepercayaan dan laluan checkout yang jelas — bukan sekadar listing produk.",
    previewTag: "Pratonton Funnel",
    previewTitle: "Pelanggan nampak **nilai produk**, bukan struktur komisen dalaman.",
    previewSub: "Hero, masalah, manfaat, cara guna, FAQ, gambar, video, bayaran, selepas jualan dan tracking digabungkan dalam satu halaman jualan.",
    previewHero: "Produk ini sesuai untuk pelanggan yang mahu **buat keputusan lebih cepat**",
    previewPoint1: "Masalah apa yang diselesaikan",
    previewPoint2: "Kenapa ia sesuai untuk mereka",
    previewPoint3: "Kenapa ia berbaloi dibeli",
    previewPoint4: "Bagaimana bayaran dan selepas jualan berjalan",
    systemTitle: "Bukan website biasa. Ini AI conversion funnel.",
    systemCard1: "AI susun kelebihan produk",
    systemCard1s: "Tukar maklumat produk yang berselerak kepada nilai yang pelanggan boleh faham.",
    systemCard2: "Bina kepercayaan membeli",
    systemCard2s: "FAQ, jaminan, bukti, cara guna dan selepas jualan mengurangkan keraguan.",
    systemCard3: "Laluan checkout jelas",
    systemCard3s: "Pelanggan boleh bayar selepas faham. Order masuk ke dashboard peniaga.",
    howTitle: "Cara peniaga bermula",
    step1: "Pilih pakej",
    step1s: "Starter / Growth / Scale",
    step2: "Isi maklumat peniaga",
    step2s: "Sistem cipta akaun login",
    step3: "Muat naik maklumat produk",
    step3s: "AI jana funnel 3 bahasa",
    step4: "Launch dan test conversion",
    step4s: "Pelanggan faham produk dan bayar",
    pricingTitle: "Pilih pakej mengikut tahap bisnes anda",
    pricingSub: "Sokongan promoter / creator ialah nilai tambah dalam pakej, bukan product pool awam. Fokus homepage ialah AI menerangkan produk dengan jelas supaya traffic lebih mudah convert.",
    choose: "Pilih",
    free1: "Muat naik 3 produk",
    free2: "AI funnel 3 bahasa",
    free3: "Link jualan produk",
    free4: "Order / tracking asas",
    growth1: "Sehingga 500 SKU",
    growth2: "AI funnel 3 bahasa",
    growth3: "Bimbingan 1-ke-1",
    growth4: "Nilai tambah: sokongan creator untuk 1 produk",
    scale1: "SKU tanpa had",
    scale2: "AI funnel 3 bahasa",
    scale3: "Perancangan channel conversion 1-ke-1",
    scale4: "Nilai tambah: sokongan creator untuk 5 produk",
    faqTitle: "Soalan Lazim",
    q1: "Adakah LinkFlo marketplace e-dagang?",
    a1: "Tidak. LinkFlo ialah sistem AI product funnel yang bantu peniaga terangkan produk dengan jelas dan tukar traffic jadi order.",
    q2: "Adakah product pool promoter dipaparkan kepada umum?",
    a2: "Tidak. Fungsi promoter berada dalam pakej dan dashboard. Produk yang boleh dipromosikan hanya dilihat oleh promoter yang diluluskan selepas login.",
    q3: "Adakah pelanggan nampak komisen atau jumlah bersih peniaga?",
    a3: "Tidak. Halaman pelanggan hanya tunjuk nilai produk, harga, bayaran, FAQ dan selepas jualan, bukan struktur settlement dalaman.",
    q4: "Siapa urus penghantaran?",
    a4: "Peniaga sendiri. LinkFlo urus funnel, rekod bayaran dan order. Peniaga hantar barang dan kemas kini tracking number.",
    finalTitle: "Sedia terangkan produk dengan jelas dan convert traffic lebih baik?",
    finalSub: "Mula dengan satu produk. Biar AI bina funnel, kemudian lihat sama ada pelanggan lebih cepat faham, percaya dan order.",
    finalCta: "Mula Sekarang",
  },
}

const plans = [
  {
    name: "Starter",
    key: "starter",
    price: "RM49.90",
    limit: "3 SKU",
    points: {
      zh: ["上传 3 个产品", "AI 三语成交 Funnel", "产品成交链接", "订单 / Tracking 基础功能"],
      en: ["Upload 3 products", "AI 3-language funnel", "Product conversion link", "Basic order / tracking tools"],
      ms: ["Muat naik 3 produk", "AI funnel 3 bahasa", "Link jualan produk", "Order / tracking asas"],
    },
  },
  {
    name: "Growth",
    key: "growth",
    price: "RM3699",
    limit: "500 SKU",
    featured: true,
    points: {
      zh: ["最多 500 SKU", "AI 三语成交 Funnel", "1 对 1 教导", "加值：协助对接网红推广 1 个产品"],
      en: ["Up to 500 SKU", "AI 3-language funnel", "1-to-1 guidance", "Add-on: creator support for 1 product"],
      ms: ["Sehingga 500 SKU", "AI funnel 3 bahasa", "Bimbingan 1-ke-1", "Nilai tambah: sokongan creator untuk 1 produk"],
    },
  },
  {
    name: "Scale",
    key: "scale",
    price: "RM12999",
    limit: "Unlimited",
    points: {
      zh: ["无限 SKU", "AI 三语成交 Funnel", "1 对 1 成交渠道规划", "加值：协助对接网红推广 5 个产品"],
      en: ["Unlimited SKU", "AI 3-language funnel", "1-to-1 conversion channel planning", "Add-on: creator support for 5 products"],
      ms: ["SKU tanpa had", "AI funnel 3 bahasa", "Perancangan channel conversion 1-ke-1", "Nilai tambah: sokongan creator untuk 5 produk"],
    },
  },
]

function tFor(lang) {
  return copy[lang] || copy.zh
}

function HomePageContent() {
  const { lang } = useLanguage()
  const t = tFor(lang)
  const embedUrl = useMemo(() => youtubeEmbed(HOMEPAGE_YOUTUBE_URL), [])

  useEffect(() => {
    try {
      document.documentElement.style.overflow = ""
      document.body.style.overflow = ""
      document.body.style.pointerEvents = ""
      document.body.style.filter = ""
      document.body.style.opacity = ""
      document.querySelectorAll('[data-linkflo-mobile-overlay="true"]').forEach((node) => node.remove())
    } catch {}
  }, [])

  const flow = [
    [t.step1, t.step1s],
    [t.step2, t.step2s],
    [t.step3, t.step3s],
    [t.step4, t.step4s],
  ]

  const faqs = [
    [t.q1, t.a1],
    [t.q2, t.a2],
    [t.q3, t.a3],
    [t.q4, t.a4],
  ]

  return (
    <main className="min-h-screen bg-[#f5f8ff] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-blue-100 bg-white/85 px-5 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="text-xl font-black tracking-[-.04em] text-blue-700">
            LinkFlo
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/pricing" className="hidden rounded-full px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-blue-50 md:block">
              {t.navPricing}
            </Link>
            <Link href="/support" className="hidden rounded-full px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-blue-50 md:block">
              {t.navSupport}
            </Link>
            <LanguageSwitch />
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden px-5 py-16 md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,.18),transparent_35%),radial-gradient(circle_at_72%_18%,rgba(14,165,233,.16),transparent_32%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div>
            <div className="inline-flex rounded-full border border-blue-200 bg-white/85 px-4 py-2 text-sm font-black text-blue-700 shadow-sm">
              {t.badge}
            </div>
            <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[.95] tracking-[-.06em] md:text-7xl">
              <Highlight>{t.headline}</Highlight>
              <br />
              <span className="text-blue-700"><Highlight>{t.headline2}</Highlight></span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg font-bold leading-8 text-slate-600">
              <Highlight>{t.sub}</Highlight>
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/merchant/apply" className="rounded-full bg-blue-700 px-7 py-4 font-black text-white shadow-xl shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-800 active:translate-y-0">
                {t.ctaMerchant}
              </Link>
              <Link href="/pricing" className="rounded-full bg-white px-7 py-4 font-black text-blue-700 shadow transition hover:-translate-y-0.5 active:translate-y-0">
                {t.ctaPricing}
              </Link>
              <Link href="/support" className="rounded-full border border-blue-200 px-7 py-4 font-black text-slate-700 transition hover:bg-white">
                {t.ctaSupport}
              </Link>
            </div>
            <div className="mt-7 grid max-w-3xl gap-3 sm:grid-cols-3">
              <MiniStat title={t.stat1} desc={t.stat1s} />
              <MiniStat title={t.stat2} desc={t.stat2s} />
              <MiniStat title={t.stat3} desc={t.stat3s} />
            </div>
          </div>

          <div className="rounded-[42px] bg-white p-5 shadow-2xl shadow-blue-100">
            <div className="overflow-hidden rounded-[32px] bg-slate-950 text-white">
              <div className="border-b border-white/10 p-5">
                <p className="text-xs font-black uppercase tracking-[.24em] text-blue-300">{t.previewTag}</p>
                <h2 className="mt-3 text-3xl font-black tracking-[-.05em]">AI Product Funnel</h2>
              </div>
              <div className="grid gap-4 p-5 md:grid-cols-[1.05fr_.95fr]">
                <div className="rounded-[28px] bg-white p-5 text-slate-950">
                  <div className="rounded-[24px] bg-gradient-to-br from-blue-700 to-slate-950 p-5 text-white">
                    <p className="text-xs font-black uppercase tracking-[.18em] text-blue-100">Hero</p>
                    <h3 className="mt-4 text-2xl font-black leading-tight"><Highlight className="bg-white/15 text-white">{t.previewHero}</Highlight></h3>
                  </div>
                  <p className="mt-4 text-sm font-bold leading-6 text-slate-600"><Highlight>{t.previewSub}</Highlight></p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {[t.previewPoint1, t.previewPoint2, t.previewPoint3, t.previewPoint4].map((x) => (
                      <div key={x} className="rounded-2xl bg-slate-50 p-3 text-sm font-black text-slate-700">
                        <Highlight>{x}</Highlight>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <PreviewBox title="Pain" text={t.problem1} />
                  <PreviewBox title="Benefit" text={t.problem2} />
                  <PreviewBox title="CTA" text={t.previewTitle} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {embedUrl ? (
          <div className="relative mx-auto mt-12 max-w-5xl">
            <div className="overflow-hidden rounded-[34px] border border-blue-100 bg-white p-3 shadow-2xl shadow-blue-100">
              <div className="aspect-video overflow-hidden rounded-[26px]">
                <iframe
                  className="h-full w-full"
                  src={embedUrl}
                  title="LinkFlo Intro Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="px-5 py-14">
        <div className="mx-auto grid max-w-7xl gap-8 rounded-[42px] bg-white p-8 shadow-xl md:grid-cols-[.9fr_1.1fr] md:p-10">
          <h2 className="text-4xl font-black leading-tight tracking-[-.04em]"><Highlight>{t.storyTitle}</Highlight></h2>
          <div className="space-y-5 text-base font-bold leading-8 text-slate-600">
            <p><Highlight>{t.story1}</Highlight></p>
            <p><Highlight>{t.story2}</Highlight></p>
            <p><Highlight>{t.story3}</Highlight></p>
          </div>
        </div>
      </section>

      <section className="px-5 py-14">
        <div className="mx-auto max-w-7xl">
          <h2 className="max-w-4xl text-4xl font-black tracking-[-.04em]"><Highlight>{t.problemTitle}</Highlight></h2>
          <p className="mt-3 max-w-3xl font-bold leading-7 text-slate-500"><Highlight>{t.problemSub}</Highlight></p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <FeatureCard title={t.problem1} desc={t.problem1s} />
            <FeatureCard title={t.problem2} desc={t.problem2s} />
            <FeatureCard title={t.problem3} desc={t.problem3s} />
          </div>
        </div>
      </section>

      <section className="px-5 py-14">
        <div className="mx-auto max-w-7xl rounded-[42px] bg-slate-950 p-8 text-white shadow-2xl md:p-10">
          <h2 className="max-w-4xl text-4xl font-black tracking-[-.04em]"><Highlight>{t.solutionTitle}</Highlight></h2>
          <p className="mt-4 max-w-3xl font-bold leading-8 text-slate-300"><Highlight>{t.solutionSub}</Highlight></p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <DarkCard title={t.systemCard1} desc={t.systemCard1s} />
            <DarkCard title={t.systemCard2} desc={t.systemCard2s} />
            <DarkCard title={t.systemCard3} desc={t.systemCard3s} />
          </div>
        </div>
      </section>

      <section className="px-5 py-14">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
          <div>
            <h2 className="text-4xl font-black tracking-[-.04em]"><Highlight>{t.howTitle}</Highlight></h2>
            <p className="mt-3 font-bold leading-7 text-slate-500"><Highlight>{t.systemTitle}</Highlight></p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {flow.map(([title, desc], index) => (
              <div key={title} className="rounded-[30px] bg-white p-6 shadow">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-600 font-black text-white">{index + 1}</span>
                <h3 className="mt-4 text-xl font-black"><Highlight>{title}</Highlight></h3>
                <p className="mt-2 font-bold leading-7 text-slate-500"><Highlight>{desc}</Highlight></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-14" id="pricing">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-4xl font-black tracking-[-.04em]"><Highlight>{t.pricingTitle}</Highlight></h2>
              <p className="mt-2 max-w-3xl font-bold leading-7 text-slate-500"><Highlight>{t.pricingSub}</Highlight></p>
            </div>
            <Link href="/pricing" className="rounded-full bg-slate-950 px-6 py-3 font-black text-white transition hover:bg-blue-700">
              {t.navPricing}
            </Link>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.name} className={`rounded-[34px] p-7 shadow-xl ${plan.featured ? "bg-blue-700 text-white shadow-blue-200" : "bg-white text-slate-950"}`}>
                <p className={`text-sm font-black ${plan.featured ? "text-blue-100" : "text-blue-700"}`}>{plan.name}</p>
                <h3 className="mt-2 text-4xl font-black">{plan.price}</h3>
                <p className={`mt-1 font-black ${plan.featured ? "text-blue-100" : "text-slate-500"}`}>{plan.limit}</p>
                <div className="mt-5 space-y-3">
                  {(plan.points[lang] || plan.points.zh).map((item) => (
                    <p key={item} className={`font-bold ${plan.featured ? "text-white" : "text-slate-700"}`}>✓ <Highlight>{item}</Highlight></p>
                  ))}
                </div>
                <Link href={`/merchant/apply?plan=${plan.key}`} className={`mt-6 block rounded-full px-5 py-3 text-center font-black transition ${plan.featured ? "bg-white text-blue-700 hover:bg-blue-50" : "bg-blue-700 text-white hover:bg-blue-800"}`}>
                  {t.choose} {plan.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-14">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-4xl font-black tracking-[-.04em]"><Highlight>{t.faqTitle}</Highlight></h2>
          <div className="mt-8 space-y-4">
            {faqs.map(([question, answer], index) => (
              <details key={question} open={index === 0} className="rounded-[28px] bg-white p-6 shadow">
                <summary className="cursor-pointer text-lg font-black"><Highlight>{question}</Highlight></summary>
                <p className="mt-4 font-bold leading-7 text-slate-600"><Highlight>{answer}</Highlight></p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16">
        <div className="mx-auto max-w-5xl rounded-[42px] bg-gradient-to-br from-blue-700 to-slate-950 p-9 text-center text-white shadow-2xl shadow-blue-200 md:p-12">
          <h2 className="text-4xl font-black tracking-[-.04em]"><Highlight className="bg-white/15 text-white">{t.finalTitle}</Highlight></h2>
          <p className="mx-auto mt-4 max-w-2xl font-bold leading-8 text-blue-100"><Highlight className="bg-white/15 text-white">{t.finalSub}</Highlight></p>
          <Link href="/merchant/apply" className="mt-8 inline-flex rounded-full bg-white px-8 py-4 font-black text-blue-700 transition hover:bg-blue-50">
            {t.finalCta}
          </Link>
        </div>
      </section>

      <footer className="border-t border-blue-100 px-5 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm font-bold text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© LinkFlo</p>
          <Link href="/support" className="text-blue-700 hover:text-blue-900">
            {t.footerSupport}
          </Link>
        </div>
      </footer>
    </main>
  )
}

function MiniStat({ title, desc }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow">
      <b><Highlight>{title}</Highlight></b>
      <p className="mt-1 text-sm font-bold leading-6 text-slate-500"><Highlight>{desc}</Highlight></p>
    </div>
  )
}

function FeatureCard({ title, desc }) {
  return (
    <div className="rounded-[34px] bg-white p-7 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl">
      <h3 className="text-2xl font-black"><Highlight>{title}</Highlight></h3>
      <p className="mt-3 font-bold leading-7 text-slate-600"><Highlight>{desc}</Highlight></p>
    </div>
  )
}

function DarkCard({ title, desc }) {
  return (
    <div className="rounded-[30px] border border-white/10 bg-white/10 p-6">
      <h3 className="text-xl font-black"><Highlight className="bg-white/15 text-white">{title}</Highlight></h3>
      <p className="mt-3 font-bold leading-7 text-slate-300"><Highlight className="bg-white/15 text-white">{desc}</Highlight></p>
    </div>
  )
}

function PreviewBox({ title, text }) {
  return (
    <div className="rounded-3xl bg-white/10 p-4">
      <p className="text-xs font-black uppercase tracking-[.2em] text-blue-200">{title}</p>
      <p className="mt-3 text-sm font-black leading-6"><Highlight className="bg-white/15 text-white">{text}</Highlight></p>
    </div>
  )
}

export default function HomePage() {
  return (
    <ClientOnly>
      <HomePageContent />
    </ClientOnly>
  )
}
