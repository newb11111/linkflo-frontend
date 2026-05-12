const isDev = process.env.NODE_ENV !== "production"

const rawApiUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  (isDev ? "http://localhost:5000" : "")

const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  process.env.VERCEL_URL ||
  (isDev ? "http://localhost:3000" : "")

function normalizeUrl(url = "") {
  if (!url) return ""
  const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`
  return withProtocol.replace(/\/$/, "")
}

const API_URL = normalizeUrl(rawApiUrl)
const SITE_URL = normalizeUrl(rawSiteUrl)

export { API_URL, SITE_URL }

export function getSiteOrigin() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin
  }

  return SITE_URL || "http://localhost:3000"
}
