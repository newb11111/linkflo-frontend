"use client"

import { useState } from "react"

function normalizeWhatsapp(phone = "") {
  let cleaned = String(phone).replace(/\D/g, "")

  if (!cleaned) return ""

  if (cleaned.startsWith("0")) {
    cleaned = `6${cleaned}`
  }

  return cleaned
}

function buildWhatsappLink(data = {}) {
  const phone = normalizeWhatsapp(data?.whatsapp || "")
  if (!phone) return "#"

  const customMessage = (data?.cta?.whatsapp || "").trim()
  const brandName = (data?.brandName || "").trim()
  const heroTitle = (data?.hero?.title || "").trim()

  let message = customMessage

  if (!message) {
    if (brandName) {
      message = `Hi，我想了解 ${brandName}`
    } else if (heroTitle) {
      message = `Hi，我想了解 ${heroTitle}`
    } else {
      message = "Hi，我想了解更多"
    }
  }

  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${phone}?text=${encodedMessage}`
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

      if (parsed.pathname.startsWith("/embed/")) {
        return url
      }
    }

    return ""
  } catch {
    return ""
  }
}

function BgSection({
  image,
  overlay = "bg-black/45",
  minHeight = "min-h-[420px]",
  rounded = "rounded-[32px]",
  children,
  className = "",
}) {
  return (
    <div
      className={`relative overflow-hidden ${rounded} ${minHeight} ${className}`}
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
      <div className={`absolute inset-0 ${image ? overlay : "bg-slate-900"}`} />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export default function LandingPage({ data = {} }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const isStarter = data.packageType === "starter"
  const isPro = data.packageType === "pro"
  const isProPlus = data.packageType === "proplus"

  const painPoints = Array.isArray(data?.pain?.points)
    ? data.pain.points.filter(Boolean)
    : []

  const menuItems = Array.isArray(data?.menu)
    ? data.menu.filter(
        (item) => item?.name || item?.image || item?.price || item?.desc
      )
    : []

  const reviewItems = Array.isArray(data?.reviews?.items)
    ? data.reviews.items.filter((item) => item?.image || item?.text || item?.name)
    : []

  const videos = Array.isArray(data?.videos)
    ? data.videos.filter((item) => item?.url)
    : []

  const whatsappLink = buildWhatsappLink(data)
  const hasWhatsapp = whatsappLink !== "#"
  const ctaButtonText = data?.cta?.buttonText || "立即咨询"

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-slate-800">
      <h1 style={{color: "red"}}>TEST 24 APR</h1>
      {isProPlus ? (
        <>
          <header className="fixed inset-x-0 top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
              <div className="text-lg font-bold sm:text-xl">
                {data.brandName || "BRAND"}
              </div>

              <nav className="hidden items-center gap-6 text-sm md:flex">
                <a href="#pain" className="hover:opacity-70">
                  Problem
                </a>
                <a href="#video" className="hover:opacity-70">
                  Video
                </a>
                <a href="#reviews" className="hover:opacity-70">
                  Reviews
                </a>
                <a href="#menu" className="hover:opacity-70">
                  Menu
                </a>
                <a href="#order" className="hover:opacity-70">
                  Order
                </a>
              </nav>

              <button
                className="text-2xl md:hidden"
                onClick={() => setMenuOpen(true)}
              >
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
                <div className="mb-6 flex items-center justify-between">
                  <strong>{data.brandName || "BRAND"}</strong>
                  <button onClick={() => setMenuOpen(false)}>✕</button>
                </div>

                <div className="grid gap-4 text-sm">
                  <a href="#pain" onClick={() => setMenuOpen(false)}>
                    Problem
                  </a>
                  <a href="#video" onClick={() => setMenuOpen(false)}>
                    Video
                  </a>
                  <a href="#reviews" onClick={() => setMenuOpen(false)}>
                    Reviews
                  </a>
                  <a href="#menu" onClick={() => setMenuOpen(false)}>
                    Menu
                  </a>
                  <a href="#order" onClick={() => setMenuOpen(false)}>
                    Order
                  </a>
                </div>
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      {(data?.hero?.title || data?.hero?.subtitle || data?.hero?.image) ? (
        <section
          className={`relative overflow-hidden px-4 sm:px-6 ${
            isProPlus ? "pt-28" : "pt-8"
          }`}
        >
          <div className="mx-auto w-full max-w-6xl">
            <BgSection
              image={data?.hero?.image}
              overlay="bg-gradient-to-br from-black/75 via-black/55 to-black/35"
              minHeight="min-h-[540px] sm:min-h-[620px]"
              rounded="rounded-[36px]"
            >
              <div className="flex min-h-[540px] flex-col items-center justify-center px-6 py-16 text-center text-white sm:min-h-[620px] sm:px-10">
                <p className="mb-3 text-xs uppercase tracking-[0.35em] text-white/70 sm:text-sm">
                  Landing Page
                </p>

                <h1 className="max-w-4xl text-3xl font-black leading-tight sm:text-5xl md:text-6xl">
                  {data.hero?.title}
                </h1>

                {data.hero?.subtitle ? (
                  <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
                    {data.hero.subtitle}
                  </p>
                ) : null}

                <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
                  {hasWhatsapp ? (
                    <a href={whatsappLink} target="_blank" rel="noreferrer">
                      <button className="rounded-full bg-white px-8 py-4 font-semibold text-slate-900 transition hover:opacity-90">
                        {ctaButtonText}
                      </button>
                    </a>
                  ) : (
                    <button
                      className="rounded-full bg-white/40 px-8 py-4 font-semibold text-white cursor-not-allowed"
                      disabled
                    >
                      请先填写 WhatsApp
                    </button>
                  )}

                  {data?.brandName ? (
                    <div className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm text-white/80 backdrop-blur">
                      {data.brandName}
                    </div>
                  ) : null}
                </div>
              </div>
            </BgSection>
          </div>
        </section>
      ) : null}

      {(painPoints.length ||
        data?.pain?.title ||
        data?.pain?.subtitle ||
        data?.pain?.image) ? (
        <section id="pain" className="px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500 sm:text-sm">
              Problem
            </p>

            <h2 className="mt-3 max-w-2xl text-center text-2xl font-bold sm:text-4xl">
              {data?.pain?.title || "你现在遇到的问题"}
            </h2>

            {data?.pain?.subtitle ? (
              <p className="mt-4 max-w-2xl text-center text-base leading-7 text-slate-600">
                {data.pain.subtitle}
              </p>
            ) : null}

            <div className="mt-10 grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              {data?.pain?.image ? (
                <BgSection
                  image={data.pain.image}
                  overlay="bg-black/35"
                  minHeight="min-h-[320px] sm:min-h-[420px]"
                  rounded="rounded-[32px]"
                >
                  <div className="flex min-h-[320px] items-end p-6 text-white sm:min-h-[420px] sm:p-8">
                    <div className="max-w-lg">
                      <p className="text-sm uppercase tracking-[0.24em] text-white/70">
                        Why people don’t convert
                      </p>
                      <h3 className="mt-3 text-2xl font-bold sm:text-3xl">
                        流量有了，不代表成交会自动发生
                      </h3>
                    </div>
                  </div>
                </BgSection>
              ) : (
                <div className="rounded-[32px] bg-slate-900 p-8 text-white shadow-xl">
                  <p className="text-sm uppercase tracking-[0.24em] text-white/70">
                    Why people don’t convert
                  </p>
                  <h3 className="mt-3 text-2xl font-bold sm:text-3xl">
                    流量有了，不代表成交会自动发生
                  </h3>
                </div>
              )}

              {painPoints.length ? (
                <div className="grid gap-4">
                  {painPoints.map((point, index) => (
                    <div
                      key={index}
                      className="rounded-[24px] bg-white px-5 py-5 text-left shadow-sm sm:px-6"
                    >
                      <div className="mb-2 text-xs uppercase tracking-[0.22em] text-slate-400">
                        Point {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="text-base leading-7 text-slate-700">
                        {point}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {isProPlus && videos.length ? (
        <section id="video" className="px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500 sm:text-sm">
              Video
            </p>

            <h2 className="mt-3 max-w-2xl text-2xl font-bold sm:text-4xl">
              {data.videoTitle || "真实效果展示"}
            </h2>

            <div className="mt-10 grid w-full gap-6">
              {videos.map((video, index) => {
                const embedUrl = getYoutubeEmbedUrl(video.url)

                return (
                  <div
                    key={index}
                    className="aspect-video overflow-hidden rounded-[28px] bg-white shadow-xl"
                  >
                    {embedUrl ? (
                      <iframe
                        className="h-full w-full"
                        src={embedUrl}
                        title={`Video ${index + 1}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-500">
                        视频链接错误（请填 YouTube 链接）
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      ) : null}

      {(isPro || isProPlus) && data?.proImage ? (
        <section className="px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto w-full max-w-6xl">
            <BgSection
              image={data.proImage}
              overlay="bg-gradient-to-r from-black/65 to-black/25"
              minHeight="min-h-[380px] sm:min-h-[500px]"
              rounded="rounded-[36px]"
            >
              <div className="flex min-h-[380px] items-end p-6 text-white sm:min-h-[500px] sm:p-10">
                <div className="max-w-2xl">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/70 sm:text-sm">
                    Result
                  </p>
                  <h2 className="mt-3 text-2xl font-bold sm:text-4xl">
                    {data.proImageTitle || "效果展示"}
                  </h2>
                </div>
              </div>
            </BgSection>
          </div>
        </section>
      ) : null}

      {!isStarter && (reviewItems.length || data?.reviews?.image || data?.reviews?.title) ? (
        <section id="reviews" className="px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500 sm:text-sm">
              Reviews
            </p>

            <h2 className="mt-3 max-w-2xl text-2xl font-bold sm:text-4xl">
              {data?.reviews?.title || "真实反馈"}
            </h2>

            {data?.reviews?.image ? (
              <img
                src={data.reviews.image}
                alt="Reviews"
                className="mt-10 w-full max-w-3xl rounded-[28px] shadow-xl"
              />
            ) : null}

            {reviewItems.length ? (
              <div className="mt-10 grid w-full gap-6 md:grid-cols-2">
                {reviewItems.map((item, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-[28px] bg-white text-left shadow-lg"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name || `Review ${index + 1}`}
                        className="h-64 w-full object-cover"
                      />
                    ) : null}

                    <div className="p-6">
                      {item.text ? (
                        <p className="text-sm leading-7 text-slate-600 sm:text-base">
                          {item.text}
                        </p>
                      ) : null}

                      {item.name ? (
                        <p className="mt-4 font-semibold">{item.name}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {menuItems.length ? (
        <section id="menu" className="px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500 sm:text-sm">
              Offers
            </p>

            <div className="mb-8 mt-3">
              <h2 className="text-2xl font-bold sm:text-4xl">
                {data.menuTitle || "热门选择"}
              </h2>
            </div>

            <div className="grid w-full gap-6">
              {menuItems.map((item, index) => (
                <div
                  key={index}
                  className="rounded-[28px] bg-white p-5 text-left shadow-lg sm:p-6"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name || `Menu ${index + 1}`}
                      className="mb-5 h-auto max-h-[420px] w-full rounded-[22px] object-cover"
                    />
                  ) : null}

                  {item.name ? (
                    <h3 className="text-lg font-bold sm:text-xl">{item.name}</h3>
                  ) : null}

                  {item.desc ? (
                    <p className="mt-2 text-sm leading-7 text-slate-500 sm:text-base">
                      {item.desc}
                    </p>
                  ) : null}

                  {item.price ? (
                    <p className="mt-4 text-lg font-semibold">{item.price}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section id="order" className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto w-full max-w-6xl">
          <BgSection
            image={data?.hero?.image || data?.proImage || ""}
            overlay="bg-gradient-to-br from-black/80 via-black/60 to-black/45"
            minHeight="min-h-[320px] sm:min-h-[420px]"
            rounded="rounded-[36px]"
          >
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-14 text-center text-white sm:min-h-[420px] sm:px-10">
              <p className="text-xs uppercase tracking-[0.28em] text-white/65 sm:text-sm">
                CTA
              </p>

              <h2 className="mt-3 max-w-2xl text-2xl font-bold sm:text-4xl">
                {data?.cta?.title || "现在开始提升你的生意"}
              </h2>

              {data?.cta?.subtitle ? (
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/80">
                  {data.cta.subtitle}
                </p>
              ) : null}

              {hasWhatsapp ? (
                <a
                  href={whatsappLink}
                  className="mt-8 inline-block"
                  target="_blank"
                  rel="noreferrer"
                >
                  <button className="rounded-full bg-white px-10 py-4 font-semibold text-slate-900 transition hover:opacity-90">
                    {ctaButtonText}
                  </button>
                </a>
              ) : (
                <button
                  className="mt-8 rounded-full bg-white/30 px-10 py-4 text-white cursor-not-allowed"
                  disabled
                >
                  请先填写 WhatsApp
                </button>
              )}
            </div>
          </BgSection>
        </div>
      </section>
    </div>
  )
}