"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { API_URL } from "../../lib/config"
import { useLanguage } from "../../components/TranslateProvider"
import ProductFunnelLux from "../../components/ProductFunnelLux"

const PRODUCT_CATEGORIES = [
  "Beauty / Skincare",
  "Health / Wellness",
  "Food & Beverage",
  "Fashion / Apparel",
  "Home & Living",
  "Digital Product / Software",
  "Course / Education",
  "Service / Appointment",
  "Automotive",
  "Baby / Kids",
  "Pet",
  "Other",
]

const CATEGORY_KEY = {
  "Beauty / Skincare": "categoryBeauty",
  "Health / Wellness": "categoryHealth",
  "Food & Beverage": "categoryFood",
  "Fashion / Apparel": "categoryFashion",
  "Home & Living": "categoryHome",
  "Digital Product / Software": "categoryDigital",
  "Course / Education": "categoryCourse",
  "Service / Appointment": "categoryService",
  "Automotive": "categoryAutomotive",
  "Baby / Kids": "categoryBaby",
  "Pet": "categoryPet",
  "Other": "categoryOther",
}

function categoryLabel(value, tr = UI.zh) {
  return tr[CATEGORY_KEY[value]] || value
}


const UI = {
  zh: {
    merchantSalesOS: "Merchant Sales OS",
    heroDesc: "这里不是填资料后台。这里是你的 AI 成交页 + Promoter 分销经营中心。",
    createAiFunnel: "创建 AI Funnel",
    handleOrders: "处理订单",
    planUpgrade: "配套 / 升级",
    todaySales: "今日销售",
    monthSales: "本月销售",
    orderCount: "订单数量",
    conversionRate: "转化率",
    promoterCount: "Promoter 数量",
    paidOrdersToday: "今天已付款订单",
    paidOrdersMonth: "本月已付款订单",
    allOrdersPaid: "全部订单 · {paid} paid",
    paidOrdersViews: "已付款订单 ÷ 浏览量",
    promoterSourceRecord: "有带来订单 / 来源记录",
    funnelAnalytics: "Funnel 数据",
    funnelAnalyticsDesc: "看每个成交页从浏览、点击到付款的表现。没有 tracking 数据时会自动显示 0，不会爆页面。",
    viewOrders: "查看订单",
    views: "浏览",
    clicks: "点击",
    paidOrders: "付款订单",
    funnelVisits: "Funnel 浏览",
    ctaClicks: "CTA / checkout 点击",
    billplzPaid: "Billplz 已付款",
    paidSales: "付款销售额",
    totalGmv: "总 GMV",
    aiSuggestions: "AI 经营建议",
    topProduct: "Top Product",
    topPromoter: "Top Promoter",
    noProductData: "还没有产品数据。",
    noPromoterOrders: "还没有 Promoter 订单。复制推广模板给 Promoter 测第一波流量。",
    noProductsYet: "还没有产品。先创建第一个 AI Product Funnel。",
    aiBuilder: "AI FUNNEL BUILDER",
    createProductFunnel: "创建产品成交页",
    builderDesc: "用 5 个步骤完成产品成交页。AI 会补齐成交文案、FAQ、痛点、CTA，并自动准备 English + Bahasa Melayu。",
    preview: "Preview",
    stepBasic: "Step 1 · 基础资料",
    stepAi: "Step 2 · AI Funnel",
    stepMedia: "Step 3 · 图片 / 视频",
    stepPromoter: "Step 4 · Promoter 设置",
    stepPreview: "Step 5 · Preview",
    basicInfo: "基础资料",
    basicHint: "先填产品最基本资料。后面的 funnel 文案可以交给 AI 生成。",
    productName: "产品名字 *",
    price: "价格 RM *",
    stock: "库存 / 数量",
    aftersalesWhatsapp: "售后 WhatsApp",
    merchantWhatsapp: "商家 WhatsApp（可空）",
    physicalProduct: "实体产品",
    digitalProduct: "数字产品",
    serviceProduct: "服务/预约",
    builderStatus: "Builder 状态",
    basicIncomplete: "基础资料：未完成",
    basicDone: "基础资料：已完成",
    aiReady: "AI Funnel：可生成",
    aiGenerated: "AI Funnel：已生成",
    imagesCount: "图片：{count} / 9",
    promoterCommission: "Promoter 佣金：{rate}",
    commissionNotSet: "未设置",
    translationReady: "三语：自动准备中",
    settlementPreview: "结算预览",
    merchantReceive: "商家预计到手",
    benefitsTitle: "核心卖点 / 好处",
    benefitsHint: "一行一个，AI 会放进 Solution / Offer",
    painTitle: "顾客痛点",
    painHint: "一行一个，AI 会放进 Problem section",
    faqTitle: "FAQ 常见问题",
    faqHint: "问题和答案可加减，提交时会进入三语 funnel",
    proofTitle: "真实证明 / 评价 / 案例",
    proofHint: "没有就留空，有填才会出现",
    useTitle: "使用方式 / 交付方式",
    useHint: "实体 / 数字 / 服务都可以写",
    ctaTitle: "CTA / 保障点",
    ctaHint: "用于降低顾客疑虑",
    add: "+ 添加",
    delete: "删除",
    collapse: "收起",
    expand: "展开",
    question: "问题",
    answer: "答案",
    inputContent: "输入内容",
    itemAdded: "已新增一项",
    itemRemoved: "已删除一项",
    saveDraft: "保存草稿",
    submitReview: "提交审核",
    previous: "上一步",
    next: "下一步",
    generateAi: "一键 AI 生成 Funnel",
    productImages: "产品图片",
    productImagesHint: "最多 9 张。第一张会作为主图和 Hero 背景。",
    videoEmbedTitle: "产品影片",
    videoEmbedHint: "影片请分开填写 YouTube / TikTok / Vimeo link，不要和图片上传混在一起。",
    videoEmbedPh: "贴上 YouTube / TikTok / Vimeo 影片链接（可空）",
    noVideo: "还没有影片链接。",
    previewFull: "完整 Funnel 预览",
    previewFullDesc: "这里会模拟顾客看到的完整成交页结构：Hero、图片、影片、痛点、卖点、FAQ 和 CTA。",
    previewPage: "预览页面",
    oneClickCreate: "一键生成 Funnel",
    draftSecondary: "保存草稿（可选）",
    createFirst: "请先创建产品，再打开真实页面。",
    customerTrustNote: "顾客页面只显示产品价值、价格、购买按钮、FAQ 和售后说明，不显示佣金或平台费用。",
    chooseFiles: "选择图片",
    noImages: "还没有图片。",
    mainImage: "主图",
    setMainImage: "设主图",
    copyFunnel: "复制 Funnel",
    openFunnel: "打开 Funnel",
    copyPromoterLink: "复制 Promoter Link",
    productFunnels: "我的产品 Funnel",
    productFunnelsDesc: "不只是产品列表。这里可以看状态、结算、打开 funnel、复制推广链接。",
    actions: "操作",
    editFunnel: "编辑 Funnel",
    hide: "隐藏",
    deleteProduct: "删除",
    quickActions: "快速操作",
    addNewProduct: "+ 新增产品",
    addAnother: "新增另一个",
    editProduct: "编辑产品 Funnel",
    newProductDraft: "新产品草稿",
    editingProduct: "正在编辑产品",
    aiGeneratedEditable: "AI 生成后你可以继续加减内容。这里不是普通长表格，是成交页内容编辑器。",
    customerFacingContent: "顾客页面全部字眼",
    customerFacingContentHint: "这里控制 /p/[slug] 顾客会看到的所有主要文案。Slug 有的标题、说明、CTA、影片标题和展示文案，这里都能改。",
    heroBadgeLabel: "Hero 标签",
    heroTitleLabel: "Hero 标题",
    heroSubtitleLabel: "Hero 副标题",
    galleryTitleLabel: "图片区标题",
    gallerySubtitleLabel: "图片区说明",
    galleryLabelsLabel: "图片说明（每行一个）",
    videoTitleLabel: "影片区标题",
    videoSubtitleLabel: "影片区说明",
    problemTitleLabel: "痛点区标题",
    problemSubtitleLabel: "痛点区说明",
    solutionTitleLabel: "卖点区标题",
    solutionSubtitleLabel: "卖点区说明",
    processTitleLabel: "流程区标题",
    processStepsLabel: "流程步骤（每行一个）",
    proofTitleLabel: "证明/评价区标题",
    offerTitleLabel: "详情区标题",
    offerSubtitleLabel: "详情区说明",
    faqTitleLabel: "FAQ 标题",
    detailsTitleLabel: "产品详情标题",
    finalCtaTitleLabel: "最后 CTA 标题",
    finalCtaSubtitleLabel: "最后 CTA 说明",
    liveSlugPreview: "真实 Slug 页面预览",
    liveSlugPreviewHint: "这个预览使用和 /p/[slug] 同一个 Product Funnel 组件，所以商家看到的会更接近顾客最终看到的页面。",
    realDraftPreview: "查看未上线预览",
    draftPreviewHint: "草稿 / 待审核也能预览，不需要等 Admin approve。",
    trustBadge1Label: "Hero 信任点 1",
    trustBadge2Label: "Hero 信任点 2",
    trustBadge3Label: "Hero 信任点 3",
    imageHintLabel: "图片区提示文字",
    faqButtonLabel: "Hero 第二按钮文字",
    safeNoteLabel: "Hero 安全说明",
    paidToMerchantLabel: "购买区付款说明",
    supportTrackingLabel: "售后 / Tracking 按钮文字",
    stickyCtaLabel: "底部浮动购买按钮文字",
    targetCustomerPh: "目标客户：谁最需要这个产品？",
    problemSolvedPh: "解决什么问题？",
    productDetailPh: "产品详细说明（AI 可帮你优化）",
    aiGenerating: "AI 生成中...",
    mediaUploading: "图片上传中...",
    noImagesSuggest: "还没有图片。建议至少上传 1 张产品图。",
    promoterSettingDesc: "设置让推广者愿意帮你卖的佣金，同时看清楚商家预计到手。",
    commissionPh: "Promoter 佣金 %（例如 20）",
    ctaButtonPh: "CTA 按钮文字",
    whatsappMessagePh: "WhatsApp 预设信息（可空）",
    strongHookTitle: "你的强钩子标题",
    valueDesc: "这里会展示顾客能快速理解的产品价值。",
    buyNow: "立即购买",
    sellingPointsLabel: "卖点",
    translationDone: "EN + BM 已准备",
    translationAuto: "保存草稿 / 提交审核时会自动准备 EN + BM",
    filled: "已填写",
    ready: "已准备",
    copiedFunnel: "已复制产品 Funnel link",
    copiedPromoter: "已复制 Promoter link 模板",
    copyPromoTemplate: "复制推广模板",
    restoreShow: "恢复显示",
    noImage: "没有图片",
    merchantNet: "商家到手参考",
    rejectionReason: "打回原因",
    sales: "销售额",
    promoters: "Promoters",
    digitalDeliveryPh: "数字产品交付内容",
    serviceInstructionsPh: "服务预约说明",
    nextAiFunnel: "下一步：AI Funnel",
    uploadImageDeleted: "图片已删除",
    setAsMain: "已设为主图",
    switchedNew: "已切换到新增产品模式。",
    suggestionViewsNoPaid: "有浏览但还没有付款，建议检查 Hero 标题、价格信任感和 CTA 是否够明确。",
    suggestionClicksNoPaid: "有点击但没有付款，建议加强付款前 FAQ、保障点和顾客疑虑处理。",
    suggestionNoViews: "已上线但没有浏览，建议复制 Promoter link 给推广者先测试流量。",
    suggestionHealthy: "目前没有明显风险。下一步重点看 Top Product，把有浏览和有订单的产品优先放大。",
    healthNoProduct: "先上传第一个产品，AI 会帮你生成可成交 Funnel。",
    healthPending: "个产品正在审核。审核通过后，Promoter 才能开始推广。",
    healthDraft: "个产品还在草稿。建议补好图片、佣金和 Funnel 文案后提交审核。",
    healthNoImage: "个产品缺少图片。产品图会直接影响顾客信任和转化。",
    healthNoPaid: "产品已经准备好，下一步是复制 Promoter link 给推广者测试第一波流量。",
    healthGood: "已有订单数据。接下来重点看 Top Product 和未处理订单，优先优化有点击和有销量的产品。",
    stepWord: "步骤",
    workspaceBadge: "工作台",
    aiBuilderLabel: "AI FUNNEL BUILDER",
    originalPricePh: "原价 / Original price（可空）",
    promotionPh: "优惠 / Offer（例：买2送1、包邮、限时折扣）",
    promotionDeadlinePh: "优惠截止 / Deadline（可空）",
    completeBriefTitle: "完整产品 Brief",
    completeBriefHint: "这里填越完整，AI 生成的成交页越不像模板。不会填可以先留空，之后再补。",
    aiMaterial: "AI 素材",
    targetCustomerFullPh: "适合谁？例如：上班族、宝妈、敏感肌、刚创业的人",
    targetNotSuitablePh: "不适合谁？例如：孕妇不建议、预算太低不适合",
    customerPainFullPh: "顾客现在的问题 / 痛点，越具体越好",
    failedAlternativesPh: "顾客试过什么方法但失败？",
    customerObjectionsPh: "顾客最担心 / 不买的原因，例如：怕没效、怕被骗、怕麻烦",
    desiredResultPh: "顾客最想要的结果，例如：更省时间、更安心、更方便",
    ingredientsPh: "产品成分 / 材料 / 技术 / 服务内容",
    differentiationPh: "和普通产品有什么不同？为什么选你？",
    trustAssetsPh: "信任资料：实体店、顾客反馈、KOL、认证、公司背景、Before/After",
    caseStatusPlaceholder: "案例状态",
    caseStatusNone: "暂时没有案例",
    caseStatusSome: "有少量案例",
    caseStatusMany: "有很多案例",
    soldCountPh: "已售数量 / 成交数量（没有就留空，不要乱填）",
    guaranteePh: "保障 / 售后 / 退换政策",
    deliveryTimePh: "多久收到货 / 安排服务？",
    paymentMethodsPh: "付款方式：FPX / Card / COD / Transfer",
    orderFlowPh: "顾客下单后会发生什么？例如：付款成功 → 商家确认 → 发货/预约 → 售后跟进",
    sellingPointsPh: "核心卖点（一行一个）",
    proofMaterialPh: "信任资料 / 案例 / 证明",
    faqMaterialPh: "顾客疑虑 / FAQ 原始素材",
    orderDeliveryPh: "下单流程 / 交付方式",
    videoPurposePh: "这个视频想表达什么？例如：开箱、使用过程、顾客反馈、老板解释",
    imageUsageNotesPh: "图片说明：每张图是什么用途？例如：1 产品图，2 Before/After，3 顾客反馈",
    productVideoPreviewTitle: "产品影片预览",
    uploadedImagesMsg: "已上传 {count} 张图片。",
    savedEditMsg: "已保存。若之前已上线，修改后会重新进入待审核。",
    productCreatedMsg: "产品已创建。你可以预览页面或提交审核。",
    confirmArchiveMsg: "确定删除/归档 {name}？订单记录会保留，公开页面会隐藏。",
    ordersLabel: "订单",
    paidLabel: "已付款",
    totalOrdersLabel: "总订单",
    viewsLabel: "浏览",
    commissionLabel: "佣金",
    liveStatus: "已上线",
    pendingStatus: "待审核",
    rejectedStatus: "被打回",
    draftStatus: "草稿",
    categoryBeauty: "美妆 / 护肤",
    categoryHealth: "健康 / 保健",
    categoryFood: "食品 / 饮料",
    categoryFashion: "时尚 / 服饰",
    categoryHome: "家居 / 生活",
    categoryDigital: "数码产品 / 软件",
    categoryCourse: "课程 / 教育",
    categoryService: "服务 / 预约",
    categoryAutomotive: "汽车 / 交通",
    categoryBaby: "母婴 / 儿童",
    categoryPet: "宠物",
    categoryOther: "其他",
  },
  en: {
    merchantSalesOS: "Merchant Sales OS",
    heroDesc: "This is not a data-entry backend. It is your AI funnel and Promoter distribution operating center.",
    createAiFunnel: "Create AI Funnel",
    handleOrders: "Handle Orders",
    planUpgrade: "Plan / Upgrade",
    todaySales: "Today Sales",
    monthSales: "Monthly Sales",
    orderCount: "Order Count",
    conversionRate: "Conversion Rate",
    promoterCount: "Promoter Count",
    paidOrdersToday: "Paid orders today",
    paidOrdersMonth: "Paid orders this month",
    allOrdersPaid: "All orders · {paid} paid",
    paidOrdersViews: "Paid orders ÷ views",
    promoterSourceRecord: "Promoters with orders / source records",
    funnelAnalytics: "Funnel Analytics",
    funnelAnalyticsDesc: "Check each funnel performance from views, clicks to paid orders. Missing tracking data will show as 0 and will not break the page.",
    viewOrders: "View Orders",
    views: "Views",
    clicks: "Clicks",
    paidOrders: "Paid Orders",
    funnelVisits: "Funnel visits",
    ctaClicks: "CTA / checkout clicks",
    billplzPaid: "Billplz paid",
    paidSales: "Paid Sales",
    totalGmv: "Total GMV",
    aiSuggestions: "AI Suggestions",
    topProduct: "Top Product",
    topPromoter: "Top Promoter",
    noProductData: "No product data yet.",
    noPromoterOrders: "No promoter orders yet. Copy the promotion template and test your first traffic batch.",
    noProductsYet: "No products yet. Create your first AI Product Funnel.",
    aiBuilder: "AI FUNNEL BUILDER",
    createProductFunnel: "Create Product Funnel",
    builderDesc: "Complete a product funnel in 5 steps. AI helps generate copy, FAQ, pain points, CTA, and prepares English + Bahasa Melayu automatically.",
    preview: "Preview",
    stepBasic: "Step 1 · Basic Info",
    stepAi: "Step 2 · AI Funnel",
    stepMedia: "Step 3 · Images / Video",
    stepPromoter: "Step 4 · Promoter Settings",
    stepPreview: "Step 5 · Preview",
    basicInfo: "Basic Info",
    basicHint: "Start with the basic product info. AI can generate the funnel copy later.",
    productName: "Product Name *",
    price: "Price RM *",
    stock: "Stock / Quantity",
    aftersalesWhatsapp: "After-sales WhatsApp",
    merchantWhatsapp: "Merchant WhatsApp (optional)",
    physicalProduct: "Physical Product",
    digitalProduct: "Digital Product",
    serviceProduct: "Service / Appointment",
    builderStatus: "Builder Status",
    basicIncomplete: "Basic info: incomplete",
    basicDone: "Basic info: complete",
    aiReady: "AI Funnel: ready to generate",
    aiGenerated: "AI Funnel: generated",
    imagesCount: "Images: {count} / 9",
    promoterCommission: "Promoter commission: {rate}",
    commissionNotSet: "Not set",
    translationReady: "Languages: preparing automatically",
    settlementPreview: "Settlement Preview",
    merchantReceive: "Estimated Merchant Payout",
    benefitsTitle: "Key Benefits",
    benefitsHint: "One per line. AI will place these into Solution / Offer.",
    painTitle: "Customer Pain Points",
    painHint: "One per line. AI will place these into Problem section.",
    faqTitle: "FAQ",
    faqHint: "You can add or remove Q&A. They will be included in the 3-language funnel.",
    proofTitle: "Proof / Reviews / Cases",
    proofHint: "Leave blank if not available. It only appears when filled.",
    useTitle: "Usage / Delivery Method",
    useHint: "Works for physical, digital, or service products.",
    ctaTitle: "CTA / Trust Points",
    ctaHint: "Use this to reduce customer hesitation.",
    add: "+ Add",
    delete: "Delete",
    collapse: "Collapse",
    expand: "Expand",
    question: "Question",
    answer: "Answer",
    inputContent: "Input content",
    itemAdded: "item added",
    itemRemoved: "item removed",
    saveDraft: "Save Draft",
    submitReview: "Submit Review",
    previous: "Previous",
    next: "Next",
    generateAi: "Generate AI Funnel",
    productImages: "Product Images",
    productImagesHint: "Maximum 9 images. The first image is used as main image and Hero background.",
    videoEmbedTitle: "Product Video",
    videoEmbedHint: "Paste a YouTube / TikTok / Vimeo link separately. Do not mix it with image uploads.",
    videoEmbedPh: "Paste YouTube / TikTok / Vimeo video link (optional)",
    noVideo: "No video link yet.",
    previewFull: "Full Funnel Preview",
    previewFullDesc: "This simulates the customer-facing funnel structure: Hero, images, video, pain points, benefits, FAQ and CTA.",
    previewPage: "Preview Page",
    oneClickCreate: "Generate Funnel",
    draftSecondary: "Save Draft (optional)",
    createFirst: "Create the product first before opening the live page.",
    customerTrustNote: "Customer pages only show value, price, buying CTA, FAQ and after-sales support. Commission and platform fees are hidden.",
    chooseFiles: "Choose images",
    noImages: "No images yet.",
    mainImage: "Main Image",
    setMainImage: "Set Main Image",
    copyFunnel: "Copy Funnel",
    openFunnel: "Open Funnel",
    copyPromoterLink: "Copy Promoter Link",
    productFunnels: "My Product Funnels",
    productFunnelsDesc: "Not just a product list. Check status, settlement, open funnels and copy promoter links here.",
    actions: "Actions",
    editFunnel: "Edit Funnel",
    hide: "Hide",
    deleteProduct: "Delete",
    quickActions: "Quick Actions",
    addNewProduct: "+ Add Product",
    addAnother: "Add Another",
    editProduct: "Edit Product Funnel",
    newProductDraft: "New Product Draft",
    editingProduct: "Editing Product",
    aiGeneratedEditable: "After AI generates the funnel, you can still add or remove content. This is a funnel content editor, not a normal long form.",
    targetCustomerPh: "Target customer: who needs this most?",
    problemSolvedPh: "What problem does it solve?",
    productDetailPh: "Product details (AI can optimize this)",
    aiGenerating: "Generating AI...",
    mediaUploading: "Uploading images...",
    noImagesSuggest: "No images yet. Upload at least 1 product image.",
    promoterSettingDesc: "Set a commission that motivates promoters while seeing your estimated payout clearly.",
    commissionPh: "Promoter commission % (e.g. 20)",
    ctaButtonPh: "CTA button text",
    whatsappMessagePh: "WhatsApp preset message (optional)",
    strongHookTitle: "Your strong hook headline",
    valueDesc: "This will show a clear product value that customers can understand quickly.",
    buyNow: "Buy Now",
    sellingPointsLabel: "Selling Points",
    translationDone: "EN + BM ready",
    translationAuto: "Save draft / submit review will prepare EN + BM automatically",
    filled: "Filled",
    ready: "Ready",
    copiedFunnel: "Product Funnel link copied",
    copiedPromoter: "Promoter link template copied",
    copyPromoTemplate: "Copy Promotion Template",
    restoreShow: "Restore Display",
    noImage: "No Image",
    merchantNet: "Merchant Net",
    rejectionReason: "Rejection Reason",
    sales: "Sales",
    promoters: "Promoters",
    digitalDeliveryPh: "Digital product delivery details",
    serviceInstructionsPh: "Service appointment instructions",
    nextAiFunnel: "Next: AI Funnel",
    uploadImageDeleted: "Image removed",
    setAsMain: "Set as main image",
    switchedNew: "Switched to add-new-product mode.",
    suggestionViewsNoPaid: "has views but no paid orders. Check Hero headline, pricing trust and CTA clarity.",
    suggestionClicksNoPaid: "has clicks but no paid orders. Strengthen FAQ, guarantee and objections before payment.",
    suggestionNoViews: "is live but has no views. Copy promoter links to test the first traffic batch.",
    suggestionHealthy: "No obvious risk for now. Next, focus on top products with views and orders.",
    healthNoProduct: "Upload your first product. AI will help generate a conversion funnel.",
    healthPending: " products are under review. Promoters can promote after approval.",
    healthDraft: " products are still drafts. Add images, commission and funnel copy before review.",
    healthNoImage: " products are missing images. Product images affect trust and conversion.",
    healthNoPaid: "Products are ready. Next, copy promoter links to test your first traffic batch.",
    healthGood: "You already have order data. Focus on top products and pending orders.",
    customerFacingContent: "Customer-facing Content",
    customerFacingContentHint: "Controls the main copy customers see on /p/[slug]: title, description, CTA, video title and display copy.",
    heroBadgeLabel: "Hero Badge",
    heroTitleLabel: "Hero Title",
    heroSubtitleLabel: "Hero Subtitle",
    galleryTitleLabel: "Gallery Section Title",
    gallerySubtitleLabel: "Gallery Section Description",
    galleryLabelsLabel: "Image Labels (one per line)",
    videoTitleLabel: "Video Section Title",
    videoSubtitleLabel: "Video Section Description",
    problemTitleLabel: "Problem Section Title",
    problemSubtitleLabel: "Problem Section Description",
    solutionTitleLabel: "Benefits Section Title",
    solutionSubtitleLabel: "Benefits Section Description",
    processTitleLabel: "Process Section Title",
    processStepsLabel: "Process Steps (one per line)",
    proofTitleLabel: "Proof / Review Section Title",
    offerTitleLabel: "Details Section Title",
    offerSubtitleLabel: "Details Section Description",
    faqTitleLabel: "FAQ Title",
    detailsTitleLabel: "Product Details Title",
    finalCtaTitleLabel: "Final CTA Title",
    finalCtaSubtitleLabel: "Final CTA Description",
    liveSlugPreview: "Live Slug Page Preview",
    liveSlugPreviewHint: "This preview uses the same Product Funnel component as /p/[slug], so merchants see something closer to the final customer page.",
    realDraftPreview: "View Draft Preview",
    draftPreviewHint: "Draft / pending products can be previewed before Admin approval.",
    trustBadge1Label: "Hero Trust Point 1",
    trustBadge2Label: "Hero Trust Point 2",
    trustBadge3Label: "Hero Trust Point 3",
    imageHintLabel: "Gallery Hint Text",
    faqButtonLabel: "Hero Secondary Button Text",
    safeNoteLabel: "Hero Safety Note",
    paidToMerchantLabel: "Purchase Payment Note",
    supportTrackingLabel: "After-sales / Tracking Button Text",
    stickyCtaLabel: "Bottom Sticky Buy Button Text",
    stepWord: "Step",
    workspaceBadge: "Workspace",
    aiBuilderLabel: "AI FUNNEL BUILDER",
    originalPricePh: "Original price (optional)",
    promotionPh: "Promotion / Offer (e.g. buy 2 free 1, free shipping, limited-time discount)",
    promotionDeadlinePh: "Promotion deadline (optional)",
    completeBriefTitle: "Complete Product Brief",
    completeBriefHint: "The more complete this is, the less template-like the AI funnel will be. Leave blanks if needed and fill them later.",
    aiMaterial: "AI Material",
    targetCustomerFullPh: "Who is it suitable for? e.g. office workers, moms, sensitive skin, new entrepreneurs",
    targetNotSuitablePh: "Who is it not suitable for? e.g. not recommended for pregnancy, not suitable for very low budgets",
    customerPainFullPh: "Customer problem / pain point. Be as specific as possible.",
    failedAlternativesPh: "What have customers tried before but failed?",
    customerObjectionsPh: "Customer worries / why they do not buy, e.g. afraid it will not work, afraid of scams, afraid it is troublesome",
    desiredResultPh: "The result customers want, e.g. save time, feel safer, make it easier",
    ingredientsPh: "Ingredients / materials / technology / service details",
    differentiationPh: "How is this different from normal products? Why choose you?",
    trustAssetsPh: "Trust assets: physical store, customer feedback, KOL, certification, company background, before/after",
    caseStatusPlaceholder: "Case status",
    caseStatusNone: "No cases yet",
    caseStatusSome: "A few cases",
    caseStatusMany: "Many cases",
    soldCountPh: "Sold count / completed sales (leave blank if none; do not invent numbers)",
    guaranteePh: "Guarantee / after-sales / return policy",
    deliveryTimePh: "How long to receive it / arrange the service?",
    paymentMethodsPh: "Payment methods: FPX / Card / COD / Transfer",
    orderFlowPh: "What happens after ordering? e.g. payment success → merchant confirms → delivery/appointment → after-sales follow-up",
    sellingPointsPh: "Key selling points (one per line)",
    proofMaterialPh: "Trust material / cases / proof",
    faqMaterialPh: "Customer objections / raw FAQ material",
    orderDeliveryPh: "Order flow / delivery method",
    videoPurposePh: "What should this video communicate? e.g. unboxing, usage process, customer feedback, founder explanation",
    imageUsageNotesPh: "Image notes: what is each image for? e.g. 1 product image, 2 before/after, 3 customer review",
    productVideoPreviewTitle: "Product video preview",
    uploadedImagesMsg: "Uploaded {count} images.",
    savedEditMsg: "Saved. If it was already live, the edit will enter pending review again.",
    productCreatedMsg: "Product created. You can preview the page or submit for review.",
    confirmArchiveMsg: "Delete/archive {name}? Order records will be kept and the public page will be hidden.",
    ordersLabel: "orders",
    paidLabel: "paid",
    totalOrdersLabel: "total orders",
    viewsLabel: "views",
    commissionLabel: "commission",
    liveStatus: "Live",
    pendingStatus: "Pending Review",
    rejectedStatus: "Rejected",
    draftStatus: "Draft",
    categoryBeauty: "Beauty / Skincare",
    categoryHealth: "Health / Wellness",
    categoryFood: "Food & Beverage",
    categoryFashion: "Fashion / Apparel",
    categoryHome: "Home & Living",
    categoryDigital: "Digital Product / Software",
    categoryCourse: "Course / Education",
    categoryService: "Service / Appointment",
    categoryAutomotive: "Automotive",
    categoryBaby: "Baby / Kids",
    categoryPet: "Pet",
    categoryOther: "Other",
  },
  ms: {
    merchantSalesOS: "Merchant Sales OS",
    heroDesc: "Ini bukan backend isi data sahaja. Ini pusat operasi AI funnel dan Promoter distribution anda.",
    createAiFunnel: "Cipta AI Funnel",
    handleOrders: "Urus Order",
    planUpgrade: "Pakej / Naik Taraf",
    todaySales: "Jualan Hari Ini",
    monthSales: "Jualan Bulan Ini",
    orderCount: "Jumlah Order",
    conversionRate: "Kadar Konversi",
    promoterCount: "Jumlah Promoter",
    paidOrdersToday: "Order dibayar hari ini",
    paidOrdersMonth: "Order dibayar bulan ini",
    allOrdersPaid: "Semua order · {paid} dibayar",
    paidOrdersViews: "Order dibayar ÷ paparan",
    promoterSourceRecord: "Promoter yang membawa order / rekod sumber",
    funnelAnalytics: "Analitik Funnel",
    funnelAnalyticsDesc: "Lihat prestasi setiap funnel dari paparan, klik hingga order dibayar. Jika tiada data tracking, sistem akan papar 0 dan tidak akan rosak.",
    viewOrders: "Lihat Order",
    views: "Paparan",
    clicks: "Klik",
    paidOrders: "Order Dibayar",
    funnelVisits: "Lawatan funnel",
    ctaClicks: "Klik CTA / checkout",
    billplzPaid: "Billplz dibayar",
    paidSales: "Jualan Dibayar",
    totalGmv: "Jumlah GMV",
    aiSuggestions: "Cadangan AI",
    topProduct: "Produk Terbaik",
    topPromoter: "Promoter Terbaik",
    noProductData: "Belum ada data produk.",
    noPromoterOrders: "Belum ada order promoter. Salin template promosi untuk uji trafik pertama.",
    noProductsYet: "Belum ada produk. Cipta AI Product Funnel pertama.",
    aiBuilder: "AI FUNNEL BUILDER",
    createProductFunnel: "Cipta Funnel Produk",
    builderDesc: "Siapkan funnel produk dalam 5 langkah. AI membantu jana copy, FAQ, pain point, CTA dan sediakan English + Bahasa Melayu secara automatik.",
    preview: "Preview",
    stepBasic: "Step 1 · Maklumat Asas",
    stepAi: "Step 2 · AI Funnel",
    stepMedia: "Step 3 · Gambar / Video",
    stepPromoter: "Step 4 · Tetapan Promoter",
    stepPreview: "Step 5 · Preview",
    basicInfo: "Maklumat Asas",
    basicHint: "Mulakan dengan maklumat asas produk. AI boleh jana copy funnel selepas itu.",
    productName: "Nama Produk *",
    price: "Harga RM *",
    stock: "Stok / Kuantiti",
    aftersalesWhatsapp: "WhatsApp Selepas Jualan",
    merchantWhatsapp: "WhatsApp Peniaga (pilihan)",
    physicalProduct: "Produk Fizikal",
    digitalProduct: "Produk Digital",
    serviceProduct: "Servis / Temujanji",
    builderStatus: "Status Builder",
    basicIncomplete: "Maklumat asas: belum lengkap",
    basicDone: "Maklumat asas: lengkap",
    aiReady: "AI Funnel: boleh dijana",
    aiGenerated: "AI Funnel: sudah dijana",
    imagesCount: "Gambar: {count} / 9",
    promoterCommission: "Komisen Promoter: {rate}",
    commissionNotSet: "Belum ditetapkan",
    translationReady: "Bahasa: disediakan automatik",
    settlementPreview: "Pratonton Penyelesaian",
    merchantReceive: "Anggaran Bayaran Peniaga",
    benefitsTitle: "Manfaat Utama",
    benefitsHint: "Satu setiap baris. AI akan masukkan ke bahagian Solution / Offer.",
    painTitle: "Pain Point Pelanggan",
    painHint: "Satu setiap baris. AI akan masukkan ke bahagian Problem.",
    faqTitle: "FAQ",
    faqHint: "Anda boleh tambah atau padam soalan jawapan. Ia akan masuk ke funnel 3 bahasa.",
    proofTitle: "Bukti / Review / Kes",
    proofHint: "Biarkan kosong jika tiada. Ia hanya muncul jika diisi.",
    useTitle: "Cara Guna / Cara Hantar",
    useHint: "Sesuai untuk produk fizikal, digital atau servis.",
    ctaTitle: "CTA / Jaminan",
    ctaHint: "Gunakan ini untuk kurangkan keraguan pelanggan.",
    add: "+ Tambah",
    delete: "Padam",
    collapse: "Tutup",
    expand: "Buka",
    question: "Soalan",
    answer: "Jawapan",
    inputContent: "Isi kandungan",
    itemAdded: "item ditambah",
    itemRemoved: "item dipadam",
    saveDraft: "Simpan Draf",
    submitReview: "Hantar Semakan",
    previous: "Sebelumnya",
    next: "Seterusnya",
    generateAi: "Jana AI Funnel",
    productImages: "Gambar Produk",
    productImagesHint: "Maksimum 9 gambar. Gambar pertama digunakan sebagai gambar utama dan latar Hero.",
    videoEmbedTitle: "Video Produk",
    videoEmbedHint: "Masukkan link YouTube / TikTok / Vimeo secara berasingan. Jangan campur dengan muat naik gambar.",
    videoEmbedPh: "Tampal link video YouTube / TikTok / Vimeo (pilihan)",
    noVideo: "Tiada link video lagi.",
    previewFull: "Pratonton Funnel Penuh",
    previewFullDesc: "Ini mensimulasikan struktur funnel pelanggan: Hero, gambar, video, masalah, manfaat, FAQ dan CTA.",
    previewPage: "Pratonton Halaman",
    oneClickCreate: "Jana Funnel",
    draftSecondary: "Simpan Draf (pilihan)",
    createFirst: "Cipta produk dahulu sebelum membuka halaman sebenar.",
    customerTrustNote: "Halaman pelanggan hanya memaparkan nilai produk, harga, butang beli, FAQ dan sokongan selepas jualan. Komisen dan caj platform disembunyikan.",
    chooseFiles: "Pilih gambar",
    noImages: "Belum ada gambar.",
    mainImage: "Gambar Utama",
    setMainImage: "Tetapkan Utama",
    copyFunnel: "Salin Funnel",
    openFunnel: "Buka Funnel",
    copyPromoterLink: "Salin Link Promoter",
    productFunnels: "Funnel Produk Saya",
    productFunnelsDesc: "Bukan sekadar senarai produk. Semak status, penyelesaian, buka funnel dan salin link promoter di sini.",
    actions: "Tindakan",
    editFunnel: "Edit Funnel",
    hide: "Sembunyi",
    deleteProduct: "Padam",
    quickActions: "Tindakan Pantas",
    addNewProduct: "+ Tambah Produk",
    addAnother: "Tambah Satu Lagi",
    editProduct: "Edit Funnel Produk",
    newProductDraft: "Draf Produk Baru",
    editingProduct: "Sedang Edit Produk",
    aiGeneratedEditable: "Selepas AI jana funnel, anda masih boleh tambah atau padam kandungan. Ini editor kandungan funnel, bukan borang panjang biasa.",
    targetCustomerPh: "Pelanggan sasaran: siapa paling perlukan produk ini?",
    problemSolvedPh: "Masalah apa yang diselesaikan?",
    productDetailPh: "Butiran produk (AI boleh bantu optimakan)",
    aiGenerating: "AI sedang menjana...",
    mediaUploading: "Gambar sedang dimuat naik...",
    noImagesSuggest: "Belum ada gambar. Muat naik sekurang-kurangnya 1 gambar produk.",
    promoterSettingDesc: "Tetapkan komisen yang menarik untuk promoter sambil melihat anggaran bayaran peniaga dengan jelas.",
    commissionPh: "Komisen Promoter % (cth. 20)",
    ctaButtonPh: "Teks butang CTA",
    whatsappMessagePh: "Mesej WhatsApp preset (pilihan)",
    strongHookTitle: "Tajuk hook yang kuat",
    valueDesc: "Ini akan memaparkan nilai produk yang pelanggan boleh faham dengan cepat.",
    buyNow: "Beli Sekarang",
    sellingPointsLabel: "Selling Point",
    translationDone: "EN + BM sudah sedia",
    translationAuto: "Simpan draf / hantar semakan akan sediakan EN + BM secara automatik",
    filled: "Telah diisi",
    ready: "Sedia",
    copiedFunnel: "Link Funnel produk disalin",
    copiedPromoter: "Template link Promoter disalin",
    copyPromoTemplate: "Salin Template Promosi",
    restoreShow: "Pulihkan Paparan",
    noImage: "Tiada Gambar",
    merchantNet: "Net Peniaga",
    rejectionReason: "Sebab Ditolak",
    sales: "Jualan",
    promoters: "Promoter",
    digitalDeliveryPh: "Butiran penghantaran produk digital",
    serviceInstructionsPh: "Arahan servis / temujanji",
    nextAiFunnel: "Seterusnya: AI Funnel",
    uploadImageDeleted: "Gambar dipadam",
    setAsMain: "Ditetapkan sebagai gambar utama",
    switchedNew: "Ditukar kepada mod tambah produk baru.",
    suggestionViewsNoPaid: "ada paparan tetapi belum ada order dibayar. Semak tajuk Hero, keyakinan harga dan CTA.",
    suggestionClicksNoPaid: "ada klik tetapi belum ada order dibayar. Kuatkan FAQ, jaminan dan keraguan pelanggan sebelum pembayaran.",
    suggestionNoViews: "sudah live tetapi belum ada paparan. Salin link promoter untuk uji trafik pertama.",
    suggestionHealthy: "Tiada risiko jelas buat masa ini. Fokus pada produk terbaik yang ada paparan dan order.",
    healthNoProduct: "Muat naik produk pertama. AI akan bantu jana funnel yang boleh convert.",
    healthPending: " produk sedang disemak. Promoter boleh mula promosi selepas diluluskan.",
    healthDraft: " produk masih draf. Lengkapkan gambar, komisen dan copy funnel sebelum hantar semakan.",
    healthNoImage: " produk tiada gambar. Gambar produk mempengaruhi trust dan conversion.",
    healthNoPaid: "Produk sudah bersedia. Seterusnya salin link promoter untuk uji trafik pertama.",
    healthGood: "Sudah ada data order. Fokus pada top product dan order belum diproses.",
    customerFacingContent: "Kandungan Untuk Pelanggan",
    customerFacingContentHint: "Mengawal copy utama yang pelanggan lihat di /p/[slug]: tajuk, penerangan, CTA, tajuk video dan copy paparan.",
    heroBadgeLabel: "Label Hero",
    heroTitleLabel: "Tajuk Hero",
    heroSubtitleLabel: "Subtajuk Hero",
    galleryTitleLabel: "Tajuk Bahagian Gambar",
    gallerySubtitleLabel: "Penerangan Bahagian Gambar",
    galleryLabelsLabel: "Label Gambar (satu setiap baris)",
    videoTitleLabel: "Tajuk Bahagian Video",
    videoSubtitleLabel: "Penerangan Bahagian Video",
    problemTitleLabel: "Tajuk Bahagian Masalah",
    problemSubtitleLabel: "Penerangan Bahagian Masalah",
    solutionTitleLabel: "Tajuk Bahagian Manfaat",
    solutionSubtitleLabel: "Penerangan Bahagian Manfaat",
    processTitleLabel: "Tajuk Bahagian Proses",
    processStepsLabel: "Langkah Proses (satu setiap baris)",
    proofTitleLabel: "Tajuk Bahagian Bukti / Review",
    offerTitleLabel: "Tajuk Bahagian Butiran",
    offerSubtitleLabel: "Penerangan Bahagian Butiran",
    faqTitleLabel: "Tajuk FAQ",
    detailsTitleLabel: "Tajuk Butiran Produk",
    finalCtaTitleLabel: "Tajuk CTA Akhir",
    finalCtaSubtitleLabel: "Penerangan CTA Akhir",
    liveSlugPreview: "Pratonton Halaman Slug Sebenar",
    liveSlugPreviewHint: "Pratonton ini guna komponen Product Funnel yang sama dengan /p/[slug], jadi peniaga nampak lebih dekat dengan halaman akhir pelanggan.",
    realDraftPreview: "Lihat Pratonton Draf",
    draftPreviewHint: "Produk draf / menunggu semakan boleh dipratonton sebelum kelulusan Admin.",
    trustBadge1Label: "Trust Point Hero 1",
    trustBadge2Label: "Trust Point Hero 2",
    trustBadge3Label: "Trust Point Hero 3",
    imageHintLabel: "Teks Hint Galeri",
    faqButtonLabel: "Teks Butang Kedua Hero",
    safeNoteLabel: "Nota Keselamatan Hero",
    paidToMerchantLabel: "Nota Pembayaran Pembelian",
    supportTrackingLabel: "Teks Butang Selepas Jualan / Tracking",
    stickyCtaLabel: "Teks Butang Beli Sticky Bawah",
    stepWord: "Langkah",
    workspaceBadge: "Ruang Kerja",
    aiBuilderLabel: "AI FUNNEL BUILDER",
    originalPricePh: "Harga asal (pilihan)",
    promotionPh: "Promosi / Offer (cth. beli 2 percuma 1, free shipping, diskaun terhad)",
    promotionDeadlinePh: "Tarikh akhir promosi (pilihan)",
    completeBriefTitle: "Brief Produk Lengkap",
    completeBriefHint: "Lagi lengkap diisi, lagi kurang rasa template pada funnel AI. Boleh biar kosong dahulu dan tambah kemudian.",
    aiMaterial: "Bahan AI",
    targetCustomerFullPh: "Sesuai untuk siapa? cth. pekerja pejabat, ibu, kulit sensitif, usahawan baru",
    targetNotSuitablePh: "Tidak sesuai untuk siapa? cth. tidak disaran untuk hamil, tidak sesuai untuk bajet terlalu rendah",
    customerPainFullPh: "Masalah / pain point pelanggan. Tulis se-spesifik mungkin.",
    failedAlternativesPh: "Apa yang pelanggan pernah cuba tetapi gagal?",
    customerObjectionsPh: "Keraguan pelanggan / sebab tidak beli, cth. takut tiada kesan, takut ditipu, takut leceh",
    desiredResultPh: "Hasil yang pelanggan mahukan, cth. jimat masa, lebih yakin, lebih mudah",
    ingredientsPh: "Bahan / material / teknologi / butiran servis",
    differentiationPh: "Apa beza dengan produk biasa? Kenapa pilih anda?",
    trustAssetsPh: "Bahan trust: kedai fizikal, feedback pelanggan, KOL, sijil, latar syarikat, before/after",
    caseStatusPlaceholder: "Status kes",
    caseStatusNone: "Belum ada kes",
    caseStatusSome: "Ada beberapa kes",
    caseStatusMany: "Ada banyak kes",
    soldCountPh: "Jumlah terjual / jualan siap (biar kosong jika tiada; jangan reka nombor)",
    guaranteePh: "Jaminan / selepas jualan / polisi pulangan",
    deliveryTimePh: "Berapa lama untuk terima / atur servis?",
    paymentMethodsPh: "Kaedah bayaran: FPX / Card / COD / Transfer",
    orderFlowPh: "Apa berlaku selepas pelanggan order? cth. bayaran berjaya → peniaga sahkan → hantar/temujanji → follow-up selepas jualan",
    sellingPointsPh: "Selling point utama (satu setiap baris)",
    proofMaterialPh: "Bahan trust / kes / bukti",
    faqMaterialPh: "Keraguan pelanggan / bahan FAQ asal",
    orderDeliveryPh: "Flow order / cara penghantaran",
    videoPurposePh: "Apa yang video ini mahu sampaikan? cth. unboxing, cara guna, feedback pelanggan, penjelasan founder",
    imageUsageNotesPh: "Nota gambar: fungsi setiap gambar? cth. 1 gambar produk, 2 before/after, 3 review pelanggan",
    productVideoPreviewTitle: "Pratonton video produk",
    uploadedImagesMsg: "{count} gambar dimuat naik.",
    savedEditMsg: "Disimpan. Jika sudah live, edit ini akan masuk semakan semula.",
    productCreatedMsg: "Produk dicipta. Anda boleh pratonton halaman atau hantar semakan.",
    confirmArchiveMsg: "Padam/arkibkan {name}? Rekod order akan disimpan dan halaman awam akan disembunyikan.",
    ordersLabel: "order",
    paidLabel: "dibayar",
    totalOrdersLabel: "jumlah order",
    viewsLabel: "paparan",
    commissionLabel: "komisen",
    liveStatus: "Sudah Live",
    pendingStatus: "Menunggu Semakan",
    rejectedStatus: "Ditolak",
    draftStatus: "Draf",
    categoryBeauty: "Kecantikan / Skincare",
    categoryHealth: "Kesihatan / Wellness",
    categoryFood: "Makanan & Minuman",
    categoryFashion: "Fesyen / Pakaian",
    categoryHome: "Rumah & Kehidupan",
    categoryDigital: "Produk Digital / Software",
    categoryCourse: "Kursus / Pendidikan",
    categoryService: "Servis / Temujanji",
    categoryAutomotive: "Automotif",
    categoryBaby: "Bayi / Kanak-kanak",
    categoryPet: "Haiwan Peliharaan",
    categoryOther: "Lain-lain",
  },
}

