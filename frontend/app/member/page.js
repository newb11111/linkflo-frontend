'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { api, SITE_URL, logout as doLogout, getToken, getUser } from '../../lib/api'
import LanguageToggle from '../../components/LanguageToggle'
import { useLanguage } from '../../lib/i18n'

const tierText = {
  UNVERIFIED: 'Unverified Member',
  VERIFIED: 'Verified Member',
  GOLD: 'Gold Ambassador',
  DIAMOND: 'Diamond Ambassador'
}

const tierIcon = {
  UNVERIFIED: '🪪',
  VERIFIED: '✅',
  GOLD: '👑',
  DIAMOND: '💎'
}

function money(value) {
  return Number(value || 0).toFixed(2)
}

function pct(value) {
  return Math.round(Number(value || 0) * 100)
}


const MEMBER_TEXT = {
  zh: {
    linkfloMember:'Linkflo Member', syncing:'同步中…', hello:'Hi', thanksSupport:'感谢你的支持！', verifiedMember:'Verified Member', unverifiedMember:'Unverified Member', member:'Member',
    paidCredit:'Paid Credit', bonusCredit:'Bonus Credit', bonusCap:'Bonus 抵扣上限', viewDetails:'查看详情 ›', bonusCapHelp:'等级越高，每单可用 Bonus Credit 抵扣越多。',
    nextStep:'下一步建议', monthlyMissionProgress:'本月任务进度', maintainLevel:'再完成 {count} 个任务可维持当前等级。', noMonthlyRequired:'当前等级没有强制发帖任务。', submitStoryProof:'上传 Story 证明',
    myProducts:'我的产品', recommended:'推荐 AI 产品', all:'全部 ›', noStoreItems:'Admin 还没有上架产品。',
    earnTitle:'Earn Credit', earnSub:'分享素材、邀请朋友、提交 proof，赚 Bonus Credit。', myReferralLink:'My Referral Link', noReferral:'系统还没有 referral code，请联系 Admin。', copyLink:'Copy Link', shareWhatsApp:'Share WhatsApp', monthlyMission:'Monthly Mission', posts:'Posts', marketingMaterials:'Marketing Materials', noMaterials:'Admin 还没有上传素材。', open:'Open', copy:'Copy', captionCopied:'Caption 已复制。',
    submitProof:'Submit Proof', postUrlOptional:'Post URL，可空', captionOptional:'Caption，可空', uploadProof:'上传 screenshot proof', uploaded:'已上传：{url}', proofRecords:'Proof 记录', noProofRecords:'还没有提交记录。',
    productStore:'AI Product Hub', productStoreDesc:'发现并开通 Linkflo 自家和 Partner 的 AI 产品。', searchAiProducts:'搜索 AI 产品...', featuredAiProducts:'精选 AI 产品', requestDemo:'预约 Demo', wallet:'Wallet', walletDesc:'查看 Paid Credit、Bonus Credit 和交易记录。', totalCredit:'Total Credit', topupPaidCredit:'Topup Paid Credit', topup:'Topup', recentTransactions:'Recent Transactions', noTransactions:'还没有交易记录。',
    aiFunnel:'AI Funnel', aiFunnelDesc:'开通后可以创建产品成交页、Promoter link 和追踪 WhatsApp 点击。', menu:'Menu', menuDesc:'KYC、订单、Funnel、交易和账户设置。', kycVerification:'KYC Verification', kycHint:'不 KYC 可以使用系统，但 Bonus Credit 每单只可抵 5%。通过后可变成 Verified Member，解锁 30%。', submitKyc:'Submit KYC', latestKycStatus:'最新 KYC 状态：', levelRules:'Level Rules / 抵扣规则', referralHistory:'Referral History', orders:'Orders', settings:'Settings', logout:'Logout',
    home:'首页', hub:'产品库', myAi:'My AI', credits:'Credits', earn:'Earn', store:'Hub', funnel:'My AI', price:'Price', bonusMax:'Bonus max', needPaid:'Need Paid', currentPlan:'Current Plan', switchPlan:'Switch Plan', activateMonthly:'Activate Monthly', buyNow:'Buy Now', alreadyActivated:'已开通，不重复扣款',
    openFunnel:'进入 Funnel', aiFunnelNotActive:'AI Funnel 尚未开通', aiFunnelNotActiveDesc:'开通后可以创建 Funnel、Promoter link 和查看点击数据。', activateFunnel:'开通 AI Funnel', nextBilling:'下次扣费：{date}',
    completeKycTitle:'完成 KYC，解锁更高抵扣', completeKycText:'认证通过后，Bonus Credit 抵扣上限可以从 5% 提升到 30%。', completeKycBtn:'立即认证', morePostsTitle:'再完成 {count} 个分享任务', morePostsText:'完成本月 {required} 个 approved posts / stories，维持或提升 Ambassador 等级。', uploadStory:'上传 Story 证明', activateFunnelTitle:'开通 AI Funnel', activateFunnelText:'用 credit 开通 Funnel 后，就能创建产品页、Promoter link 和追踪点击。', goActivate:'去开通产品', continueEarnTitle:'继续赚 Bonus Credit', continueEarnText:'复制 referral link 或使用素材发 story，继续累积可抵扣的 Bonus Credit。', goEarn:'去 Earn',
    quickUpload:'上传证明', inviteFriends:'邀请好友', materialLibrary:'素材库', buyService:'AI 产品', confirmPurchase:'确认购买 {name}?\n价格：{price} credits\nBonus Credit 最高可抵：{bonus} credits ({cap}%)\n剩余需要 Paid Credit。', confirmSwitch:'确认切换 AI Funnel 到 {name}?\n系统会扣本月配套 credit，并把原本 AI Funnel 配套替换成新的配套。', sameFunnelNoCharge:'你已经开通这个 AI Funnel 配套，不会重复扣 credit。', purchaseSuccess:'购买成功。', referralCopied:'Referral link 已复制。', uploading:'Uploading...', uploadSuccess:'上传成功。', kycSubmitted:'KYC submitted.', proofSubmitted:'Proof submitted.', topupBillCreated:'Topup bill created.', productService:'Linkflo product / service', myAiProducts:'My AI Products', myAiDesc:'Open and manage the AI products and workspaces you already activated.', aiFunnelWorkspaces:'AI Funnel Workspaces', noActiveProducts:'No active AI products yet. Activate one from the Hub.', createNewFunnel:'Create New AI Funnel', openProduct:'Open Product', creditsTitle:'Credits Center', creditsDesc:'Wallet, Earn and Rewards are combined here.', walletTab:'Wallet', earnTab:'Earn', rewardsTab:'Rewards', drawerTitle:'Menu Drawer', notifications:'Notifications', noNotifications:'No new notifications yet.', kycDrawerHint:'KYC / Verification', ordersBilling:'Orders & Billing', supportHelp:'Support / Help', accountSettings:'Account Settings', myAiProducts:'我的 AI 产品', myAiDesc:'这里显示你已经开通的 AI 产品和工作区。', aiFunnelWorkspaces:'AI Funnel Workspaces', noActiveProducts:'还没有开通任何 AI 产品。先去 Hub 开通。', createNewFunnel:'创建新的 AI Funnel', openProduct:'打开产品', creditsTitle:'Credits Center', creditsDesc:'Wallet、Earn、Rewards 集中在这里。', walletTab:'Wallet', earnTab:'Earn', rewardsTab:'Rewards', drawerTitle:'Menu Drawer', notifications:'Notifications', noNotifications:'目前没有新通知。', kycDrawerHint:'KYC / 认证', ordersBilling:'Orders & Billing', supportHelp:'Support / Help', accountSettings:'Account Settings'
  },
  en: {
    linkfloMember:'Linkflo Member', syncing:'Syncing…', hello:'Hi', thanksSupport:'Thanks for your support!', verifiedMember:'Verified Member', unverifiedMember:'Unverified Member', member:'Member',
    paidCredit:'Paid Credit', bonusCredit:'Bonus Credit', bonusCap:'Bonus discount cap', viewDetails:'View details ›', bonusCapHelp:'The higher your level, the more Bonus Credit you can use per order.',
    nextStep:'Next Step', monthlyMissionProgress:'Monthly Mission Progress', maintainLevel:'Complete {count} more tasks to maintain your level.', noMonthlyRequired:'Your current level has no required monthly posts.', submitStoryProof:'Submit Story Proof',
    myProducts:'My Products', recommended:'Featured AI Products', all:'All ›', noStoreItems:'No products have been listed by Admin yet.',
    earnTitle:'Earn Credit', earnSub:'Share materials, invite friends, submit proof and earn Bonus Credit.', myReferralLink:'My Referral Link', noReferral:'No referral code yet. Please contact Admin.', copyLink:'Copy Link', shareWhatsApp:'Share WhatsApp', monthlyMission:'Monthly Mission', posts:'Posts', marketingMaterials:'Marketing Materials', noMaterials:'No marketing materials yet.', open:'Open', copy:'Copy', captionCopied:'Caption copied.',
    submitProof:'Submit Proof', postUrlOptional:'Post URL, optional', captionOptional:'Caption, optional', uploadProof:'Upload screenshot proof', uploaded:'Uploaded: {url}', proofRecords:'Proof Records', noProofRecords:'No proof submissions yet.',
    productStore:'AI Product Hub', productStoreDesc:'Discover and activate Linkflo and Partner AI products with credit.', searchAiProducts:'Search AI products...', featuredAiProducts:'Featured AI Products', requestDemo:'Request Demo', wallet:'Wallet', walletDesc:'View Paid Credit, Bonus Credit and transactions.', totalCredit:'Total Credit', topupPaidCredit:'Topup Paid Credit', topup:'Topup', recentTransactions:'Recent Transactions', noTransactions:'No transactions yet.',
    aiFunnel:'AI Funnel', aiFunnelDesc:'After activation, create product funnels, promoter links and track WhatsApp clicks.', menu:'Menu', menuDesc:'KYC, orders, Funnel, transactions and account settings.', kycVerification:'KYC Verification', kycHint:'Without KYC, Bonus Credit can only cover 5% per order. After approval, you become Verified Member and unlock 30%.', submitKyc:'Submit KYC', latestKycStatus:'Latest KYC status: ', levelRules:'Level Rules / Discount Caps', referralHistory:'Referral History', orders:'Orders', settings:'Settings', logout:'Logout',
    home:'Home', hub:'Hub', myAi:'My AI', credits:'Credits', earn:'Earn', store:'Hub', funnel:'My AI', price:'Price', bonusMax:'Bonus max', needPaid:'Need Paid', currentPlan:'Current Plan', switchPlan:'Switch Plan', activateMonthly:'Activate Monthly', buyNow:'Buy Now', alreadyActivated:'Already active, no duplicate charge',
    openFunnel:'Open Funnel', aiFunnelNotActive:'AI Funnel is not active', aiFunnelNotActiveDesc:'Activate it to create funnels, promoter links and view click data.', activateFunnel:'Activate AI Funnel', nextBilling:'Next billing: {date}',
    completeKycTitle:'Complete KYC to unlock higher discount', completeKycText:'After approval, your Bonus Credit cap can increase from 5% to 30%.', completeKycBtn:'Verify now', morePostsTitle:'Complete {count} more sharing tasks', morePostsText:'Complete {required} approved posts / stories this month to maintain or upgrade your Ambassador level.', uploadStory:'Submit Story Proof', activateFunnelTitle:'Activate AI Funnel', activateFunnelText:'Use credit to activate Funnel and create product pages, promoter links and click tracking.', goActivate:'Activate product', continueEarnTitle:'Keep earning Bonus Credit', continueEarnText:'Copy your referral link or share materials to keep earning Bonus Credit.', goEarn:'Go Earn',
    quickUpload:'Submit Proof', inviteFriends:'Invite Friends', materialLibrary:'Materials', buyService:'AI Products', confirmPurchase:'Confirm purchase {name}?\nPrice: {price} credits\nBonus Credit max: {bonus} credits ({cap}%)\nThe rest needs Paid Credit.', confirmSwitch:'Switch AI Funnel to {name}?\nThe system will charge this month’s plan credit and replace your current AI Funnel plan.', sameFunnelNoCharge:'This AI Funnel plan is already active. No credit will be deducted again.', purchaseSuccess:'Purchase successful.', referralCopied:'Referral link copied.', uploading:'Uploading...', uploadSuccess:'Upload successful.', kycSubmitted:'KYC submitted.', proofSubmitted:'Proof submitted.', topupBillCreated:'Topup bill created.', productService:'Linkflo product / service', myAiProducts:'My AI Products', myAiDesc:'Open and manage the AI products and workspaces you already activated.', aiFunnelWorkspaces:'AI Funnel Workspaces', noActiveProducts:'No active AI products yet. Activate one from the Hub.', createNewFunnel:'Create New AI Funnel', openProduct:'Open Product', creditsTitle:'Credits Center', creditsDesc:'Wallet, Earn and Rewards are combined here.', walletTab:'Wallet', earnTab:'Earn', rewardsTab:'Rewards', drawerTitle:'Menu Drawer', notifications:'Notifications', noNotifications:'No new notifications yet.', kycDrawerHint:'KYC / Verification', ordersBilling:'Orders & Billing', supportHelp:'Support / Help', accountSettings:'Account Settings'
  },
  bm: {
    linkfloMember:'Linkflo Member', syncing:'Sedang sync…', hello:'Hi', thanksSupport:'Terima kasih atas sokongan anda!', verifiedMember:'Verified Member', unverifiedMember:'Unverified Member', member:'Member',
    paidCredit:'Paid Credit', bonusCredit:'Bonus Credit', bonusCap:'Had guna Bonus', viewDetails:'Lihat detail ›', bonusCapHelp:'Level lebih tinggi membolehkan anda guna lebih banyak Bonus Credit setiap order.',
    nextStep:'Langkah Seterusnya', monthlyMissionProgress:'Progress Misi Bulanan', maintainLevel:'Selesaikan {count} lagi task untuk kekalkan level.', noMonthlyRequired:'Level semasa tiada syarat post bulanan.', submitStoryProof:'Hantar bukti Story',
    myProducts:'Produk Saya', recommended:'Produk AI Pilihan', all:'Semua ›', noStoreItems:'Admin belum senaraikan produk.',
    earnTitle:'Earn Credit', earnSub:'Kongsi bahan, jemput kawan, hantar proof dan dapat Bonus Credit.', myReferralLink:'Link Referral Saya', noReferral:'Referral code belum ada. Sila hubungi Admin.', copyLink:'Salin Link', shareWhatsApp:'Kongsi WhatsApp', monthlyMission:'Misi Bulanan', posts:'Posts', marketingMaterials:'Bahan Marketing', noMaterials:'Belum ada bahan marketing.', open:'Buka', copy:'Salin', captionCopied:'Caption disalin.',
    submitProof:'Hantar Proof', postUrlOptional:'Post URL, pilihan', captionOptional:'Caption, pilihan', uploadProof:'Muat naik screenshot proof', uploaded:'Telah upload: {url}', proofRecords:'Rekod Proof', noProofRecords:'Belum ada rekod proof.',
    productStore:'AI Product Hub', productStoreDesc:'Cari dan aktifkan produk AI Linkflo dan Partner dengan credit.', searchAiProducts:'Cari produk AI...', featuredAiProducts:'Produk AI Pilihan', requestDemo:'Minta Demo', wallet:'Wallet', walletDesc:'Lihat Paid Credit, Bonus Credit dan transaksi.', totalCredit:'Total Credit', topupPaidCredit:'Topup Paid Credit', topup:'Topup', recentTransactions:'Transaksi Terkini', noTransactions:'Belum ada transaksi.',
    aiFunnel:'AI Funnel', aiFunnelDesc:'Selepas aktif, cipta product funnel, promoter link dan track WhatsApp clicks.', menu:'Menu', menuDesc:'KYC, order, Funnel, transaksi dan setting akaun.', kycVerification:'KYC Verification', kycHint:'Tanpa KYC, Bonus Credit hanya boleh cover 5% setiap order. Selepas approved, anda jadi Verified Member dan unlock 30%.', submitKyc:'Hantar KYC', latestKycStatus:'Status KYC terkini: ', levelRules:'Level Rules / Had Diskaun', referralHistory:'Referral History', orders:'Orders', settings:'Settings', logout:'Logout',
    home:'Laman', hub:'Hub', myAi:'My AI', credits:'Credits', earn:'Earn', store:'Hub', funnel:'My AI', price:'Price', bonusMax:'Bonus max', needPaid:'Need Paid', currentPlan:'Current Plan', switchPlan:'Tukar Plan', activateMonthly:'Aktif Bulanan', buyNow:'Beli Sekarang', alreadyActivated:'Sudah aktif, tiada caj berulang',
    openFunnel:'Masuk Funnel', aiFunnelNotActive:'AI Funnel belum aktif', aiFunnelNotActiveDesc:'Aktifkan untuk cipta Funnel, promoter link dan lihat data klik.', activateFunnel:'Aktifkan AI Funnel', nextBilling:'Billing seterusnya: {date}',
    completeKycTitle:'Lengkapkan KYC untuk unlock diskaun lebih tinggi', completeKycText:'Selepas approved, had Bonus Credit naik dari 5% ke 30%.', completeKycBtn:'Verify sekarang', morePostsTitle:'Selesaikan {count} lagi task sharing', morePostsText:'Selesaikan {required} approved posts / stories bulan ini untuk kekalkan atau naik level Ambassador.', uploadStory:'Hantar Proof Story', activateFunnelTitle:'Aktifkan AI Funnel', activateFunnelText:'Guna credit untuk aktifkan Funnel dan cipta product page, promoter link dan tracking klik.', goActivate:'Aktifkan produk', continueEarnTitle:'Terus earn Bonus Credit', continueEarnText:'Salin referral link atau share bahan untuk terus kumpul Bonus Credit.', goEarn:'Pergi Earn',
    quickUpload:'Hantar Proof', inviteFriends:'Jemput Kawan', materialLibrary:'Bahan', buyService:'Produk AI', confirmPurchase:'Sahkan beli {name}?\nHarga: {price} credits\nBonus Credit maksimum: {bonus} credits ({cap}%)\nBaki perlu guna Paid Credit.', confirmSwitch:'Tukar AI Funnel ke {name}?\nSistem akan caj credit plan bulan ini dan ganti plan AI Funnel semasa.', sameFunnelNoCharge:'Plan AI Funnel ini sudah aktif. Credit tidak akan ditolak lagi.', purchaseSuccess:'Pembelian berjaya.', referralCopied:'Referral link disalin.', uploading:'Uploading...', uploadSuccess:'Upload berjaya.', kycSubmitted:'KYC dihantar.', proofSubmitted:'Proof dihantar.', topupBillCreated:'Topup bill created.', productService:'Produk / servis Linkflo', myAiProducts:'Produk AI Saya', myAiDesc:'Buka dan urus produk AI dan workspace yang sudah aktif.', aiFunnelWorkspaces:'AI Funnel Workspaces', noActiveProducts:'Belum ada produk AI aktif. Aktifkan dari Hub.', createNewFunnel:'Cipta AI Funnel Baru', openProduct:'Buka Produk', creditsTitle:'Credits Center', creditsDesc:'Wallet, Earn dan Rewards digabungkan di sini.', walletTab:'Wallet', earnTab:'Earn', rewardsTab:'Rewards', drawerTitle:'Menu Drawer', notifications:'Notifications', noNotifications:'Belum ada notifikasi baru.', kycDrawerHint:'KYC / Verification', ordersBilling:'Orders & Billing', supportHelp:'Support / Help', accountSettings:'Account Settings'
  }
}

