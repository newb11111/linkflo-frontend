'use client'

import Link from 'next/link'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../lib/i18n'

const copy = {
  zh: {
    login: '登录后台', start: '免费开始', badge: 'AI 时代的收入增长平台',
    heroTitle: <>让更多人<br/><span>用 AI 产品</span>开始赚钱</>,
    heroLead: 'Linkflo 是一站式 AI 产品枢纽与增长平台，帮助你发现优质 AI 工具、推广赚钱、学习成长，并把 AI 变成可持续的收入机会。',
    aiHub: 'AI Product Hub', aiHubDesc: '发现优质 AI 产品', rewards: 'Ambassador Rewards', rewardsDesc: '推广赚取丰厚奖励', academy: 'AI Academy', academyDesc: '学习 AI，提升收入',
    forWho: '适合谁', learnMore: '了解更多', individual: '个人', individualDesc: '利用 AI 工具提升效率，开启副业或增加收入。', merchant: '商家', merchantDesc: '获取优质 AI 解决方案，降本增效，驱动增长。', team: '团队', teamDesc: '培训团队，复制成功模式，打造可持续的收入体系。',
    inside: '平台里有什么', hubTitle: 'AI Product Hub', hubText: '精选优质 AI 产品，未来会逐步加入更多工具。', creditTitle: 'Credits', creditText: '充值额度与奖励积分，用于开通产品与服务。', academyTitle: 'AI Academy', academyText: '系统课程与实战内容，从入门到精通。', rewardTitle: 'Rewards', rewardText: '推广优质 AI 产品，赚取奖励积分。',
    funnelTitle: 'AI Funnel', funnelTag: '当前已上线', funnelText: '把产品做成成交页，配合推广链接与 WhatsApp 追踪，把流量变成更清楚的商机。',
    ctaTitle: '加入 Linkflo，免费开启 AI 创收之旅', cta1: '免费注册', cta2: '无需门槛', cta3: '立即开始', ctaButton: '免费加入', footer: '全球用户正在使用 Linkflo 发现 AI、学习 AI、通过 AI 赚钱',
    bottomHome: '首页', bottomProducts: '产品', bottomCredits: '积分', bottomMine: '我的'
  },
  en: {
    login: 'Login', start: 'Start Free', badge: 'Income growth platform for the AI era',
    heroTitle: <>Help more people<br/><span>earn with AI products</span></>,
    heroLead: 'Linkflo is an AI product hub and growth platform that helps you discover AI tools, promote products, learn practical skills, and turn AI into sustainable income opportunities.',
    aiHub: 'AI Product Hub', aiHubDesc: 'Discover quality AI products', rewards: 'Ambassador Rewards', rewardsDesc: 'Promote and earn rewards', academy: 'AI Academy', academyDesc: 'Learn AI and grow income',
    forWho: 'Who it is for', learnMore: 'Learn more', individual: 'Individuals', individualDesc: 'Use AI tools to improve productivity, start side income, or grow your skills.', merchant: 'Merchants', merchantDesc: 'Access AI solutions that reduce cost, improve operations, and drive growth.', team: 'Teams', teamDesc: 'Train teams, replicate winning systems, and build repeatable income flows.',
    inside: 'What is inside', hubTitle: 'AI Product Hub', hubText: 'Curated AI products, with more tools added gradually.', creditTitle: 'Credits', creditText: 'Paid credits and bonus credits to activate products and services.', academyTitle: 'AI Academy', academyText: 'Practical courses and playbooks from beginner to advanced.', rewardTitle: 'Rewards', rewardText: 'Promote selected AI products and earn bonus credits.',
    funnelTitle: 'AI Funnel', funnelTag: 'Available now', funnelText: 'Turn products into conversion pages with promoter links and WhatsApp tracking so traffic becomes clearer opportunities.',
    ctaTitle: 'Join Linkflo and start your AI income journey for free', cta1: 'Free account', cta2: 'Low barrier', cta3: 'Start instantly', ctaButton: 'Join Free', footer: 'Users use Linkflo to discover AI, learn AI, and grow with AI.',
    bottomHome: 'Home', bottomProducts: 'Products', bottomCredits: 'Credits', bottomMine: 'Mine'
  },
  bm: {
    login: 'Log Masuk', start: 'Mula Percuma', badge: 'Platform pertumbuhan pendapatan era AI',
    heroTitle: <>Bantu lebih ramai orang<br/><span>jana pendapatan dengan produk AI</span></>,
    heroLead: 'Linkflo ialah hub produk AI dan platform pertumbuhan yang membantu anda mencari alat AI, mempromosikan produk, belajar kemahiran praktikal, dan menjadikan AI peluang pendapatan yang lebih mampan.',
    aiHub: 'AI Product Hub', aiHubDesc: 'Cari produk AI berkualiti', rewards: 'Ambassador Rewards', rewardsDesc: 'Promosi dan dapat ganjaran', academy: 'AI Academy', academyDesc: 'Belajar AI dan tingkatkan pendapatan',
    forWho: 'Sesuai untuk siapa', learnMore: 'Ketahui lagi', individual: 'Individu', individualDesc: 'Guna alat AI untuk naikkan produktiviti, mula pendapatan sampingan, atau tambah kemahiran.', merchant: 'Peniaga', merchantDesc: 'Gunakan penyelesaian AI untuk kurangkan kos, tingkatkan operasi, dan bantu pertumbuhan.', team: 'Pasukan', teamDesc: 'Latih pasukan, gandakan sistem yang berjaya, dan bina aliran pendapatan berulang.',
    inside: 'Apa yang ada dalam platform', hubTitle: 'AI Product Hub', hubText: 'Produk AI terpilih, dengan lebih banyak alat akan ditambah secara berperingkat.', creditTitle: 'Credits', creditText: 'Kredit berbayar dan kredit bonus untuk aktifkan produk serta servis.', academyTitle: 'AI Academy', academyText: 'Kursus praktikal dan panduan dari asas hingga mahir.', rewardTitle: 'Rewards', rewardText: 'Promosikan produk AI terpilih dan dapatkan kredit bonus.',
    funnelTitle: 'AI Funnel', funnelTag: 'Sudah tersedia', funnelText: 'Tukar produk menjadi halaman jualan dengan pautan promoter dan penjejakan WhatsApp supaya trafik menjadi peluang yang lebih jelas.',
    ctaTitle: 'Sertai Linkflo dan mula perjalanan pendapatan AI secara percuma', cta1: 'Akaun percuma', cta2: 'Mudah bermula', cta3: 'Mula segera', ctaButton: 'Sertai Percuma', footer: 'Pengguna menggunakan Linkflo untuk menemui AI, belajar AI, dan berkembang dengan AI.',
    bottomHome: 'Home', bottomProducts: 'Produk', bottomCredits: 'Credits', bottomMine: 'Saya'
  }
}