function fmt(text, values = {}) {
  return String(text || '').replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '')
}

const emptyForm = {
  name: "",
  price: "",
  originalPrice: "",
  promotion: "",
  promotionDeadline: "",
  commissionRate: "",
  category: "Beauty / Skincare",
  productType: "PHYSICAL",
  stock: "",
  digitalDelivery: "",
  serviceInstructions: "",
  productImage: "",
  productImages: [],
  videoUrl: "",
  whatsapp: "",
  aftersalesWhatsapp: "",
  heroTitle: "",
  heroSubtitle: "",
  heroBadge: "",
  galleryTitle: "",
  gallerySubtitle: "",
  galleryLabels: "",
  videoTitle: "",
  videoSubtitle: "",
  processTitle: "",
  processSteps: "",
  proofTitle: "",
  offerTitle: "",
  offerSubtitle: "",
  faqTitle: "",
  detailsTitle: "",
  finalCtaTitle: "",
  finalCtaSubtitle: "",
  targetCustomer: "",
  problemSolved: "",
  sellingPoints: "",
  useMethod: "",
  warranty: "",
  proof: "",
  shortDescription: "",
  longDescription: "",
  targetNotSuitable: "",
  failedAlternatives: "",
  customerObjections: "",
  desiredResult: "",
  ingredients: "",
  differentiation: "",
  trustAssets: "",
  caseStatus: "",
  soldCount: "",
  guarantee: "",
  deliveryTime: "",
  paymentMethods: "",
  orderFlow: "",
  imageUsageNotes: "",
  videoPurpose: "",
  problemTitle: "",
  problemSubtitle: "",
  painPoints: "",
  solutionTitle: "",
  solutionSubtitle: "",
  benefits: "",
  ctaTitle: "",
  ctaSubtitle: "",
  aiGenerated: false,
  faqs: "",
  ctaText: "立即购买",
  heroTrust1: "",
  heroTrust2: "",
  heroTrust3: "",
  imageHint: "",
  faqButtonText: "",
  safeNote: "",
  paidToMerchantText: "",
  supportTrackingText: "",
  stickyCtaText: "",
  whatsappMessage: "",
  translations: {},
}