const DEFAULT_STORE_TEXT = {
  FUNNEL_STARTER: { zh:['AI Funnel Starter','用 AI 创建成交页、Promoter link 和 WhatsApp 点击追踪。'], en:['AI Funnel Starter','Create AI sales funnels, promoter links and WhatsApp click tracking.'], bm:['AI Funnel Starter','Cipta funnel jualan AI, promoter link dan tracking klik WhatsApp.'] },
  FUNNEL_GROWTH: { zh:['AI Funnel Growth','适合开始推广多个 AI offer，包含 50 个 promoter links。'], en:['AI Funnel Growth','For growing multiple AI offers with 50 promoter links included.'], bm:['AI Funnel Growth','Untuk kembangkan beberapa offer AI dengan 50 promoter links.'] },
  FUNNEL_SCALE: { zh:['AI Funnel Scale','适合团队推广和大量 AI 产品流量追踪。'], en:['AI Funnel Scale','For team promotion and higher-volume AI product tracking.'], bm:['AI Funnel Scale','Untuk promosi team dan tracking produk AI volume lebih tinggi.'] },
  EXTRA_SKU: { zh:['Extra AI Product Funnel Slot','增加 1 个额外 AI 产品 Funnel 位。'], en:['Extra AI Product Funnel Slot','Add 1 extra AI product funnel slot.'], bm:['Extra AI Product Funnel Slot','Tambah 1 slot funnel produk AI.'] },
  WEBSITE_AUDIT: { zh:['AI Funnel Audit','Linkflo 帮你检查 AI 产品页面、offer 和成交路径。'], en:['AI Funnel Audit','Linkflo reviews your AI product page, offer and conversion flow.'], bm:['AI Funnel Audit','Linkflo review halaman produk AI, offer dan flow conversion anda.'] },
  WHATSAPP_SCRIPT: { zh:['AI WhatsApp Closing Script','生成适合你 AI 产品的 WhatsApp 成交话术。'], en:['AI WhatsApp Closing Script','Generate WhatsApp closing scripts for your AI product.'], bm:['AI WhatsApp Closing Script','Jana script closing WhatsApp untuk produk AI anda.'] },
  WEBSITE_BUILD: { zh:['AI Landing Page Builder Service','由 Linkflo 协助搭建 AI 产品成交页。'], en:['AI Landing Page Builder Service','Linkflo helps build a sales page for your AI product.'], bm:['AI Landing Page Builder Service','Linkflo bantu bina sales page untuk produk AI anda.'] },
  ACADEMY_ACCESS: { zh:['AI Academy Access','学习 AI 产品、AI Funnel、推广和变现路线。'], en:['AI Academy Access','Learn AI products, AI funnels, promotion and monetization.'], bm:['AI Academy Access','Belajar produk AI, AI funnel, promosi dan monetization.'] },
  AI_CAPTION_GENERATOR: { zh:['AI Caption Generator','为社交媒体快速生成推广文案。'], en:['AI Caption Generator','Generate social captions for campaigns quickly.'], bm:['AI Caption Generator','Jana caption sosial media untuk campaign dengan cepat.'] },
  AI_POSTER_MAKER: { zh:['AI Poster Maker','快速生成 AI 产品宣传海报。'], en:['AI Poster Maker','Create promotional posters for AI products quickly.'], bm:['AI Poster Maker','Cipta poster promosi untuk produk AI dengan cepat.'] },
  PARTNER_WHATSAPP_BOT: { zh:['Partner AI WhatsApp Reply Bot','Partner 产品：自动回复客户问题，适合销售和客服。'], en:['Partner AI WhatsApp Reply Bot','Partner product: reply to customer questions for sales and support.'], bm:['Partner AI WhatsApp Reply Bot','Produk partner: balas soalan pelanggan untuk sales dan support.'] },
  PARTNER_CRM_ASSISTANT: { zh:['Partner AI CRM Assistant','Partner 产品：跟进 lead、记录客户和提醒成交动作。'], en:['Partner AI CRM Assistant','Partner product: follow up leads, record customers and trigger sales reminders.'], bm:['Partner AI CRM Assistant','Produk partner: follow up lead, rekod pelanggan dan reminder sales.'] }
}

