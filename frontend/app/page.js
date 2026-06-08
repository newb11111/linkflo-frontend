'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../lib/i18n'

const homeCopy = {
  zh: {
    navProduct: '产品', navFlow: '流程', navPricing: '配套', navFaq: 'FAQ', popularTag: '最多人选',
    homeStart: '开始使用', homeLogin: '登录后台', homeBadge: 'AI Funnel + Promoter Link + WhatsApp Tracking',
    homeHeadline: '把每个产品，变成一套可以复制的成交系统',
    homeLead: 'LinkFlo 帮商家快速生成专业成交页，给每位 Promoter 专属链接，并追踪 Link Click 与 WhatsApp Click。你不只是做一个页面，而是在建立一支可管理、可复制、可放大的推广团队。',
    homeCta: '注册 / 登录 Merchant', homePricing: '查看配套', watchDemo: '看系统怎样跑',
    heroNote: '适合：产品商家、服务业、代理团队、线下门店、TikTok / 小红书导流',
    metricFunnel: 'AI 成交页', metricLinks: 'Promoter Links', metricClicks: '点击追踪',
    dashboardTitle: 'Merchant Dashboard Preview', dashboardSubtitle: '一眼看懂谁有带流量、哪个 SKU 有人点击。', dashboardChip1: '今日 WhatsApp Click', dashboardChip2: 'Promoter 排名', dashboardChip3: 'SKU Funnel',
    rankTitle: 'Promoter Performance', rank1: 'Ah Ming', rank2: 'Jessy', rank3: 'Daniel',
    funnelCardTitle: '美容产品成交页', funnelCardText: 'Hero、痛点、解决方案、证明、Offer、FAQ、CTA 自动整理成更容易成交的顺序。',
    logoStrip: '一个系统，帮你连接商家、产品、Promoter 与 WhatsApp 咨询',
    problemKicker: '为什么不是普通网站？', problemTitle: '普通网站只是展示，LinkFlo 是为了让团队更容易卖',
    problemLead: '很多商家不是没有产品，而是 Promoter 不会讲、链接没有归属、点击没有数据、老板不知道谁真的有推广。LinkFlo 把这些流程系统化。',
    problem1Title: 'Promoter 不用自己想文案', problem1Text: '每个 SKU 都有成交页，重点、证明、FAQ 和 CTA 都放好。新手复制链接就能开始推广。',
    problem2Title: '每个人都有专属链接', problem2Text: '顾客从谁的链接进来，WhatsApp CTA 就导去对应 Promoter，方便商家分配与追踪。',
    problem3Title: '老板看得到真实动作', problem3Text: '系统记录 Link Click 和 WhatsApp Click，不只是看感觉，而是看谁真的带来咨询。',
    flowKicker: '使用流程', flowTitle: '从一个 SKU，到一组 Promoter 团队',
    step1Title: '上传产品资料', step1Text: '商家输入产品卖点、目标顾客、痛点、证明和 offer。',
    step2Title: '生成成交 Funnel', step2Text: 'AI 整理成 Hero、Problem、Solution、Trust、Offer、FAQ 和 CTA。',
    step3Title: '创建 Promoter Link', step3Text: '每个 Promoter 拿到自己的推广链接，顾客点击后直接 WhatsApp。',
    step4Title: '查看点击与排名', step4Text: 'Merchant 后台追踪 link click、WhatsApp click 和 promoter 表现。',
    productKicker: '核心功能', productTitle: '首页、后台、Promoter 页面都围绕成交而设计',
    featureFunnel: 'AI Funnel Builder', featureFunnelText: '把零散卖点整理成专业成交页。Hero 满屏、视频、图集、长文介绍、FAQ 和 CTA 都能放。',
    featurePromoterLink: 'Promoter 专属链接', featurePromoterText: 'Promoter 属于 Merchant，可以看到该商家的所有产品并复制自己的推广链接。',
    featureTracking: 'WhatsApp Click Tracking', featureTrackingText: '记录页面点击与 WhatsApp 点击，让商家知道谁有带流量，不再凭感觉管理团队。',
    featureCredit: 'Credit + 配套扣费', featureCreditText: 'Merchant 充值 credit 后购买配套或使用 AI generate，后台会先弹窗确认才扣费。',
    featureTranslate: '三语页面', featureTranslateText: '中文、English、BM 切换，适合马来西亚商家和多语言团队使用。',
    featureMobile: '手机优先', featureMobileText: '顾客多数从手机点链接进来，所以 Funnel、Promoter Dashboard 和 Merchant 操作都更适合手机。',
    previewKicker: '系统预览', previewTitle: '让商家感觉这是一个完整平台，不是空空的 landing page',
    previewLead: '新版首页会先教育顾客 LinkFlo 的价值，再引导他们去注册、充值 credit、创建 SKU、创建 Promoter。',
    merchantBoxTitle: 'Merchant 可以管理', promoterBoxTitle: 'Promoter 可以复制', publicBoxTitle: '顾客看到的是',
    merchantBox1: 'SKU / Product Funnel', merchantBox2: 'Promoter 名单与点击', merchantBox3: 'Credit 与配套升级',
    promoterBox1: '自己的产品链接', promoterBox2: '自己的点击表现', promoterBox3: '一键复制分享',
    publicBox1: '专业成交页', publicBox2: '视频 / 图片 / FAQ', publicBox3: '直接 WhatsApp 对应 Promoter',
    pricing: '配套', pricingNote: '全部默认 1 个 SKU；增加 SKU：一次性 +RM100 / SKU。点击配套后会先弹窗解释流程：注册 / 登录 → 充值 credit → 确认扣 credit → 配套马上生效。',
    choosePlan: '选择这个配套', starterDesc: '适合刚开始让新手 promoter 跟着 SOP 推广的商家。', growthDesc: '适合已经开始招 promoter，需要追踪表现和排名的团队。', scaleDesc: '适合有大量 promoter，要更系统化复制成交流程的商家。',
    skuIncluded: '默认 1 个 SKU', extraSku: '额外 SKU：RM100 / SKU 一次性',
    faqTitle: '常见问题', faq1Q: 'LinkFlo 是 marketplace 吗？', faq1A: '不是。LinkFlo 不处理顾客 checkout，而是帮商家建立成交页、Promoter 链接和 WhatsApp 导流追踪。',
    faq2Q: 'Promoter 可以自己注册吗？', faq2A: '目前由 Merchant 在后台创建 Promoter，避免乱注册，也方便商家管理团队。',
    faq3Q: '顾客点击后钱在哪里交易？', faq3A: '顾客会直接 WhatsApp 对应 Promoter 或商家，成交与付款可以在你原本的 WhatsApp / 线下流程完成。',
    faq4Q: 'AI Generate 会不会直接扣钱？', faq4A: '会先在后台提示，每次 AI Generate 扣 0.1 credit；购买配套也会先弹窗确认。',
    finalCtaTitle: '准备把你的产品变成可复制的推广系统？', finalCtaText: '先注册 Merchant，进入后台充值 credit，再开始创建第一个 SKU Funnel 和 Promoter Link。',
    buyConfirm: '购买前确认', selectedPlan: '你选择了 {plan} 配套', planModalText: '系统不会在首页直接扣钱。正确流程是先注册或登录 Merchant 后台，然后充值 credit。credit 足够时，后台会再弹窗让你确认，确认后才扣 credit 并马上切换配套。', stepRegister: '1. 注册 / 登录 Merchant', stepTopup: '2. Billplz 充值 credit', stepConfirm: '3. 确认扣 credit 购买配套', newUserTopup: '新用户注册并充值', existingLogin: '已有账号登录'
  },
  en: {
    navProduct: 'Product', navFlow: 'Flow', navPricing: 'Pricing', navFaq: 'FAQ', popularTag: 'Most picked',
    homeStart: 'Start', homeLogin: 'Login', homeBadge: 'AI Funnel + Promoter Link + WhatsApp Tracking',
    homeHeadline: 'Turn every product into a repeatable selling system',
    homeLead: 'LinkFlo helps merchants create professional funnel pages, assign dedicated links to promoters, and track Link Clicks plus WhatsApp Clicks. It is not just one page — it is a controllable promoter system.',
    homeCta: 'Register / Login Merchant', homePricing: 'View pricing', watchDemo: 'See how it works',
    heroNote: 'For product brands, service businesses, agent teams, shops, TikTok and social traffic',
    metricFunnel: 'AI funnel pages', metricLinks: 'Promoter links', metricClicks: 'Click tracking',
    dashboardTitle: 'Merchant Dashboard Preview', dashboardSubtitle: 'Know who drives traffic and which SKU gets attention.', dashboardChip1: 'Today WhatsApp Clicks', dashboardChip2: 'Promoter ranking', dashboardChip3: 'SKU Funnel',
    rankTitle: 'Promoter Performance', rank1: 'Ah Ming', rank2: 'Jessy', rank3: 'Daniel',
    funnelCardTitle: 'Beauty product funnel', funnelCardText: 'Hero, pain points, solution, proof, offer, FAQ and CTA are arranged in a conversion-friendly flow.',
    logoStrip: 'One system connecting merchants, products, promoters and WhatsApp inquiries',
    problemKicker: 'Why not a normal website?', problemTitle: 'A normal website displays. LinkFlo helps a team sell.',
    problemLead: 'Many merchants do not lack products. They lack a clear way for promoters to explain, share, track and report performance. LinkFlo turns that process into a system.',
    problem1Title: 'Promoters do not start from zero', problem1Text: 'Every SKU has a funnel page with key points, proof, FAQ and CTA. New promoters can share immediately.',
    problem2Title: 'Every promoter has a link', problem2Text: 'When customers enter from a promoter link, the WhatsApp CTA goes to that promoter for easier ownership and tracking.',
    problem3Title: 'Merchants see real actions', problem3Text: 'Track Link Clicks and WhatsApp Clicks so decisions are based on activity, not guesses.',
    flowKicker: 'Workflow', flowTitle: 'From one SKU to a promoter team',
    step1Title: 'Upload product details', step1Text: 'Enter selling points, target customers, pain points, proof and offer.',
    step2Title: 'Generate a funnel', step2Text: 'AI organizes it into Hero, Problem, Solution, Trust, Offer, FAQ and CTA.',
    step3Title: 'Create promoter links', step3Text: 'Each promoter gets a dedicated link. Customers click and go to WhatsApp.',
    step4Title: 'Track clicks and ranking', step4Text: 'Merchant dashboard tracks link clicks, WhatsApp clicks and promoter performance.',
    productKicker: 'Core features', productTitle: 'Home, dashboard and promoter pages are built around conversion',
    featureFunnel: 'AI Funnel Builder', featureFunnelText: 'Turn scattered selling points into a professional funnel with hero, video, gallery, long copy, FAQ and CTA.',
    featurePromoterLink: 'Promoter dedicated links', featurePromoterText: 'Promoters belong to a merchant and can access that merchant’s products and their own links.',
    featureTracking: 'WhatsApp Click Tracking', featureTrackingText: 'Record page clicks and WhatsApp clicks so merchants know who is actually bringing traffic.',
    featureCredit: 'Credit + plan billing', featureCreditText: 'Merchants top up credit to buy plans or use AI generate. Confirmation appears before credit is deducted.',
    featureTranslate: 'Three languages', featureTranslateText: 'Chinese, English and BM switching for Malaysian merchants and multilingual teams.',
    featureMobile: 'Mobile-first', featureMobileText: 'Most customers enter from mobile, so funnels, promoter dashboard and merchant flows are optimized for phones.',
    previewKicker: 'System preview', previewTitle: 'Make LinkFlo feel like a complete platform, not an empty landing page',
    previewLead: 'The new homepage explains the value first, then guides merchants to register, top up credit, create SKUs and create promoters.',
    merchantBoxTitle: 'Merchant manages', promoterBoxTitle: 'Promoter copies', publicBoxTitle: 'Customer sees',
    merchantBox1: 'SKU / Product Funnel', merchantBox2: 'Promoters and clicks', merchantBox3: 'Credit and plan upgrade',
    promoterBox1: 'Own product links', promoterBox2: 'Own click data', promoterBox3: 'One-click copy',
    publicBox1: 'Professional funnel page', publicBox2: 'Video / gallery / FAQ', publicBox3: 'WhatsApp to the right promoter',
    pricing: 'Pricing', pricingNote: 'All plans include 1 SKU by default; extra SKU is a one-time +RM100 / SKU. After choosing a plan, a popup explains: register / login → top up credit → confirm credit deduction → plan activates immediately.',
    choosePlan: 'Choose this plan', starterDesc: 'For merchants starting with new promoters using a clear SOP.', growthDesc: 'For teams already recruiting promoters and needing tracking and ranking.', scaleDesc: 'For larger promoter teams that need a more systematic selling flow.',
    skuIncluded: '1 SKU included', extraSku: 'Extra SKU: one-time RM100 / SKU',
    faqTitle: 'FAQ', faq1Q: 'Is LinkFlo a marketplace?', faq1A: 'No. LinkFlo does not handle customer checkout. It helps merchants create funnel pages, promoter links and WhatsApp tracking.',
    faq2Q: 'Can promoters register by themselves?', faq2A: 'For now, merchants create promoters in the dashboard to keep the team controlled and clean.',
    faq3Q: 'Where does the customer pay?', faq3A: 'Customers go to the right promoter or merchant on WhatsApp. The actual sale can happen in your existing WhatsApp or offline process.',
    faq4Q: 'Will AI Generate deduct credit directly?', faq4A: 'The dashboard shows a notice first. Each AI Generate costs 0.1 credit, and plan purchases require confirmation too.',
    finalCtaTitle: 'Ready to turn your product into a repeatable promoter system?', finalCtaText: 'Register as a Merchant, top up credit, then create your first SKU Funnel and Promoter Link.',
    buyConfirm: 'Confirm before purchase', selectedPlan: 'You selected the {plan} plan', planModalText: 'The homepage will not charge directly. Register or login to the Merchant dashboard first, then top up credit. When credit is enough, the dashboard asks for confirmation before activating the plan.', stepRegister: '1. Register / Login Merchant', stepTopup: '2. Top up credit with Billplz', stepConfirm: '3. Confirm credit deduction to buy plan', newUserTopup: 'New user: register and top up', existingLogin: 'Existing user login'
  },
  bm: {
    navProduct: 'Produk', navFlow: 'Flow', navPricing: 'Pakej', navFaq: 'FAQ', popularTag: 'Paling dipilih',
    homeStart: 'Mula', homeLogin: 'Log masuk', homeBadge: 'AI Funnel + Promoter Link + WhatsApp Tracking',
    homeHeadline: 'Tukar setiap produk menjadi sistem jualan yang boleh diulang',
    homeLead: 'LinkFlo membantu merchant bina funnel page profesional, beri link khas kepada setiap promoter, dan track Link Click serta WhatsApp Click. Ini bukan sekadar satu page — ini sistem promoter yang boleh dikawal dan dibesarkan.',
    homeCta: 'Daftar / Login Merchant', homePricing: 'Lihat pakej', watchDemo: 'Lihat cara sistem jalan',
    heroNote: 'Sesuai untuk brand produk, servis, team agent, kedai offline, TikTok dan traffic social media',
    metricFunnel: 'AI funnel page', metricLinks: 'Promoter links', metricClicks: 'Click tracking',
    dashboardTitle: 'Preview Merchant Dashboard', dashboardSubtitle: 'Tahu siapa bawa traffic dan SKU mana yang ada perhatian.', dashboardChip1: 'WhatsApp Click hari ini', dashboardChip2: 'Ranking promoter', dashboardChip3: 'SKU Funnel',
    rankTitle: 'Prestasi Promoter', rank1: 'Ah Ming', rank2: 'Jessy', rank3: 'Daniel',
    funnelCardTitle: 'Funnel produk beauty', funnelCardText: 'Hero, pain point, solution, proof, offer, FAQ dan CTA disusun dalam flow yang lebih mudah convert.',
    logoStrip: 'Satu sistem untuk hubungkan merchant, produk, promoter dan inquiry WhatsApp',
    problemKicker: 'Kenapa bukan website biasa?', problemTitle: 'Website biasa hanya display. LinkFlo bantu team menjual.',
    problemLead: 'Ramai merchant bukan tiada produk. Masalahnya promoter tidak tahu cara explain, link tiada ownership, click tiada data, dan boss tidak tahu siapa benar-benar promote. LinkFlo jadikan proses ini sistematik.',
    problem1Title: 'Promoter tidak mula dari kosong', problem1Text: 'Setiap SKU ada funnel page dengan point utama, bukti, FAQ dan CTA. Promoter baru boleh terus share.',
    problem2Title: 'Setiap promoter ada link', problem2Text: 'Bila pelanggan masuk dari link promoter, WhatsApp CTA akan pergi kepada promoter tersebut untuk tracking lebih jelas.',
    problem3Title: 'Merchant nampak tindakan sebenar', problem3Text: 'Track Link Click dan WhatsApp Click supaya keputusan dibuat berdasarkan aktiviti, bukan rasa-rasa.',
    flowKicker: 'Cara guna', flowTitle: 'Dari satu SKU ke satu team promoter',
    step1Title: 'Upload info produk', step1Text: 'Isi selling point, target customer, pain point, proof dan offer.',
    step2Title: 'Generate funnel', step2Text: 'AI susun kepada Hero, Problem, Solution, Trust, Offer, FAQ dan CTA.',
    step3Title: 'Cipta promoter link', step3Text: 'Setiap promoter dapat link sendiri. Pelanggan click dan terus ke WhatsApp.',
    step4Title: 'Track click dan ranking', step4Text: 'Dashboard merchant track link click, WhatsApp click dan prestasi promoter.',
    productKicker: 'Fungsi utama', productTitle: 'Home, dashboard dan promoter page dibina untuk conversion',
    featureFunnel: 'AI Funnel Builder', featureFunnelText: 'Tukar selling point yang berselerak kepada funnel profesional dengan hero, video, gallery, copy panjang, FAQ dan CTA.',
    featurePromoterLink: 'Link khas promoter', featurePromoterText: 'Promoter milik merchant dan boleh akses produk merchant tersebut serta link sendiri.',
    featureTracking: 'WhatsApp Click Tracking', featureTrackingText: 'Rekod page click dan WhatsApp click supaya merchant tahu siapa benar-benar bawa traffic.',
    featureCredit: 'Credit + pakej', featureCreditText: 'Merchant top up credit untuk beli pakej atau guna AI generate. Pengesahan akan muncul sebelum credit dipotong.',
    featureTranslate: 'Tiga bahasa', featureTranslateText: 'Tukar Chinese, English dan BM untuk merchant Malaysia dan team pelbagai bahasa.',
    featureMobile: 'Mobile-first', featureMobileText: 'Kebanyakan pelanggan masuk dari telefon, jadi funnel, promoter dashboard dan flow merchant lebih sesuai untuk mobile.',
    previewKicker: 'Preview sistem', previewTitle: 'Jadikan LinkFlo nampak seperti platform penuh, bukan landing page kosong',
    previewLead: 'Homepage baru akan explain value dahulu, kemudian bawa merchant daftar, top up credit, cipta SKU dan cipta promoter.',
    merchantBoxTitle: 'Merchant urus', promoterBoxTitle: 'Promoter salin', publicBoxTitle: 'Pelanggan nampak',
    merchantBox1: 'SKU / Product Funnel', merchantBox2: 'Promoter dan click', merchantBox3: 'Credit dan upgrade pakej',
    promoterBox1: 'Link produk sendiri', promoterBox2: 'Data click sendiri', promoterBox3: 'One-click copy',
    publicBox1: 'Funnel page profesional', publicBox2: 'Video / gallery / FAQ', publicBox3: 'WhatsApp kepada promoter betul',
    pricing: 'Pakej', pricingNote: 'Semua pakej default 1 SKU; tambahan SKU: sekali bayar +RM100 / SKU. Selepas pilih pakej, popup akan terangkan: daftar / login → top up credit → sahkan potong credit → pakej aktif terus.',
    choosePlan: 'Pilih pakej ini', starterDesc: 'Sesuai untuk merchant yang baru mula gunakan promoter dengan SOP jelas.', growthDesc: 'Sesuai untuk team yang sudah mula rekrut promoter dan perlu tracking serta ranking.', scaleDesc: 'Sesuai untuk team promoter besar yang perlukan flow jualan lebih sistematik.',
    skuIncluded: 'Termasuk 1 SKU', extraSku: 'SKU tambahan: RM100 / SKU sekali bayar',
    faqTitle: 'FAQ', faq1Q: 'Adakah LinkFlo marketplace?', faq1A: 'Bukan. LinkFlo tidak urus checkout pelanggan. Ia bantu merchant bina funnel page, promoter link dan WhatsApp tracking.',
    faq2Q: 'Promoter boleh daftar sendiri?', faq2A: 'Buat masa ini merchant cipta promoter dalam dashboard supaya team lebih terkawal dan bersih.',
    faq3Q: 'Pelanggan bayar di mana?', faq3A: 'Pelanggan terus WhatsApp promoter atau merchant yang betul. Closing boleh berlaku dalam flow WhatsApp atau offline anda.',
    faq4Q: 'AI Generate terus potong credit?', faq4A: 'Dashboard akan tunjuk notice dahulu. Setiap AI Generate caj 0.1 credit, pembelian pakej juga perlu confirm dahulu.',
    finalCtaTitle: 'Sedia tukar produk anda menjadi sistem promoter yang boleh diulang?', finalCtaText: 'Daftar sebagai Merchant, top up credit, kemudian cipta SKU Funnel dan Promoter Link pertama anda.',
    buyConfirm: 'Sahkan sebelum beli', selectedPlan: 'Anda pilih pakej {plan}', planModalText: 'Homepage tidak akan caj terus. Daftar atau login ke dashboard Merchant dahulu, kemudian top up credit. Bila credit cukup, dashboard akan minta pengesahan sebelum aktifkan pakej.', stepRegister: '1. Daftar / Login Merchant', stepTopup: '2. Top up credit melalui Billplz', stepConfirm: '3. Sahkan potong credit untuk beli pakej', newUserTopup: 'Pengguna baru: daftar dan top up', existingLogin: 'Login akaun sedia ada'
  }
}