async function mapi(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.message || "Failed")
  return json
}

async function uploadOne(file) {
  const fd = new FormData()
  fd.append("image", file)
  const res = await fetch(`${API_URL}/api/upload`, { method: "POST", credentials: "include", body: fd })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || json.message || "Upload failed")
  return json.url
}

const money = (v) => `RM ${Number(v || 0).toFixed(2)}`
const pct = (v) => `${Number(v || 0).toFixed(Number(v || 0) % 1 ? 1 : 0)}%`

function hasFakeTranslation(value) {
  if (typeof value === "string") return value.includes("[EN]") || value.includes("[BM]")
  if (Array.isArray(value)) return value.some(hasFakeTranslation)
  if (value && typeof value === "object") return Object.values(value).some(hasFakeTranslation)
  return false
}
function flattenTranslationText(value) {
  if (typeof value === "string") return value
  if (Array.isArray(value)) return value.map(flattenTranslationText).join(" ")
  if (value && typeof value === "object") return Object.values(value).map(flattenTranslationText).join(" ")
  return ""
}
function looksMostlyUntranslated(value, lang) {
  if (lang === "zh") return false
  const text = flattenTranslationText(value)
  const cjk = (text.match(/[\u3400-\u9FFF]/g) || []).length
  const latin = (text.match(/[A-Za-z]/g) || []).length
  const ratio = cjk / Math.max(1, cjk + latin)
  return cjk >= 12 && ratio > 0.22
}
function looksLikeOldLocalFallback(value) {
  const text = flattenTranslationText(value).toLowerCase()
  return [
    "helps customers understand the product before they buy",
    "is explained through a simple funnel",
    "presented in a simple product funnel",
    "so customers can understand the benefits, usage, payment flow",
    "basic questions about price, process and after-sales support",
    "review the product details, images, price and order process",
    "customer questions this funnel needs to answer",
    "questions customers need answered before buying",
    "customers need clear product information",
    "buying decisions can be slow",
    "membantu pelanggan faham produk sebelum membeli",
    "diterangkan melalui funnel ringkas",
    "dipersembahkan dalam format mudah baca",
    "soalan asas tentang harga, proses dan selepas pembelian",
    "sila semak maklumat produk, imej, harga dan proses order",
    "masalah pelanggan yang perlu dijawab",
    "pelanggan perlukan penerangan jelas",
    "keputusan membeli boleh jadi lambat",
  ].some((phrase) => text.includes(phrase))
}
function hasUsefulTranslationCopy(value) {
  if (!value || typeof value !== "object") return false
  return [
    value.heroTitle, value.heroSubtitle, value.problemTitle, value.problemSubtitle, value.painPoints,
    value.solutionTitle, value.solutionSubtitle, value.benefits, value.longDescription, value.faqs,
    value.sections?.hero?.title, value.sections?.hero?.subtitle, value.sections?.problem?.title, value.sections?.solution?.title,
  ].some((x) => x !== undefined && x !== null && String(x).trim() !== "")
}
function usableTranslation(value, lang) {
  if (!hasUsefulTranslationCopy(value)) return false
  if (hasFakeTranslation(value)) return false
  if (looksLikeOldLocalFallback(value)) return false
  if (looksMostlyUntranslated(value, lang)) return false
  return true
}
function translationsReady(translations = {}) {
  return Boolean(
    usableTranslation(translations?.zh, "zh") &&
    usableTranslation(translations?.en, "en") &&
    usableTranslation(translations?.ms, "ms")
  )
}