function formatText(template, vars = {}) {
  return String(template || '').replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))
}
function getPlanCodeFromItem(item = {}) {
  const code = String(item.code || '')
  if (!code.startsWith('FUNNEL_')) return null
  if (code.includes('SCALE')) return 'SCALE'
  if (code.includes('GROWTH')) return 'GROWTH'
  return 'STARTER'
}
function localizeStoreItem(item = {}, lang = 'zh') {
  const row = DEFAULT_STORE_TEXT[item.code]?.[lang] || DEFAULT_STORE_TEXT[item.code]?.zh
  if (!row) return item
  return { ...item, name: row[0] || item.name, description: row[1] || item.description }
}

function productTone(item = {}) {
  const code = String(item.code || '')
  if (code.startsWith('FUNNEL_')) return { icon:'🚀', category:'AI Funnel', color:'violet' }
  if (code.includes('WHATSAPP') || code.includes('SCRIPT')) return { icon:'💬', category:'AI Sales', color:'green' }
  if (code.includes('CAPTION') || code.includes('POSTER')) return { icon:'✨', category:'AI Marketing', color:'pink' }
  if (code.includes('ACADEMY')) return { icon:'🎓', category:'AI Academy', color:'orange' }
  if (code.includes('PARTNER')) return { icon:'🤝', category:'Partner AI', color:'blue' }
  return { icon:'🧩', category:'AI Business', color:'blue' }
}
function productActionText(item = {}, mt, member = {}) {
  const planCode = getPlanCodeFromItem(item)
  const hasFunnel = Boolean(member?.hasActiveFunnel || member?.planStatus === 'ACTIVE')
  if (planCode && hasFunnel && member?.plan === planCode) return mt('currentPlan')
  if (planCode && hasFunnel && member?.plan !== planCode) return mt('switchPlan')
  if (String(item.code || '').startsWith('PARTNER_')) return mt('requestDemo')
  if (item.billingType === 'MONTHLY') return mt('activateMonthly')
  return mt('buyNow')
}


function memberFallback() {
  const user = getUser() || {}
  return {
    member: {
      brandName: user.name || user.email || 'Member',
      user,
      paidCredit: 0,
      bonusCredit: 0,
      bonusCap: 0.05,
      memberTier: 'UNVERIFIED',
      kycStatus: 'UNVERIFIED',
      approvedPostsThisMonth: 0,
      monthlyPostRequired: 0,
      hasActiveFunnel: false
    },
    storeItems: [],
    materials: [],
    socialProofs: [],
    ledger: []
  }
}

function readCachedMemberSummary() {
  if (typeof window === 'undefined') return memberFallback()
  try {
    const cached = JSON.parse(localStorage.getItem('linkflo_member_summary') || 'null')
    if (cached && cached.member) return cached
  } catch {}
  return memberFallback()
}

function saveCachedMemberSummary(summary) {
  if (typeof window === 'undefined' || !summary) return
  try { localStorage.setItem('linkflo_member_summary', JSON.stringify(summary)) } catch {}
}

