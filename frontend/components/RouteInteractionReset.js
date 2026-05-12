"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

function cleanupInteractionLock() {
  if (typeof document === "undefined") return

  const html = document.documentElement
  const body = document.body

  html.style.overflow = ""
  html.style.pointerEvents = ""
  body.style.overflow = ""
  body.style.pointerEvents = ""
  body.style.filter = ""
  body.style.opacity = ""

  // Remove any mobile sidebar overlay that might survive browser back/forward cache.
  document.querySelectorAll('[data-linkflo-mobile-overlay="true"]').forEach((node) => {
    try { node.remove() } catch {}
  })

  // Extra defensive cleanup for old builds that did not mark the overlay.
  document.querySelectorAll('button[aria-label="Close menu"], button[aria-label="Close"]').forEach((node) => {
    try {
      const style = window.getComputedStyle(node)
      if (style.position === "fixed" && style.zIndex && Number(style.zIndex) >= 30) node.remove()
    } catch {}
  })
}

export default function RouteInteractionReset() {
  const pathname = usePathname()

  useEffect(() => {
    cleanupInteractionLock()
    const onPageShow = () => cleanupInteractionLock()
    window.addEventListener("pageshow", onPageShow)
    return () => window.removeEventListener("pageshow", onPageShow)
  }, [pathname])

  return null
}
