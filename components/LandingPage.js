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
      {isProPlus ? (
        <>
          <header className="fixed inset-x-0 top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur">
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
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
          className={`relative overflow-hidden ${
            isProPlus ? "pt-28" : "pt-10"
          }`}
        >
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-14 text-center sm:px-6 sm:py-16">
            <p className="mb-3 text-xs uppercase tracking-[0.28em] text-slate-500 sm:text-sm">
              Landing Page
            </p>

            <h1 className="max-w-3xl text-3xl font-black leading-tight sm:text-5xl md:text-6xl">
              {data.hero?.title}
            </h1>

            {data.hero?.subtitle ? (
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                {data.hero.subtitle}
              </p>
            ) : null}

            {hasWhatsapp ? (
              <a
                href={whatsappLink}
                className="mt-8 inline-block"
                target="_blank"
                rel="noreferrer"
              >
                <button className="rounded-full bg-black px-8 py-4 font-semibold text-white transition hover:opacity-90">
                  {ctaButtonText}
                </button>
              </a>
            ) : (
              <button
                className="mt-8 rounded-full bg-gray-300 px-8 py-4 font-semibold text-gray-600 cursor-not-allowed"
                disabled
              >
                请先填写 WhatsApp
              </button>
            )}

            {data.hero?.image ? (
              <div className="mt-10 w-full max-w-3xl rounded-[28px] bg-white p-3 shadow-2xl sm:mt-12">
                <img
                  src={data.hero.image}
                  alt="Hero"
                  className="h-auto max-h-[520px] w-full rounded-[22px] object-cover"
                />
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {(painPoints.length ||
        data?.pain?.title ||
        data?.pain?.subtitle ||
        data?.pain?.image) ? (
        <section id="pain" className="px-4 py-14 sm:px-6 sm:py-16">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500 sm:text-sm">
              Problem
            </p>

            <h2 className="mt-3 max-w-2xl text-2xl font-bold sm:text-4xl">
              {data?.pain?.title || "你现在遇到的问题"}
            </h2>

            {data?.pain?.subtitle ? (
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                {data.pain.subtitle}
              </p>
            ) : null}

            {data?.pain?.image ? (
              <img
                src={data.pain.image}
                alt="Pain"
                className="mt-10 w-full max-w-3xl rounded-[28px] object-cover shadow-xl"
              />
            ) : null}

            {painPoints.length ? (
              <div className="mt-10 grid w-full gap-4">
                {painPoints.map((point, index) => (
                  <div
                    key={index}
                    className="rounded-2xl bg-white px-5 py-5 text-left shadow-sm"
                  >
                    {point}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {isProPlus && videos.length ? (
        <section id="video" className="px-4 py-14 sm:px-6 sm:py-16">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
            <h2 className="max-w-2xl text-2xl font-bold sm:text-4xl">
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
        <section className="px-4 py-14 text-center sm:px-6 sm:py-16">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center">
            <h2 className="max-w-2xl text-2xl font-bold sm:text-4xl">
              {data.proImageTitle || "效果展示"}
            </h2>

            <img
              src={data.proImage}
              alt="Pro display"
              className="mt-10 w-full max-w-3xl rounded-[30px] shadow-2xl"
            />
          </div>
        </section>
      ) : null}

      {!isStarter && (reviewItems.length || data?.reviews?.image || data?.reviews?.title) ? (
        <section id="reviews" className="px-4 py-14 sm:px-6 sm:py-16">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
            <h2 className="max-w-2xl text-2xl font-bold sm:text-4xl">
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
              <div className="mt-10 grid w-full gap-6">
                {reviewItems.map((item, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-[28px] bg-white shadow-lg"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name || `Review ${index + 1}`}
                        className="h-auto max-h-[420px] w-full object-cover"
                      />
                    ) : null}

                    <div className="p-6 text-left">
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
        <section id="menu" className="px-4 py-14 sm:px-6 sm:py-16">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
            <div className="mb-8">
              <h2 className="text-2xl font-bold sm:text-4xl">
                {data.menuTitle || "热门选择"}
              </h2>
            </div>

            <div className="grid w-full gap-6">
              {menuItems.map((item, index) => (
                <div
                  key={index}
                  className="rounded-[28px] bg-white p-5 shadow-lg"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name || `Menu ${index + 1}`}
                      className="mb-5 h-auto max-h-[420px] w-full rounded-[22px] object-cover"
                    />
                  ) : null}

                  <div className="text-left">
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
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section id="order" className="px-4 py-16 text-center sm:px-6 sm:py-20">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center">
          <h2 className="max-w-2xl text-2xl font-bold sm:text-4xl">
            {data?.cta?.title || "现在开始提升你的生意"}
          </h2>

          {data?.cta?.subtitle ? (
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
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
              <button className="rounded-full bg-black px-10 py-4 text-white transition hover:opacity-90">
                {ctaButtonText}
              </button>
            </a>
          ) : (
            <button
              className="mt-8 rounded-full bg-gray-300 px-10 py-4 text-gray-600 cursor-not-allowed"
              disabled
            >
              请先填写 WhatsApp
            </button>
          )}
        </div>
      </section>
    </div>
  )
}