export default function MemberDashboard() {
  const { lang } = useLanguage()
  const mt = (key, vars) => formatText((MEMBER_TEXT[lang] || MEMBER_TEXT.zh)[key] || MEMBER_TEXT.zh[key] || key, vars)
  const [data, setData] = useState(() => readCachedMemberSummary())
  const [syncing, setSyncing] = useState(false)
  const [msg, setMsg] = useState('')
  const [active, setActive] = useState('home')
  const [activeCategory, setActiveCategory] = useState('All')
  const [creditsTab, setCreditsTab] = useState('wallet')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [noticeOpen, setNoticeOpen] = useState(false)
  const [topupAmount, setTopupAmount] = useState(100)
  const [kyc, setKyc] = useState({ fullName:'', icNumber:'', phone:'', socialProfile:'', icFrontUrl:'', icBackUrl:'', selfieUrl:'' })
  const [proof, setProof] = useState({ platform:'Instagram', postType:'STORY', proofImageUrl:'', postUrl:'', caption:'' })

  async function load() {
    if (!getToken()) { window.location.href = '/login'; return }
    setSyncing(true)
    try {
      const me = await api('/api/auth/me')
      if (me.role === 'ADMIN') { window.location.href = '/admin'; return }
      const summary = await api('/api/member/summary')
      setData(summary)
      saveCachedMemberSummary(summary)
    } catch (e) {
      window.location.href = '/login'
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const tab = new URLSearchParams(window.location.search).get('tab')
    const mapped = { hub:'store', store:'store', my:'funnel', myai:'funnel', products:'funnel', funnel:'funnel', earn:'credits', wallet:'credits', credits:'credits', home:'home' }[String(tab || '').toLowerCase()]
    if (mapped) setActive(mapped)
    if (String(tab || '').toLowerCase() === 'earn') setCreditsTab('earn')
    if (String(tab || '').toLowerCase() === 'wallet') setCreditsTab('wallet')
  }, [])

  function navigate(target, sub) {
    if (target === 'menu' || target === 'drawer') { setDrawerOpen(true); return }
    if (target === 'credits') setCreditsTab(sub || creditsTab || 'wallet')
    setActive(target)
    setDrawerOpen(false)
  }

  const member = data?.member || {}
  const activeFunnel = Boolean(member.hasActiveFunnel)
  const localizedItems = (data?.storeItems || []).map(item => localizeStoreItem(item, lang))
  const storeCategories = ['All', ...Array.from(new Set(localizedItems.map(item => productTone(item).category)))]
  const visibleStoreItems = localizedItems.filter(item => activeCategory === 'All' || productTone(item).category === activeCategory)
  const featuredItems = localizedItems.filter(item => String(item.code || '').startsWith('FUNNEL_') || String(item.code || '').startsWith('PARTNER_')).slice(0, 4)
  const bonusCapPercent = pct(member.bonusCap)
  const approvedPosts = Number(member.approvedPostsThisMonth || 0)
  const requiredPosts = Number(member.monthlyPostRequired || 0)
  const missionPercent = requiredPosts > 0 ? Math.min(100, Math.round((approvedPosts / requiredPosts) * 100)) : 100

  const referralUrl = useMemo(() => {
    if (!member.referralCode) return ''
    return `${SITE_URL}/login?mode=register&ref=${encodeURIComponent(member.referralCode)}`
  }, [member.referralCode])

  const nextStep = useMemo(() => {
    if ((member.kycStatus || 'UNVERIFIED') !== 'VERIFIED') {
      return {
        title: mt('completeKycTitle'),
        text: mt('completeKycText'),
        button: mt('completeKycBtn'),
        target: 'drawer'
      }
    }
    if (requiredPosts > 0 && approvedPosts < requiredPosts) {
      return {
        title: mt('morePostsTitle', { count: requiredPosts - approvedPosts }),
        text: mt('morePostsText', { required: requiredPosts }),
        button: mt('uploadStory'),
        target: 'credits',
        sub: 'earn'
      }
    }
    if (!activeFunnel) {
      return {
        title: mt('activateFunnelTitle'),
        text: mt('activateFunnelText'),
        button: mt('goActivate'),
        target: 'store'
      }
    }
    return {
      title: mt('continueEarnTitle'),
      text: mt('continueEarnText'),
      button: mt('goEarn'),
      target: 'credits',
      sub: 'earn'
    }
  }, [member.kycStatus, requiredPosts, approvedPosts, activeFunnel, lang])

  async function copyReferral() {
    try {
      await navigator.clipboard.writeText(referralUrl)
      setMsg(mt('referralCopied'))
    } catch {
      setMsg(referralUrl || '系统还没有 referral code。')
    }
  }

  async function copyText(text, success = '已复制。') {
    try { await navigator.clipboard.writeText(text || ''); setMsg(success) } catch { setMsg(text || '') }
  }

  async function upload(file, setter, key) {
    if (!file) return
    setMsg(mt('uploading'))
    try {
      const fd = new FormData()
      fd.append('file', file)
      const up = await api('/api/upload/media', { method:'POST', body: fd })
      setter(v => ({ ...v, [key]: up.url }))
      setMsg(mt('uploadSuccess'))
    } catch (e) { setMsg(e.message) }
  }

  async function topup(e) {
    e.preventDefault()
    setMsg('')
    try {
      const result = await api('/api/billing/merchant/topup', { method:'POST', body: JSON.stringify({ amount: Number(topupAmount) }) })
      setMsg(result.message || mt('topupBillCreated'))
      if (result.billUrl) window.location.href = result.billUrl
      else load()
    } catch (e) { setMsg(e.message) }
  }

  async function purchase(item) {
    const displayItem = localizeStoreItem(item, lang)
    const cap = pct(member.bonusCap)
    const maxBonus = Number(item.price || 0) * Number(member.bonusCap || 0)
    const planCode = getPlanCodeFromItem(item)
    const hasFunnel = Boolean(member.hasActiveFunnel || member.planStatus === 'ACTIVE')
    if (planCode && hasFunnel && member.plan === planCode) {
      setMsg(mt('sameFunnelNoCharge'))
      return
    }
    const message = planCode && hasFunnel
      ? mt('confirmSwitch', { name: displayItem.name })
      : mt('confirmPurchase', { name: displayItem.name, price: money(item.price), bonus: money(maxBonus), cap })
    if (!confirm(message)) return
    setMsg('')
    try {
      const result = await api('/api/member/store/purchase', { method:'POST', body: JSON.stringify({ itemId: item.id }) })
      setMsg(result.message || mt('purchaseSuccess'))
      await load()
    } catch (e) { setMsg(e.message) }
  }

  async function submitKyc(e) {
    e.preventDefault()
    setMsg('')
    try {
      const result = await api('/api/member/kyc', { method:'POST', body: JSON.stringify(kyc) })
      setMsg(result.message || mt('kycSubmitted'))
      await load()
    } catch (e) { setMsg(e.message) }
  }

  async function submitProof(e) {
    e.preventDefault()
    setMsg('')
    try {
      const result = await api('/api/member/social-proof', { method:'POST', body: JSON.stringify(proof) })
      setMsg(result.message || mt('proofSubmitted'))
      setProof({ platform:'Instagram', postType:'STORY', proofImageUrl:'', postUrl:'', caption:'' })
      await load()
    } catch (e) { setMsg(e.message) }
  }

  async function logout() {
    await doLogout()
    window.location.href = '/login'
  }

  return <main className="lf-app-shell">
    <MemberStyles />
    <DesktopSidebar active={active} setActive={setActive} member={member} mt={mt} logout={logout} />
    <section className="lf-phone-shell lf-content-shell">

    <header className="lf-mobile-header">
      <button className="lf-icon-btn" onClick={() => setDrawerOpen(true)} aria-label={mt('menu')}>☰</button>
      <div>
        <strong>{mt('linkfloMember')}</strong>
        <small>{tierText[member.memberTier] || member.tierLabel || 'Member'}</small>
      </div>
      <div className="lf-header-actions">
        <LanguageToggle compact />
        <button className="lf-bell" onClick={() => setNoticeOpen(v => !v)} aria-label={mt('notifications')}>🔔</button>
      </div>
    </header>

    {noticeOpen && <section className="lf-notice-panel">
      <div className="lf-section-title"><h2>{mt('notifications')}</h2><button onClick={() => setNoticeOpen(false)}>×</button></div>
      <div className="lf-list">
        <div className="lf-list-row"><b>{mt('bonusCredit')}</b><span>Info</span><small>{mt('continueEarnText')}</small></div>
        {requiredPosts > 0 && approvedPosts < requiredPosts && <div className="lf-list-row"><b>{mt('monthlyMission')}</b><span>{approvedPosts}/{requiredPosts}</span><small>{mt('maintainLevel', { count: Math.max(0, requiredPosts - approvedPosts) })}</small></div>}
        {activeFunnel && <div className="lf-list-row"><b>{mt('aiFunnel')}</b><span>Active</span><small>{mt('nextBilling', { date: member.nextBillingAt ? new Date(member.nextBillingAt).toLocaleDateString() : '-' })}</small></div>}
      </div>
    </section>}

    {msg && <div className={msg.toLowerCase().includes('不足') || msg.toLowerCase().includes('error') || msg.toLowerCase().includes('failed') ? 'lf-toast bad' : 'lf-toast'}>{msg}</div>}
    {syncing && <div className="lf-sync-pill">{mt('syncing')}</div>}

    {active === 'home' && <>
      <section className="lf-welcome-card">
        <div>
          <p>{mt('hello')}, {member.brandName || mt('member')} 👋</p>
          <h1>{mt('thanksSupport')}</h1>
          <span className="lf-pill soft">{member.kycStatus === 'VERIFIED' ? mt('verifiedMember') : mt('unverifiedMember')}</span>
        </div>
      </section>

      <section className="lf-credit-grid">
        <CreditCard title={mt('paidCredit')} value={`RM ${money(member.paidCredit)}`} icon="💳" tone="blue" />
        <CreditCard title={mt('bonusCredit')} value={`RM ${money(member.bonusCredit)}`} icon="🎁" tone="pink" />
      </section>

      <section className="lf-soft-card lf-bonus-card">
        <div className="lf-row between">
          <div>
            <p className="lf-label">{mt('bonusCap')}</p>
            <h2>{bonusCapPercent}%</h2>
          </div>
          <button className="lf-text-btn" onClick={() => setDrawerOpen(true)}>{mt('viewDetails')}</button>
        </div>
        <Progress value={bonusCapPercent} max={50} />
        <p className="lf-muted">{mt('bonusCapHelp')}</p>
      </section>

      <section className="lf-soft-card lf-next-card">
        <p className="lf-label">{mt('nextStep')}</p>
        <h2>{nextStep.title}</h2>
        <p>{nextStep.text}</p>
        <button className="lf-main-btn" onClick={() => navigate(nextStep.target, nextStep.sub)}>{nextStep.button}</button>
      </section>

      <section className="lf-soft-card mission-preview">
        <div className="lf-row between">
          <div>
            <p className="lf-label">{mt('monthlyMissionProgress')}</p>
            <h2>{approvedPosts} / {requiredPosts || 0}</h2>
          </div>
          <span className="lf-target">🎯</span>
        </div>
        <Progress value={missionPercent} />
        <p className="lf-muted">{requiredPosts > 0 ? mt('maintainLevel', { count: Math.max(0, requiredPosts - approvedPosts) }) : mt('noMonthlyRequired')}</p>
        <button className="lf-light-btn" onClick={() => navigate('credits','earn')}>{mt('submitStoryProof')}</button>
      </section>

      <QuickActions navigate={navigate} mt={mt} />

      <section className="lf-soft-card">
        <div className="lf-section-title"><h2>{mt('myProducts')}</h2></div>
        <ProductStatus activeFunnel={activeFunnel} member={member} setActive={setActive} mt={mt} />
      </section>

      <section className="lf-soft-card">
        <div className="lf-section-title"><h2>{mt('recommended')}</h2><button onClick={() => setActive('store')}>{mt('all')}</button></div>
        {featuredItems.slice(0, 3).map(item => <StoreMini key={item.id} item={item} cap={member.bonusCap} member={member} lang={lang} mt={mt} onBuy={() => purchase(item)} />)}
        {!featuredItems.length && <p className="lf-muted">{mt('noStoreItems')}</p>}
      </section>
    </>}


    {active === 'credits' && <>
      <section className="lf-page-title"><h1>{mt('creditsTitle')}</h1><p>{mt('creditsDesc')}</p></section>
      <section className="lf-credit-tabs">
        <button className={creditsTab === 'wallet' ? 'active' : ''} onClick={() => setCreditsTab('wallet')}>💳 {mt('walletTab')}</button>
        <button className={creditsTab === 'earn' ? 'active' : ''} onClick={() => setCreditsTab('earn')}>🎯 {mt('earnTab')}</button>
        <button className={creditsTab === 'rewards' ? 'active' : ''} onClick={() => setCreditsTab('rewards')}>🎁 {mt('rewardsTab')}</button>
      </section>

      {creditsTab === 'wallet' && <>
        <section className="lf-total-card">
          <p>{mt('totalCredit')}</p>
          <h1>RM {money(Number(member.paidCredit || 0) + Number(member.bonusCredit || 0))}</h1>
          <div className="lf-credit-grid compact">
            <CreditCard title="Paid" value={`RM ${money(member.paidCredit)}`} icon="💳" tone="blue" />
            <CreditCard title="Bonus" value={`RM ${money(member.bonusCredit)}`} icon="🎁" tone="pink" />
          </div>
        </section>
        <section className="lf-soft-card">
          <div className="lf-section-title"><h2>{mt('topupPaidCredit')}</h2></div>
          <form className="lf-form" onSubmit={topup}>
            <input type="number" min="100" value={topupAmount} onChange={e=>setTopupAmount(e.target.value)} />
            <button className="lf-main-btn">{mt('topup')}</button>
          </form>
        </section>
        <section className="lf-soft-card">
          <div className="lf-section-title"><h2>{mt('recentTransactions')}</h2></div>
          <div className="lf-list">
            {(data?.ledgers || []).map(l => <div className="lf-list-row" key={l.id}><b>{l.bucket} {l.direction} {money(l.amount)}</b><span>{l.category}</span><small>{new Date(l.createdAt).toLocaleString()}｜After: {money(l.balanceAfter)}</small></div>)}
            {!(data?.ledgers || []).length && <p className="lf-muted">{mt('noTransactions')}</p>}
          </div>
        </section>
      </>}

      {creditsTab === 'earn' && <>
        <section className="lf-soft-card">
          <p className="lf-label">{mt('myReferralLink')}</p>
          <div className="lf-ref-box">{referralUrl || mt('noReferral')}</div>
          <div className="lf-two-btns">
            <button className="lf-main-btn" onClick={copyReferral}>{mt('copyLink')}</button>
            <button className="lf-light-btn" onClick={() => referralUrl && window.open(`https://wa.me/?text=${encodeURIComponent(referralUrl)}`,'_blank')}>{mt('shareWhatsApp')}</button>
          </div>
        </section>
        <section className="lf-soft-card">
          <div className="lf-row between">
            <div><p className="lf-label">{mt('monthlyMission')}</p><h2>{approvedPosts} / {requiredPosts || 0} {mt('posts')}</h2></div>
            <span className="lf-target">🎯</span>
          </div>
          <Progress value={missionPercent} />
        </section>
        <section className="lf-soft-card">
          <div className="lf-section-title"><h2>{mt('marketingMaterials')}</h2></div>
          <div className="lf-material-list">
            {(data?.materials || []).map(m => <div className="lf-material" key={m.id}>
              <span>{m.type === 'VIDEO' ? '🎬' : m.type === 'CAPTION' ? '✍️' : '🖼️'}</span>
              <div><b>{m.title}</b><small>{m.platform} · {m.language || 'ALL'}</small>{m.caption && <p>{m.caption}</p>}</div>
              <div className="lf-material-actions">{m.fileUrl && <a href={m.fileUrl} target="_blank">{mt('open')}</a>}{m.caption && <button onClick={() => copyText(m.caption, mt('captionCopied'))}>{mt('copy')}</button>}</div>
            </div>)}
            {!(data?.materials || []).length && <p className="lf-muted">{mt('noMaterials')}</p>}
          </div>
        </section>
        <section className="lf-soft-card">
          <div className="lf-section-title"><h2>{mt('submitProof')}</h2></div>
          <form className="lf-form" onSubmit={submitProof}>
            <select value={proof.platform} onChange={e=>setProof({...proof, platform:e.target.value})}><option>Instagram</option><option>Facebook</option><option>TikTok</option><option>WhatsApp Status</option><option>小红书</option></select>
            <select value={proof.postType} onChange={e=>setProof({...proof, postType:e.target.value})}><option value="STORY">Story</option><option value="POST">Post</option><option value="VIDEO">Video</option><option value="STATUS">Status</option></select>
            <input placeholder={mt('postUrlOptional')} value={proof.postUrl} onChange={e=>setProof({...proof, postUrl:e.target.value})} />
            <textarea placeholder={mt('captionOptional')} value={proof.caption} onChange={e=>setProof({...proof, caption:e.target.value})} />
            <label className="lf-upload">{mt('uploadProof')}<input type="file" accept="image/*" onChange={e=>upload(e.target.files?.[0], setProof, 'proofImageUrl')} /></label>
            {proof.proofImageUrl && <small className="lf-uploaded">{mt('uploaded', { url: proof.proofImageUrl })}</small>}
            <button className="lf-main-btn">{mt('submitProof')}</button>
          </form>
        </section>
      </>}

      {creditsTab === 'rewards' && <>
        <section className="lf-soft-card">
          <div className="lf-section-title"><h2>{mt('referralHistory')}</h2></div>
          <div className="lf-stats-grid">
            <CreditCard title="Referrals" value={member.referralCount || 0} icon="👥" tone="blue" />
            <CreditCard title="Paid Referrals" value={member.paidReferralCount || 0} icon="💰" tone="pink" />
          </div>
        </section>
        <section className="lf-soft-card">
          <div className="lf-section-title"><h2>{mt('proofRecords')}</h2></div>
          <div className="lf-list">
            {(data?.proofs || []).map(p => <div key={p.id} className="lf-list-row"><b>{p.platform} · {p.postType}</b><span>{p.status}</span><small>{p.adminNote || p.caption || '-'}</small></div>)}
            {!(data?.proofs || []).length && <p className="lf-muted">{mt('noProofRecords')}</p>}
          </div>
        </section>
      </>}
    </>}

    {active === 'earn' && <>
      <section className="lf-page-title"><h1>{mt('earnTitle')}</h1><p>{mt('earnSub')}</p></section>

      <section className="lf-soft-card">
        <p className="lf-label">{mt('myReferralLink')}</p>
        <div className="lf-ref-box">{referralUrl || mt('noReferral')}</div>
        <div className="lf-two-btns">
          <button className="lf-main-btn" onClick={copyReferral}>{mt('copyLink')}</button>
          <button className="lf-light-btn" onClick={() => referralUrl && window.open(`https://wa.me/?text=${encodeURIComponent(referralUrl)}`,'_blank')}>{mt('shareWhatsApp')}</button>
        </div>
      </section>

      <section className="lf-soft-card">
        <div className="lf-row between">
          <div><p className="lf-label">{mt('monthlyMission')}</p><h2>{approvedPosts} / {requiredPosts || 0} {mt('posts')}</h2></div>
          <span className="lf-target">🎯</span>
        </div>
        <Progress value={missionPercent} />
      </section>

      <section className="lf-soft-card">
        <div className="lf-section-title"><h2>{mt('marketingMaterials')}</h2></div>
        <div className="lf-material-list">
          {(data?.materials || []).map(m => <div className="lf-material" key={m.id}>
            <span>{m.type === 'VIDEO' ? '🎬' : m.type === 'CAPTION' ? '✍️' : '🖼️'}</span>
            <div>
              <b>{m.title}</b>
              <small>{m.platform} · {m.language || 'ALL'}</small>
              {m.caption && <p>{m.caption}</p>}
            </div>
            <div className="lf-material-actions">
              {m.fileUrl && <a href={m.fileUrl} target="_blank">Open</a>}
              {m.caption && <button onClick={() => copyText(m.caption, 'Caption 已复制。')}>Copy</button>}
            </div>
          </div>)}
          {!(data?.materials || []).length && <p className="lf-muted">{mt('noMaterials')}</p>}
        </div>
      </section>

      <section className="lf-soft-card">
        <div className="lf-section-title"><h2>{mt('submitProof')}</h2></div>
        <form className="lf-form" onSubmit={submitProof}>
          <select value={proof.platform} onChange={e=>setProof({...proof, platform:e.target.value})}><option>Instagram</option><option>Facebook</option><option>TikTok</option><option>WhatsApp Status</option><option>小红书</option></select>
          <select value={proof.postType} onChange={e=>setProof({...proof, postType:e.target.value})}><option value="STORY">Story</option><option value="POST">Post</option><option value="VIDEO">Video</option><option value="STATUS">Status</option></select>
          <input placeholder={mt('postUrlOptional')} value={proof.postUrl} onChange={e=>setProof({...proof, postUrl:e.target.value})} />
          <textarea placeholder={mt('captionOptional')} value={proof.caption} onChange={e=>setProof({...proof, caption:e.target.value})} />
          <label className="lf-upload">{mt('uploadProof')}<input type="file" accept="image/*" onChange={e=>upload(e.target.files?.[0], setProof, 'proofImageUrl')} /></label>
          {proof.proofImageUrl && <small className="lf-uploaded">{mt('uploaded', { url: proof.proofImageUrl })}</small>}
          <button className="lf-main-btn">{mt('submitProof')}</button>
        </form>
      </section>

      <section className="lf-soft-card">
        <div className="lf-section-title"><h2>{mt('proofRecords')}</h2></div>
        <div className="lf-list">
          {(data?.proofs || []).map(p => <div key={p.id} className="lf-list-row"><b>{p.platform} · {p.postType}</b><span>{p.status}</span><small>{p.adminNote || p.caption || '-'}</small></div>)}
          {!(data?.proofs || []).length && <p className="lf-muted">{mt('noProofRecords')}</p>}
        </div>
      </section>
    </>}

    {active === 'store' && <>
      <section className="lf-hub-hero">
        <div>
          <p className="lf-label">AI PRODUCT HUB</p>
          <h1>{mt('productStore')}</h1>
          <p>{mt('productStoreDesc')}</p>
        </div>
        <div className="lf-hub-search">🔎 {mt('searchAiProducts')}</div>
      </section>
      <section className="lf-category-row">
        {storeCategories.map(cat => <button key={cat} className={activeCategory === cat ? 'active' : ''} onClick={() => setActiveCategory(cat)}>{cat}</button>)}
      </section>
      {!!featuredItems.length && <section className="lf-featured-strip">
        <div className="lf-section-title"><h2>{mt('featuredAiProducts')}</h2><button onClick={() => setActiveCategory('All')}>{mt('all')}</button></div>
        <div className="lf-featured-grid">
          {featuredItems.map(item => <StoreMini key={item.id} item={item} cap={member.bonusCap} member={member} lang={lang} mt={mt} onBuy={() => purchase(item)} />)}
        </div>
      </section>}
      <section className="lf-store-grid">
        {visibleStoreItems.map(item => <StoreCard key={item.id} item={item} cap={member.bonusCap} member={member} lang={lang} mt={mt} onBuy={() => purchase(item)} />)}
      </section>
      {!visibleStoreItems.length && <section className="lf-soft-card"><p className="lf-muted">{mt('noStoreItems')}</p></section>}
    </>}

    {active === 'wallet' && <>
      <section className="lf-page-title"><h1>{mt('wallet')}</h1><p>{mt('walletDesc')}</p></section>
      <section className="lf-total-card">
        <p>{mt('totalCredit')}</p>
        <h1>RM {money(Number(member.paidCredit || 0) + Number(member.bonusCredit || 0))}</h1>
        <div className="lf-credit-grid compact">
          <CreditCard title="Paid" value={`RM ${money(member.paidCredit)}`} icon="💳" tone="blue" />
          <CreditCard title="Bonus" value={`RM ${money(member.bonusCredit)}`} icon="🎁" tone="pink" />
        </div>
      </section>
      <section className="lf-soft-card">
        <div className="lf-section-title"><h2>{mt('topupPaidCredit')}</h2></div>
        <form className="lf-form" onSubmit={topup}>
          <input type="number" min="100" value={topupAmount} onChange={e=>setTopupAmount(e.target.value)} />
          <button className="lf-main-btn">{mt('topup')}</button>
        </form>
      </section>
      <section className="lf-soft-card">
        <div className="lf-section-title"><h2>{mt('recentTransactions')}</h2></div>
        <div className="lf-list">
          {(data?.ledgers || []).map(l => <div className="lf-list-row" key={l.id}><b>{l.bucket} {l.direction} {money(l.amount)}</b><span>{l.category}</span><small>{new Date(l.createdAt).toLocaleString()}｜After: {money(l.balanceAfter)}</small></div>)}
          {!(data?.ledgers || []).length && <p className="lf-muted">{mt('noTransactions')}</p>}
        </div>
      </section>
    </>}

    {active === 'funnel' && <>
      <section className="lf-page-title"><h1>{mt('myAiProducts')}</h1><p>{mt('myAiDesc')}</p></section>
      <section className="lf-soft-card">
        <div className="lf-section-title"><h2>{mt('aiFunnelWorkspaces')}</h2><button onClick={() => setActive('store')}>{mt('createNewFunnel')}</button></div>
        <ProductStatus activeFunnel={activeFunnel} member={member} setActive={setActive} mt={mt} large />
      </section>
      {(data?.subscriptions || []).filter(s => !String(s.productCode || '').startsWith('FUNNEL_') && s.status === 'ACTIVE').map(sub => {
        const item = localizeStoreItem(sub.productItem || { code: sub.productCode, name: sub.productCode, description: '' }, lang)
        return <section className="lf-soft-card lf-owned-product" key={sub.id}>
          <div className="lf-product-status"><div className="lf-product-icon">{productTone(item).icon}</div><div><h3>{item.name}</h3><p>{sub.status} · {sub.nextBillingAt ? mt('nextBilling', { date: new Date(sub.nextBillingAt).toLocaleDateString() }) : mt('openProduct')}</p></div><button className="lf-light-btn">{mt('openProduct')}</button></div>
        </section>
      })}
      {!activeFunnel && !(data?.subscriptions || []).some(s => s.status === 'ACTIVE') && <section className="lf-soft-card"><p className="lf-muted">{mt('noActiveProducts')}</p><button className="lf-main-btn" onClick={() => setActive('store')}>{mt('productStore')}</button></section>}
    </>}

    {active === 'menu' && <>
      <section className="lf-page-title"><h1>{mt('menu')}</h1><p>{mt('menuDesc')}</p></section>

      <section className="lf-soft-card">
        <div className="lf-section-title"><h2>{mt('kycVerification')}</h2><span className="lf-pill">{member.kycStatus || 'UNVERIFIED'}</span></div>
        <p className="lf-muted">{mt('kycHint')}</p>
        <form className="lf-form" onSubmit={submitKyc}>
          <input placeholder="Full name / 真实姓名" value={kyc.fullName} onChange={e=>setKyc({...kyc, fullName:e.target.value})} />
          <input placeholder="IC / Passport no." value={kyc.icNumber} onChange={e=>setKyc({...kyc, icNumber:e.target.value})} />
          <input placeholder="Phone / WhatsApp" value={kyc.phone} onChange={e=>setKyc({...kyc, phone:e.target.value})} />
          <input placeholder="Social media profile link" value={kyc.socialProfile} onChange={e=>setKyc({...kyc, socialProfile:e.target.value})} />
          <label className="lf-upload">IC Front<input type="file" accept="image/*" onChange={e=>upload(e.target.files?.[0], setKyc, 'icFrontUrl')} /></label>
          <label className="lf-upload">IC Back<input type="file" accept="image/*" onChange={e=>upload(e.target.files?.[0], setKyc, 'icBackUrl')} /></label>
          <label className="lf-upload">Selfie<input type="file" accept="image/*" onChange={e=>upload(e.target.files?.[0], setKyc, 'selfieUrl')} /></label>
          <button className="lf-main-btn">{mt('submitKyc')}</button>
        </form>
        {data?.kyc && <p className="lf-muted">{mt('latestKycStatus')}<b>{data.kyc.status}</b> {data.kyc.adminNote ? `｜${data.kyc.adminNote}` : ''}</p>}
      </section>

      <section className="lf-soft-card">
        <div className="lf-menu-list">
          <Link href="/member/funnel">进入 Funnel Dashboard</Link>
          <button onClick={() => setActive('earn')}>Marketing Library / Submit Proof</button>
          <button onClick={() => setActive('wallet')}>{mt('recentTransactions')}</button>
          <button onClick={logout}>{mt('logout')}</button>
        </div>
      </section>
    </>}

    {drawerOpen && <div className="lf-drawer-backdrop" onClick={() => setDrawerOpen(false)}>
      <aside className="lf-drawer" onClick={e => e.stopPropagation()}>
        <div className="lf-section-title"><h2>{mt('drawerTitle')}</h2><button onClick={() => setDrawerOpen(false)}>×</button></div>
        <div className="lf-menu-list">
          <button onClick={() => navigate('home')}>{mt('home')}</button>
          <button onClick={() => navigate('store')}>{mt('productStore')}</button>
          <button onClick={() => navigate('funnel')}>{mt('myAiProducts')}</button>
          <button onClick={() => navigate('credits','wallet')}>{mt('wallet')}</button>
          <button onClick={() => navigate('credits','earn')}>{mt('earnTitle')}</button>
          <button onClick={() => navigate('credits','rewards')}>{mt('rewardsTab')}</button>
          <Link href="/member/funnel">AI Funnel Workspace</Link>
        </div>
        <details className="lf-drawer-details">
          <summary>{mt('kycDrawerHint')} · {member.kycStatus || 'UNVERIFIED'}</summary>
          <p className="lf-muted">{mt('kycHint')}</p>
          <form className="lf-form" onSubmit={submitKyc}>
            <input placeholder="Full name / 真实姓名" value={kyc.fullName} onChange={e=>setKyc({...kyc, fullName:e.target.value})} />
            <input placeholder="IC / Passport no." value={kyc.icNumber} onChange={e=>setKyc({...kyc, icNumber:e.target.value})} />
            <input placeholder="Phone / WhatsApp" value={kyc.phone} onChange={e=>setKyc({...kyc, phone:e.target.value})} />
            <input placeholder="Social media profile link" value={kyc.socialProfile} onChange={e=>setKyc({...kyc, socialProfile:e.target.value})} />
            <label className="lf-upload">IC Front<input type="file" accept="image/*" onChange={e=>upload(e.target.files?.[0], setKyc, 'icFrontUrl')} /></label>
            <label className="lf-upload">IC Back<input type="file" accept="image/*" onChange={e=>upload(e.target.files?.[0], setKyc, 'icBackUrl')} /></label>
            <label className="lf-upload">Selfie<input type="file" accept="image/*" onChange={e=>upload(e.target.files?.[0], setKyc, 'selfieUrl')} /></label>
            <button className="lf-main-btn">{mt('submitKyc')}</button>
          </form>
        </details>
        <div className="lf-menu-list">
          <button onClick={() => setMsg(mt('ordersBilling'))}>{mt('ordersBilling')}</button>
          <button onClick={() => setMsg(mt('supportHelp'))}>{mt('supportHelp')}</button>
          <button onClick={() => setMsg(mt('accountSettings'))}>{mt('accountSettings')}</button>
          <button onClick={logout}>{mt('logout')}</button>
        </div>
      </aside>
    </div>}

    <nav className="lf-bottom-nav">
      <NavButton active={active === 'home'} icon="🏠" label={mt('home')} onClick={() => navigate('home')} />
      <NavButton active={active === 'store'} icon="🧠" label={mt('hub')} onClick={() => navigate('store')} />
      <NavButton active={active === 'funnel'} icon="🤖" label={mt('myAi')} onClick={() => navigate('funnel')} />
      <NavButton active={active === 'credits'} icon="💎" label={mt('credits')} onClick={() => navigate('credits','wallet')} />
    </nav>
  </section>
  </main>
}