function normalizeImages(value) {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean).slice(0, 9)
  return String(value).split("\n").map((x) => x.trim()).filter(Boolean).slice(0, 9)
}
function siteOrigin() {
  if (typeof window === "undefined") return ""
  return window.location.origin
}
function productUrl(slug) { return `${siteOrigin()}/p/${slug}` }
function productDraftUrl(slug, id) { return `${siteOrigin()}/p/${slug || "preview"}?draft=${id}` }
function promoterUrl(slug) { return `${siteOrigin()}/p/${slug}?ref=YOUR_REF_CODE` }
function mediaEmbedUrl(url = "") {
  if (!url) return ""
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "")
      return id ? `https://www.youtube.com/embed/${id}` : url
    }
    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname === "/watch") {
        const id = parsed.searchParams.get("v")
        return id ? `https://www.youtube.com/embed/${id}` : url
      }
      if (parsed.pathname.startsWith("/shorts/")) {
        const id = parsed.pathname.replace("/shorts/", "")
        return id ? `https://www.youtube.com/embed/${id}` : url
      }
    }
  } catch {}
  return url
}

function richInline(text) {
  if (text === undefined || text === null) return null
  return String(text).split(/(\*\*.*?\*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const clean = part.slice(2, -2)
      return <span key={i} className="merchant-inline-highlight">{clean}</span>
    }
    return <span key={i}>{part}</span>
  })
}

function PreviewText({ children, className = "" }) {
  return <span className={className}>{richInline(children)}</span>
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true } catch { return false }
}
function settlement(price, commissionRate) {
  const total = Number(price || 0)
  const commission = total * Number(commissionRate || 0) / 100
  const platform = total * 0.115
  const merchant = Math.max(0, total - commission - platform)
  return { commission, platform, merchant }
}
function badge(status, tr = UI.zh) {
  const s = status || "DRAFT"
  const cls = s === "APPROVED" ? "bg-emerald-100 text-emerald-700" : s === "PENDING" ? "bg-amber-100 text-amber-700" : s === "REJECTED" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"
  const text = s === "APPROVED" ? tr.liveStatus : s === "PENDING" ? tr.pendingStatus : s === "REJECTED" ? tr.rejectedStatus : tr.draftStatus
  return <span className={`rounded-full px-3 py-1 text-xs font-black ${cls}`}>{text}</span>
}

function uniquePromoters(orders) {
  const set = new Set()
  orders.forEach((o) => {
    const id = o.promoter_id || o.ref_code
    if (id) set.add(String(id))
  })
  return set.size
}

function productStats(products, orders) {
  const map = new Map()
  products.forEach((p) => map.set(String(p.id), { orders: 0, sales: 0, paid: 0 }))
  orders.forEach((o) => {
    const key = String(o.product_id || o.productId || "")
    if (!map.has(key)) return
    const m = map.get(key)
    m.orders += 1
    if (isPaidOrder(o)) {
      m.sales += Number(o.total_amount || 0)
      m.paid += 1
    }
  })
  return map
}

