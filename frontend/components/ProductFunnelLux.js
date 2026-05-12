"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { formatMoney } from "../lib/customerApi"
import LanguageSwitch from "./LanguageSwitch"
import { useLanguage } from "./TranslateProvider"

function has(value) {
  return value !== undefined && value !== null && String(value).trim() !== ""
}

function lines(value) {
  if (!value) return []
  if (Array.isArray(value)) return value.map((x) => String(x || "").trim()).filter(Boolean)
  return String(value).split("\n").map((x) => x.trim()).filter(Boolean)
}

function faqLines(value, fallbackAnswer = "请联系客服了解更多。") {
  return lines(value).map((row) => {
    const [q, ...rest] = row.split("|")
    return { q: q?.trim() || row, a: rest.join("|").trim() || fallbackAnswer }
  })
}

function sectionItems(section) {
  if (!section?.items) return []
  return section.items
    .map((item) => {
      if (typeof item === "string") return item
      return item?.text || item?.title || item?.description || ""
    })
    .filter(Boolean)
}

function youtubeEmbed(url = "") {
  if (!url) return ""
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "")
      return id ? `https://www.youtube.com/embed/${id}` : ""
    }
    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname === "/watch") {
        const id = parsed.searchParams.get("v")
        return id ? `https://www.youtube.com/embed/${id}` : ""
      }
      if (parsed.pathname.startsWith("/shorts/")) {
        const id = parsed.pathname.replace("/shorts/", "")
        return id ? `https://www.youtube.com/embed/${id}` : ""
      }
      if (parsed.pathname.startsWith("/embed/")) return url
    }
  } catch {}
  return url
}


const UI = {
  zh: {
    productDisplay: "先看产品呈现",
    imageHint: "滑动查看图片，适合手机用户快速理解产品。",
    videoTitle: "先看这段影片",
    videoSubtitle: "用最短时间了解这个产品是否适合你。",
    defaultProblemTitle: "你是不是也遇到这些问题？",
    defaultProblemSubtitle: "先确认问题，才知道这个产品值不值得买。",
    defaultSolutionTitle: "为什么这个适合你？",
    defaultSolutionSubtitle: "不是单纯展示产品，而是让顾客清楚看到购买理由。",
    processTitle: "下单后怎么运作？",
    proofTitle: "反馈 / 证明",
    detailsTitle: "产品 / 服务详情",
    defaultDescription: "商家暂时还没有填写更详细的说明。",
    stock: "库存",
    offerTitle: "你会获得什么？",
    faqTitle: "常见问题 FAQ",
    fallbackFaqAnswer: "请联系客服了解更多。",
    fallbackFaqQuestion: "问题",
    readyTitle: "准备下单了吗？",
    readySubtitle: "点击按钮进入 checkout，付款成功后系统才会确认订单。",
    paidToMerchant: "付款成功后订单会进入商家后台处理。",
    buyNow: "立即购买",
    supportTracking: "订单售后 / Tracking 查询",
    billplzSafe: "Billplz 安全付款",
    pageExplains: "页面提前说明疑虑",
    trackingAfterPaid: "付款后订单页可看 tracking / 售后",
    faqButton: "先看 FAQ",
    safeNote: "付款完成后才会生成订单记录，方便商家处理发货和售后。",
    menuShowcase: "产品展示",
    menuVideo: "影片",
    menuPain: "问题",
    menuBenefits: "为什么值得买",
    menuProcess: "怎么运作",
    menuProof: "反馈 / 证明",
    menuDetails: "产品详情",
    menuOrder: "立即购买",
    display: "展示",
    step: "Step",
    productFallback: "精选产品",
    merchantFallback: "LinkFlo 商家",
  },
  en: {
    productDisplay: "Product showcase",
    imageHint: "Swipe through the images to understand the product quickly on mobile.",
    videoTitle: "Watch the product video",
    videoSubtitle: "Understand whether this product is right for you in the shortest time.",
    defaultProblemTitle: "Are you facing these problems?",
    defaultProblemSubtitle: "Understand the problem first before deciding whether this product is worth buying.",
    defaultSolutionTitle: "Why is this suitable for you?",
    defaultSolutionSubtitle: "This is not just a product display. It helps customers see clear reasons to buy.",
    processTitle: "What happens after you order?",
    proofTitle: "Reviews / Proof",
    detailsTitle: "Product / Service Details",
    defaultDescription: "The merchant has not added a more detailed description yet.",
    stock: "Stock",
    offerTitle: "What will you get?",
    faqTitle: "Frequently Asked Questions",
    fallbackFaqAnswer: "Please contact support for more information.",
    fallbackFaqQuestion: "Question",
    readyTitle: "Ready to order?",
    readySubtitle: "Continue to checkout. Your order will only be confirmed after successful payment.",
    paidToMerchant: "After successful payment, the order will be sent to the merchant for processing.",
    buyNow: "Buy Now",
    supportTracking: "Order support / Tracking",
    billplzSafe: "Secure Billplz payment",
    pageExplains: "Page explains common doubts",
    trackingAfterPaid: "Tracking / after-sales available after payment",
    faqButton: "Read FAQ first",
    safeNote: "An order record is created only after payment is completed, so the merchant can process delivery and after-sales.",
    menuShowcase: "Showcase",
    menuVideo: "Video",
    menuPain: "Problems",
    menuBenefits: "Why buy",
    menuProcess: "Process",
    menuProof: "Reviews / Proof",
    menuDetails: "Details",
    menuOrder: "Buy Now",
    display: "Display",
    step: "Step",
    productFallback: "Selected product",
    merchantFallback: "LinkFlo Merchant",
  },
  ms: {
    productDisplay: "Paparan produk",
    imageHint: "Leret gambar untuk faham produk dengan cepat di telefon.",
    videoTitle: "Tonton video produk",
    videoSubtitle: "Fahami sama ada produk ini sesuai untuk anda dalam masa singkat.",
    defaultProblemTitle: "Adakah anda menghadapi masalah ini?",
    defaultProblemSubtitle: "Fahami masalah dahulu sebelum membuat keputusan membeli.",
    defaultSolutionTitle: "Kenapa produk ini sesuai untuk anda?",
    defaultSolutionSubtitle: "Ini bukan sekadar paparan produk. Halaman ini membantu pelanggan nampak sebab untuk membeli.",
    processTitle: "Apa berlaku selepas order?",
    proofTitle: "Ulasan / Bukti",
    detailsTitle: "Butiran Produk / Servis",
    defaultDescription: "Peniaga belum menambah penerangan yang lebih lengkap.",
    stock: "Stok",
    offerTitle: "Apa yang anda akan dapat?",
    faqTitle: "Soalan Lazim",
    fallbackFaqAnswer: "Sila hubungi sokongan untuk maklumat lanjut.",
    fallbackFaqQuestion: "Soalan",
    readyTitle: "Bersedia untuk order?",
    readySubtitle: "Teruskan ke checkout. Order hanya disahkan selepas bayaran berjaya.",
    paidToMerchant: "Selepas bayaran berjaya, order akan dihantar ke peniaga untuk diproses.",
    buyNow: "Beli Sekarang",
    supportTracking: "Sokongan order / Tracking",
    billplzSafe: "Bayaran Billplz selamat",
    pageExplains: "Halaman menjawab keraguan biasa",
    trackingAfterPaid: "Tracking / selepas jualan tersedia selepas bayaran",
    faqButton: "Baca FAQ dahulu",
    safeNote: "Rekod order hanya dibuat selepas bayaran selesai supaya peniaga boleh proses penghantaran dan selepas jualan.",
    menuShowcase: "Paparan",
    menuVideo: "Video",
    menuPain: "Masalah",
    menuBenefits: "Kenapa beli",
    menuProcess: "Proses",
    menuProof: "Ulasan / Bukti",
    menuDetails: "Butiran",
    menuOrder: "Beli Sekarang",
    display: "Paparan",
    step: "Langkah",
    productFallback: "Produk pilihan",
    merchantFallback: "Peniaga LinkFlo",
  },
}