function DesktopSidebar({ active, setActive, member, mt, logout }) {
  const items = [
    ['home','⌂',mt('home')], ['store','◈',mt('productStore')], ['funnel','△',mt('myAiProducts')], ['credits','◎',mt('creditsTitle')]
  ]
  return <aside className="lf-desktop-sidebar">
    <div className="lf-side-brand"><span>∞</span><b>Linkflo</b></div>
    <nav>
      {items.map(([key, icon, label]) => <button key={key} className={active === key ? 'active' : ''} onClick={() => setActive(key)}><span>{icon}</span>{label}</button>)}
    </nav>
    <div className="lf-side-card">
      <b>{tierIcon[member.memberTier] || '✨'} {tierText[member.memberTier] || 'Member'}</b>
      <small>Bonus cap {pct(member.bonusCap)}%</small>
      <button onClick={() => setActive('credits')}>View Credits</button>
    </div>
    <button className="lf-side-logout" onClick={logout}>Logout</button>
  </aside>
}

function CreditCard({ title, value, icon, tone }) {
  return <div className={`lf-credit-card ${tone || ''}`}>
    <div><p>{title}</p><h3>{value}</h3></div>
    <span>{icon}</span>
  </div>
}

function Progress({ value, max = 100 }) {
  const width = Math.max(0, Math.min(100, Math.round((Number(value || 0) / Number(max || 100)) * 100)))
  return <div className="lf-progress"><i style={{ width: `${width}%` }} /></div>
}