function resolveCopy(lang, tr) {
  const dict = homeCopy[lang] || homeCopy.zh
  return (key, vars = {}) => {
    const raw = dict[key] || homeCopy.zh[key] || tr(key, vars)
    return Object.entries(vars).reduce((text, [k, v]) => text.replaceAll(`{${k}}`, String(v ?? '')), raw)
  }
}

export default function Home() {
  const [selectedPlan, setSelectedPlan] = useState(null)
  const { lang, tr } = useLanguage()
  const tx = useMemo(() => resolveCopy(lang, tr), [lang, tr])
  const plans = useMemo(() => ([
    { code: 'STARTER', name: 'Starter', price: 'RM29/mo', links: '10 promoter links', desc: tx('starterDesc'), popular: false },
    { code: 'GROWTH', name: 'Growth', price: 'RM139/mo', links: '50 promoter links', desc: tx('growthDesc'), popular: true },
    { code: 'SCALE', name: 'Scale', price: 'RM259/mo', links: '100 promoter links', desc: tx('scaleDesc'), popular: false }
  ]), [tx])

  const features = [
    ['01', tx('featureFunnel'), tx('featureFunnelText')],
    ['02', tx('featurePromoterLink'), tx('featurePromoterText')],
    ['03', tx('featureTracking'), tx('featureTrackingText')],
    ['04', tx('featureCredit'), tx('featureCreditText')],
    ['05', tx('featureTranslate'), tx('featureTranslateText')],
    ['06', tx('featureMobile'), tx('featureMobileText')]
  ]

  const stepsData = [
    [tx('step1Title'), tx('step1Text')],
    [tx('step2Title'), tx('step2Text')],
    [tx('step3Title'), tx('step3Text')],
    [tx('step4Title'), tx('step4Text')]
  ]

  const faqs = [
    [tx('faq1Q'), tx('faq1A')],
    [tx('faq2Q'), tx('faq2A')],
    [tx('faq3Q'), tx('faq3A')],
    [tx('faq4Q'), tx('faq4A')]
  ]

  return (
    <main className="lf-home">
      <HomeStyles />
      <nav className="lf-nav">
        <a href="#top" className="lf-brand" aria-label="LinkFlo home"><span>LF</span><b>LinkFlo</b></a>
        <div className="lf-nav-links">
          <a href="#product">{tx('navProduct')}</a>
          <a href="#flow">{tx('navFlow')}</a>
          <a href="#pricing">{tx('navPricing')}</a>
          <a href="#faq">{tx('navFaq')}</a>
        </div>
        <div className="lf-nav-actions">
          <LanguageToggle compact />
          <Link href="/login" className="lf-btn lf-btn-ghost">{tx('homeLogin')}</Link>
          <button onClick={() => setSelectedPlan(plans[1])} className="lf-btn lf-btn-primary">{tx('homeStart')}</button>
        </div>
      </nav>

      <section id="top" className="lf-hero lf-shell">
        <div className="lf-hero-copy">
          <div className="lf-pill">{tx('homeBadge')}</div>
          <h1>{tx('homeHeadline')}</h1>
          <p className="lf-lead">{tx('homeLead')}</p>
          <div className="lf-cta-row">
            <Link href="/login?mode=register" className="lf-btn lf-btn-primary lf-btn-big">{tx('homeCta')}</Link>
            <a href="#flow" className="lf-btn lf-btn-ghost lf-btn-big">{tx('watchDemo')}</a>
            <a href="#pricing" className="lf-btn lf-btn-soft lf-btn-big">{tx('homePricing')}</a>
          </div>
          <p className="lf-hero-note">{tx('heroNote')}</p>
          <div className="lf-hero-metrics">
            <Metric value="3x" label={tx('metricFunnel')} />
            <Metric value="100" label={tx('metricLinks')} />
            <Metric value="24/7" label={tx('metricClicks')} />
          </div>
        </div>
        <DashboardMockup tx={tx} />
      </section>

      <section className="lf-strip">
        <div>{tx('logoStrip')}</div>
      </section>

      <section className="lf-section lf-shell lf-problem">
        <div className="lf-section-head">
          <span>{tx('problemKicker')}</span>
          <h2>{tx('problemTitle')}</h2>
          <p>{tx('problemLead')}</p>
        </div>
        <div className="lf-three-grid">
          <InfoCard number="01" title={tx('problem1Title')} text={tx('problem1Text')} />
          <InfoCard number="02" title={tx('problem2Title')} text={tx('problem2Text')} />
          <InfoCard number="03" title={tx('problem3Title')} text={tx('problem3Text')} />
        </div>
      </section>

      <section id="flow" className="lf-section lf-shell">
        <div className="lf-section-head lf-centered">
          <span>{tx('flowKicker')}</span>
          <h2>{tx('flowTitle')}</h2>
        </div>
        <div className="lf-flow">
          {stepsData.map((item, index) => <FlowStep key={item[0]} index={index + 1} title={item[0]} text={item[1]} />)}
        </div>
      </section>

      <section id="product" className="lf-section lf-shell">
        <div className="lf-section-head">
          <span>{tx('productKicker')}</span>
          <h2>{tx('productTitle')}</h2>
        </div>
        <div className="lf-feature-grid">
          {features.map(([num, title, text]) => <FeatureCard key={num} number={num} title={title} text={text} />)}
        </div>
      </section>

      <section className="lf-section lf-shell lf-preview-section">
        <div className="lf-preview-copy">
          <span>{tx('previewKicker')}</span>
          <h2>{tx('previewTitle')}</h2>
          <p>{tx('previewLead')}</p>
        </div>
        <div className="lf-preview-grid">
          <MiniPanel title={tx('merchantBoxTitle')} items={[tx('merchantBox1'), tx('merchantBox2'), tx('merchantBox3')]} />
          <MiniPanel title={tx('promoterBoxTitle')} items={[tx('promoterBox1'), tx('promoterBox2'), tx('promoterBox3')]} />
          <MiniPanel title={tx('publicBoxTitle')} items={[tx('publicBox1'), tx('publicBox2'), tx('publicBox3')]} />
        </div>
      </section>

      <section id="pricing" className="lf-section lf-shell">
        <div className="lf-section-head lf-centered">
          <span>{tx('navPricing')}</span>
          <h2>{tx('pricing')}</h2>
          <p>{tx('pricingNote')}</p>
        </div>
        <div className="lf-pricing-grid">
          {plans.map((p) => (
            <div key={p.name} className={`lf-price-card ${p.popular ? 'is-popular' : ''}`}>
              {p.popular && <div className="lf-popular">{tx('popularTag')}</div>}
              <h3>{p.name}</h3>
              <div className="lf-price">{p.price}</div>
              <b>{p.links}</b>
              <p>{p.desc}</p>
              <ul>
                <li>{tx('skuIncluded')}</li>
                <li>{tx('extraSku')}</li>
              </ul>
              <button onClick={() => setSelectedPlan(p)} className="lf-btn lf-btn-primary lf-btn-full">{tx('choosePlan')}</button>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="lf-section lf-shell lf-faq-section">
        <div className="lf-section-head">
          <span>FAQ</span>
          <h2>{tx('faqTitle')}</h2>
        </div>
        <div className="lf-faq-grid">
          {faqs.map(([q, a]) => <div key={q} className="lf-faq-card"><h3>{q}</h3><p>{a}</p></div>)}
        </div>
      </section>

      <section className="lf-final-cta lf-shell">
        <div>
          <h2>{tx('finalCtaTitle')}</h2>
          <p>{tx('finalCtaText')}</p>
        </div>
        <div className="lf-final-actions">
          <Link href="/login?mode=register" className="lf-btn lf-btn-primary lf-btn-big">{tx('homeCta')}</Link>
          <Link href="/login" className="lf-btn lf-btn-ghost lf-btn-big">{tx('homeLogin')}</Link>
        </div>
      </section>

      {selectedPlan && <PlanModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} tx={tx} />}
    </main>
  )
}

function Metric({ value, label }) {
  return <div className="lf-metric"><b>{value}</b><span>{label}</span></div>
}

function DashboardMockup({ tx }) {
  return (
    <div className="lf-mockup" aria-label="LinkFlo dashboard preview">
      <div className="lf-mockup-top"><span></span><span></span><span></span></div>
      <div className="lf-mockup-header">
        <div>
          <small>LINKFLO</small>
          <h3>{tx('dashboardTitle')}</h3>
          <p>{tx('dashboardSubtitle')}</p>
        </div>
        <div className="lf-live-dot">Live</div>
      </div>
      <div className="lf-chip-row">
        <div><b>128</b><span>{tx('dashboardChip1')}</span></div>
        <div><b>26</b><span>{tx('dashboardChip2')}</span></div>
        <div><b>8</b><span>{tx('dashboardChip3')}</span></div>
      </div>
      <div className="lf-mockup-body">
        <div className="lf-rank-card">
          <h4>{tx('rankTitle')}</h4>
          <RankItem name={tx('rank1')} value="48 WA" width="88%" />
          <RankItem name={tx('rank2')} value="31 WA" width="62%" />
          <RankItem name={tx('rank3')} value="19 WA" width="42%" />
        </div>
        <div className="lf-funnel-card">
          <div className="lf-funnel-visual"></div>
          <h4>{tx('funnelCardTitle')}</h4>
          <p>{tx('funnelCardText')}</p>
          <div className="lf-wa-button">WhatsApp CTA</div>
        </div>
      </div>
    </div>
  )
}

function RankItem({ name, value, width }) {
  return (
    <div className="lf-rank-item">
      <div><b>{name}</b><span>{value}</span></div>
      <div className="lf-bar"><i style={{ width }}></i></div>
    </div>
  )
}

function InfoCard({ number, title, text }) {
  return <div className="lf-info-card"><span>{number}</span><h3>{title}</h3><p>{text}</p></div>
}

function FlowStep({ index, title, text }) {
  return <div className="lf-flow-step"><div>{String(index).padStart(2, '0')}</div><h3>{title}</h3><p>{text}</p></div>
}

function FeatureCard({ number, title, text }) {
  return <div className="lf-feature-card"><span>{number}</span><h3>{title}</h3><p>{text}</p></div>
}

function MiniPanel({ title, items }) {
  return <div className="lf-mini-panel"><h3>{title}</h3>{items.map(item => <div key={item} className="lf-mini-row"><span>✓</span>{item}</div>)}</div>
}

function PlanModal({ plan, onClose, tx }) {
  return <div className="lf-modal-backdrop" onClick={onClose}>
    <div className="lf-modal" onClick={e => e.stopPropagation()}>
      <button onClick={onClose} className="lf-close-btn">×</button>
      <div className="lf-pill">{tx('buyConfirm')}</div>
      <h2>{tx('selectedPlan', { plan: plan.name })}</h2>
      <p>{tx('planModalText')}</p>
      <div className="lf-modal-steps">
        <b>{tx('stepRegister')}</b>
        <b>{tx('stepTopup')}</b>
        <b>{tx('stepConfirm')}</b>
      </div>
      <div className="lf-modal-actions">
        <Link href={`/login?mode=register&plan=${plan.code}`} className="lf-btn lf-btn-primary lf-btn-big">{tx('newUserTopup')}</Link>
        <Link href={`/login?mode=merchant&plan=${plan.code}`} className="lf-btn lf-btn-ghost lf-btn-big">{tx('existingLogin')}</Link>
      </div>
    </div>
  </div>
}

function HomeStyles() {
  return <style jsx global>{`
    :root{--lf-blue:#0b5cff;--lf-dark:#07111f;--lf-text:#0f172a;--lf-muted:#64748b;--lf-soft:#eef5ff;--lf-line:#dbe7ff;--lf-card:#ffffff;}
    html{scroll-behavior:smooth}.lf-home{min-height:100vh;background:radial-gradient(circle at top left,#e9f2ff 0,#f8fbff 34%,#ffffff 72%);color:var(--lf-text);font-family:Arial,'Helvetica Neue',sans-serif;overflow:hidden}.lf-home *{box-sizing:border-box}.lf-shell{max-width:1180px;margin:0 auto;padding-left:28px;padding-right:28px}.lf-nav{position:sticky;top:0;z-index:30;max-width:1180px;margin:0 auto;padding:16px 28px;display:flex;align-items:center;justify-content:space-between;gap:16px;background:rgba(248,251,255,.82);backdrop-filter:blur(18px);border-bottom:1px solid rgba(219,231,255,.7)}.lf-brand{display:flex;align-items:center;gap:10px;color:var(--lf-text);text-decoration:none}.lf-brand span{width:36px;height:36px;border-radius:12px;background:linear-gradient(135deg,var(--lf-blue),#38bdf8);color:white;display:grid;place-items:center;font-weight:900;box-shadow:0 12px 30px rgba(11,92,255,.26)}.lf-brand b{font-size:22px;letter-spacing:-.6px}.lf-nav-links{display:flex;align-items:center;gap:22px}.lf-nav-links a{color:#334155;text-decoration:none;font-weight:800;font-size:14px}.lf-nav-actions{display:flex;align-items:center;gap:10px}.lf-btn{border:0;border-radius:999px;padding:11px 16px;font-weight:900;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;line-height:1;cursor:pointer;white-space:nowrap;transition:transform .18s ease,box-shadow .18s ease}.lf-btn:hover{transform:translateY(-1px)}.lf-btn-primary{background:linear-gradient(135deg,var(--lf-blue),#2563eb);color:white;box-shadow:0 14px 30px rgba(11,92,255,.22)}.lf-btn-ghost{background:white;color:var(--lf-text);border:1px solid var(--lf-line);box-shadow:0 10px 24px rgba(15,23,42,.06)}.lf-btn-soft{background:#eaf2ff;color:#0b5cff;border:1px solid #cfe1ff}.lf-btn-big{padding:15px 22px}.lf-btn-full{width:100%;margin-top:18px}.lf-pill{display:inline-flex;align-items:center;gap:8px;padding:9px 13px;border-radius:999px;background:#e8f0ff;color:#0758e7;font-weight:900;font-size:13px;border:1px solid #d7e6ff}.lf-hero{display:grid;grid-template-columns:1.02fr .98fr;align-items:center;gap:42px;padding-top:72px;padding-bottom:54px;position:relative}.lf-hero:before{content:'';position:absolute;right:-220px;top:20px;width:520px;height:520px;background:radial-gradient(circle,#bcd9ff 0,rgba(188,217,255,0) 68%);z-index:0}.lf-hero-copy,.lf-mockup{position:relative;z-index:1}.lf-hero h1{font-size:clamp(44px,6.4vw,74px);line-height:.98;letter-spacing:-3.2px;margin:20px 0 18px;max-width:760px}.lf-lead{font-size:19px;line-height:1.78;color:#43546b;max-width:720px}.lf-cta-row{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}.lf-hero-note{margin-top:18px;color:#64748b;line-height:1.7;font-weight:700}.lf-hero-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:24px;max-width:640px}.lf-metric{background:rgba(255,255,255,.74);border:1px solid #e2ecff;border-radius:22px;padding:16px;box-shadow:0 12px 35px rgba(15,23,42,.06)}.lf-metric b{display:block;font-size:28px;color:#0b5cff}.lf-metric span{display:block;margin-top:4px;color:#64748b;font-weight:800;font-size:13px}.lf-mockup{background:linear-gradient(180deg,#0b1220,#101827);border:1px solid rgba(255,255,255,.12);border-radius:34px;padding:16px;box-shadow:0 34px 90px rgba(10,24,52,.32);color:white;transform:rotate(1deg)}.lf-mockup-top{display:flex;gap:7px;padding:4px 0 14px}.lf-mockup-top span{width:11px;height:11px;border-radius:50%;background:#324155}.lf-mockup-header{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;background:linear-gradient(135deg,rgba(37,99,235,.24),rgba(14,165,233,.08));border:1px solid rgba(147,197,253,.22);border-radius:24px;padding:20px}.lf-mockup-header small{color:#93c5fd;font-weight:900;letter-spacing:1.7px}.lf-mockup-header h3{font-size:24px;margin:8px 0 8px;letter-spacing:-.7px}.lf-mockup-header p{color:#b6c5d8;line-height:1.6;margin:0}.lf-live-dot{background:#dcfce7;color:#166534;border-radius:999px;padding:8px 10px;font-weight:900;font-size:12px}.lf-chip-row{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:12px 0}.lf-chip-row div{background:#162235;border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:15px}.lf-chip-row b{font-size:24px;display:block}.lf-chip-row span{display:block;color:#a8b7ca;font-size:12px;margin-top:4px;font-weight:800}.lf-mockup-body{display:grid;grid-template-columns:1fr .92fr;gap:12px}.lf-rank-card,.lf-funnel-card{background:white;color:var(--lf-text);border-radius:24px;padding:18px}.lf-rank-card h4,.lf-funnel-card h4{margin:0 0 14px;font-size:16px}.lf-rank-item{margin-bottom:16px}.lf-rank-item div:first-child{display:flex;justify-content:space-between;gap:10px;font-size:13px}.lf-rank-item span{color:#64748b;font-weight:800}.lf-bar{height:9px;background:#e6eefb;border-radius:999px;margin-top:8px;overflow:hidden}.lf-bar i{height:100%;display:block;background:linear-gradient(90deg,#0b5cff,#38bdf8);border-radius:999px}.lf-funnel-visual{height:90px;border-radius:20px;background:linear-gradient(135deg,#dbeafe,#bfdbfe 45%,#fef3c7);margin-bottom:14px;position:relative;overflow:hidden}.lf-funnel-visual:after{content:'';position:absolute;inset:auto 16px 14px 16px;height:26px;border-radius:999px;background:rgba(255,255,255,.78)}.lf-funnel-card p{color:#64748b;line-height:1.55;font-size:13px}.lf-wa-button{background:#16a34a;color:white;text-align:center;border-radius:999px;padding:10px 12px;font-weight:900;margin-top:12px}.lf-strip{padding:20px 28px;background:#07111f;color:#dbeafe;text-align:center;font-weight:900;letter-spacing:.2px}.lf-section{padding-top:76px;padding-bottom:76px}.lf-section-head{max-width:760px;margin-bottom:28px}.lf-section-head span,.lf-preview-copy span{display:inline-block;color:#0b5cff;font-weight:950;letter-spacing:.12em;text-transform:uppercase;font-size:12px;margin-bottom:10px}.lf-section-head h2,.lf-preview-copy h2,.lf-final-cta h2{font-size:clamp(32px,5vw,52px);line-height:1.05;letter-spacing:-2px;margin:0 0 14px}.lf-section-head p,.lf-preview-copy p,.lf-final-cta p{color:#5c6f86;line-height:1.75;font-size:17px;margin:0}.lf-centered{text-align:center;margin-left:auto;margin-right:auto}.lf-three-grid,.lf-pricing-grid,.lf-faq-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.lf-info-card,.lf-feature-card,.lf-price-card,.lf-faq-card,.lf-mini-panel{background:white;border:1px solid #e2ebff;border-radius:28px;padding:24px;box-shadow:0 18px 50px rgba(15,23,42,.06)}.lf-info-card span,.lf-feature-card span{display:inline-grid;place-items:center;width:42px;height:42px;border-radius:15px;background:#eef5ff;color:#0b5cff;font-weight:950;margin-bottom:18px}.lf-info-card h3,.lf-feature-card h3,.lf-faq-card h3,.lf-mini-panel h3{font-size:21px;letter-spacing:-.5px;margin:0 0 10px}.lf-info-card p,.lf-feature-card p,.lf-faq-card p{color:#5c6f86;line-height:1.72;margin:0}.lf-flow{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;position:relative}.lf-flow-step{background:linear-gradient(180deg,#ffffff,#f8fbff);border:1px solid #dce9ff;border-radius:28px;padding:22px;min-height:210px;box-shadow:0 18px 45px rgba(15,23,42,.05)}.lf-flow-step div{width:46px;height:46px;border-radius:16px;background:#0b5cff;color:white;display:grid;place-items:center;font-weight:950;margin-bottom:28px;box-shadow:0 12px 26px rgba(11,92,255,.22)}.lf-flow-step h3{margin:0 0 10px;font-size:20px;letter-spacing:-.5px}.lf-flow-step p{color:#607188;line-height:1.65;margin:0}.lf-feature-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.lf-preview-section{display:grid;grid-template-columns:.8fr 1.2fr;gap:24px;align-items:center;background:linear-gradient(135deg,#07111f,#0f1d33);border-radius:42px;color:white;padding-top:42px;padding-bottom:42px;margin-top:30px}.lf-preview-copy{padding-left:28px}.lf-preview-copy h2{color:white}.lf-preview-copy p{color:#c5d3e6}.lf-preview-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;padding-right:28px}.lf-mini-panel{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.12);box-shadow:none;color:white}.lf-mini-panel h3{color:white}.lf-mini-row{display:flex;gap:9px;align-items:flex-start;color:#d5e3f8;padding:10px 0;border-top:1px solid rgba(255,255,255,.1);line-height:1.45}.lf-mini-row span{color:#86efac;font-weight:900}.lf-price-card{position:relative}.lf-price-card.is-popular{border:2px solid #0b5cff;transform:translateY(-10px);box-shadow:0 28px 70px rgba(11,92,255,.14)}.lf-popular{position:absolute;right:18px;top:18px;background:#0b5cff;color:white;border-radius:999px;padding:8px 10px;font-size:12px;font-weight:950}.lf-price-card h3{font-size:24px;margin:0 0 14px}.lf-price{font-size:38px;letter-spacing:-1.5px;font-weight:950;margin-bottom:8px}.lf-price-card b{color:#0b5cff}.lf-price-card p{color:#5c6f86;line-height:1.65;min-height:78px}.lf-price-card ul{padding-left:18px;color:#44566d;line-height:1.9;margin:18px 0 0}.lf-faq-grid{grid-template-columns:repeat(2,1fr)}.lf-final-cta{margin:30px auto 64px;background:linear-gradient(135deg,#e8f1ff,#ffffff);border:1px solid #dbe8ff;border-radius:42px;padding-top:42px;padding-bottom:42px;display:flex;justify-content:space-between;gap:24px;align-items:center;box-shadow:0 24px 80px rgba(15,23,42,.08)}.lf-final-cta h2{max-width:760px}.lf-final-actions{display:flex;gap:12px;flex-wrap:wrap;justify-content:flex-end}.lf-modal-backdrop{position:fixed;inset:0;background:rgba(7,17,31,.55);display:grid;place-items:center;padding:18px;z-index:60}.lf-modal{position:relative;background:white;border-radius:30px;padding:30px;max-width:580px;width:100%;box-shadow:0 30px 90px rgba(7,17,31,.34)}.lf-modal h2{letter-spacing:-1px;margin:18px 0 8px}.lf-modal p{color:#5c6f86;line-height:1.75}.lf-close-btn{position:absolute;right:18px;top:16px;border:0;background:#f1f5f9;border-radius:14px;font-size:24px;padding:3px 11px;cursor:pointer}.lf-modal-steps{display:grid;gap:8px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:20px;padding:16px;color:#334155}.lf-modal-actions{display:flex;gap:10px;margin-top:18px;flex-wrap:wrap}
    @media(max-width:980px){.lf-nav{flex-wrap:wrap}.lf-nav-links{order:3;width:100%;justify-content:center}.lf-hero{grid-template-columns:1fr;padding-top:46px}.lf-mockup{transform:none}.lf-three-grid,.lf-feature-grid,.lf-pricing-grid{grid-template-columns:1fr 1fr}.lf-flow{grid-template-columns:1fr 1fr}.lf-preview-section{grid-template-columns:1fr}.lf-preview-copy{padding:0 28px}.lf-preview-grid{padding:0 28px 8px}.lf-final-cta{align-items:flex-start;flex-direction:column}.lf-final-actions{justify-content:flex-start}}
    @media(max-width:680px){.lf-shell{padding-left:18px;padding-right:18px}.lf-nav{padding:14px 18px;align-items:flex-start}.lf-brand b{font-size:20px}.lf-nav-links{display:none}.lf-nav-actions{width:100%;display:grid;grid-template-columns:1fr 1fr;gap:8px}.lf-nav-actions > div{grid-column:1 / -1;justify-self:end}.lf-btn{width:100%;text-align:center}.lf-hero{padding-top:34px;gap:28px}.lf-hero h1{letter-spacing:-2px}.lf-lead{font-size:17px}.lf-cta-row{display:grid}.lf-hero-metrics,.lf-chip-row,.lf-mockup-body,.lf-three-grid,.lf-feature-grid,.lf-pricing-grid,.lf-faq-grid,.lf-flow,.lf-preview-grid{grid-template-columns:1fr}.lf-mockup{border-radius:28px;padding:12px}.lf-mockup-header{border-radius:20px;flex-direction:column}.lf-section{padding-top:54px;padding-bottom:54px}.lf-section-head h2,.lf-preview-copy h2,.lf-final-cta h2{letter-spacing:-1.4px}.lf-price-card.is-popular{transform:none}.lf-preview-section,.lf-final-cta{border-radius:30px}.lf-preview-copy,.lf-preview-grid{padding-left:18px;padding-right:18px}.lf-final-cta{margin-bottom:34px}.lf-modal{padding:24px;border-radius:24px;max-height:92vh;overflow:auto}.lf-modal-actions{display:grid}}
  `}</style>
}