function uiText(lang) {
  return UI[lang] || UI.zh
}


function displayCategory(value, lang) {
  const raw = String(value || "").trim()
  const map = {
    "Beauty / Skincare": { zh: "美妆 / 护肤", en: "Beauty / Skincare", ms: "Kecantikan / Penjagaan Kulit" },
    "Health / Wellness": { zh: "健康 / 保健", en: "Health / Wellness", ms: "Kesihatan / Kesejahteraan" },
    "Food & Beverage": { zh: "食品 / 饮料", en: "Food & Beverage", ms: "Makanan / Minuman" },
    "Fashion / Apparel": { zh: "时尚 / 服饰", en: "Fashion / Apparel", ms: "Fesyen / Pakaian" },
    "Home & Living": { zh: "家居生活", en: "Home & Living", ms: "Rumah / Gaya Hidup" },
    "Digital Product / Software": { zh: "数字产品 / 软件", en: "Digital Product / Software", ms: "Produk Digital / Perisian" },
    "数字产品 / 软件": { zh: "数字产品 / 软件", en: "Digital Product / Software", ms: "Produk Digital / Perisian" },
    "Produk Digital / Perisian": { zh: "数字产品 / 软件", en: "Digital Product / Software", ms: "Produk Digital / Perisian" },
    "Course / Education": { zh: "课程 / 教育", en: "Course / Education", ms: "Kursus / Pendidikan" },
    "Service / Appointment": { zh: "服务 / 预约", en: "Service / Appointment", ms: "Servis / Temujanji" },
    "Automotive": { zh: "汽车", en: "Automotive", ms: "Automotif" },
    "Baby / Kids": { zh: "母婴 / 儿童", en: "Baby / Kids", ms: "Bayi / Kanak-kanak" },
    "Pet": { zh: "宠物", en: "Pet", ms: "Haiwan Peliharaan" },
    "Other": { zh: "其他", en: "Other", ms: "Lain-lain" },
    "General": { zh: "一般", en: "General", ms: "Umum" },
  }
  return map[raw]?.[lang] || raw || (lang === "ms" ? "Umum" : lang === "en" ? "General" : "一般")
}

