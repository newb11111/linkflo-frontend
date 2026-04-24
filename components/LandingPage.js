"use client"

import { useState } from "react"

function normalizeWhatsapp(phone = "") {
  let cleaned = String(phone).replace(/\D/g, "")
  if (!cleaned) return ""
  if (cleaned.startsWith("0")) cleaned = `6${cleaned}`
  return cleaned
}

function hasText(value) {
  return typeof value === "string" && value.trim() !== ""
}

function hasValidItems(items = []) {
  return Array.isArray(items) && items.some((item) =>
    Object.values(item || {}).some((value) => hasText(value))
  )
}

function getValidItems(items = []) {
  if (!Array.isArray(items)) return []
  return items.filter((item) =>
    Object.values(item || {}).some((value) => hasText(value))
  )
}

function hasSection(section = {}) {
  return (
    hasText(section.title) ||
    hasText(section.subtitle) ||
    hasText(section.backgroundImage) ||
    hasText(section.image) ||
    hasText(section.ctaText) ||
    hasText(section.buttonText) ||
    hasText(section.whatsappMessage) ||
    hasValidItems(section.items)
  )
}

function buildWhatsappLink(data = {}) {
  const phone = normalizeWhatsapp(data?.whatsapp || "")
  if (!phone) return "#"

  const sections = data?.sections || {}
  const message =
    sections?.cta?.whatsappMessage ||
    sections?.hero?.whatsappMessage ||
    (data?.brandName ? `Hi，我想了解 ${data.brandName}` : "Hi，我想了解更多")

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

function SectionHeader({ label, title, subtitle, align = "center" }) {
  if (!hasText(title) && !hasText(subtitle)) return null
  const center = align === "center"

  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {label ? (
        <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-700/70">
          {label}
        </p>
      ) : null}

      {hasText(title) ? (
        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
          {title}
        </h2>
      ) : null}

      {hasText(subtitle) ? (
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
  if (!hasText(image)) return null

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

  const problemItems = getValidItems(problem.items)
  const solutionItems = getValidItems(solution.items)
  const processItems = getValidItems(process.items)
  const showcaseItems = getValidItems(showcase.items)
  const reviewItems = getValidItems(reviews.items)
  const offerItems = getValidItems(offer.items)
  const faqItems = getValidItems(faq.items)

  const whatsappLink = buildWhatsappLink(data)
  const hasWhatsapp = whatsappLink !== "#"

  const ctaText = hero.ctaText || cta.buttonText || ""

  const navItems = [
    hasSection(problem) ? ["problem", "Problem"] : null,
    hasSection(conversion) ? ["conversion", "Gap"] : null,
    hasSection(solution) ? ["solution", "Solution"] : null,
    hasSection(process) ? ["process", "Process"] : null,
    hasSection(showcase) ? ["showcase", "Showcase"] : null,
    hasSection(reviews) ? ["reviews", "Reviews"] : null,
    hasSection(offer) ? ["offer", "Offer"] : null,
    hasSection(faq) ? ["faq", "FAQ"] : null,
  ].filter(Boolean)

  const showHeader = hasText(data.brandName) || navItems.length > 0 || (hasWhatsapp && hasText(ctaText))

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-slate-800">
      {showHeader ? (
        <header className="fixed inset-x-0 top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
            <div className="text-lg font-black text-slate-950">
              {data.brandName || ""}
            </div>

            {navItems.length > 0 ? (
              <nav className="hidden gap-7 text-sm font-semibold text-slate-600 md:flex">
                {navItems.map(([id, name]) => (
                  <a key={id} href={`#${id}`} className="hover:text-slate-950">
                    {name}
                  </a>
                ))}
              </nav>
            ) : null}

            {hasWhatsapp && hasText(ctaText) ? (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="hidden rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white md:block"
              >
                {ctaText}
              </a>
            ) : null}

            {navItems.length > 0 ? (
              <button className="text-2xl md:hidden" onClick={() => setMenuOpen(true)}>
                ☰
              </button>
            ) : null}
          </div>
        </header>
      ) : null}

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
              <strong>{data.brandName || "Menu"}</strong>
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

      {hasSection(hero) ? (
        <section className={`px-4 sm:px-6 ${showHeader ? "pt-28" : "pt-8"}`}>
          <div className="mx-auto max-w-7xl">
            <BgBlock image={hero.backgroundImage} className="min-h-[620px]">
              <div className="flex min-h-[620px] flex-col justify-end px-6 pb-12 pt-24 text-white sm:px-12 lg:px-16 lg:pb-16">
                <div className="max-w-4xl">
                  <p className="mb-4 text-xs font-black uppercase tracking-[0.36em] text-white/70">
                    Conversion Landing Page
                  </p>

                  {hasText(hero.title) ? (
                    <h1 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
                      {hero.title}
                    </h1>
                  ) : null}

                  {hasText(hero.subtitle) ? (
                    <p className="mt-6 max-w-2xl text-base leading-8 text-white/80 sm:text-xl">
                      {hero.subtitle}
                    </p>
                  ) : null}

                  {hasWhatsapp && hasText(ctaText) ? (
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
      ) : null}

      {hasSection(problem) ? (
        <section id="problem" className="relative px-4 py-24 sm:px-6">
          <SoftBackground image={problem.backgroundImage} />

          <div className="relative mx-auto max-w-7xl">
            <SectionHeader
              label="Problem"
              title={problem.title}
              subtitle={problem.subtitle}
            />

            {problemItems.length > 0 ? (
              <div className="mt-12 grid gap-6 md:grid-cols-3">
                {problemItems.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-[32px] bg-white p-7 shadow-sm ring-1 ring-black/5"
                  >
                    {hasText(item.image) ? (
                      <img
                        src={item.image}
                        alt={item.title || ""}
                        className="mb-6 h-48 w-full rounded-[24px] object-cover"
                      />
                    ) : null}

                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    {hasText(item.title) ? (
                      <h3 className="text-xl font-black text-slate-950">
                        {item.title}
                      </h3>
                    ) : null}

                    {hasText(item.desc) ? (
                      <p className="mt-3 leading-8 text-slate-600">{item.desc}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {hasSection(conversion) ? (
        <section id="conversion" className="px-4 py-16 sm:px-6">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
            {hasText(conversion.image) ? (
              <img
                src={conversion.image}
                alt={conversion.title || "Conversion Gap"}
                className="h-full max-h-[520px] w-full rounded-[36px] object-cover shadow-xl"
              />
            ) : null}

            {(hasText(conversion.title) || hasText(conversion.subtitle)) ? (
              <div className="rounded-[36px] bg-slate-950 p-8 text-white sm:p-12">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-200/80">
                  Conversion Gap
                </p>

                {hasText(conversion.title) ? (
                  <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">
                    {conversion.title}
                  </h2>
                ) : null}

                {hasText(conversion.subtitle) ? (
                  <p className="mt-6 text-base leading-8 text-white/70 sm:text-lg">
                    {conversion.subtitle}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {hasSection(solution) ? (
        <section id="solution" className="relative px-4 py-24 sm:px-6">
          <SoftBackground image={solution.backgroundImage} />

          <div className="relative mx-auto max-w-7xl">
            <SectionHeader
              label="Solution"
              title={solution.title}
              subtitle={solution.subtitle}
            />

            {solutionItems.length > 0 ? (
              <div className="mt-12 grid gap-6 md:grid-cols-3">
                {solutionItems.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-[32px] bg-white p-8 shadow-sm ring-1 ring-black/5"
                  >
                    {hasText(item.image) ? (
                      <img
                        src={item.image}
                        alt={item.title || ""}
                        className="mb-6 h-44 w-full rounded-[24px] object-cover"
                      />
                    ) : null}

                    <p className="text-sm font-black text-blue-700">
                      0{index + 1}
                    </p>

                    {hasText(item.title) ? (
                      <h3 className="mt-5 text-2xl font-black text-slate-950">
                        {item.title}
                      </h3>
                    ) : null}

                    {hasText(item.desc) ? (
                      <p className="mt-4 leading-8 text-slate-600">{item.desc}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {hasSection(process) ? (
        <section id="process" className="relative bg-white px-4 py-24 sm:px-6">
          <SoftBackground image={process.backgroundImage} />

          <div className="relative mx-auto max-w-7xl">
            <SectionHeader
              label="Process"
              title={process.title}
              subtitle={process.subtitle}
            />

            {processItems.length > 0 ? (
              <div className="mt-12 grid gap-6 md:grid-cols-3">
                {processItems.map((item, index) => (
                  <div key={index} className="rounded-[32px] bg-[#f7f4ee] p-8">
                    <div className="mb-8 text-6xl font-black text-slate-200">
                      {index + 1}
                    </div>

                    {hasText(item.image) ? (
                      <img
                        src={item.image}
                        alt={item.title || ""}
                        className="mb-6 h-44 w-full rounded-[24px] object-cover"
                      />
                    ) : null}

                    {hasText(item.title) ? (
                      <h3 className="text-2xl font-black text-slate-950">
                        {item.title}
                      </h3>
                    ) : null}

                    {hasText(item.desc) ? (
                      <p className="mt-4 leading-8 text-slate-600">{item.desc}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {hasSection(showcase) ? (
        <section id="showcase" className="relative px-4 py-24 sm:px-6">
          <SoftBackground image={showcase.backgroundImage} />

          <div className="relative mx-auto max-w-7xl">
            <SectionHeader
              label="Showcase"
              title={showcase.title}
              subtitle={showcase.subtitle}
            />

            {showcaseItems.length > 0 ? (
              <div className="mt-12 grid gap-6 md:grid-cols-2">
                {showcaseItems.map((item, index) => {
                  const videoUrl = item.videoUrl || item.youtubeUrl || item.url
                  const isVideo = hasText(videoUrl)

                  return (
                    <div
                      key={index}
                      className="overflow-hidden rounded-[34px] bg-white shadow-sm ring-1 ring-black/5"
                    >
                      {isVideo ? (
                        <YoutubeBox url={videoUrl} title={item.title} />
                      ) : hasText(item.image) ? (
                        <img
                          src={item.image}
                          alt={item.title || ""}
                          className="h-80 w-full object-cover"
                        />
                      ) : null}

                      {(hasText(item.title) || hasText(item.desc)) ? (
                        <div className="p-7">
                          {hasText(item.title) ? (
                            <h3 className="text-xl font-black text-slate-950">
                              {item.title}
                            </h3>
                          ) : null}

                          {hasText(item.desc) ? (
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
      ) : null}

      {hasSection(reviews) ? (
        <section id="reviews" className="relative bg-white px-4 py-24 sm:px-6">
          <SoftBackground image={reviews.backgroundImage} />

          <div className="relative mx-auto max-w-7xl">
            <SectionHeader
              label="Reviews"
              title={reviews.title}
              subtitle={reviews.subtitle}
            />

            {reviewItems.length > 0 ? (
              <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {reviewItems.map((item, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-[32px] bg-[#f7f4ee] shadow-sm ring-1 ring-black/5"
                  >
                    {hasText(item.image) ? (
                      <img
                        src={item.image}
                        alt={item.name || ""}
                        className="h-72 w-full object-cover"
                      />
                    ) : null}

                    <div className="p-7">
                      {hasText(item.text) ? (
                        <p className="leading-8 text-slate-700">{item.text}</p>
                      ) : null}

                      {hasText(item.name) ? (
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
      ) : null}

      {hasSection(offer) ? (
        <section id="offer" className="relative px-4 py-24 sm:px-6">
          <SoftBackground image={offer.backgroundImage} />

          <div className="relative mx-auto max-w-7xl">
            <SectionHeader
              label="Offer"
              title={offer.title}
              subtitle={offer.subtitle}
            />

            {offerItems.length > 0 ? (
              <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {offerItems.map((item, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-[34px] bg-white shadow-sm ring-1 ring-black/5"
                  >
                    {hasText(item.image) ? (
                      <img
                        src={item.image}
                        alt={item.name || item.title || ""}
                        className="h-72 w-full object-cover"
                      />
                    ) : null}

                    <div className="p-7">
                      {hasText(item.name) || hasText(item.title) ? (
                        <h3 className="text-2xl font-black text-slate-950">
                          {item.name || item.title}
                        </h3>
                      ) : null}

                      {hasText(item.desc) ? (
                        <p className="mt-4 leading-8 text-slate-600">
                          {item.desc}
                        </p>
                      ) : null}

                      {hasText(item.price) ? (
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
      ) : null}

      {hasSection(faq) ? (
        <section id="faq" className="relative bg-white px-4 py-24 sm:px-6">
          <SoftBackground image={faq.backgroundImage} />

          <div className="relative mx-auto max-w-4xl">
            <SectionHeader
              label="FAQ"
              title={faq.title}
              subtitle={faq.subtitle}
            />

            {faqItems.length > 0 ? (
              <div className="mt-12 grid gap-4">
                {faqItems.map((item, index) => (
                  <div key={index} className="rounded-[28px] bg-[#f7f4ee] p-7">
                    {hasText(item.q) || hasText(item.question) ? (
                      <h3 className="text-lg font-black text-slate-950">
                        {item.q || item.question}
                      </h3>
                    ) : null}

                    {hasText(item.a) || hasText(item.answer) ? (
                      <p className="mt-3 leading-8 text-slate-600">
                        {item.a || item.answer}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {hasSection(cta) ? (
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

                {hasText(cta.title) ? (
                  <h2 className="mt-4 max-w-3xl text-3xl font-black leading-tight sm:text-5xl">
                    {cta.title}
                  </h2>
                ) : null}

                {hasText(cta.subtitle) ? (
                  <p className="mt-6 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
                    {cta.subtitle}
                  </p>
                ) : null}

                {hasWhatsapp && hasText(cta.buttonText || hero.ctaText) ? (
                  <a href={whatsappLink} target="_blank" rel="noreferrer">
                    <button className="mt-9 rounded-full bg-white px-10 py-4 font-black text-slate-950 shadow-xl transition hover:scale-[1.02]">
                      {cta.buttonText || hero.ctaText}
                    </button>
                  </a>
                ) : null}
              </div>
            </BgBlock>
          </div>
        </section>
      ) : null}
    </div>
  )
}