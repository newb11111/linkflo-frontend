"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId") || searchParams.get("order_id") || ""

  return (
    <main style={{ padding: 40, maxWidth: 720, margin: "0 auto" }}>
      <h1>Payment Success</h1>
      <p>Your payment has been received.</p>

      {orderId && (
        <p>
          Order ID: <strong>{orderId}</strong>
        </p>
      )}

      {orderId && (
        <Link href={`/order/${orderId}`}>
          View Order Tracking
        </Link>
      )}
    </main>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40 }}>Loading...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}