function displayProductType(value, lang) {
  const raw = String(value || "PHYSICAL").toUpperCase()
  const dict = {
    PHYSICAL: { zh: "实体产品", en: "Physical Product", ms: "Produk Fizikal" },
    "PHYSICAL PRODUCT": { zh: "实体产品", en: "Physical Product", ms: "Produk Fizikal" },
    "实体产品": { zh: "实体产品", en: "Physical Product", ms: "Produk Fizikal" },
    "PRODUK FIZIKAL": { zh: "实体产品", en: "Physical Product", ms: "Produk Fizikal" },
    DIGITAL: { zh: "数字产品", en: "Digital Product", ms: "Produk Digital" },
    "DIGITAL PRODUCT": { zh: "数字产品", en: "Digital Product", ms: "Produk Digital" },
    "数字产品": { zh: "数字产品", en: "Digital Product", ms: "Produk Digital" },
    "PRODUK DIGITAL": { zh: "数字产品", en: "Digital Product", ms: "Produk Digital" },
    SERVICE: { zh: "服务 / 预约", en: "Service / Appointment", ms: "Servis / Temujanji" },
    "SERVICE / APPOINTMENT": { zh: "服务 / 预约", en: "Service / Appointment", ms: "Servis / Temujanji" },
    "服务 / 预约": { zh: "服务 / 预约", en: "Service / Appointment", ms: "Servis / Temujanji" },
    "SERVIS / TEMUJANJI": { zh: "服务 / 预约", en: "Service / Appointment", ms: "Servis / Temujanji" },
  }
  return dict[raw]?.[lang] || raw
}

function inline(text) {
  if (!text) return null
  return String(text).split(/(\*\*.*?\*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <span className="lux-hl" key={i}>{part.slice(2, -2)}</span>
    }
    return <span key={i}>{part}</span>
  })
}

function gallery(product, activePage) {
  const s = activePage?.sections || {}
  const raw =
    activePage?.galleryImages ||
    activePage?.productImages ||
    s?.showcase?.items?.map((x) => x?.image || x?.imageUrl).filter(Boolean) ||
    product?.galleryImages ||
    product?.productImages ||
    product?.images ||
    []

  if (Array.isArray(raw)) {
    return raw.map((x) => (typeof x === "string" ? x : x?.url || x?.imageUrl || x?.image)).filter(Boolean).slice(0, 9)
  }

  return String(raw).split("\n").map((x) => x.trim()).filter(Boolean).slice(0, 9)
}

function mainImage(product, page) {
  const s = page?.sections || {}
  return (
    page?.heroProductImage ||
    page?.productImage ||
    s?.hero?.image ||
    s?.hero?.backgroundImage ||
    product?.image ||
    product?.imageUrl ||
    product?.coverImage ||
    ""
  )
}


function textHasFakePrefix(value) {
  if (typeof value === "string") return value.includes("[EN]") || value.includes("[BM]")
  if (Array.isArray(value)) return value.some(textHasFakePrefix)
  if (value && typeof value === "object") return Object.values(value).some(textHasFakePrefix)
  return false
}

function flattenText(value) {
  if (typeof value === "string") return value
  if (Array.isArray(value)) return value.map(flattenText).join(" ")
  if (value && typeof value === "object") return Object.values(value).map(flattenText).join(" ")
  return ""
}

function textLooksLocalFallback(value) {
  const text = flattenText(value).toLowerCase()
  if (!text.trim()) return false
  const phrases = [
    "helps customers understand the product before they buy",
    "is explained through a simple funnel",
    "presented in a simple product funnel",
    "customer questions this funnel needs to answer",
    "questions customers need answered before buying",
    "customers need clear product information",
    "buying decisions can be slow",
    "how this product is presented to customers",
    "understand this product before you buy",
    "so customers can understand the benefits, usage, payment flow",
    "basic questions about price, process and after-sales support",
    "review the product details, images, price and order process",
    "membantu pelanggan faham produk sebelum membeli",
    "diterangkan melalui funnel ringkas",
    "dipersembahkan dalam format mudah baca",
    "masalah pelanggan yang perlu dijawab",
    "pelanggan perlukan penerangan jelas",
    "keputusan membeli boleh jadi lambat",
    "apa yang this product bantu sampaikan",
    "fahami this product sebelum membuat pembelian",
    "soalan asas tentang harga, proses dan selepas pembelian",
    "sila semak maklumat produk, imej, harga dan proses order",
  ]
  return phrases.some((phrase) => text.includes(phrase))
}

function hasMeaningfulFunnelCopy(value) {
  if (!value || typeof value !== "object") return false
  const fields = [
    value.heroTitle, value.heroSubtitle, value.problemTitle, value.problemSubtitle, value.painPoints,
    value.solutionTitle, value.solutionSubtitle, value.benefits, value.processSteps, value.longDescription,
    value.offerTitle, value.offerSubtitle, value.faqs, value.ctaTitle, value.ctaSubtitle,
    value.sections?.hero?.title, value.sections?.hero?.subtitle, value.sections?.problem?.title,
    value.sections?.solution?.title, value.sections?.cta?.title,
  ]
  return fields.some(has)
}

function translationUsableForLang(value, lang) {
  if (!value || typeof value !== "object") return false
  if (!hasMeaningfulFunnelCopy(value)) return false
  if (textHasFakePrefix(value)) return false
  if (textLooksLocalFallback(value)) return false
  if (translationObjectLooksMostlyUntranslated(value, lang)) return false
  return true
}

function pickAny(...values) {
  for (const value of values) {
    if (has(value)) return value
  }
  return ""
}

function cjkRatio(value) {
  const text = flattenText(value)
  const cjk = (text.match(/[\u3400-\u9FFF]/g) || []).length
  const latin = (text.match(/[A-Za-z]/g) || []).length
  return { cjk, latin, ratio: cjk / Math.max(1, cjk + latin) }
}

// Whole-object check: keep this lenient so one untranslated short title does not
// reject an otherwise good OpenAI translation. Individual fields are checked below.
function translationObjectLooksMostlyUntranslated(value, lang) {
  if (lang === "zh") return false
  const { cjk, ratio } = cjkRatio(value)
  return cjk >= 30 && ratio > 0.3
}

