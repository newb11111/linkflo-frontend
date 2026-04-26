"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import PageForm from "@/components/admin/PageForm"
import { API_URL } from "@/lib/config"
import { getAdminHeaders } from "@/lib/adminAuth"

const defaultReviewItem = { image: "", text: "", name: "" }

function safeArray(value, fallback = []) {
  if (Array.isArray(value)) return value

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : fallback
    } catch {
      return fallback
    }
  }

  return fallback
}

function normalizeReviewItem(item = {}) {
  return {
    image: item.image || "",
    text: item.text || item.content || "",
    name: item.name || "",
  }
}

function normalizePageData(data = {}) {
  const reviews = data.reviews && typeof data.reviews === "object" && !Array.isArray(data.reviews)
    ? data.reviews
    : {}

  return {
    ...data,
    reviews: {
      title: reviews.title || "",
      image: reviews.image || "",
      items: safeArray(reviews.items, [defaultReviewItem, defaultReviewItem, defaultReviewItem]).map(normalizeReviewItem),
    },
    features: safeArray(data.features, []),
    faqs: safeArray(data.faqs, []),
    gallery: safeArray(data.gallery, []),
  }
}

export default function EditPage() {
  const params = useParams()
  const router = useRouter()
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/page/${params.id}`, {
          headers: getAdminHeaders(),
        })

        const json = await res.json()
        if (!res.ok) throw new Error(json.message || "Failed to load page")

        setPage({
          ...json,
          data: normalizePageData(json.data),
        })
      } catch (err) {
        setError(err.message || "Failed to load page")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) run()
  }, [params.id])

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>
  if (error) return <div style={{ padding: 24 }}>{error}</div>
  if (!page) return <div style={{ padding: 24 }}>Page not found</div>

  return (
    <PageForm
      mode="edit"
      pageId={page.id}
      slug={page.slug}
      initialForm={{
        name: page.name || "",
        whatsapp: page.whatsapp || "",
        plan: page.plan || "starter",
      }}
      initialData={page.data}
      onSuccess={() => router.refresh()}
    />
  )
}