function topProducts(products, orders) {
  const stats = productStats(products, orders)
  return [...products]
    .map((p) => ({ ...p, sales: stats.get(String(p.id))?.sales || 0, orders: stats.get(String(p.id))?.orders || 0 }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5)
}

function isPaidOrder(o) {
  const ps = String(o.payment_status || '').toUpperCase()
  const st = String(o.status || '').toUpperCase()
  return ps === 'PAID' || st === 'PAID' || st === 'COMPLETED'
}
function orderDate(o) {
  const raw = o.created_at || o.createdAt || o.paid_at || o.paidAt || o.updated_at || o.updatedAt
  const d = raw ? new Date(raw) : null
  return d && !Number.isNaN(d.getTime()) ? d : null
}
function sameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
function sameMonth(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}
function productViews(p) {
  return Number(p.view_count || p.viewCount || p.views || 0)
}
function productClicks(p) {
  return Number(p.click_count || p.clickCount || p.checkout_count || p.checkoutCount || p.cta_clicks || p.ctaClicks || p.ref_clicks || p.refClicks || 0)
}
function productPromoterCount(productId, orders = []) {
  const set = new Set()
  orders.forEach((o) => {
    if (String(o.product_id || o.productId || '') !== String(productId)) return
    const id = o.promoter_id || o.promoterId || o.ref_code || o.promoter_username || o.promoter_name
    if (id) set.add(String(id))
  })
  return set.size
}
function topPromoters(orders = []) {
  const map = new Map()
  orders.forEach((o) => {
    const key = o.promoter_id || o.promoterId || o.ref_code || o.promoter_username || o.promoter_name
    if (!key) return
    const name = o.promoter_name || o.promoter_username || o.ref_code || `Promoter ${key}`
    const item = map.get(String(key)) || { key: String(key), name, sales: 0, orders: 0, paid: 0 }
    item.orders += 1
    if (isPaidOrder(o)) {
      item.paid += 1
      item.sales += Number(o.total_amount || o.amount || 0)
    }
    map.set(String(key), item)
  })
  return [...map.values()].sort((a, b) => b.sales - a.sales || b.orders - a.orders).slice(0, 5)
}
function funnelHealthSuggestions(products = [], orders = [], tr = UI.zh) {
  if (!products.length) return [tr.noProductsYet]
  const suggestions = []
  const stats = productStats(products, orders)
  products.forEach((p) => {
    const views = productViews(p)
    const clicks = productClicks(p)
    const paid = stats.get(String(p.id))?.paid || 0
    const title = p.name || p.slug || 'Product'
    if (views >= 30 && paid === 0) suggestions.push(`${title}: ${tr.suggestionViewsNoPaid || 'has views but no paid orders. Improve Hero, pricing trust and CTA.'}`)
    if (clicks >= 10 && paid === 0) suggestions.push(`${title}: ${tr.suggestionClicksNoPaid || 'has clicks but no paid orders. Strengthen FAQ and trust points.'}`)
    if (!productViews(p) && String(p.approval_status || '').toUpperCase() === 'APPROVED') suggestions.push(`${title}: ${tr.suggestionNoViews || 'is live but has no views. Share promoter links for the first traffic test.'}`)
  })
  if (!suggestions.length) suggestions.push(tr.suggestionHealthy || 'No obvious risk for now. Focus on scaling top products.')
  return suggestions.slice(0, 3)
}

function textLines(value = "") {
  return String(value || "").split("\n").map((x) => x.trim()).filter(Boolean)
}
function joinLines(list = []) {
  return list.map((x) => String(x || "").trim()).filter(Boolean).join("\n")
}
function ArrayTextEditor({ title, hint, value, onChange, placeholder, pair = false, onToast, tr }) {
  const tt = tr || UI.zh
  const makeItems = (raw) => {
    const lines = textLines(raw)
    if (pair) {
      const parsed = lines.map((line) => {
        const [q, ...a] = line.split("|")
        return { q: q || "", a: a.join("|") || "" }
      })
      return parsed.length ? parsed : [{ q: "", a: "" }]
    }
    const parsed = lines.map((text) => ({ text }))
    return parsed.length ? parsed : [{ text: "" }]
  }

  const [items, setItems] = useState(() => makeItems(value))

  useEffect(() => {
    setItems(makeItems(value))
  }, [value, pair])

  const sync = (next, toastText) => {
    const safeNext = next.length ? next : [pair ? { q: "", a: "" } : { text: "" }]
    setItems(safeNext)
    if (pair) {
      onChange(
        safeNext
          .map((x) => `${x.q || ""}|${x.a || ""}`)
          .filter((x) => x.replace("|", "").trim())
          .join("\n")
      )
    } else {
      onChange(joinLines(safeNext.map((x) => x.text)))
    }
    if (toastText) onToast?.(toastText)
  }

  const addItem = () => {
    const next = [...items, pair ? { q: "", a: "" } : { text: "" }]
    setItems(next)
    onToast?.(`${title} ${tt.itemAdded}`)
  }

  const removeItem = (idx) => {
    sync(items.filter((_, i) => i !== idx), `${title} ${tt.itemRemoved}`)
  }

  return (
    <div className="rounded-[26px] border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-lg font-black">{title}</h4>
          {hint ? <p className="mt-1 text-sm font-bold text-slate-400">{hint}</p> : null}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-700 transition hover:bg-blue-100 active:scale-[.98]"
        >
          {tt.add}
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="rounded-2xl bg-slate-50 p-3">
            {pair ? (
              <div className="grid gap-2 md:grid-cols-2">
                <input
                  className="rounded-xl border bg-white p-3 text-sm font-bold"
                  placeholder={tt.question}
                  value={item.q}
                  onChange={(e) => { const next = [...items]; next[idx] = { ...next[idx], q: e.target.value }; sync(next) }}
                />
                <input
                  className="rounded-xl border bg-white p-3 text-sm font-bold"
                  placeholder={tt.answer}
                  value={item.a}
                  onChange={(e) => { const next = [...items]; next[idx] = { ...next[idx], a: e.target.value }; sync(next) }}
                />
              </div>
            ) : (
              <input
                className="w-full rounded-xl border bg-white p-3 text-sm font-bold"
                placeholder={`${placeholder || tt.inputContent} ${idx + 1}`}
                value={item.text}
                onChange={(e) => { const next = [...items]; next[idx] = { text: e.target.value }; sync(next) }}
              />
            )}
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700 transition hover:bg-red-100 active:scale-[.98]"
              >
                {tt.delete}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


function previewSlugProduct(form = {}, previewImages = []) {
  return {
    id: "preview",
    slug: "preview",
    name: form.name || "Product",
    title: form.name || "Product",
    price: Number(form.price || 0),
    category: form.category || "General",
    productType: form.productType || "PHYSICAL",
    stock: Number(form.stock || 0),
    productImage: form.productImage || previewImages[0] || "",
    productImages: previewImages,
    galleryImages: previewImages,
    merchantName: "Merchant Preview",
  }
}

function previewSlugPage(form = {}, previewImages = []) {
  return {
    id: "preview",
    slug: "preview",
    brandName: form.name || "Product",
    merchantName: "Merchant Preview",
    price: Number(form.price || 0),
    category: form.category || "General",
    productType: form.productType || "PHYSICAL",
    productImage: form.productImage || previewImages[0] || "",
    productImages: previewImages,
    galleryImages: previewImages,
    translations: form.translations || {},
    heroTitle: form.heroTitle || form.name || "Product",
    heroSubtitle: form.heroSubtitle || form.problemSolved || form.longDescription || "",
    heroBadge: form.heroBadge || "AI Product Funnel",
    ctaText: form.ctaText || "立即购买",
    heroTrust1: form.heroTrust1 || "",
    heroTrust2: form.heroTrust2 || "",
    heroTrust3: form.heroTrust3 || "",
    imageHint: form.imageHint || "",
    faqButtonText: form.faqButtonText || "",
    safeNote: form.safeNote || "",
    paidToMerchantText: form.paidToMerchantText || "",
    supportTrackingText: form.supportTrackingText || "",
    stickyCtaText: form.stickyCtaText || "",
    galleryTitle: form.galleryTitle || "",
    galleryLabels: form.galleryLabels || "",
    videoUrl: form.videoUrl || "",
    videoTitle: form.videoTitle || "",
    videoSubtitle: form.videoSubtitle || "",
    painPoints: form.painPoints || "",
    benefits: form.benefits || form.sellingPoints || "",
    processTitle: form.processTitle || "",
    processSteps: form.processSteps || form.useMethod || "",
    proofTitle: form.proofTitle || "",
    proofText: form.proof || "",
    longDescription: form.longDescription || form.offerSubtitle || "",
    offerTitle: form.offerTitle || "",
    offerSubtitle: form.offerSubtitle || form.longDescription || "",
    faqTitle: form.faqTitle || "",
    faqs: form.faqs || "",
    detailsTitle: form.detailsTitle || "",
    ctaTitle: form.finalCtaTitle || form.ctaTitle || "",
    ctaSubtitle: form.finalCtaSubtitle || form.ctaSubtitle || form.warranty || "",
    sections: {
      hero: { title: form.heroTitle || form.name || "Product", subtitle: form.heroSubtitle || form.problemSolved || form.longDescription || "", backgroundImage: form.productImage || previewImages[0] || "", ctaText: form.ctaText || "立即购买", trust1: form.heroTrust1 || "", trust2: form.heroTrust2 || "", trust3: form.heroTrust3 || "", secondaryButtonText: form.faqButtonText || "", safeNote: form.safeNote || "" },
      showcase: { title: form.galleryTitle || "", subtitle: form.gallerySubtitle || "", hint: form.imageHint || "", videoUrl: form.videoUrl || "", items: previewImages.map((url, i) => ({ title: textLines(form.galleryLabels)[i] || `Display ${i + 1}`, image: url })) },
      video: { url: form.videoUrl || "" },
      problem: { title: form.problemTitle || "", subtitle: form.problemSubtitle || "", items: textLines(form.painPoints).map((x) => ({ title: x, desc: "" })) },
      solution: { title: form.solutionTitle || "", subtitle: form.solutionSubtitle || "", items: textLines(form.benefits || form.sellingPoints).map((x) => ({ title: x, desc: "" })) },
      process: { title: form.processTitle || "", items: textLines(form.processSteps || form.useMethod).map((x) => ({ title: x, desc: "" })) },
      reviews: { title: form.proofTitle || "", items: textLines(form.proof).map((x) => ({ title: x, text: x })) },
      offer: { title: form.offerTitle || "", subtitle: form.offerSubtitle || form.longDescription || "", items: [{ title: form.name || "Product", desc: form.longDescription || form.offerSubtitle || "", image: form.productImage || previewImages[0] || "" }] },
      faq: { title: form.faqTitle || "", items: textLines(form.faqs).map((x) => { const [q, ...a] = x.split("|"); return { title: q || "", desc: a.join("|") || "" } }) },
      cta: { title: form.finalCtaTitle || form.ctaTitle || "", subtitle: form.finalCtaSubtitle || form.ctaSubtitle || form.warranty || "", buttonText: form.ctaText || "立即购买", paymentNote: form.paidToMerchantText || "", supportButtonText: form.supportTrackingText || "", stickyButtonText: form.stickyCtaText || "", whatsappMessage: form.whatsappMessage || "" },
    },
  }
}

export default function MerchantDashboard() {
  const { lang } = useLanguage()
  const tr = { ...UI.zh, ...(UI[lang] || {}) }
  const [me, setMe] = useState(null)
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState("")
  const [msg, setMsg] = useState("")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [openProductMenu, setOpenProductMenu] = useState("")
  const [activeStep, setActiveStep] = useState(0)
  const [openSections, setOpenSections] = useState({ customerText: true, benefits: true, pain: true, faq: true, proof: false, use: false, cta: false })

  const previewImages = useMemo(() => {
    const imgs = normalizeImages(form.productImages)
    if (form.productImage && !imgs.includes(form.productImage)) imgs.unshift(form.productImage)
    return imgs.slice(0, 9)
  }, [form.productImage, form.productImages])

  const stats = useMemo(() => {
    const now = new Date()
    const paidOrders = orders.filter(isPaidOrder)
    const todayOrders = paidOrders.filter((o) => sameDay(orderDate(o), now))
    const monthOrders = paidOrders.filter((o) => sameMonth(orderDate(o), now))
    const totalSales = paidOrders.reduce((s, o) => s + Number(o.total_amount || o.amount || 0), 0)
    const todaySales = todayOrders.reduce((s, o) => s + Number(o.total_amount || o.amount || 0), 0)
    const monthSales = monthOrders.reduce((s, o) => s + Number(o.total_amount || o.amount || 0), 0)
    const pending = paidOrders.filter((o) => ["PROCESSING", "SHIPPED"].includes((o.status || "").toUpperCase()) && !o.tracking_number).length
    const approved = products.filter((p) => (p.approval_status || "").toUpperCase() === "APPROVED").length
    const totalViews = products.reduce((sum, p) => sum + productViews(p), 0)
    const totalClicks = products.reduce((sum, p) => sum + productClicks(p), 0)
    const paidCount = paidOrders.length
    const conversion = totalViews > 0 ? (paidCount / totalViews) * 100 : 0
    return { paidOrders, todayOrders, monthOrders, paidCount, totalSales, todaySales, monthSales, pending, approved, promoters: uniquePromoters(orders), totalViews, totalClicks, conversion }
  }, [orders, products])

  const health = useMemo(() => {
    if (!products.length) return tr.healthNoProduct
    const draft = products.filter((p) => (p.approval_status || "DRAFT") === "DRAFT").length
    const pending = products.filter((p) => (p.approval_status || "") === "PENDING").length
    const noImage = products.filter((p) => !(p.product_image || p.productImage || normalizeImages(p.product_images || p.productImages)[0])).length
    if (pending) return `${pending}${tr.healthPending}`
    if (draft) return `${draft}${tr.healthDraft}`
    if (noImage) return `${noImage}${tr.healthNoImage}`
    if (!stats.paidOrders.length) return tr.healthNoPaid
    return tr.healthGood
  }, [products, stats.paidOrders.length, tr])

  async function load() {
    setLoading(true)
    try {
      const [meRes, productRes, orderRes] = await Promise.all([
        mapi("/api/merchant/me"),
        mapi("/api/merchant/products"),
        mapi("/api/merchant/orders").catch(() => []),
      ])
      setMe(meRes.merchant)
      setProducts(Array.isArray(productRes) ? productRes : [])
      setOrders(Array.isArray(orderRes) ? orderRes : [])
      setErr("")
    } catch (e) { setErr(e.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  function set(k, v) { setForm((prev) => ({ ...prev, [k]: v })) }
  function notify(text) { setMsg(text) }
  function toggleSection(key) { setOpenSections((prev) => ({ ...prev, [key]: !prev[key] })) }
  const steps = [
    tr.basicInfo,
    "AI Funnel",
    tr.productImages,
    tr.stepPromoter.replace(/^Step 4 · /, "").replace(/^Langkah 4 · /, ""),
    tr.preview,
  ]

  async function handleUpload(files) {
    const list = Array.from(files || []).slice(0, 9 - previewImages.length)
    if (!list.length) return
    setUploading(true)
    setMsg("")
    try {
      const urls = []
      for (const file of list) urls.push(await uploadOne(file))
      setForm((prev) => {
        const merged = [...normalizeImages(prev.productImages), ...urls].filter(Boolean).slice(0, 9)
        return { ...prev, productImages: merged, productImage: prev.productImage || merged[0] || "" }
      })
      setMsg(fmt(tr.uploadedImagesMsg, { count: urls.length }))
    } catch (e) { setMsg(e.message || "Upload failed") }
    finally { setUploading(false) }
  }
  function removeImage(url) {
    setForm((prev) => {
      const next = normalizeImages(prev.productImages).filter((x) => x !== url)
      return { ...prev, productImages: next, productImage: prev.productImage === url ? (next[0] || "") : prev.productImage }
    })
  }
  function makeMainImage(url) {
    setForm((prev) => {
      const imgs = normalizeImages(prev.productImages)
      const next = [url, ...imgs.filter((x) => x !== url)].slice(0, 9)
      return { ...prev, productImages: next, productImage: url }
    })
  }

  async function startEdit(id) {
    try {
      const p = await mapi(`/api/merchant/products/${id}`)
      const d = p.data || {}
      const sec = d.sections || {}
      const imgs = normalizeImages(p.productImages || d.productImages || d.galleryImages)
      if (p.productImage && !imgs.includes(p.productImage)) imgs.unshift(p.productImage)
      setEditingId(id)
      setForm({
        ...emptyForm,
        name: p.name || "",
        price: p.price || "",
        commissionRate: p.commission_rate ?? p.commissionRate ?? "",
        category: PRODUCT_CATEGORIES.includes(p.category) ? p.category : "Other",
        productType: p.productType || "PHYSICAL",
        stock: p.stock || "",
        digitalDelivery: p.digitalDelivery || "",
        serviceInstructions: p.serviceInstructions || "",
        productImage: p.productImage || imgs[0] || "",
        productImages: imgs.slice(0, 9),
        videoUrl: p.videoUrl || d.videoUrl || d.sections?.showcase?.videoUrl || d.sections?.video?.url || "",
        whatsapp: p.whatsapp || "",
        aftersalesWhatsapp: p.aftersalesWhatsapp || "",
        heroTitle: sec.hero?.title || "",
        heroSubtitle: sec.hero?.subtitle || "",
        heroBadge: d.heroBadge || sec.hero?.badge || "",
        galleryTitle: d.galleryTitle || sec.showcase?.title || "",
        gallerySubtitle: d.gallerySubtitle || sec.showcase?.subtitle || "",
        galleryLabels: d.galleryLabels || (sec.showcase?.items || []).map((x) => x.title || "").filter(Boolean).join("\n"),
        videoTitle: d.videoTitle || sec.video?.title || "",
        videoSubtitle: d.videoSubtitle || sec.video?.subtitle || "",
        processTitle: d.processTitle || sec.process?.title || "",
        processSteps: d.processSteps || (sec.process?.items || []).map((x) => x.title || x.desc || "").filter(Boolean).join("\n"),
        proofTitle: d.proofTitle || sec.reviews?.title || "",
        offerTitle: d.offerTitle || sec.offer?.title || "",
        offerSubtitle: d.offerSubtitle || sec.offer?.subtitle || "",
        faqTitle: d.faqTitle || sec.faq?.title || "",
        detailsTitle: d.detailsTitle || "",
        finalCtaTitle: d.finalCtaTitle || sec.cta?.title || "",
        finalCtaSubtitle: d.finalCtaSubtitle || sec.cta?.subtitle || "",
        targetCustomer: d.targetCustomer || p.rawProductData?.targetCustomer || "",
        problemSolved: d.problemSolved || p.rawProductData?.problemSolved || "",
        sellingPoints: d.sellingPoints || p.rawProductData?.sellingPoints || "",
        useMethod: d.useMethod || p.rawProductData?.useMethod || "",
        warranty: d.warranty || p.rawProductData?.warranty || "",
        proof: d.proof || p.rawProductData?.proof || "",
        shortDescription: sec.offer?.items?.[0]?.desc || "",
        longDescription: sec.offer?.subtitle || "",
        targetNotSuitable: d.targetNotSuitable || p.rawProductData?.targetNotSuitable || "",
        failedAlternatives: d.failedAlternatives || p.rawProductData?.failedAlternatives || "",
        customerObjections: d.customerObjections || p.rawProductData?.customerObjections || "",
        desiredResult: d.desiredResult || p.rawProductData?.desiredResult || "",
        ingredients: d.ingredients || p.rawProductData?.ingredients || "",
        differentiation: d.differentiation || p.rawProductData?.differentiation || "",
        trustAssets: d.trustAssets || p.rawProductData?.trustAssets || "",
        caseStatus: d.caseStatus || p.rawProductData?.caseStatus || "",
        soldCount: d.soldCount || p.rawProductData?.soldCount || "",
        guarantee: d.guarantee || p.rawProductData?.guarantee || "",
        deliveryTime: d.deliveryTime || p.rawProductData?.deliveryTime || "",
        paymentMethods: d.paymentMethods || p.rawProductData?.paymentMethods || "",
        orderFlow: d.orderFlow || p.rawProductData?.orderFlow || "",
        imageUsageNotes: d.imageUsageNotes || p.rawProductData?.imageUsageNotes || "",
        videoPurpose: d.videoPurpose || p.rawProductData?.videoPurpose || "",
        originalPrice: d.originalPrice || p.rawProductData?.originalPrice || "",
        promotion: d.promotion || p.rawProductData?.promotion || "",
        promotionDeadline: d.promotionDeadline || p.rawProductData?.promotionDeadline || "",
        problemTitle: sec.problem?.title || "",
        problemSubtitle: sec.problem?.subtitle || "",
        painPoints: (sec.problem?.items || []).map((x) => x.title || x.desc || "").filter(Boolean).join("\n"),
        solutionTitle: sec.solution?.title || "",
        solutionSubtitle: sec.solution?.subtitle || "",
        benefits: (sec.solution?.items || []).map((x) => x.title || x.desc || "").filter(Boolean).join("\n"),
        faqs: (sec.faq?.items || []).map((x) => `${x.title || ""}|${x.desc || ""}`).join("\n"),
        ctaTitle: sec.cta?.title || "",
        ctaSubtitle: sec.cta?.subtitle || "",
        ctaText: sec.hero?.ctaText || sec.cta?.buttonText || "立即购买",
        heroTrust1: d.heroTrust1 || sec.hero?.trust1 || "",
        heroTrust2: d.heroTrust2 || sec.hero?.trust2 || "",
        heroTrust3: d.heroTrust3 || sec.hero?.trust3 || "",
        imageHint: d.imageHint || sec.showcase?.hint || "",
        faqButtonText: d.faqButtonText || sec.hero?.secondaryButtonText || "",
        safeNote: d.safeNote || sec.hero?.safeNote || "",
        paidToMerchantText: d.paidToMerchantText || sec.cta?.paymentNote || "",
        supportTrackingText: d.supportTrackingText || sec.cta?.supportButtonText || "",
        stickyCtaText: d.stickyCtaText || sec.cta?.stickyButtonText || "",
        whatsappMessage: sec.cta?.whatsappMessage || "",
        aiGenerated: p.aiStatus === "AI_GENERATED",
        translations: p.translations || {},
      })
      setActiveStep(0)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (e) { setMsg(e.message) }
  }

  async function generateAiFunnel() {
    if (!form.name) return setMsg(tr.productName + " required")
    setAiLoading(true); setMsg("")
    try {
      const res = await mapi("/api/merchant/ai-generate-funnel", { method: "POST", body: JSON.stringify(form) })
      const f = res.funnel || {}
      const merged = {
        ...form,
        heroTitle: f.heroTitle || form.heroTitle,
        heroSubtitle: f.heroSubtitle || form.heroSubtitle,
        heroBadge: f.heroBadge || form.heroBadge,
        galleryTitle: f.galleryTitle || form.galleryTitle,
        gallerySubtitle: f.gallerySubtitle || form.gallerySubtitle,
        videoTitle: f.videoTitle || form.videoTitle,
        videoSubtitle: f.videoSubtitle || form.videoSubtitle,
        processTitle: f.processTitle || form.processTitle,
        processSteps: f.processSteps || form.processSteps || form.useMethod,
        proofTitle: f.proofTitle || form.proofTitle,
        offerTitle: f.offerTitle || form.offerTitle,
        offerSubtitle: f.offerSubtitle || form.offerSubtitle || form.longDescription,
        faqTitle: f.faqTitle || form.faqTitle,
        detailsTitle: f.detailsTitle || form.detailsTitle,
        finalCtaTitle: f.finalCtaTitle || form.finalCtaTitle || form.ctaTitle,
        finalCtaSubtitle: f.finalCtaSubtitle || form.finalCtaSubtitle || form.ctaSubtitle,
        problemTitle: f.problemTitle || form.problemTitle,
        problemSubtitle: f.problemSubtitle || form.problemSubtitle,
        painPoints: f.painPoints || form.painPoints,
        solutionTitle: f.solutionTitle || form.solutionTitle,
        solutionSubtitle: f.solutionSubtitle || form.solutionSubtitle,
        benefits: f.benefits || form.benefits,
        longDescription: f.longDescription || form.longDescription,
        faqs: f.faqs || form.faqs,
        ctaTitle: f.ctaTitle || form.ctaTitle,
        ctaSubtitle: f.ctaSubtitle || form.ctaSubtitle,
        ctaText: f.ctaText || form.ctaText,
        heroTrust1: f.heroTrust1 || form.heroTrust1,
        heroTrust2: f.heroTrust2 || form.heroTrust2,
        heroTrust3: f.heroTrust3 || form.heroTrust3,
        imageHint: f.imageHint || form.imageHint,
        faqButtonText: f.faqButtonText || form.faqButtonText,
        safeNote: f.safeNote || form.safeNote,
        paidToMerchantText: f.paidToMerchantText || form.paidToMerchantText,
        supportTrackingText: f.supportTrackingText || form.supportTrackingText,
        stickyCtaText: f.stickyCtaText || form.stickyCtaText,
        whatsappMessage: f.whatsappMessage || form.whatsappMessage,
        aiGenerated: true,
      }
      let translations = form.translations || {}
      try {
        const tr = await mapi("/api/merchant/translate-funnel", { method: "POST", body: JSON.stringify(merged) })
        translations = tr.translations || translations
      } catch (_) {}
      setForm({ ...merged, translations })
      setActiveStep(1)
      setMsg(tr.translationDone)
    } catch (e) { setMsg(e.message || "AI failed") }
    finally { setAiLoading(false) }
  }

  async function save(options = {}) {
    try {
      const path = editingId ? `/api/merchant/products/${editingId}` : "/api/merchant/products"
      const method = editingId ? "PUT" : "POST"
      let payload = { ...form, productImages: previewImages, productImage: form.productImage || previewImages[0] || "" }
      // Always refresh translations on save/submit. Otherwise old EN/BM/zh translations can keep showing
      // previous customer-facing copy even after the merchant edits the funnel.
      if (!options.silent) setMsg(tr.translationAuto)
      try {
        const translateRes = await mapi("/api/merchant/translate-funnel", { method: "POST", body: JSON.stringify(payload) })
        payload = { ...payload, translations: translateRes.translations || {} }
        setForm((prev) => ({ ...prev, translations: translateRes.translations || {} }))
      } catch (_) {}
      const res = await mapi(path, { method, body: JSON.stringify(payload) })
      if (!options.silent) setMsg(editingId ? tr.savedEditMsg : tr.productCreatedMsg)
      if (!editingId && res.page?.id) setEditingId(res.page.id)
      await load()
      return res
    } catch (e) { setMsg(e.message); return null }
  }
  async function submit(id) {
    let target = id || editingId

    // When the merchant submits from the builder, save the latest form first.
    // Otherwise the admin/public funnel can still show the previous saved content.
    if (!id) {
      const saved = await save({ silent: true })
      target = saved?.page?.id || editingId
      if (!target) return setMsg(tr.createFirst || tr.saveDraft)
    }

    try { await mapi(`/api/merchant/products/${target}/submit`, { method: "POST" }); setMsg(tr.submitReview) ; await load() }
    catch (e) { setMsg(e.message) }
  }
  async function toggleHidden(p) {
    try { await mapi(`/api/merchant/products/${p.id}/visibility`, { method: "PATCH", body: JSON.stringify({ isHidden: !p.is_hidden }) }); setMsg(!p.is_hidden ? tr.hide : tr.restoreShow); await load() }
    catch (e) { setMsg(e.message) }
  }
  async function archiveProduct(p) {
    if (!window.confirm(fmt(tr.confirmArchiveMsg, { name: p.name }))) return
    try { await mapi(`/api/merchant/products/${p.id}`, { method: "DELETE" }); setMsg(tr.deleteProduct); await load() }
    catch (e) { setMsg(e.message) }
  }

  if (loading) return <main className="rounded-[32px] bg-white p-10 font-bold shadow-xl">Loading...</main>
  if (err) return <main className="rounded-[32px] bg-white p-10 shadow-xl"><Link href="/merchant/login" className="rounded-full bg-slate-950 px-6 py-3 font-black text-white">Merchant Login</Link></main>

  const settlementPreview = settlement(form.price, form.commissionRate)
  const top = topProducts(products, orders)
  const topPromoterList = topPromoters(orders)
  const suggestions = funnelHealthSuggestions(products, orders, tr)

  return (
    <main>
      <div>
        <section className="overflow-hidden rounded-[38px] bg-slate-950 p-8 text-white shadow-2xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-blue-100">{tr.merchantSalesOS}</p>
              <h1 className="mt-5 text-4xl font-black tracking-[-.04em] md:text-6xl">{me?.name || "Merchant"}</h1>
              <p className="mt-3 max-w-2xl text-lg font-bold text-slate-300">{tr.heroDesc}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="#create" className="rounded-full bg-white px-6 py-3 font-black text-slate-950 transition hover:bg-blue-50 active:scale-[.98]">{tr.createAiFunnel}</a>
              <Link href="/merchant/orders" className="rounded-full bg-blue-600 px-6 py-3 font-black text-white transition hover:bg-blue-700 active:scale-[.98]">{tr.handleOrders}</Link>
              <Link href="/merchant/billing" className="rounded-full bg-white/10 px-6 py-3 font-black text-white transition hover:bg-white/20 active:scale-[.98]">{tr.planUpgrade}</Link>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-[30px] bg-white p-5 shadow"><p className="text-sm font-black text-slate-400">{tr.todaySales}</p><h3 className="mt-2 text-3xl font-black">{money(stats.todaySales)}</h3><p className="mt-1 text-xs font-bold text-slate-400">{tr.paidOrdersToday}</p></div>
          <div className="rounded-[30px] bg-white p-5 shadow"><p className="text-sm font-black text-slate-400">{tr.monthSales}</p><h3 className="mt-2 text-3xl font-black">{money(stats.monthSales)}</h3><p className="mt-1 text-xs font-bold text-slate-400">{tr.paidOrdersMonth}</p></div>
          <div className="rounded-[30px] bg-white p-5 shadow"><p className="text-sm font-black text-slate-400">{tr.orderCount}</p><h3 className="mt-2 text-3xl font-black">{orders.length}</h3><p className="mt-1 text-xs font-bold text-slate-400">{fmt(tr.allOrdersPaid, { paid: stats.paidCount })}</p></div>
          <div className="rounded-[30px] bg-white p-5 shadow"><p className="text-sm font-black text-slate-400">{tr.conversionRate}</p><h3 className="mt-2 text-3xl font-black">{stats.conversion.toFixed(1)}%</h3><p className="mt-1 text-xs font-bold text-slate-400">{tr.paidOrdersViews}</p></div>
          <div className="rounded-[30px] bg-white p-5 shadow"><p className="text-sm font-black text-slate-400">{tr.promoterCount}</p><h3 className="mt-2 text-3xl font-black">{stats.promoters}</h3><p className="mt-1 text-xs font-bold text-slate-400">{tr.promoterSourceRecord}</p></div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-3">
          <div className="rounded-[34px] bg-white p-6 shadow-xl lg:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <div><h2 className="text-2xl font-black">{tr.funnelAnalytics}</h2><p className="mt-1 text-sm font-bold text-slate-500">{tr.funnelAnalyticsDesc}</p></div>
              <Link href="/merchant/orders" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800 active:scale-[.98]">{tr.viewOrders}</Link>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-4">
              <div className="rounded-3xl bg-slate-50 p-5"><p className="text-xs font-black text-slate-400">{tr.views}</p><h3 className="mt-2 text-3xl font-black">{stats.totalViews}</h3><p className="mt-1 text-xs font-bold text-slate-400">{tr.funnelVisits}</p></div>
              <div className="rounded-3xl bg-blue-50 p-5"><p className="text-xs font-black text-blue-500">{tr.clicks}</p><h3 className="mt-2 text-3xl font-black text-blue-700">{stats.totalClicks}</h3><p className="mt-1 text-xs font-bold text-blue-500">{tr.ctaClicks}</p></div>
              <div className="rounded-3xl bg-amber-50 p-5"><p className="text-xs font-black text-amber-500">{tr.paidOrders}</p><h3 className="mt-2 text-3xl font-black text-amber-700">{stats.paidCount}</h3><p className="mt-1 text-xs font-bold text-amber-500">{tr.billplzPaid}</p></div>
              <div className="rounded-3xl bg-emerald-50 p-5"><p className="text-xs font-black text-emerald-500">{tr.paidSales}</p><h3 className="mt-2 text-2xl font-black text-emerald-700">{money(stats.totalSales)}</h3><p className="mt-1 text-xs font-bold text-emerald-500">{tr.totalGmv}</p></div>
            </div>
          </div>
          <div className="rounded-[34px] bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-black">{tr.aiSuggestions}</h2>
            <p className="mt-4 rounded-3xl bg-blue-50 p-5 text-sm font-bold leading-7 text-blue-800">{health}</p>
            <div className="mt-4 space-y-3">
              {suggestions.map((item, idx) => (
                <p key={idx} className="rounded-3xl bg-slate-50 p-4 text-sm font-bold leading-6 text-slate-600">{idx + 1}. {item}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-5 xl:grid-cols-3">
          <div className="rounded-[34px] bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-black">{tr.topProduct}</h2>
            <div className="mt-4 space-y-3">
              {top.length ? top.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-3xl bg-slate-50 p-4">
                  <div><p className="font-black">{p.name}</p><p className="text-sm font-bold text-slate-500">{p.orders} {tr.ordersLabel} · {productViews(p)} {tr.viewsLabel} · {pct(p.commission_rate || p.commissionRate)} {tr.commissionLabel}</p></div>
                  <p className="font-black text-emerald-700">{money(p.sales)}</p>
                </div>
              )) : <p className="rounded-3xl bg-slate-50 p-5 font-bold text-slate-500">{tr.noProductData}</p>}
            </div>
          </div>
          <div className="rounded-[34px] bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-black">{tr.topPromoter}</h2>
            <div className="mt-4 space-y-3">
              {topPromoterList.length ? topPromoterList.map((p) => (
                <div key={p.key} className="flex items-center justify-between rounded-3xl bg-blue-50 p-4">
                  <div><p className="font-black text-blue-950">{p.name}</p><p className="text-sm font-bold text-blue-500">{p.paid} {tr.paidLabel} · {p.orders} {tr.totalOrdersLabel}</p></div>
                  <p className="font-black text-blue-700">{money(p.sales)}</p>
                </div>
              )) : <p className="rounded-3xl bg-slate-50 p-5 font-bold text-slate-500">{tr.noPromoterOrders}</p>}
            </div>
          </div>
          <div className="rounded-[34px] bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-black">{tr.quickActions}</h2>
            <div className="mt-4 grid gap-3">
              <a href="#create" className="rounded-3xl bg-slate-950 p-5 font-black text-white transition hover:bg-slate-800 active:scale-[.98]">{tr.createAiFunnel}</a>
              <Link href="/merchant/orders" className="rounded-3xl bg-amber-50 p-5 font-black text-amber-800 transition hover:bg-amber-100 active:scale-[.98]">{tr.handleOrders}</Link>
              <Link href="/merchant/billing" className="rounded-3xl bg-blue-50 p-5 font-black text-blue-800 transition hover:bg-blue-100 active:scale-[.98]">{tr.planUpgrade}</Link>
            </div>
          </div>
        </section>

        <section id="create" className="mt-8 rounded-[36px] bg-white p-5 shadow-xl md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[.18em] text-blue-700">{tr.aiBuilderLabel}</p>
              <h2 className="mt-2 text-3xl font-black">{editingId ? tr.editProduct : tr.createProductFunnel}</h2>
              <p className="mt-2 max-w-2xl text-sm font-bold text-slate-500">{tr.builderDesc}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {editingId ? (
                <button
                  type="button"
                  onClick={() => { setEditingId(""); setForm(emptyForm); setActiveStep(0); notify(tr.switchedNew) }}
                  className="rounded-full border px-5 py-3 font-black transition hover:bg-slate-50 active:scale-[.98]"
                >
                  {tr.addAnother}
                </button>
              ) : null}
              <button type="button" onClick={() => setActiveStep(4)} className="rounded-full bg-slate-100 px-5 py-3 font-black transition hover:bg-slate-200 active:scale-[.98]">{tr.previewPage || tr.preview}</button>
            </div>
          </div>

          {msg ? <p className="mt-5 rounded-2xl bg-blue-50 p-4 font-bold text-blue-700">{msg}</p> : null}

          <div className="mt-6 overflow-x-auto rounded-[28px] bg-slate-50 p-2">
            <div className="flex min-w-max gap-2">
              {steps.map((label, idx) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className={`rounded-full px-5 py-3 text-sm font-black transition active:scale-[.98] ${activeStep === idx ? "bg-slate-950 text-white shadow" : "bg-white text-slate-500 hover:bg-blue-50 hover:text-blue-700"}`}
                >
                  {tr.stepWord} {idx + 1} · {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
            <div className="min-h-[540px] rounded-[30px] border border-slate-100 bg-slate-50 p-4 md:p-5">
              {activeStep === 0 ? (
                <div className="space-y-5">
                  <div className="rounded-[28px] bg-white p-5 shadow-sm">
                    <h3 className="text-2xl font-black">{tr.stepBasic}</h3>
                    <p className="mt-1 text-sm font-bold text-slate-500">{tr.basicHint}</p>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <input className="rounded-2xl border p-4" placeholder={tr.productName} value={form.name} onChange={(e) => set("name", e.target.value)} />
                      <input className="rounded-2xl border p-4" placeholder={tr.price} value={form.price} onChange={(e) => set("price", e.target.value)} />
                      <input className="rounded-2xl border p-4" placeholder={tr.originalPricePh} value={form.originalPrice} onChange={(e) => set("originalPrice", e.target.value)} />
                      <input className="rounded-2xl border p-4" placeholder={tr.promotionPh} value={form.promotion} onChange={(e) => set("promotion", e.target.value)} />
                      <input className="rounded-2xl border p-4" placeholder={tr.promotionDeadlinePh} value={form.promotionDeadline} onChange={(e) => set("promotionDeadline", e.target.value)} />
                      <select className="rounded-2xl border p-4" value={form.category} onChange={(e) => set("category", e.target.value)}>{PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{categoryLabel(c, tr)}</option>)}</select>
                      <select className="rounded-2xl border p-4" value={form.productType} onChange={(e) => set("productType", e.target.value)}><option value="PHYSICAL">{tr.physicalProduct}</option><option value="DIGITAL">{tr.digitalProduct}</option><option value="SERVICE">{tr.serviceProduct}</option></select>
                      <input className="rounded-2xl border p-4" placeholder={tr.stock} value={form.stock} onChange={(e) => set("stock", e.target.value)} />
                      <input className="rounded-2xl border p-4" placeholder={tr.aftersalesWhatsapp} value={form.aftersalesWhatsapp} onChange={(e) => set("aftersalesWhatsapp", e.target.value)} />
                      <input className="rounded-2xl border p-4 md:col-span-2" placeholder={tr.merchantWhatsapp} value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
                      {form.productType === "DIGITAL" ? <textarea className="min-h-28 rounded-2xl border p-4 md:col-span-2" placeholder={tr.digitalDeliveryPh} value={form.digitalDelivery} onChange={(e) => set("digitalDelivery", e.target.value)} /> : null}
                      {form.productType === "SERVICE" ? <textarea className="min-h-28 rounded-2xl border p-4 md:col-span-2" placeholder={tr.serviceInstructionsPh} value={form.serviceInstructions} onChange={(e) => set("serviceInstructions", e.target.value)} /> : null}
                    </div>
                  </div>
                  <div className="rounded-[28px] bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-black">{tr.completeBriefTitle}</h3>
                        <p className="mt-1 text-sm font-bold text-slate-500">{tr.completeBriefHint}</p>
                      </div>
                      <span className="rounded-full bg-blue-50 px-4 py-2 text-xs font-black text-blue-700">{tr.aiMaterial}</span>
                    </div>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <textarea className="min-h-24 rounded-2xl border p-4" placeholder={tr.targetCustomerFullPh} value={form.targetCustomer} onChange={(e) => set("targetCustomer", e.target.value)} />
                      <textarea className="min-h-24 rounded-2xl border p-4" placeholder={tr.targetNotSuitablePh} value={form.targetNotSuitable} onChange={(e) => set("targetNotSuitable", e.target.value)} />
                      <textarea className="min-h-24 rounded-2xl border p-4" placeholder={tr.customerPainFullPh} value={form.problemSolved} onChange={(e) => set("problemSolved", e.target.value)} />
                      <textarea className="min-h-24 rounded-2xl border p-4" placeholder={tr.failedAlternativesPh} value={form.failedAlternatives} onChange={(e) => set("failedAlternatives", e.target.value)} />
                      <textarea className="min-h-24 rounded-2xl border p-4" placeholder={tr.customerObjectionsPh} value={form.customerObjections} onChange={(e) => set("customerObjections", e.target.value)} />
                      <textarea className="min-h-24 rounded-2xl border p-4" placeholder={tr.desiredResultPh} value={form.desiredResult} onChange={(e) => set("desiredResult", e.target.value)} />
                      <textarea className="min-h-24 rounded-2xl border p-4" placeholder={tr.ingredientsPh} value={form.ingredients} onChange={(e) => set("ingredients", e.target.value)} />
                      <textarea className="min-h-24 rounded-2xl border p-4" placeholder={tr.differentiationPh} value={form.differentiation} onChange={(e) => set("differentiation", e.target.value)} />
                      <textarea className="min-h-24 rounded-2xl border p-4" placeholder={tr.trustAssetsPh} value={form.trustAssets} onChange={(e) => set("trustAssets", e.target.value)} />
                      <select className="rounded-2xl border p-4" value={form.caseStatus} onChange={(e) => set("caseStatus", e.target.value)}>
                        <option value="">{tr.caseStatusPlaceholder}</option>
                        <option value="暂时没有案例">{tr.caseStatusNone}</option>
                        <option value="有少量案例">{tr.caseStatusSome}</option>
                        <option value="有很多案例">{tr.caseStatusMany}</option>
                      </select>
                      <input className="rounded-2xl border p-4" placeholder={tr.soldCountPh} value={form.soldCount} onChange={(e) => set("soldCount", e.target.value)} />
                      <input className="rounded-2xl border p-4" placeholder={tr.guaranteePh} value={form.guarantee} onChange={(e) => { set("guarantee", e.target.value); set("warranty", e.target.value) }} />
                      <input className="rounded-2xl border p-4" placeholder={tr.deliveryTimePh} value={form.deliveryTime} onChange={(e) => set("deliveryTime", e.target.value)} />
                      <input className="rounded-2xl border p-4" placeholder={tr.paymentMethodsPh} value={form.paymentMethods} onChange={(e) => set("paymentMethods", e.target.value)} />
                      <textarea className="min-h-24 rounded-2xl border p-4 md:col-span-2" placeholder={tr.orderFlowPh} value={form.orderFlow} onChange={(e) => set("orderFlow", e.target.value)} />
                    </div>
                  </div>

                  <div className="flex justify-end"><button type="button" onClick={() => setActiveStep(1)} className="rounded-full bg-slate-950 px-6 py-3 font-black text-white transition hover:bg-slate-800 active:scale-[.98]">{tr.nextAiFunnel}</button></div>
                </div>
              ) : null}

              {activeStep === 1 ? (
                <div className="space-y-5">
                  <div className="rounded-[28px] bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-2xl font-black">{tr.stepAi}</h3>
                        <p className="mt-1 text-sm font-bold text-slate-500">{tr.aiGeneratedEditable}</p>
                      </div>
                      <button onClick={generateAiFunnel} disabled={aiLoading} className="rounded-full bg-blue-700 px-6 py-3 font-black text-white transition hover:bg-blue-800 active:scale-[.98] disabled:opacity-50">{aiLoading ? tr.aiGenerating : tr.generateAi}</button>
                    </div>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <textarea className="min-h-28 rounded-2xl border p-4" placeholder={tr.targetCustomerPh} value={form.targetCustomer} onChange={(e) => set("targetCustomer", e.target.value)} />
                      <textarea className="min-h-28 rounded-2xl border p-4" placeholder={tr.problemSolvedPh} value={form.problemSolved} onChange={(e) => set("problemSolved", e.target.value)} />
                      <textarea className="min-h-28 rounded-2xl border p-4 md:col-span-2" placeholder={tr.productDetailPh} value={form.longDescription} onChange={(e) => set("longDescription", e.target.value)} />
                      <textarea className="min-h-24 rounded-2xl border p-4" placeholder={tr.sellingPointsPh} value={form.sellingPoints} onChange={(e) => { set("sellingPoints", e.target.value); set("benefits", e.target.value) }} />
                      <textarea className="min-h-24 rounded-2xl border p-4" placeholder={tr.proofMaterialPh} value={form.trustAssets} onChange={(e) => set("trustAssets", e.target.value)} />
                      <textarea className="min-h-24 rounded-2xl border p-4" placeholder={tr.faqMaterialPh} value={form.customerObjections} onChange={(e) => set("customerObjections", e.target.value)} />
                      <textarea className="min-h-24 rounded-2xl border p-4" placeholder={tr.orderDeliveryPh} value={form.orderFlow} onChange={(e) => set("orderFlow", e.target.value)} />
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-[26px] bg-white shadow-sm ring-1 ring-slate-100">
                    <button type="button" onClick={() => toggleSection("customerText")} className="flex w-full items-center justify-between p-5 text-left transition hover:bg-slate-50">
                      <div>
                        <h4 className="text-lg font-black">{tr.customerFacingContent}</h4>
                        <p className="mt-1 text-sm font-bold text-slate-400">{tr.customerFacingContentHint}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black">{openSections.customerText ? tr.collapse : tr.expand}</span>
                    </button>
                    {openSections.customerText ? (
                      <div className="border-t border-slate-100 p-5">
                        <div className="grid gap-4 md:grid-cols-2">
                          <input className="rounded-2xl border p-4" placeholder={tr.heroBadgeLabel} value={form.heroBadge} onChange={(e) => set("heroBadge", e.target.value)} />
                          <input className="rounded-2xl border p-4" placeholder={tr.ctaButtonPh} value={form.ctaText} onChange={(e) => set("ctaText", e.target.value)} />
                          <input className="rounded-2xl border p-4" placeholder={tr.faqButtonLabel || "Hero secondary button"} value={form.faqButtonText} onChange={(e) => set("faqButtonText", e.target.value)} />
                          <input className="rounded-2xl border p-4" placeholder={tr.stickyCtaLabel || "Sticky CTA text"} value={form.stickyCtaText} onChange={(e) => set("stickyCtaText", e.target.value)} />
                          <input className="rounded-2xl border p-4 md:col-span-2" placeholder={tr.heroTitleLabel} value={form.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} />
                          <textarea className="min-h-24 rounded-2xl border p-4 md:col-span-2" placeholder={tr.heroSubtitleLabel} value={form.heroSubtitle} onChange={(e) => set("heroSubtitle", e.target.value)} />
                          <input className="rounded-2xl border p-4" placeholder={tr.trustBadge1Label || "Trust point 1"} value={form.heroTrust1} onChange={(e) => set("heroTrust1", e.target.value)} />
                          <input className="rounded-2xl border p-4" placeholder={tr.trustBadge2Label || "Trust point 2"} value={form.heroTrust2} onChange={(e) => set("heroTrust2", e.target.value)} />
                          <input className="rounded-2xl border p-4" placeholder={tr.trustBadge3Label || "Trust point 3"} value={form.heroTrust3} onChange={(e) => set("heroTrust3", e.target.value)} />
                          <input className="rounded-2xl border p-4" placeholder={tr.imageHintLabel || "Gallery hint"} value={form.imageHint} onChange={(e) => set("imageHint", e.target.value)} />
                          <textarea className="min-h-24 rounded-2xl border p-4 md:col-span-2" placeholder={tr.safeNoteLabel || "Hero safe note"} value={form.safeNote} onChange={(e) => set("safeNote", e.target.value)} />
                          <textarea className="min-h-24 rounded-2xl border p-4 md:col-span-2" placeholder={tr.paidToMerchantLabel || "Purchase payment note"} value={form.paidToMerchantText} onChange={(e) => set("paidToMerchantText", e.target.value)} />
                          <input className="rounded-2xl border p-4 md:col-span-2" placeholder={tr.supportTrackingLabel || "Support button text"} value={form.supportTrackingText} onChange={(e) => set("supportTrackingText", e.target.value)} />
                          <input className="rounded-2xl border p-4" placeholder={tr.galleryTitleLabel} value={form.galleryTitle} onChange={(e) => set("galleryTitle", e.target.value)} />
                          <input className="rounded-2xl border p-4" placeholder={tr.gallerySubtitleLabel} value={form.gallerySubtitle} onChange={(e) => set("gallerySubtitle", e.target.value)} />
                          <textarea className="min-h-24 rounded-2xl border p-4 md:col-span-2" placeholder={tr.galleryLabelsLabel} value={form.galleryLabels} onChange={(e) => set("galleryLabels", e.target.value)} />
                          <input className="rounded-2xl border p-4" placeholder={tr.videoTitleLabel} value={form.videoTitle} onChange={(e) => set("videoTitle", e.target.value)} />
                          <input className="rounded-2xl border p-4" placeholder={tr.videoSubtitleLabel} value={form.videoSubtitle} onChange={(e) => set("videoSubtitle", e.target.value)} />
                          <input className="rounded-2xl border p-4" placeholder={tr.problemTitleLabel} value={form.problemTitle} onChange={(e) => set("problemTitle", e.target.value)} />
                          <input className="rounded-2xl border p-4" placeholder={tr.problemSubtitleLabel} value={form.problemSubtitle} onChange={(e) => set("problemSubtitle", e.target.value)} />
                          <input className="rounded-2xl border p-4" placeholder={tr.solutionTitleLabel} value={form.solutionTitle} onChange={(e) => set("solutionTitle", e.target.value)} />
                          <input className="rounded-2xl border p-4" placeholder={tr.solutionSubtitleLabel} value={form.solutionSubtitle} onChange={(e) => set("solutionSubtitle", e.target.value)} />
                          <input className="rounded-2xl border p-4" placeholder={tr.processTitleLabel} value={form.processTitle} onChange={(e) => set("processTitle", e.target.value)} />
                          <textarea className="min-h-24 rounded-2xl border p-4" placeholder={tr.processStepsLabel} value={form.processSteps} onChange={(e) => { set("processSteps", e.target.value); set("useMethod", e.target.value) }} />
                          <input className="rounded-2xl border p-4" placeholder={tr.proofTitleLabel} value={form.proofTitle} onChange={(e) => set("proofTitle", e.target.value)} />
                          <input className="rounded-2xl border p-4" placeholder={tr.detailsTitleLabel} value={form.detailsTitle} onChange={(e) => set("detailsTitle", e.target.value)} />
                          <input className="rounded-2xl border p-4" placeholder={tr.offerTitleLabel} value={form.offerTitle} onChange={(e) => set("offerTitle", e.target.value)} />
                          <textarea className="min-h-24 rounded-2xl border p-4" placeholder={tr.offerSubtitleLabel} value={form.offerSubtitle} onChange={(e) => { set("offerSubtitle", e.target.value); set("longDescription", e.target.value) }} />
                          <input className="rounded-2xl border p-4" placeholder={tr.faqTitleLabel} value={form.faqTitle} onChange={(e) => set("faqTitle", e.target.value)} />
                          <input className="rounded-2xl border p-4" placeholder={tr.finalCtaTitleLabel} value={form.finalCtaTitle} onChange={(e) => { set("finalCtaTitle", e.target.value); set("ctaTitle", e.target.value) }} />
                          <textarea className="min-h-24 rounded-2xl border p-4 md:col-span-2" placeholder={tr.finalCtaSubtitleLabel} value={form.finalCtaSubtitle} onChange={(e) => { set("finalCtaSubtitle", e.target.value); set("ctaSubtitle", e.target.value) }} />
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {[{key:"benefits",title:tr.benefitsTitle,field:"sellingPoints",hint:tr.benefitsHint,placeholder:tr.benefitsTitle},{key:"pain",title:tr.painTitle,field:"painPoints",hint:tr.painHint,placeholder:tr.painTitle},{key:"faq",title:tr.faqTitle,field:"faqs",hint:tr.faqHint,pair:true},{key:"proof",title:tr.proofTitle,field:"proof",hint:tr.proofHint,placeholder:tr.proofTitle},{key:"use",title:tr.useTitle,field:"useMethod",hint:tr.useHint,placeholder:tr.useTitle},{key:"cta",title:tr.ctaTitle,field:"warranty",hint:tr.ctaHint,placeholder:tr.ctaTitle}].map((sec) => (
                    <div key={sec.key} className="overflow-hidden rounded-[26px] bg-white shadow-sm ring-1 ring-slate-100">
                      <button type="button" onClick={() => toggleSection(sec.key)} className="flex w-full items-center justify-between p-5 text-left transition hover:bg-slate-50">
                        <div><h4 className="text-lg font-black">{sec.title}</h4><p className="mt-1 text-sm font-bold text-slate-400">{sec.hint}</p></div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black">{openSections[sec.key] ? tr.collapse : tr.expand}</span>
                      </button>
                      {openSections[sec.key] ? (
                        <div className="border-t border-slate-100 p-5">
                          <ArrayTextEditor tr={tr} title={sec.title} hint={sec.hint} value={form[sec.field]} onChange={(v) => { set(sec.field, v); if (sec.field === "sellingPoints") set("benefits", v) }} placeholder={sec.placeholder} pair={sec.pair} onToast={notify} />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}

              {activeStep === 2 ? (
                <div className="space-y-5">
                  <div className="rounded-[28px] bg-white p-5 shadow-sm">
                    <h3 className="text-2xl font-black">{tr.productImages}</h3>
                    <p className="mt-1 text-sm font-bold text-slate-500">{tr.productImagesHint}</p>
                    <input className="mt-5 block w-full rounded-2xl border bg-white p-4" type="file" accept="image/*" multiple onChange={(e) => handleUpload(e.target.files)} />
                    {uploading ? <p className="mt-3 font-bold text-blue-700">{tr.mediaUploading}</p> : null}
                    {previewImages.length ? (
                      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                        {previewImages.map((url, i) => (
                          <div key={url} className="rounded-2xl bg-white p-2 shadow ring-1 ring-slate-100">
                            <img src={url} alt="product" className="h-32 w-full rounded-xl object-cover" />
                            <div className="mt-2 flex gap-2">
                              <button type="button" onClick={() => { makeMainImage(url); notify(tr.setAsMain) }} className="flex-1 rounded-full bg-slate-950 px-3 py-2 text-xs font-black text-white transition hover:bg-slate-800 active:scale-[.98]">{i === 0 ? tr.mainImage : tr.setMainImage}</button>
                              <button type="button" onClick={() => { removeImage(url); notify(tr.uploadImageDeleted) }} className="rounded-full bg-red-50 px-3 py-2 text-xs font-black text-red-700 transition hover:bg-red-100 active:scale-[.98]">{tr.deleteProduct}</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : <p className="mt-5 rounded-3xl bg-slate-50 p-6 text-sm font-bold text-slate-400">{tr.noImagesSuggest}</p>}
                  </div>

                  <div className="rounded-[28px] bg-white p-5 shadow-sm">
                    <h3 className="text-2xl font-black">{tr.videoEmbedTitle}</h3>
                    <p className="mt-1 text-sm font-bold text-slate-500">{tr.videoEmbedHint}</p>
                    <input
                      className="mt-5 w-full rounded-2xl border bg-white p-4"
                      placeholder={tr.videoEmbedPh}
                      value={form.videoUrl}
                      onChange={(e) => set("videoUrl", e.target.value)}
                    />
                    <textarea className="mt-4 min-h-24 w-full rounded-2xl border bg-white p-4" placeholder={tr.videoPurposePh} value={form.videoPurpose} onChange={(e) => set("videoPurpose", e.target.value)} />
                    <textarea className="mt-4 min-h-24 w-full rounded-2xl border bg-white p-4" placeholder={tr.imageUsageNotesPh} value={form.imageUsageNotes} onChange={(e) => set("imageUsageNotes", e.target.value)} />
                    {form.videoUrl ? (
                      <div className="mt-5 overflow-hidden rounded-[24px] bg-slate-950 shadow">
                        <iframe className="aspect-video w-full" src={mediaEmbedUrl(form.videoUrl)} allowFullScreen title={tr.productVideoPreviewTitle} />
                      </div>
                    ) : <p className="mt-5 rounded-3xl bg-slate-50 p-6 text-sm font-bold text-slate-400">{tr.noVideo}</p>}
                  </div>
                </div>
              ) : null}

              {activeStep === 3 ? (
                <div className="space-y-5">
                  <div className="rounded-[28px] bg-white p-5 shadow-sm">
                    <h3 className="text-2xl font-black">{tr.stepPromoter}</h3>
                    <p className="mt-1 text-sm font-bold text-slate-500">{tr.promoterSettingDesc}</p>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <input className="rounded-2xl border p-4" placeholder={tr.commissionPh} value={form.commissionRate} onChange={(e) => set("commissionRate", e.target.value)} />
                      <input className="rounded-2xl border p-4" placeholder={tr.ctaButtonPh} value={form.ctaText} onChange={(e) => set("ctaText", e.target.value)} />
                          <input className="rounded-2xl border p-4" placeholder={tr.faqButtonLabel || "Hero secondary button"} value={form.faqButtonText} onChange={(e) => set("faqButtonText", e.target.value)} />
                          <input className="rounded-2xl border p-4" placeholder={tr.stickyCtaLabel || "Sticky CTA text"} value={form.stickyCtaText} onChange={(e) => set("stickyCtaText", e.target.value)} />
                      <textarea className="min-h-28 rounded-2xl border p-4 md:col-span-2" placeholder={tr.whatsappMessagePh} value={form.whatsappMessage} onChange={(e) => set("whatsappMessage", e.target.value)} />
                    </div>
                  </div>
                  <div className="rounded-[30px] bg-slate-950 p-6 text-white shadow-xl">
                    <p className="text-sm font-black text-blue-200">{tr.settlementPreview}</p>
                    <h3 className="mt-2 text-4xl font-black">{money(form.price)}</h3>
                    <div className="mt-4 space-y-2 text-sm font-bold text-slate-300">
                      <p>Promoter：-{money(settlementPreview.commission)} ({pct(form.commissionRate)})</p>
                      <p>LinkFlo：-{money(settlementPreview.platform)} (11.5%)</p>
                      <p className="border-t border-white/10 pt-3 text-xl text-white">{tr.merchantReceive}：{money(settlementPreview.merchant)}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              {activeStep === 4 ? (
                <div className="space-y-5">
                  <div className="rounded-[28px] bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-2xl font-black">{tr.previewFull}</h3>
                        <p className="mt-1 text-sm font-bold text-slate-500">{tr.previewFullDesc}</p>
                      </div>
                      {editingId ? (
                        <a href={productDraftUrl((products.find((x) => String(x.id) === String(editingId))?.slug || form.name || "preview"), editingId)} target="_blank" className="rounded-full bg-blue-700 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-800 active:scale-[.98]">{tr.openFunnel}</a>
                      ) : null}
                    </div>
                    <p className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm font-black text-emerald-700">{tr.customerTrustNote}</p>
                  </div>

                  <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-slate-950 shadow-xl">
                    <div className="border-b border-white/10 bg-slate-950 px-5 py-4 text-white">
                      <h4 className="text-lg font-black">{tr.liveSlugPreview}</h4>
                      <p className="mt-1 text-sm font-bold text-slate-400">{tr.liveSlugPreviewHint}</p>
                    </div>
                    <div className="bg-slate-950">
                      <ProductFunnelLux product={previewSlugProduct(form, previewImages)} page={previewSlugPage(form, previewImages)} />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-black text-emerald-700">{translationsReady(form.translations) ? tr.translationDone : tr.translationAuto}</div>
                </div>
              ) : null}
            </div>

            <aside className="space-y-4">
              <div className="rounded-[30px] bg-white p-6 shadow-xl ring-1 ring-slate-100">
                <h3 className="text-xl font-black">{tr.builderStatus}</h3>
                <div className="mt-4 space-y-3 text-sm font-bold text-slate-600">
                  <p className={form.name ? "text-emerald-700" : "text-amber-700"}>• {form.name ? tr.basicDone : tr.basicIncomplete}</p>
                  <p className={form.aiGenerated ? "text-emerald-700" : "text-amber-700"}>• {form.aiGenerated ? tr.aiGenerated : tr.aiReady}</p>
                  <p className={previewImages.length ? "text-emerald-700" : "text-amber-700"}>• {fmt(tr.imagesCount, { count: previewImages.length })}</p>
                  <p className={form.commissionRate ? "text-emerald-700" : "text-amber-700"}>• {fmt(tr.promoterCommission, { rate: form.commissionRate ? pct(form.commissionRate) : tr.commissionNotSet })}</p>
                  <p className={translationsReady(form.translations) ? "text-emerald-700" : "text-amber-700"}>• {translationsReady(form.translations) ? tr.translationDone : tr.translationReady}</p>
                </div>
              </div>
              <div className="rounded-[30px] bg-slate-950 p-6 text-white shadow-xl">
                <p className="text-sm font-black text-blue-200">{tr.settlementPreview}</p>
                <h3 className="mt-2 text-3xl font-black">{money(form.price)}</h3>
                <div className="mt-4 space-y-2 text-sm font-bold text-slate-300">
                  <p>Promoter：-{money(settlementPreview.commission)} ({pct(form.commissionRate)})</p>
                  <p>LinkFlo：-{money(settlementPreview.platform)} (11.5%)</p>
                  <p className="border-t border-white/10 pt-3 text-lg text-white">{tr.merchantReceive}：{money(settlementPreview.merchant)}</p>
                </div>
              </div>
              <div className="grid gap-3 rounded-[30px] bg-white p-4 shadow-xl ring-1 ring-slate-100">
                <button onClick={generateAiFunnel} disabled={aiLoading} className="rounded-full bg-blue-700 px-6 py-4 font-black text-white transition hover:bg-blue-800 active:scale-[.98] disabled:opacity-50">{aiLoading ? tr.aiGenerating : (tr.oneClickCreate || tr.generateAi)}</button>
                <button onClick={() => setActiveStep(4)} className="rounded-full bg-slate-950 px-6 py-4 font-black text-white transition hover:bg-slate-800 active:scale-[.98]">{tr.previewPage || tr.preview}</button>
                <button onClick={() => submit()} className="rounded-full bg-green-700 px-6 py-4 font-black text-white transition hover:bg-green-800 active:scale-[.98]">{tr.submitReview}</button>
                <button onClick={() => save()} className="rounded-full bg-slate-100 px-6 py-4 font-black text-slate-700 transition hover:bg-slate-200 active:scale-[.98]">{tr.draftSecondary || tr.saveDraft}</button>
              </div>
            </aside>
          </div>

          <div className="mt-6 rounded-[30px] border bg-white/95 px-4 py-3 shadow-xl backdrop-blur">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black">{editingId ? tr.editingProduct : tr.newProductDraft}</p>
                <p className="text-xs font-bold text-slate-500">{tr.stepWord} {activeStep + 1} / 5 · {steps[activeStep]}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setActiveStep(Math.max(0, activeStep - 1))} className="rounded-full bg-slate-100 px-5 py-3 text-sm font-black transition hover:bg-slate-200 active:scale-[.98]">{tr.previous}</button>
                <button type="button" onClick={() => setActiveStep(Math.min(4, activeStep + 1))} className="rounded-full bg-blue-50 px-5 py-3 text-sm font-black text-blue-700 transition hover:bg-blue-100 active:scale-[.98]">{tr.next}</button>
                <button type="button" onClick={generateAiFunnel} disabled={aiLoading} className="rounded-full bg-blue-700 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-800 active:scale-[.98] disabled:opacity-50">{aiLoading ? tr.aiGenerating : (tr.oneClickCreate || tr.generateAi)}</button>
                <button type="button" onClick={() => setActiveStep(4)} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800 active:scale-[.98]">{tr.previewPage || tr.preview}</button>
                <button type="button" onClick={() => submit()} className="rounded-full bg-green-700 px-5 py-3 text-sm font-black text-white transition hover:bg-green-800 active:scale-[.98]">{tr.submitReview}</button>
                <button type="button" onClick={() => save()} className="rounded-full bg-slate-100 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200 active:scale-[.98]">{tr.draftSecondary || tr.saveDraft}</button>
              </div>
            </div>
          </div>
        </section>

        <section id="products" className="mt-8 rounded-[36px] bg-white p-6 shadow-xl">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><h2 className="text-3xl font-black">{tr.productFunnels}</h2><p className="mt-1 text-sm font-bold text-slate-500">{tr.productFunnelsDesc}</p></div><a href="#create" className="rounded-full bg-blue-700 px-6 py-3 font-black text-white transition hover:bg-blue-800 active:scale-[.98]">{tr.addNewProduct}</a></div>
          <div className="mt-5 grid gap-4">
            {products.map((p) => {
              const imgs = normalizeImages(p.product_images || p.productImages)
              const image = p.product_image || p.productImage || imgs[0] || ""
              const ps = productStats(products, orders).get(String(p.id)) || { orders: 0, sales: 0 }
              const s = settlement(p.price, p.commission_rate || p.commissionRate)
              const isApproved = String(p.approval_status || "").toUpperCase() === "APPROVED"
              const openHref = isApproved ? `/p/${p.slug}` : `/p/${p.slug}?draft=${p.id}`
              return (
                <div key={p.id} className="rounded-3xl border bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex gap-4">
                      {image ? <img src={image} className="h-24 w-24 rounded-2xl object-cover" alt="product" /> : <div className="grid h-24 w-24 place-items-center rounded-2xl bg-slate-100 text-xs font-bold text-slate-400">{tr.noImage}</div>}
                      <div>{badge(p.approval_status, tr)}<h3 className="mt-2 text-xl font-black">{p.name}</h3><p className="text-sm font-bold text-slate-500">/p/{p.slug} · {money(p.price)} · {categoryLabel(p.category, tr)}</p><p className="mt-1 text-sm font-black text-blue-700">Promoter：{pct(p.commission_rate || p.commissionRate)} · {tr.merchantNet}：{money(s.merchant)}</p>{p.rejection_reason ? <p className="mt-2 rounded-xl bg-red-50 p-2 text-sm font-bold text-red-700">{tr.rejectionReason}：{p.rejection_reason}</p> : null}</div>
                    </div>
                    <div className="xl:min-w-[620px]">
                      <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                        <div className="rounded-2xl bg-slate-50 p-3 text-center"><p className="text-xs font-black text-slate-400">{tr.views}</p><p className="text-lg font-black">{productViews(p)}</p></div>
                        <div className="rounded-2xl bg-slate-50 p-3 text-center"><p className="text-xs font-black text-slate-400">{tr.clicks}</p><p className="text-lg font-black">{productClicks(p)}</p></div>
                        <div className="rounded-2xl bg-emerald-50 p-3 text-center"><p className="text-xs font-black text-emerald-500">{tr.sales}</p><p className="text-lg font-black text-emerald-700">{money(ps.sales)}</p></div>
                        <div className="rounded-2xl bg-blue-50 p-3 text-center"><p className="text-xs font-black text-blue-500">{tr.promoters}</p><p className="text-lg font-black text-blue-700">{productPromoterCount(p.id, orders)}</p></div>
                        <div className="rounded-2xl bg-purple-50 p-3 text-center"><p className="text-xs font-black text-purple-500">{tr.merchantNet}</p><p className="text-lg font-black text-purple-700">{money(s.merchant)}</p></div>
                      </div>

                      <div className="relative mt-3 md:hidden">
                        <button
                          type="button"
                          onClick={() => setOpenProductMenu(openProductMenu === p.id ? "" : p.id)}
                          className="w-full rounded-2xl bg-slate-950 px-4 py-3 font-black text-white transition hover:bg-slate-800 active:scale-[.98]"
                        >
                          {tr.actions} ⋯
                        </button>
                        {openProductMenu === p.id ? (
                          <div className="absolute right-0 z-10 mt-2 grid w-full gap-2 rounded-3xl border bg-white p-3 shadow-2xl">
                            <button onClick={() => { setOpenProductMenu(""); startEdit(p.id) }} className="rounded-2xl border px-4 py-3 text-left font-black">{tr.editFunnel}</button>
                            <a href={openHref} target="_blank" className="rounded-2xl bg-blue-50 px-4 py-3 font-black text-blue-700">{tr.openFunnel}</a>
                            <button onClick={async () => { setOpenProductMenu(""); setMsg(await copyText(productUrl(p.slug)) ? tr.copiedFunnel : productUrl(p.slug)) }} className="rounded-2xl bg-slate-100 px-4 py-3 text-left font-black">{tr.copyFunnel}</button>
                            <button onClick={async () => { setOpenProductMenu(""); setMsg(await copyText(promoterUrl(p.slug)) ? tr.copiedPromoter : promoterUrl(p.slug)) }} className="rounded-2xl bg-blue-600 px-4 py-3 text-left font-black text-white">{tr.copyPromoTemplate}</button>
                            <button onClick={() => { setOpenProductMenu(""); submit(p.id) }} className="rounded-2xl bg-green-700 px-4 py-3 text-left font-black text-white">{tr.submitReview}</button>
                            <button onClick={() => { setOpenProductMenu(""); toggleHidden(p) }} className="rounded-2xl bg-slate-100 px-4 py-3 text-left font-black">{p.is_hidden ? tr.restoreShow : tr.hide}</button>
                            <button onClick={() => { setOpenProductMenu(""); archiveProduct(p) }} className="rounded-2xl bg-red-50 px-4 py-3 text-left font-black text-red-700">{tr.deleteProduct}</button>
                          </div>
                        ) : null}
                      </div>

                      <div className="mt-3 hidden gap-2 md:grid md:grid-cols-3 xl:grid-cols-4">
                        <button onClick={() => startEdit(p.id)} className="rounded-full border px-4 py-2 font-black transition hover:bg-slate-50 active:scale-[.98]">{tr.editFunnel}</button>
                        <a href={openHref} target="_blank" className="rounded-full bg-blue-50 px-4 py-2 text-center font-black text-blue-700 transition hover:bg-blue-100 active:scale-[.98]">{tr.openFunnel}</a>
                        <button onClick={async () => setMsg(await copyText(productUrl(p.slug)) ? tr.copiedFunnel : productUrl(p.slug))} className="rounded-full bg-slate-100 px-4 py-2 font-black transition hover:bg-slate-200 active:scale-[.98]">{tr.copyFunnel}</button>
                        <button onClick={async () => setMsg(await copyText(promoterUrl(p.slug)) ? tr.copiedPromoter : promoterUrl(p.slug))} className="rounded-full bg-blue-600 px-4 py-2 font-black text-white transition hover:bg-blue-700 active:scale-[.98]">{tr.copyPromoTemplate}</button>
                        <button onClick={() => submit(p.id)} className="rounded-full bg-green-700 px-4 py-2 font-black text-white transition hover:bg-green-800 active:scale-[.98]">{tr.submitReview}</button>
                        <button onClick={() => toggleHidden(p)} className="rounded-full bg-slate-100 px-4 py-2 font-black transition hover:bg-slate-200 active:scale-[.98]">{p.is_hidden ? tr.restoreShow : tr.hide}</button>
                        <button onClick={() => archiveProduct(p)} className="rounded-full bg-red-50 px-4 py-2 font-black text-red-700 transition hover:bg-red-100 active:scale-[.98]">{tr.deleteProduct}</button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            {!products.length ? <div className="rounded-3xl bg-slate-50 p-8 text-center font-bold text-slate-500">{tr.noProductsYet}</div> : null}
          </div>
        </section>
      </div>
    </main>
  )
}