// Field-level check: strict enough to catch short Chinese titles like
// “为什么你会需要这个？” or “产品 / 服务详情” inside EN/BM pages.
function fieldLooksUntranslated(value, lang) {
  if (lang === "zh") return false
  if (!has(value)) return false
  const { cjk, ratio } = cjkRatio(value)
  if (!cjk) return false
  if (cjk >= 2 && ratio > 0.18) return true
  return false
}

function textLooksMostlyUntranslated(value, lang) {
  return fieldLooksUntranslated(value, lang)
}

function textUsableForLang(value, lang) {
  if (!has(value)) return false
  if (lang === "zh") return true
  return !textHasFakePrefix(value) && !fieldLooksUntranslated(value, lang)
}

function pickForLang(lang, ...values) {
  for (const value of values) {
    if (textUsableForLang(value, lang)) return value
  }
  return ""
}

function sectionItemsText(section, fallbackAnswer = "") {
  if (!section?.items) return ""
  return section.items
    .map((x) => {
      if (typeof x === "string") return x
      const title = x?.title || x?.question || ""
      const desc = x?.desc || x?.answer || x?.text || x?.description || ""
      return fallbackAnswer ? `${title}|${desc || fallbackAnswer}` : (x?.text || x?.title || x?.desc || x?.description || "")
    })
    .filter(Boolean)
    .join("\n")
}


function hasMarkdownHighlight(value = '') {
  return /\*\*[^*]+\*\*/.test(String(value || ''))
}

function firstUsefulTextChunk(text = '') {
  const raw = String(text || '').replace(/\*\*/g, '').trim()
  if (!raw) return ''
  const firstLine = raw.split(/\n+/).map((x) => x.trim()).filter(Boolean)[0] || raw
  if (/^[\u3400-\u9fff]/.test(firstLine)) return firstLine.slice(0, Math.min(8, Math.max(2, firstLine.length)))
  const words = firstLine.split(/\s+/).filter(Boolean)
  return words.slice(0, Math.min(4, Math.max(1, words.length))).join(' ')
}

function addHighlightToText(text = '') {
  const raw = String(text || '')
  if (!raw || hasMarkdownHighlight(raw)) return raw
  const chunk = firstUsefulTextChunk(raw)
  if (!chunk) return raw
  return raw.replace(chunk, `**${chunk}**`)
}

function preserveHighlightsDeep(target, source) {
  if (!target || !source) return target
  if (typeof target === 'string') {
    return hasMarkdownHighlight(source) && !hasMarkdownHighlight(target) ? addHighlightToText(target) : target
  }
  if (Array.isArray(target)) return target.map((item, i) => preserveHighlightsDeep(item, Array.isArray(source) ? source[i] : source))
  if (typeof target === 'object') {
    const out = { ...target }
    for (const key of Object.keys(out)) {
      if (source && Object.prototype.hasOwnProperty.call(source, key)) out[key] = preserveHighlightsDeep(out[key], source[key])
    }
    return out
  }
  return target
}