function QuickActions({ navigate, mt }) {
  return <section className="lf-quick-row">
    <button onClick={() => navigate('credits','earn')}><span>📤</span>{mt('quickUpload')}</button>
    <button onClick={() => navigate('credits','earn')}><span>👥</span>{mt('inviteFriends')}</button>
    <button onClick={() => navigate('credits','earn')}><span>🖼️</span>{mt('materialLibrary')}</button>
    <button onClick={() => navigate('store')}><span>🛒</span>{mt('buyService')}</button>
  </section>
}

function ProductStatus({ activeFunnel, member, setActive, large, mt }) {
  if (!activeFunnel) {
    return <div className={large ? 'lf-product-status large' : 'lf-product-status'}>
      <div className="lf-product-icon">🚀</div>
      <div>
        <h3>{mt('aiFunnelNotActive')}</h3>
        <p>{mt('aiFunnelNotActiveDesc')}</p>
      </div>
      <button className="lf-main-btn" onClick={() => setActive('store')}>{mt('activateFunnel')}</button>
    </div>
  }
  return <div className={large ? 'lf-product-status large' : 'lf-product-status'}>
    <div className="lf-product-icon">🚀</div>
    <div>
      <h3>AI Funnel - {member.plan || 'Active'}</h3>
      <p>{mt('nextBilling', { date: member.nextBillingAt ? new Date(member.nextBillingAt).toLocaleDateString() : '-' })}</p>
    </div>
    <Link className="lf-main-btn as-link" href="/member/funnel">{mt('openFunnel')}</Link>
  </div>
}

function StoreMini({ item, cap, member, lang, mt, onBuy }) {
  const displayItem = localizeStoreItem(item, lang)
  const tone = productTone(displayItem)
  const maxBonus = Number(item.price || 0) * Number(cap || 0)
  const planCode = getPlanCodeFromItem(item)
  const isCurrent = Boolean(planCode && (member?.hasActiveFunnel || member?.planStatus === 'ACTIVE') && member?.plan === planCode)
  return <div className={`lf-store-mini ${tone.color}`}>
    <span className="lf-mini-icon">{tone.icon}</span>
    <div>
      <em>{tone.category}</em>
      <b>{displayItem.name}</b>
      <small>{money(item.price)} Credits</small>
      <p>{mt('bonusMax')} {money(maxBonus)} Credits ({pct(cap)}%)</p>
    </div>
    <button disabled={isCurrent} onClick={onBuy}>{productActionText(item, mt, member)}</button>
  </div>
}

function StoreCard({ item, cap, member, lang, mt, onBuy }) {
  const displayItem = localizeStoreItem(item, lang)
  const tone = productTone(displayItem)
  const maxBonus = Number(item.price || 0) * Number(cap || 0)
  const needPaid = Math.max(0, Number(item.price || 0) - maxBonus)
  const planCode = getPlanCodeFromItem(item)
  const hasFunnel = Boolean(member?.hasActiveFunnel || member?.planStatus === 'ACTIVE')
  const isCurrent = Boolean(planCode && hasFunnel && member?.plan === planCode)
  const isSwitch = Boolean(planCode && hasFunnel && member?.plan !== planCode)
  const buttonText = productActionText(item, mt, member)
  return <section className={`lf-soft-card lf-store-card ${tone.color}`}>
    <div className="lf-store-top">
      <span className="lf-store-icon">{tone.icon}</span>
      <div>
        <span className="lf-pill">{isCurrent ? mt('alreadyActivated') : tone.category}</span>
        <h2>{displayItem.name}</h2>
        <p>{displayItem.description || mt('productService')}</p>
      </div>
    </div>
    <div className="lf-price-box">
      <div><small>{mt('price')}</small><b>{money(item.price)} Credits</b></div>
      <div><small>{mt('bonusMax')}</small><b>{money(maxBonus)} Credits</b></div>
      <div><small>{mt('needPaid')}</small><b>{money(needPaid)} Credits</b></div>
    </div>
    <button className="lf-main-btn" disabled={isCurrent} onClick={onBuy}>{buttonText}</button>
  </section>
}