export default function HomePage() {
  const { lang } = useLanguage()
  const t = copy[lang] || copy.zh

  return <main className="lf-public-page">
    <section className="lf-public-phone">
      <header className="lf-public-header">
        <img src="/linkflo-logo.png" alt="Linkflo" />
        <LanguageToggle compact />
      </header>

      <section className="lf-public-hero">
        <div className="lf-public-hero-copy">
          <p className="lf-public-badge">✦ {t.badge}</p>
          <h1>{t.heroTitle}</h1>
          <p className="lf-public-lead">{t.heroLead}</p>
          <div className="lf-public-hero-actions">
            <Link className="lf-public-primary" href="/login?mode=register">{t.start} <span>›</span></Link>
            <Link className="lf-public-secondary" href="/login">{t.login}</Link>
          </div>
        </div>
        <div className="lf-public-cube" aria-hidden="true"><b>LF</b><span>AI</span><i>$</i></div>
      </section>

      <div className="lf-public-strip">
        <MiniFeature icon="▦" title={t.aiHub} text={t.aiHubDesc} />
        <MiniFeature icon="🎁" title={t.rewards} text={t.rewardsDesc} />
        <MiniFeature icon="🎓" title={t.academy} text={t.academyDesc} />
      </div>

      <SectionHeader title={t.forWho} action={t.learnMore} />
      <div className="lf-public-three">
        <Audience icon="👤" title={t.individual} text={t.individualDesc} />
        <Audience icon="🏪" title={t.merchant} text={t.merchantDesc} />
        <Audience icon="👥" title={t.team} text={t.teamDesc} />
      </div>

      <SectionHeader title={t.inside} />
      <div className="lf-public-grid">
        <InfoCard color="blue" icon="▰" title={t.hubTitle} text={t.hubText} />
        <InfoCard color="green" icon="▭" title={t.creditTitle} text={t.creditText} />
        <InfoCard color="purple" icon="▴" title={t.academyTitle} text={t.academyText} />
        <InfoCard color="orange" icon="✦" title={t.rewardTitle} text={t.rewardText} />
      </div>

      <div className="lf-public-funnel-card">
        <span>⌁</span>
        <div><h3>{t.funnelTitle} <em>{t.funnelTag}</em></h3><p>{t.funnelText}</p></div>
        <Link href="/login?mode=register">›</Link>
      </div>

      <section className="lf-public-final">
        <h2>{t.ctaTitle}</h2>
        <div><span>✓ {t.cta1}</span><span>✓ {t.cta2}</span><span>✓ {t.cta3}</span></div>
        <Link href="/login?mode=register">{t.ctaButton} ›</Link>
      </section>

      <p className="lf-public-footer"><span>👤👤👤</span> {t.footer}</p>

      <nav className="lf-public-bottom">
        <button className="active">⌂<small>{t.bottomHome}</small></button>
        <button>▦<small>{t.bottomProducts}</small></button>
        <button>✦<small>{t.bottomCredits}</small></button>
        <button>◌<small>{t.bottomMine}</small></button>
      </nav>
    </section>
  </main>
}

function MiniFeature({icon,title,text}){ return <div className="lf-public-mini"><b>{icon}</b><div><strong>{title}</strong><small>{text}</small></div></div> }
function SectionHeader({title, action}){ return <div className="lf-public-section-head"><h2>{title}</h2>{action && <span>{action} ›</span>}</div> }
function Audience({icon,title,text}){ return <div className="lf-public-audience"><span>{icon}</span><b>{title}</b><p>{text}</p></div> }
function InfoCard({icon,title,text,color}){ return <div className={`lf-public-info ${color}`}><span>{icon}</span><b>{title}</b><p>{text}</p><i>›</i></div> }