function localizeFallbackPage(product = {}, page = {}, lang = "en") {
  const base = page || {}
  const sec = base.sections || {}
  const name = product?.name || base.brandName || sec.hero?.title || "Product"
  const price = Number(product?.price || base.price || 0)
  const priceText = price > 0 ? `RM ${price.toFixed(2)}` : (lang === "ms" ? "harga akan dipaparkan semasa checkout" : "price will be shown at checkout")
  let localized
  if (lang === "ms") {
    localized = {
      ...base,
      sections: {
        ...sec,
        hero: { ...(sec.hero || {}), title: `${name} membantu pelanggan faham produk sebelum membeli`, subtitle: `${name} diterangkan melalui funnel ringkas supaya pelanggan boleh faham manfaat, bayaran dan proses selepas pembelian. Harga bermula pada ${priceText}.`, ctaText: "Beli Sekarang" },
        problem: { ...(sec.problem || {}), title: "Masalah pelanggan yang perlu dijawab", subtitle: "Funnel ini mengurangkan soalan berulang sebelum pelanggan membeli.", items: [
          { title: "Pelanggan perlukan penerangan jelas", desc: "Maklumat utama diterangkan lebih awal." },
          { title: "Keputusan membeli boleh jadi lambat", desc: "Manfaat dan proses bayaran dipaparkan dalam satu halaman." },
        ] },
        solution: { ...(sec.solution || {}), title: `Apa yang ${name} bantu sampaikan`, subtitle: "Disusun untuk trafik promoter, iklan dan video pendek.", items: [
          { title: "Penerangan produk lebih tersusun", desc: "Pelanggan lebih mudah faham nilai produk." },
          { title: "Kurangkan komunikasi berulang", desc: "FAQ dan jaminan menjawab keraguan asas." },
        ] },
        faq: { ...(sec.faq || {}), title: "Soalan Lazim", items: [
          { title: `Berapa harga ${name}?`, desc: `Harga yang dipaparkan ialah ${priceText}.` },
          { title: "Bagaimana saya membuat order?", desc: "Tekan butang beli dan lengkapkan bayaran melalui Billplz." },
        ] },
        cta: { ...(sec.cta || {}), title: `Bersedia untuk dapatkan ${name}?`, subtitle: "Semak maklumat produk dan teruskan checkout apabila bersedia.", buttonText: "Beli Sekarang" },
      },
      heroTitle: `${name} membantu pelanggan faham produk sebelum membeli`,
      heroSubtitle: `${name} diterangkan melalui funnel ringkas supaya pelanggan boleh faham manfaat, bayaran dan proses selepas pembelian. Harga bermula pada ${priceText}.`,
      ctaText: "Beli Sekarang",
      videoTitle: "Tonton video produk",
      videoSubtitle: "Fahami sama ada produk ini sesuai untuk anda dalam masa singkat.",
      galleryTitle: "Paparan produk",
      gallerySubtitle: "Leret gambar untuk faham produk dengan cepat di telefon.",
      problemTitle: "Adakah anda menghadapi masalah ini?",
      problemSubtitle: "Fahami masalah dahulu sebelum membuat keputusan membeli.",
      solutionTitle: `Kenapa ${name} sesuai untuk anda?`,
      solutionSubtitle: "Halaman ini membantu pelanggan nampak sebab untuk membeli.",
      processTitle: "Apa berlaku selepas order?",
      proofTitle: "Ulasan / Bukti",
      detailsTitle: "Butiran Produk / Servis",
      offerTitle: "Apa yang anda akan dapat?",
      faqTitle: "Soalan Lazim",
      ctaTitle: `Bersedia untuk dapatkan ${name}?`,
      ctaSubtitle: "Semak maklumat produk dan teruskan checkout apabila bersedia.",
      finalCtaTitle: `Bersedia untuk dapatkan ${name}?`,
      finalCtaSubtitle: "Semak maklumat produk dan teruskan checkout apabila bersedia.",
      paidToMerchantText: "Selepas bayaran berjaya, order akan dihantar ke peniaga untuk diproses.",
      supportTrackingText: "Sokongan order / Tracking",
      stickyCtaText: "Beli Sekarang",
      faqButtonText: "Baca FAQ dahulu",
      safeNote: "Rekod order hanya dibuat selepas bayaran selesai supaya peniaga boleh proses penghantaran dan selepas jualan.",
    }
  } else {
    localized = {
      ...base,
      sections: {
        ...sec,
        hero: { ...(sec.hero || {}), title: `${name} helps customers understand the product before they buy`, subtitle: `${name} is explained through a simple funnel so customers can understand the benefits, payment flow and after-sales process. Price starts from ${priceText}.`, ctaText: "Buy Now" },
        problem: { ...(sec.problem || {}), title: "Customer questions this funnel needs to answer", subtitle: "This funnel reduces repeated questions before customers buy.", items: [
          { title: "Customers need clear product information", desc: "Key details are explained earlier." },
          { title: "Buying decisions can be slow", desc: "Benefits and payment flow are shown in one page." },
        ] },
        solution: { ...(sec.solution || {}), title: `How ${name} is presented to customers`, subtitle: "Structured for promoter traffic, ads and short videos.", items: [
          { title: "Clearer product explanation", desc: "Customers can understand the product value faster." },
          { title: "Less repeated communication", desc: "FAQ and assurance help answer common doubts." },
        ] },
        faq: { ...(sec.faq || {}), title: "Frequently Asked Questions", items: [
          { title: `How much is ${name}?`, desc: `The displayed price is ${priceText}.` },
          { title: "How do I place an order?", desc: "Click the buy button and complete payment through Billplz." },
        ] },
        cta: { ...(sec.cta || {}), title: `Ready to get ${name}?`, subtitle: "Review the product information and continue to checkout when ready.", buttonText: "Buy Now" },
      },
      heroTitle: `${name} helps customers understand the product before they buy`,
      heroSubtitle: `${name} is explained through a simple funnel so customers can understand the benefits, payment flow and after-sales process. Price starts from ${priceText}.`,
      ctaText: "Buy Now",
      videoTitle: "Watch the product video",
      videoSubtitle: "Understand whether this product is right for you in the shortest time.",
      galleryTitle: "Product showcase",
      gallerySubtitle: "Swipe through the images to understand the product quickly on mobile.",
      problemTitle: "Are you facing these problems?",
      problemSubtitle: "Understand the problem first before deciding whether this product is worth buying.",
      solutionTitle: `Why is ${name} suitable for you?`,
      solutionSubtitle: "This page helps customers see clear reasons to buy.",
      processTitle: "What happens after you order?",
      proofTitle: "Reviews / Proof",
      detailsTitle: "Product / Service Details",
      offerTitle: "What will you get?",
      faqTitle: "Frequently Asked Questions",
      ctaTitle: `Ready to get ${name}?`,
      ctaSubtitle: "Review the product information and continue to checkout when ready.",
      finalCtaTitle: `Ready to get ${name}?`,
      finalCtaSubtitle: "Review the product information and continue to checkout when ready.",
      paidToMerchantText: "After successful payment, the order will be sent to the merchant for processing.",
      supportTrackingText: "Order support / Tracking",
      stickyCtaText: "Buy Now",
      faqButtonText: "Read FAQ first",
      safeNote: "An order record is created only after payment is completed, so the merchant can process delivery and after-sales.",
    }
  }
  return preserveHighlightsDeep(localized, base)
}

function SectionTitle({ title, subtitle, center = true }) {
  if (!has(title) && !has(subtitle)) return null
  return (
    <div className={center ? "lux-title center" : "lux-title"}>
      {has(title) ? <h2>{inline(title)}</h2> : null}
      <div className="lux-title-line" />
      {has(subtitle) ? <p className="lux-center-muted">{inline(subtitle)}</p> : null}
    </div>
  )
}