function NavButton({ active, icon, label, onClick }) {
  return <button className={active ? 'active' : ''} onClick={onClick}><span>{icon}</span><small>{label}</small></button>
}

function MemberStyles(){return <style jsx global>{`
:root{--lf-bg:#f7f8fd;--lf-text:#182033;--lf-muted:#7b8497;--lf-blue:#4f8dff;--lf-purple:#8b5cf6;--lf-card:#ffffff;--lf-border:#eef1f7;--lf-shadow:0 18px 48px rgba(55,65,81,.10)}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 20% 0%,#eef6ff 0,#f7f8fd 34%,#fbfbff 100%);color:var(--lf-text)}button,input,select,textarea{font:inherit}.lf-phone-shell{width:100%;max-width:480px;min-height:100vh;margin:0 auto;padding:14px 14px 104px;background:linear-gradient(180deg,#fbfcff 0%,#f6f8ff 100%);position:relative}.lf-mobile-header{position:sticky;top:0;z-index:50;display:grid;grid-template-columns:42px 1fr auto;align-items:center;gap:10px;padding:10px 0 12px;background:linear-gradient(180deg,rgba(251,252,255,.96),rgba(251,252,255,.78));backdrop-filter:blur(16px)}.lf-mobile-header strong{display:block;text-align:center;font-size:16px}.lf-mobile-header small{display:block;text-align:center;color:var(--lf-muted);font-size:11px;margin-top:2px}.lf-icon-btn,.lf-bell{width:38px;height:38px;border:0;border-radius:15px;background:#fff;box-shadow:0 8px 22px rgba(40,50,90,.08);cursor:pointer}.lf-header-actions{display:flex;align-items:center;gap:6px}.lf-toast{position:sticky;top:64px;z-index:60;margin:4px 0 12px;padding:12px 14px;border-radius:18px;background:#ecfdf5;border:1px solid #bbf7d0;color:#065f46;font-weight:800;box-shadow:0 12px 30px rgba(16,185,129,.12)}.lf-toast.bad{background:#fff1f2;border-color:#fecdd3;color:#9f1239}.lf-sync-pill{position:fixed;right:18px;top:72px;z-index:70;background:rgba(255,255,255,.92);border:1px solid #e6ebf5;border-radius:999px;padding:7px 10px;color:#6b7280;font-size:12px;font-weight:900;box-shadow:0 10px 26px rgba(40,50,90,.10);backdrop-filter:blur(12px)}.lf-loading-card,.lf-welcome-card,.lf-soft-card,.lf-total-card{background:rgba(255,255,255,.9);border:1px solid var(--lf-border);border-radius:26px;box-shadow:var(--lf-shadow);backdrop-filter:blur(14px)}.lf-loading-card{padding:28px;margin-top:30vh;text-align:center}.lf-loading-card p{color:var(--lf-muted)}.lf-welcome-card{padding:22px;margin:10px 0 14px;background:linear-gradient(135deg,#fff 0%,#fbf7ff 54%,#f1f7ff 100%)}.lf-welcome-card p{margin:0 0 4px;color:#4b5563;font-weight:800}.lf-welcome-card h1{margin:0 0 12px;font-size:24px;letter-spacing:-.7px}.lf-pill{display:inline-flex;align-items:center;gap:6px;border:1px solid #e8dcff;background:#f3edff;color:#6d28d9;border-radius:999px;padding:6px 10px;font-weight:900;font-size:12px;width:max-content}.lf-pill.soft{background:#f0edff}.lf-credit-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 14px}.lf-credit-grid.compact{margin:14px 0 0}.lf-credit-card{min-height:112px;border-radius:22px;padding:16px;display:flex;flex-direction:column;justify-content:space-between;border:1px solid var(--lf-border);box-shadow:0 12px 34px rgba(40,50,90,.08)}.lf-credit-card.blue{background:linear-gradient(135deg,#eff7ff,#f7fbff)}.lf-credit-card.pink{background:linear-gradient(135deg,#fff1f3,#fff8ef)}.lf-credit-card p{margin:0;color:#4b5563;font-weight:800;font-size:12px}.lf-credit-card h3{margin:7px 0 0;font-size:19px;letter-spacing:-.4px}.lf-credit-card span{font-size:24px}.lf-soft-card{padding:17px;margin:0 0 14px}.lf-bonus-card{background:linear-gradient(135deg,#fff,#f5f0ff)}.lf-next-card{background:linear-gradient(135deg,#fffaf1,#fff)}.mission-preview{background:linear-gradient(135deg,#eef9ff,#fff)}.lf-row{display:flex;align-items:center;gap:10px}.lf-row.between{justify-content:space-between}.lf-label{margin:0 0 5px;color:#64748b;font-size:12px;font-weight:900;letter-spacing:.03em}.lf-soft-card h2,.lf-page-title h1{margin:0;font-size:23px;letter-spacing:-.6px}.lf-soft-card p{line-height:1.45}.lf-muted{color:var(--lf-muted);font-size:13px}.lf-text-btn{border:0;background:transparent;color:#4f46e5;font-weight:900;cursor:pointer}.lf-main-btn,.lf-light-btn{border:0;border-radius:17px;font-weight:950;cursor:pointer;text-align:center;text-decoration:none}.lf-main-btn:disabled,.lf-store-mini button:disabled{opacity:.55;cursor:not-allowed;box-shadow:none}.lf-main-btn{background:linear-gradient(135deg,#6d8dff,#8b5cf6);color:#fff;padding:13px 16px;box-shadow:0 14px 30px rgba(99,102,241,.22)}.lf-main-btn.as-link{display:inline-flex;justify-content:center;align-items:center}.lf-light-btn{background:#f2f5ff;color:#4f46e5;padding:12px 14px}.lf-progress{height:9px;border-radius:999px;background:#e8ecf7;overflow:hidden;margin:13px 0}.lf-progress i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#74b6ff,#8b5cf6)}.lf-target{font-size:36px;filter:drop-shadow(0 6px 12px rgba(249,115,22,.2))}.lf-quick-row{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:0 0 14px}.lf-quick-row button{border:0;background:transparent;color:#1f2937;font-weight:800;font-size:11px;cursor:pointer}.lf-quick-row span{display:flex;align-items:center;justify-content:center;width:48px;height:48px;margin:0 auto 6px;border-radius:18px;background:linear-gradient(135deg,#e5f2ff,#f5edff);box-shadow:0 12px 26px rgba(40,50,90,.08);font-size:21px}.lf-section-title{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.lf-section-title h2{font-size:18px;margin:0}.lf-section-title button{border:0;background:transparent;color:#6d5dfc;font-weight:900;cursor:pointer}.lf-product-status{display:grid;grid-template-columns:50px 1fr;gap:12px;align-items:center}.lf-product-status.large{grid-template-columns:1fr;text-align:center}.lf-product-icon{width:50px;height:50px;border-radius:18px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#dbeafe,#ede9fe);font-size:24px}.lf-product-status h3{margin:0 0 4px}.lf-product-status p{margin:0;color:var(--lf-muted);font-size:13px}.lf-product-status .lf-main-btn{grid-column:1/-1}.lf-store-mini{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;border-radius:18px;background:#f9fbff;border:1px solid var(--lf-border);padding:13px;margin-top:10px}.lf-store-mini b{display:block}.lf-store-mini small{display:block;color:#596579;margin-top:4px}.lf-store-mini p{margin:5px 0 0;color:#7b8497;font-size:12px}.lf-store-mini button{border:0;border-radius:14px;background:#efe8ff;color:#6d28d9;padding:10px 12px;font-weight:900;cursor:pointer}.lf-page-title{padding:10px 2px 16px}.lf-page-title p{margin:6px 0 0;color:var(--lf-muted)}.lf-ref-box{padding:13px;border-radius:17px;border:1px dashed #cfd7e6;background:#f9fbff;color:#384675;font-weight:900;word-break:break-all;font-size:13px}.lf-two-btns{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.lf-material-list{display:grid;gap:10px}.lf-material{display:grid;grid-template-columns:42px 1fr auto;gap:10px;align-items:start;border:1px solid var(--lf-border);background:#fbfcff;border-radius:18px;padding:12px}.lf-material>span{width:42px;height:42px;border-radius:15px;background:#eef3ff;display:flex;align-items:center;justify-content:center;font-size:20px}.lf-material b{display:block}.lf-material small{display:block;color:var(--lf-muted);margin-top:2px}.lf-material p{margin:7px 0 0;color:#64748b;font-size:12px}.lf-material-actions{display:grid;gap:6px}.lf-material-actions a,.lf-material-actions button{border:0;border-radius:12px;background:#f2f5ff;color:#4f46e5;text-decoration:none;font-weight:900;padding:8px 9px;font-size:12px;cursor:pointer}.lf-form{display:grid;gap:10px}.lf-form input,.lf-form select,.lf-form textarea{width:100%;padding:13px 14px;border:1px solid #e1e6f2;border-radius:17px;background:#fbfcff;color:var(--lf-text);outline:none}.lf-form textarea{min-height:92px;resize:vertical}.lf-upload{display:grid;gap:8px;padding:14px;border:1px dashed #cfd7e6;border-radius:17px;background:#f9fbff;font-weight:900;color:#4b5563}.lf-upload input{padding:0;border:0;background:transparent}.lf-uploaded{color:#4f46e5;word-break:break-all}.lf-list{display:grid;gap:9px}.lf-list-row{display:grid;grid-template-columns:1fr auto;gap:5px;border:1px solid var(--lf-border);border-radius:17px;background:#fbfcff;padding:12px}.lf-list-row span{color:#6d28d9;background:#f3edff;border-radius:999px;padding:3px 8px;font-size:12px;font-weight:900}.lf-list-row small{grid-column:1/-1;color:var(--lf-muted)}.lf-store-card{overflow:hidden}.lf-store-top{display:grid;grid-template-columns:54px 1fr;gap:12px}.lf-store-icon{width:54px;height:54px;border-radius:19px;background:linear-gradient(135deg,#dbeafe,#f3e8ff);display:flex;align-items:center;justify-content:center;font-size:25px}.lf-store-top h2{margin:8px 0 5px}.lf-store-top p{margin:0;color:var(--lf-muted);font-size:13px}.lf-price-box{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0}.lf-price-box div{border-radius:16px;background:#f8faff;border:1px solid var(--lf-border);padding:10px}.lf-price-box small{display:block;color:var(--lf-muted);font-size:11px}.lf-price-box b{display:block;margin-top:4px;font-size:13px}.lf-total-card{padding:20px;margin-bottom:14px;background:linear-gradient(135deg,#fff,#f0f7ff)}.lf-total-card p{margin:0;color:var(--lf-muted);font-weight:900}.lf-total-card h1{font-size:38px;margin:6px 0 0;letter-spacing:-1.2px}.lf-menu-list{display:grid;gap:10px}.lf-menu-list a,.lf-menu-list button{display:block;width:100%;border:0;text-align:left;text-decoration:none;border-radius:18px;background:#f8faff;border:1px solid var(--lf-border);padding:15px 14px;color:#1f2937;font-weight:900;cursor:pointer}.lf-credit-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:0 0 14px}.lf-credit-tabs button{border:1px solid #e6ebf5;background:#fff;border-radius:16px;padding:12px 8px;font-weight:950;color:#64748b;cursor:pointer}.lf-credit-tabs button.active{background:linear-gradient(135deg,#6d8dff,#8b5cf6);color:#fff;border-color:transparent;box-shadow:0 12px 26px rgba(99,102,241,.18)}.lf-notice-panel{position:sticky;top:60px;z-index:65;margin:0 0 12px;padding:14px;border-radius:22px;background:rgba(255,255,255,.96);border:1px solid #e8edf7;box-shadow:var(--lf-shadow);backdrop-filter:blur(18px)}.lf-drawer-backdrop{position:fixed;inset:0;z-index:120;background:rgba(15,23,42,.34);backdrop-filter:blur(6px);display:flex;justify-content:flex-start}.lf-drawer{width:min(390px,88vw);height:100vh;overflow:auto;background:linear-gradient(180deg,#ffffff,#f8fbff);padding:18px;border-radius:0 28px 28px 0;box-shadow:25px 0 70px rgba(15,23,42,.20)}.lf-drawer-details{margin:12px 0;padding:14px;border:1px solid #e6ebf5;border-radius:20px;background:#fff}.lf-drawer-details summary{font-weight:950;cursor:pointer}.lf-owned-product{margin-top:12px}.lf-stats-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.lf-bottom-nav{position:fixed;left:50%;bottom:12px;z-index:80;transform:translateX(-50%);width:calc(100% - 24px);max-width:456px;display:grid;grid-template-columns:repeat(4,1fr);gap:4px;padding:9px;border-radius:25px;background:rgba(255,255,255,.9);border:1px solid rgba(232,236,247,.9);box-shadow:0 20px 55px rgba(40,50,90,.18);backdrop-filter:blur(20px)}.lf-bottom-nav button{border:0;background:transparent;border-radius:18px;padding:8px 2px;color:#7b8497;cursor:pointer;font-weight:800}.lf-bottom-nav button span{display:block;font-size:20px;line-height:1}.lf-bottom-nav button small{display:block;font-size:10px;margin-top:3px}.lf-bottom-nav button.active{background:linear-gradient(135deg,#ede9fe,#e0f2fe);color:#5b21b6}@media(min-width:820px){.lf-phone-shell{margin-top:18px;margin-bottom:18px;border-radius:34px;min-height:calc(100vh - 36px);box-shadow:0 30px 90px rgba(15,23,42,.16);border:1px solid #eef1f7}.lf-bottom-nav{bottom:28px}}@media(max-width:380px){.lf-phone-shell{padding-left:10px;padding-right:10px}.lf-bottom-nav{grid-template-columns:repeat(4,1fr);width:calc(100% - 16px)}.lf-bottom-nav button small{font-size:9px}.lf-quick-row{gap:4px}.lf-credit-card h3{font-size:16px}.lf-price-box{grid-template-columns:1fr}.lf-material{grid-template-columns:36px 1fr}.lf-material-actions{grid-column:1/-1;grid-template-columns:1fr 1fr}.lf-material>span{width:36px;height:36px}.lf-two-btns{grid-template-columns:1fr}}

/* AI Product Hub desktop layout */
.lf-app-shell{width:100%;min-height:100vh}.lf-desktop-sidebar{display:none}.lf-hub-hero{margin:8px 0 14px;padding:22px;border-radius:28px;background:linear-gradient(135deg,#ffffff,#eef4ff 58%,#f6efff);border:1px solid var(--lf-border);box-shadow:var(--lf-shadow)}.lf-hub-hero h1{margin:0;font-size:28px;letter-spacing:-.9px}.lf-hub-hero p:not(.lf-label){margin:6px 0 0;color:var(--lf-muted)}.lf-hub-search{margin-top:16px;padding:14px 16px;border-radius:18px;background:#fff;border:1px solid #e8edf7;color:#8a94a6;font-weight:800}.lf-category-row{display:flex;gap:8px;overflow:auto;padding:0 0 12px;margin:0 0 6px;scrollbar-width:none}.lf-category-row::-webkit-scrollbar{display:none}.lf-category-row button{white-space:nowrap;border:1px solid #e7eaf5;background:#fff;color:#64748b;padding:10px 14px;border-radius:999px;font-weight:900;cursor:pointer}.lf-category-row button.active{background:linear-gradient(135deg,#6d8dff,#8b5cf6);border-color:transparent;color:#fff;box-shadow:0 10px 24px rgba(99,102,241,.18)}.lf-featured-strip{margin-bottom:14px}.lf-featured-grid{display:grid;grid-template-columns:1fr;gap:10px}.lf-store-grid{display:grid;grid-template-columns:1fr;gap:0}.lf-store-card.violet .lf-store-icon,.lf-store-mini.violet .lf-mini-icon{background:linear-gradient(135deg,#ede9fe,#ddd6fe)}.lf-store-card.green .lf-store-icon,.lf-store-mini.green .lf-mini-icon{background:linear-gradient(135deg,#dcfce7,#ccfbf1)}.lf-store-card.pink .lf-store-icon,.lf-store-mini.pink .lf-mini-icon{background:linear-gradient(135deg,#fce7f3,#fee2e2)}.lf-store-card.orange .lf-store-icon,.lf-store-mini.orange .lf-mini-icon{background:linear-gradient(135deg,#ffedd5,#fef3c7)}.lf-store-card.blue .lf-store-icon,.lf-store-mini.blue .lf-mini-icon{background:linear-gradient(135deg,#dbeafe,#e0f2fe)}.lf-store-mini{grid-template-columns:46px 1fr auto}.lf-mini-icon{width:46px;height:46px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:21px}.lf-store-mini em{display:block;font-style:normal;color:#7c3aed;font-size:10px;text-transform:uppercase;font-weight:950;letter-spacing:.05em;margin-bottom:4px}.lf-store-card{transition:transform .16s ease, box-shadow .16s ease}.lf-store-card:hover{transform:translateY(-2px);box-shadow:0 22px 60px rgba(55,65,81,.13)}
@media(min-width:1024px){body{background:linear-gradient(135deg,#eef3ff 0%,#f9fbff 40%,#f7f0ff 100%)}.lf-app-shell{max-width:1260px;margin:22px auto;display:grid;grid-template-columns:250px minmax(0,1fr);gap:22px;padding:0 18px}.lf-desktop-sidebar{display:flex;position:sticky;top:22px;height:calc(100vh - 44px);border-radius:28px;background:linear-gradient(180deg,#111a32,#15213e);color:#fff;padding:22px;box-shadow:0 25px 70px rgba(15,23,42,.25);flex-direction:column}.lf-side-brand{display:flex;align-items:center;gap:10px;font-size:18px;margin-bottom:28px}.lf-side-brand span{width:34px;height:34px;border-radius:12px;background:linear-gradient(135deg,#4f8dff,#8b5cf6);display:flex;align-items:center;justify-content:center}.lf-desktop-sidebar nav{display:grid;gap:8px}.lf-desktop-sidebar nav button,.lf-side-logout{border:0;border-radius:14px;background:transparent;color:#cbd5e1;text-align:left;padding:12px 13px;font-weight:900;cursor:pointer}.lf-desktop-sidebar nav button span{display:inline-block;width:26px}.lf-desktop-sidebar nav button.active{background:rgba(255,255,255,.12);color:#fff}.lf-side-card{margin-top:auto;background:linear-gradient(135deg,#6d5dfc,#8b5cf6);border-radius:20px;padding:16px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.18)}.lf-side-card b{display:block}.lf-side-card small{display:block;color:#e9d5ff;margin:8px 0 12px}.lf-side-card button{width:100%;border:0;border-radius:13px;background:rgba(255,255,255,.18);color:#fff;padding:10px;font-weight:900;cursor:pointer}.lf-side-logout{margin-top:12px;background:rgba(255,255,255,.08);text-align:center}.lf-phone-shell{max-width:none;margin:0;min-height:calc(100vh - 44px);border-radius:28px;padding:22px 22px 40px;box-shadow:0 25px 80px rgba(15,23,42,.10);border:1px solid #edf1f7;background:rgba(255,255,255,.72);backdrop-filter:blur(18px)}.lf-mobile-header{position:relative;background:transparent;backdrop-filter:none;grid-template-columns:1fr auto}.lf-mobile-header .lf-icon-btn{display:none}.lf-mobile-header strong{text-align:left;font-size:18px}.lf-mobile-header small{text-align:left}.lf-bottom-nav{display:none}.lf-credit-grid{grid-template-columns:repeat(2, minmax(0,1fr))}.lf-quick-row{grid-template-columns:repeat(4,1fr)}.lf-quick-row button:nth-child(n+5){display:block}.lf-soft-card,.lf-total-card,.lf-welcome-card,.lf-hub-hero{border-radius:24px}.lf-featured-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.lf-store-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.lf-store-card{margin:0}.lf-page-title h1,.lf-hub-hero h1{font-size:34px}.lf-total-card h1{font-size:42px}.lf-price-box{grid-template-columns:repeat(3,1fr)}.lf-product-status .lf-main-btn{grid-column:auto}.lf-product-status{grid-template-columns:54px 1fr auto}.lf-product-status.large{grid-template-columns:54px 1fr auto;text-align:left}.lf-welcome-card{display:flex;align-items:center;justify-content:space-between}.lf-welcome-card:after{content:'AI Product Hub';display:block;border-radius:18px;padding:18px 22px;background:linear-gradient(135deg,#ede9fe,#e0f2fe);color:#4c1d95;font-weight:950}.lf-hub-hero{display:grid;grid-template-columns:1fr 340px;gap:18px;align-items:center}.lf-hub-search{margin-top:0}.lf-category-row{flex-wrap:wrap;overflow:visible}.lf-list-row{grid-template-columns:1fr auto}.lf-material-list{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(min-width:1280px){.lf-featured-grid{grid-template-columns:repeat(4,minmax(0,1fr))}.lf-store-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.lf-credit-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}

`}</style>}
