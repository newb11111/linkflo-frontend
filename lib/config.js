const isDev = process.env.NODE_ENV !== "production"

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  (isDev ? "http://localhost:5000" : "")
).replace(/\/$/, "")

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (isDev ? "http://localhost:3000" : "")
).replace(/\/$/, "")

export { API_URL, SITE_URL }

export function getSiteOrigin() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin
  }

  return SITE_URL || "http://localhost:3000"
}
