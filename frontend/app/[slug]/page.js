import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function LegacySlugRedirect({ params }) {
  const resolvedParams = await params
  const slug = resolvedParams?.slug
  if (!slug) redirect("/")
  redirect(`/p/${encodeURIComponent(slug)}`)
}
