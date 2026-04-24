"use client"

import { useState } from "react"

function normalizeWhatsapp(phone = "") {
  let cleaned = String(phone).replace(/\D/g, "")
  if (!cleaned) return ""
  if (cleaned.startsWith("0")) cleaned = `6${cleaned}`
  return cleaned
}

function buildWhatsappLink(data = {}) {
  const phone = normalizeWhatsapp(data?.whatsapp || "")
  if (!phone) return "#"

  const sections = data?.sections || {}
  const message =
    sections?.cta?.whatsappMessage ||
    sections?.hero?.whatsappMessage ||
    `Hi，我想了解 ${data?.brandName || "你的服务"}`

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

function getYoutubeEmbedUrl(url = "") {
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

      if (parsed.pathname.startsWith("/embed/")) return url
    }

    return ""
  } catch {
    return ""
  }
}

function hasItems(section) {
  return Array.isArray(section?.items) && section.items.length > 0
}

function SectionHeader({ label, title, subtitle, align = "center" }) {
  if (!title && !subtitle) return null
  const center = align === "center"

  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {label ? (
        <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-700/70">
          {label}
        </p>
      ) : null}

      {title ? (
        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
          {title}
        </h2>
      ) : null}

      {subtitle ? (
        <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}

function BgBlock({ image, children, className = "" }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[40px] bg-slate-950 ${className}`}
      style={
        image
          ? {
              backgroundImage: `url(${image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/65 to-black/30" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

function SoftBackground({ image }) {
  if (!image) return null

  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.06]"
      style={{
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
  )
}

function YoutubeBox({ url, title }) {
  const embed = getYoutubeEmbedUrl(url)

  return (
    <div className="aspect-video overflow-hidden rounded-[34px] bg-white shadow-xl ring-1 ring-black/5">
      {embed ? (
        <iframe
          className="h-full w-full"
          src={embed}
          title={title || "Video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-slate-500">
          视频链接错误（请填 YouTube 链接）
        </div>
      )}
    </div>
  )
}

export default function LandingPage({ data = {} }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const sections = data?.sections || {}

  const hero = sections.hero || {}
  const problem = sections.problem || {}
  const conversion = sections.conversion || {}
  const solution = sections.solution || {}
  const process = sections.process || {}
  const showcase = sections.showcase || {}
  const reviews = sections.reviews || {}
  const offer = sections.offer || {}
  const faq = sections.faq || {}
  const cta = sections.cta || {}

  const whatsappLink = buildWhatsappLink(data)
  const hasWhatsapp = whatsappLink !== "#"

  const ctaText =
    hero.ctaText || cta.buttonText || "WhatsApp 咨询"

  const navItems = [
    ["problem", "Problem"],
    ["conversion", "Gap"],
    ["solution", "Solution"],
    ["process", "Process"],
    ["showcase", "Showcase"],
    ["reviews", "Reviews"],
    ["offer", "Offer"],
    ["faq", "FAQ"],
  ]

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-slate-800">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="text-lg font-black text-slate-950">
            {data.brandName || "BRAND"}
          </div>

          <nav className="hidden gap-7 text-sm font-semibold text-slate-600 md:flex">
            {navItems.map(([id, name]) => (
              <a key={id} href={`#${id}`} className="hover:text-slate-950">
                {name}
              </a>
            ))}
          </nav>

          {hasWhatsapp ? (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white md:block"
            >
              {ctaText}
            </a>
          ) : null}

          <button className="text-2xl md:hidden" onClick={() => setMenuOpen(true)}>
            ☰
          </button>
        </div>
      </header>

      {menuOpen ? (
        <div
          className="fixed inset-0 z-50 bg-black/40 md:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-72 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-8 flex justify-between">
              <strong>{data.brandName || "BRAND"}</strong>
              <button onClick={() => setMenuOpen(false)}>✕</button>
            </div>

            <div className="grid gap-5 text-sm font-semibold">
              {navItems.map(([id, name]) => (
                <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>
                  {name}
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* HERO */}
      <section className="px-4 pt-28 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <BgBlock image={hero.backgroundImage} className="min-h-[620px]">
            <div className="flex min-h-[620px] flex-col justify-end px-6 pb-12 pt-24 text-white sm:px-12 lg:px-16 lg:pb-16">
              <div className="max-w-4xl">
                <p className="mb-4 text-xs font-black uppercase tracking-[0.36em] text-white/70">
                  Conversion Landing Page
                </p>

                <h1 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
                  {hero.title || "流量有了，不代表成交会自动发生"}
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-8 text-white/80 sm:text-xl">
                  {hero.subtitle ||
                    "你缺的不是更多流量，而是一个能把客户接住、说服、推动咨询的成交页面。"}
                </p>

                {hasWhatsapp ? (
                  <a href={whatsappLink} target="_blank" rel="noreferrer">
                    <button className="mt-9 rounded-full bg-white px-9 py-4 font-black text-slate-950 shadow-xl transition hover:scale-[1.02]">
                      {ctaText}
                    </button>
                  </a>
                ) : null}
              </div>
            </div>
          </BgBlock>
        </div>
      </section>

      {/* PROBLEM */}
      <section id="problem" className="relative px-4 py-24 sm:px-6">
        <SoftBackground image={problem.backgroundImage} />

        <div className="relative mx-auto max-w-7xl">
          <SectionHeader
            label="Problem"
            title={problem.title || "为什么你有流量，却没有成交？"}
            subtitle={
              problem.subtitle ||
              "很多生意不是输在流量，而是输在客户点进来之后，没有被马上说服。"
            }
          />

          {hasItems(problem) ? (
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {problem.items.map((item, index) => (
                <div
                  key={index}
                  className="rounded-[32px] bg-white p-7 shadow-sm ring-1 ring-black/5"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title || ""}
                      className="mb-6 h-48 w-full rounded-[24px] object-cover"
                    />
                  ) : null}

                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <h3 className="text-xl font-black text-slate-950">
                    {item.title}
                  </h3>

                  <p className="mt-3 leading-8 text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* CONVERSION GAP */}
      <section id="conversion" className="px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
          {conversion.image ? (
            <img
              src={conversion.image}
              alt={conversion.title || "Conversion Gap"}
              className="h-full max-h-[520px] w-full rounded-[36px] object-cover shadow-xl"
            />
          ) : (
            <div className="min-h-[360px] rounded-[36px] bg-slate-200" />
          )}

          <div className="rounded-[36px] bg-slate-950 p-8 text-white sm:p-12">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-200/80">
              Conversion Gap
            </p>

            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">
              {conversion.title || "问题不是没人看，是看完没有下一步"}
            </h2>

            <p className="mt-6 text-base leading-8 text-white/70 sm:text-lg">
              {conversion.subtitle ||
                "客户点进来只有几秒钟判断你值不值得相信。页面没有讲清楚价值、证明和行动路径，流量就会白白流走。"}
            </p>
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section id="solution" className="relative px-4 py-24 sm:px-6">
        <SoftBackground image={solution.backgroundImage} />

        <div className="relative mx-auto max-w-7xl">
          <SectionHeader
            label="Solution"
            title={solution.title || "成交页面帮你把流量接住"}
            subtitle={
              solution.subtitle ||
              "不是单纯漂亮，而是把客户需要看的内容，排成一条成交路径。"
            }
          />

          {hasItems(solution) ? (
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {solution.items.map((item, index) => (
                <div
                  key={index}
                  className="rounded-[32px] bg-white p-8 shadow-sm ring-1 ring-black/5"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title || ""}
                      className="mb-6 h-44 w-full rounded-[24px] object-cover"
                    />
                  ) : null}

                  <p className="text-sm font-black text-blue-700">
                    0{index + 1}
                  </p>

                  <h3 className="mt-5 text-2xl font-black text-slate-950">
                    {item.title}
                  </h3>

                  <p className="mt-4 leading-8 text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* PROCESS */}
      <section id="process" className="relative bg-white px-4 py-24 sm:px-6">
        <SoftBackground image={process.backgroundImage} />

        <div className="relative mx-auto max-w-7xl">
          <SectionHeader
            label="Process"
            title={process.title || "简单流程，快速上线"}
            subtitle={process.subtitle || "资料进来，页面就可以被系统化生产。"}
          />

          {hasItems(process) ? (
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {process.items.map((item, index) => (
                <div key={index} className="rounded-[32px] bg-[#f7f4ee] p-8">
                  <div className="mb-8 text-6xl font-black text-slate-200">
                    {index + 1}
                  </div>

                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title || ""}
                      className="mb-6 h-44 w-full rounded-[24px] object-cover"
                    />
                  ) : null}

                  <h3 className="text-2xl font-black text-slate-950">
                    {item.title}
                  </h3>

                  <p className="mt-4 leading-8 text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* SHOWCASE */}
      <section id="showcase" className="relative px-4 py-24 sm:px-6">
        <SoftBackground image={showcase.backgroundImage} />

        <div className="relative mx-auto max-w-7xl">
          <SectionHeader
            label="Showcase"
            title={showcase.title || "页面展示 / Demo"}
            subtitle={showcase.subtitle || "这里放页面截图、产品图、服务图、demo video。"}
          />

          {hasItems(showcase) ? (
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {showcase.items.map((item, index) => {
                const isVideo = item.videoUrl || item.youtubeUrl || item.url
                const videoUrl = item.videoUrl || item.youtubeUrl || item.url

                return (
                  <div
                    key={index}
                    className="overflow-hidden rounded-[34px] bg-white shadow-sm ring-1 ring-black/5"
                  >
                    {isVideo ? (
                      <YoutubeBox url={videoUrl} title={item.title} />
                    ) : item.image ? (
                      <img
                        src={item.image}
                        alt={item.title || ""}
                        className="h-80 w-full object-cover"
                      />
                    ) : null}

                    {(item.title || item.desc) ? (
                      <div className="p-7">
                        {item.title ? (
                          <h3 className="text-xl font-black text-slate-950">
                            {item.title}
                          </h3>
                        ) : null}

                        {item.desc ? (
                          <p className="mt-3 leading-8 text-slate-600">
                            {item.desc}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          ) : null}
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="relative bg-white px-4 py-24 sm:px-6">
        <SoftBackground image={reviews.backgroundImage} />

        <div className="relative mx-auto max-w-7xl">
          <SectionHeader
            label="Reviews"
            title={reviews.title || "真实反馈 / 信任证明"}
            subtitle={reviews.subtitle || "这里重点是证明，截图和评价比长篇解释更有力。"}
          />

          {hasItems(reviews) ? (
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reviews.items.map((item, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[32px] bg-[#f7f4ee] shadow-sm ring-1 ring-black/5"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name || ""}
                      className="h-72 w-full object-cover"
                    />
                  ) : null}

                  <div className="p-7">
                    {item.text ? (
                      <p className="leading-8 text-slate-700">{item.text}</p>
                    ) : null}

                    {item.name ? (
                      <p className="mt-5 font-black text-slate-950">
                        {item.name}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* OFFER */}
      <section id="offer" className="relative px-4 py-24 sm:px-6">
        <SoftBackground image={offer.backgroundImage} />

        <div className="relative mx-auto max-w-7xl">
          <SectionHeader
            label="Offer"
            title={offer.title || "配套 / Offer"}
            subtitle={offer.subtitle || "这里用卡片呈现价格、服务内容和产品图。"}
          />

          {hasItems(offer) ? (
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {offer.items.map((item, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[34px] bg-white shadow-sm ring-1 ring-black/5"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name || item.title || ""}
                      className="h-72 w-full object-cover"
                    />
                  ) : null}

                  <div className="p-7">
                    <h3 className="text-2xl font-black text-slate-950">
                      {item.name || item.title}
                    </h3>

                    {item.desc ? (
                      <p className="mt-4 leading-8 text-slate-600">
                        {item.desc}
                      </p>
                    ) : null}

                    {item.price ? (
                      <p className="mt-6 text-3xl font-black text-slate-950">
                        {item.price}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative bg-white px-4 py-24 sm:px-6">
        <SoftBackground image={faq.backgroundImage} />

        <div className="relative mx-auto max-w-4xl">
          <SectionHeader
            label="FAQ"
            title={faq.title || "常见问题"}
            subtitle={faq.subtitle || "先处理客户心里的疑问，才更容易让他点击咨询。"}
          />

          {hasItems(faq) ? (
            <div className="mt-12 grid gap-4">
              {faq.items.map((item, index) => (
                <div key={index} className="rounded-[28px] bg-[#f7f4ee] p-7">
                  <h3 className="text-lg font-black text-slate-950">
                    {item.q || item.question}
                  </h3>

                  <p className="mt-3 leading-8 text-slate-600">
                    {item.a || item.answer}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* CTA */}
      <section id="order" className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <BgBlock
            image={cta.backgroundImage || hero.backgroundImage}
            className="min-h-[460px]"
          >
            <div className="flex min-h-[460px] flex-col items-center justify-center px-6 py-16 text-center text-white sm:px-10">
              <p className="text-xs font-black uppercase tracking-[0.32em] text-white/60">
                Final CTA
              </p>

              <h2 className="mt-4 max-w-3xl text-3xl font-black leading-tight sm:text-5xl">
                {cta.title || "现在开始把你的流量变成咨询和成交"}
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
                {cta.subtitle || "如果你已经有流量，下一步就是把流量接住。"}
              </p>

              {hasWhatsapp ? (
                <a href={whatsappLink} target="_blank" rel="noreferrer">
                  <button className="mt-9 rounded-full bg-white px-10 py-4 font-black text-slate-950 shadow-xl transition hover:scale-[1.02]">
                    {cta.buttonText || hero.ctaText || "WhatsApp 咨询"}
                  </button>
                </a>
              ) : null}
            </div>
          </BgBlock>
        </div>
      </section>
    </div>
  )
}