function Slider({ items, render }) {
  if (!items.length) return null
  return (
    <div className="lux-slider">
      {items.map((item, i) => (
        <div className="lux-slide lux-glow-card" key={`${item}-${i}`}>
          {render ? render(item, i) : <p>{inline(item)}</p>}
        </div>
      ))}
    </div>
  )
}

export default function ProductFunnelLux({ product, page, refCode = "", related = [] }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState(0)
  const { lang } = useLanguage()
  const u = uiText(lang)
  // Chinese always renders the latest base product data.
  // EN/BM should only use a real saved/OpenAI translation. If translation is missing, invalid,
  // or is the old generic local fallback, show the merchant's original copy instead of
  // inventing English/BM funnel copy. UI labels still follow the selected language.
  const translatedPage = lang === "zh" ? null : page?.translations?.[lang]
  const translationLooksUsable = lang !== "zh" && translationUsableForLang(translatedPage, lang)
  const fallbackPage = page || {}
  const activePage = translationLooksUsable ? preserveHighlightsDeep(translatedPage, page) : fallbackPage
  const s = activePage?.sections || {}
  const fs = fallbackPage?.sections || {}
  const imagePage = page || activePage
  const tx = (...values) => lang === "zh" ? pickAny(...values) : pickForLang(lang, ...values)

  const heroTitle = tx(activePage?.heroTitle, s?.hero?.title, fallbackPage?.heroTitle, fs?.hero?.title, product?.title, product?.name) || product?.name || u.productFallback
  const heroSubtitle = tx(activePage?.heroSubtitle, s?.hero?.subtitle, fallbackPage?.heroSubtitle, fs?.hero?.subtitle, product?.subtitle)
  const heroBg = page?.heroBgImage || page?.sections?.hero?.backgroundImage || page?.sections?.hero?.image || mainImage(product, imagePage)
  const heroImg = mainImage(product, imagePage)
  const checkoutHref = `/checkout/${product.slug}${refCode ? `?ref=${encodeURIComponent(refCode)}` : ""}`
  const shownCategory = displayCategory(product?.category || activePage?.category, lang)
  const shownType = displayProductType(product?.productType || activePage?.productType, lang)
  const heroBadgeText = tx(activePage?.heroBadge, s?.hero?.badge, fallbackPage?.heroBadge, `${shownType || "PRODUCT"} · ${shownCategory || u.productFallback}`)
  const heroTrustItems = [
    tx(activePage?.heroTrust1, s?.hero?.trust1, fallbackPage?.heroTrust1, fs?.hero?.trust1, u.billplzSafe),
    tx(activePage?.heroTrust2, s?.hero?.trust2, fallbackPage?.heroTrust2, fs?.hero?.trust2, u.pageExplains),
    tx(activePage?.heroTrust3, s?.hero?.trust3, fallbackPage?.heroTrust3, fs?.hero?.trust3, u.trackingAfterPaid),
  ].filter(Boolean)
  const heroCtaText = tx(activePage?.ctaText, s?.hero?.ctaText, fallbackPage?.ctaText, fs?.hero?.ctaText, u.buyNow)
  const faqButtonText = tx(activePage?.faqButtonText, s?.hero?.secondaryButtonText, fallbackPage?.faqButtonText, fs?.hero?.secondaryButtonText, u.faqButton)
  const safeNoteText = tx(activePage?.safeNote, s?.hero?.safeNote, fallbackPage?.safeNote, fs?.hero?.safeNote, u.safeNote)
  const imageHintText = tx(activePage?.imageHint, s?.showcase?.hint, fallbackPage?.imageHint, fs?.showcase?.hint, u.imageHint)
  const paidToMerchantText = tx(activePage?.paidToMerchantText, s?.cta?.paymentNote, fallbackPage?.paidToMerchantText, fs?.cta?.paymentNote, u.paidToMerchant)
  const supportTrackingText = tx(activePage?.supportTrackingText, s?.cta?.supportButtonText, fallbackPage?.supportTrackingText, fs?.cta?.supportButtonText, u.supportTracking)
  const stickyCtaText = tx(activePage?.stickyCtaText, s?.cta?.stickyButtonText, fallbackPage?.stickyCtaText, fs?.cta?.stickyButtonText, u.menuOrder)

  const pain = lines(tx(activePage?.painPoints, sectionItemsText(s?.problem), fallbackPage?.painPoints, sectionItemsText(fs?.problem)))
  const benefits = lines(tx(activePage?.benefits, activePage?.whyPoints, sectionItemsText(s?.solution), fallbackPage?.benefits, fallbackPage?.whyPoints, sectionItemsText(fs?.solution)))
  const process = lines(tx(activePage?.processSteps, sectionItemsText(s?.process), fallbackPage?.processSteps, sectionItemsText(fs?.process)))
  const proof = lines(tx(activePage?.proofText, sectionItemsText(s?.reviews), fallbackPage?.proofText, sectionItemsText(fs?.reviews)))
  const offer = lines(tx(activePage?.offer, sectionItemsText(s?.offer), fallbackPage?.offer, sectionItemsText(fs?.offer), activePage?.longDescription, fallbackPage?.longDescription))
  const faqSource = tx(activePage?.faqs, activePage?.faq, sectionItemsText(s?.faq, u.fallbackFaqAnswer), fallbackPage?.faqs, fallbackPage?.faq, sectionItemsText(fs?.faq, u.fallbackFaqAnswer))
  const faqs = faqLines(faqSource, u.fallbackFaqAnswer)
  const images = gallery(product, imagePage)
  const baseSections = page?.sections || {}
  const video = page?.videoUrl || baseSections?.showcase?.videoUrl || baseSections?.showcase?.youtubeUrl || baseSections?.video?.url || activePage?.videoUrl || s?.showcase?.videoUrl || s?.showcase?.youtubeUrl || s?.video?.url || ""
  function scrollTo(id) {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <main className="lux-page" data-product-content="true">
      <header className="lux-header">
        <div className="lux-brand">
          <div className="lux-logo">{String(product?.merchantName || product?.name || "L").slice(0, 1)}</div>
          <div>
            <strong>{product?.name}</strong>
            <span>{product?.merchantName || activePage?.merchantName || u.merchantFallback}</span>
          </div>
        </div>
        <LanguageSwitch variant="dark" />
        <button className="lux-menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">☰</button>
      </header>

      {menuOpen ? (
        <div className="lux-drawer">
          <div className="lux-drawer-head">
            <div className="lux-brand">
              <div className="lux-logo">{String(product?.merchantName || product?.name || "L").slice(0, 1)}</div>
              <div>
                <strong>{product?.name}</strong>
                <span>{product?.merchantName || activePage?.merchantName || u.merchantFallback}</span>
              </div>
            </div>
            <button onClick={() => setMenuOpen(false)}>×</button>
          </div>
          <nav>
            <button onClick={() => scrollTo("showcase")}>{u.menuShowcase}</button>
            {video ? <button onClick={() => scrollTo("video")}>{u.menuVideo}</button> : null}
            {pain.length ? <button onClick={() => scrollTo("pain")}>{u.menuPain}</button> : null}
            {benefits.length ? <button onClick={() => scrollTo("solution")}>{u.menuBenefits}</button> : null}
            {process.length ? <button onClick={() => scrollTo("process")}>{u.menuProcess}</button> : null}
            {proof.length ? <button onClick={() => scrollTo("proof")}>{u.menuProof}</button> : null}
            <button onClick={() => scrollTo("details")}>{u.menuDetails}</button>
            {faqs.length ? <button onClick={() => scrollTo("faq")}>{u.faqTitle}</button> : null}
            <button onClick={() => scrollTo("order")}>{u.menuOrder}</button>
          </nav>
        </div>
      ) : null}

      <section className="lux-hero">
        <div
          className="lux-hero-bg"
          style={heroBg ? { backgroundImage: `linear-gradient(90deg, rgba(2,6,23,.96) 0%, rgba(15,23,42,.86) 46%, rgba(2,6,23,.74) 100%), url(${heroBg})` } : undefined}
        />
        <div className="lux-container lux-hero-grid">
          <div className="lux-hero-copy">
            <div className="lux-pill">{inline(heroBadgeText)}</div>
            <h1>{inline(heroTitle)}</h1>
            {heroSubtitle ? <p className="lux-hero-sub">{inline(heroSubtitle)}</p> : null}
            <div className="lux-mini-trust">
              {heroTrustItems.map((item, i) => <span key={i}>✓ {inline(item)}</span>)}
            </div>
            <div className="lux-hero-actions"><Link className="lux-cta" href={checkoutHref}>{inline(heroCtaText)}</Link><button className="lux-secondary-cta" onClick={() => scrollTo("faq")}>{inline(faqButtonText)}</button></div>
            <p className="lux-safe">{inline(safeNoteText)}</p>
          </div>

          {heroImg ? (
            <div className="lux-hero-product">
              <div className="lux-product-glow" />
              <div className="lux-product-stage">
                <img src={heroImg} alt={product?.name || "Product"} />
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {video ? (
        <section className="lux-section" id="video">
          <div className="lux-container">
            <SectionTitle title={tx(activePage?.videoTitle, fallbackPage?.videoTitle, u.videoTitle)} subtitle={tx(activePage?.videoSubtitle, fallbackPage?.videoSubtitle, u.videoSubtitle)} />
            <div className="lux-video"><iframe src={youtubeEmbed(video)} allowFullScreen title="product video" /></div>
          </div>
        </section>
      ) : null}


      {images.length ? (
        <section className="lux-showcase" id="showcase">
          <div className="lux-container">
            <div className="lux-section-head">
              <div className="lux-title-line" />
              <h2>{inline(tx(activePage?.galleryTitle, fallbackPage?.galleryTitle, u.productDisplay))}</h2>
              <div className="lux-title-line" />
            </div>
            <p className="lux-center-muted">{inline(tx(activePage?.gallerySubtitle, fallbackPage?.gallerySubtitle, imageHintText))}</p>
            <div className="lux-gallery">
              {images.map((img, i) => (
                <div className="lux-gallery-card" key={img + i}>
                  <img src={img} alt={`${product?.name || "Product"} ${i + 1}`} />
                  <div>{inline(lines(tx(activePage?.galleryLabels, fallbackPage?.galleryLabels))[i] || `${u.display} ${i + 1}`)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {pain.length ? (
        <section className="lux-section" id="pain">
          <div className="lux-container">
            <SectionTitle title={tx(activePage?.problemTitle, s?.problem?.title, fallbackPage?.problemTitle, fs?.problem?.title, u.defaultProblemTitle)} subtitle={tx(activePage?.problemSubtitle, s?.problem?.subtitle, fallbackPage?.problemSubtitle, fs?.problem?.subtitle, u.defaultProblemSubtitle)} />
            <div className="lux-grid-4">
              {pain.map((x, i) => <div className="lux-problem-card lux-glow-card" key={x + i}><div className="lux-problem-icon">{i + 1}</div><p>{inline(x)}</p></div>)}
            </div>
          </div>
        </section>
      ) : null}

      {benefits.length ? (
        <section className="lux-section" id="solution">
          <div className="lux-container">
            <SectionTitle title={tx(activePage?.solutionTitle, s?.solution?.title, fallbackPage?.solutionTitle, fs?.solution?.title, u.defaultSolutionTitle)} subtitle={tx(activePage?.solutionSubtitle, s?.solution?.subtitle, fallbackPage?.solutionSubtitle, fs?.solution?.subtitle, u.defaultSolutionSubtitle)} />
            <Slider items={benefits} />
          </div>
        </section>
      ) : null}

      {process.length ? (
        <section className="lux-section" id="process">
          <div className="lux-container">
            <SectionTitle title={tx(activePage?.processTitle, s?.process?.title, fallbackPage?.processTitle, fs?.process?.title, u.processTitle)} />
            <Slider items={process} render={(item, i) => <div className="lux-slide-card"><small>{u.step} {i + 1}</small><p>{inline(item)}</p></div>} />
          </div>
        </section>
      ) : null}

      {proof.length ? (
        <section className="lux-section lux-proof" id="proof">
          <div className="lux-container">
            <SectionTitle title={tx(activePage?.proofTitle, s?.reviews?.title, fallbackPage?.proofTitle, fs?.reviews?.title, u.proofTitle)} />
            <div className="lux-proof-grid">
              {proof.map((x, i) => <div className="lux-case lux-glow-card" key={x + i}><h3>#{i + 1}</h3><p>{inline(x)}</p></div>)}
            </div>
          </div>
        </section>
      ) : null}

      <section className="lux-section" id="details">
        <div className="lux-container">
          <SectionTitle title={tx(activePage?.detailsTitle, fallbackPage?.detailsTitle, u.detailsTitle)} />
          <div className="lux-product lux-glow-card">
            <div>
              <h3>{inline(product?.name || u.productFallback)}</h3>
              <p>{inline(tx(activePage?.longDescription, fallbackPage?.longDescription, product?.subtitle, activePage?.solutionSubtitle, fallbackPage?.solutionSubtitle, u.defaultDescription))}</p>
              <div className="lux-mini-trust details">
                <span>{shownType}</span>
                <span>{shownCategory}</span>
                <span>{u.stock}：{Number(product?.stock || 0)}</span>
              </div>
            </div>
            <div className="lux-price-box">
              <span>RM</span>
              <strong>{Number(product?.price || 0).toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </section>

      {offer.length ? (
        <section className="lux-section" id="offer">
          <div className="lux-container">
            <SectionTitle title={tx(activePage?.offerTitle, s?.offer?.title, fallbackPage?.offerTitle, fs?.offer?.title, u.offerTitle)} />
            <div className="lux-offer-grid">
              {offer.slice(0, 6).map((x, i) => <div className="lux-offer lux-glow-card" key={x + i}><div className="lux-icon">{i + 1}</div><p>{inline(x)}</p></div>)}
            </div>
          </div>
        </section>
      ) : null}

      {faqs.length ? (
        <section className="lux-section" id="faq">
          <div className="lux-container">
            <SectionTitle title={tx(activePage?.faqTitle, s?.faq?.title, fallbackPage?.faqTitle, fs?.faq?.title, u.faqTitle)} />
            <div className="lux-faq">
              {faqs.map((item, i) => (
                <div className="lux-faq-item lux-glow-card" key={item.q + i}>
                  <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)}><span>Q{i + 1}</span>{inline(item.q)}<b>{openFaq === i ? "−" : "+"}</b></button>
                  {openFaq === i ? <p>{inline(item.a)}</p> : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}


      <section className="lux-section lux-final" id="order">
        <div className="lux-container">
          <div className="lux-order lux-glow-card">
            <div>
              <h2>{inline(tx(activePage?.ctaTitle, activePage?.finalCtaTitle, s?.cta?.title, fallbackPage?.ctaTitle, fallbackPage?.finalCtaTitle, fs?.cta?.title, u.readyTitle))}</h2>
              <p>{inline(tx(activePage?.ctaSubtitle, activePage?.finalCtaSubtitle, s?.cta?.subtitle, fallbackPage?.ctaSubtitle, fallbackPage?.finalCtaSubtitle, fs?.cta?.subtitle, u.readySubtitle))}</p>
            </div>
            <div className="lux-form lux-buy-panel">
              <div className="lux-buy-price">{formatMoney(product?.price || 0)}</div>
              <p>{inline(paidToMerchantText)}</p>
              <Link className="lux-buy-btn" href={checkoutHref}>{inline(tx(activePage?.ctaText, s?.cta?.buttonText, fallbackPage?.ctaText, fs?.cta?.buttonText, u.buyNow))}</Link>
              <Link className="lux-soft-btn" href="/support">{inline(supportTrackingText)}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Public related product browsing removed: product discovery now lives inside approved Promoter dashboard only. */}

      <div className="lux-sticky-cta">
        <div>
          <b>{inline(product?.name)}</b>
          <span>{formatMoney(product?.price || 0)}</span>
        </div>
        <Link href={checkoutHref}>{inline(stickyCtaText)}</Link>
      </div>
    </main>
  )
}
