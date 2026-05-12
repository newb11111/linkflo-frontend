"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { API_URL } from "../lib/config"
import { getAdminPassword } from "../lib/adminAuth"
import RealtimeChatBox from "./RealtimeChatBox"

function headers(role) {
  return role === "admin" ? { "x-admin-password": getAdminPassword() } : {}
}

export default function InboxPage({ role = "customer", title = "Inbox" }) {
  const [items, setItems] = useState([])
  const [active, setActive] = useState("")
  const [error, setError] = useState("")

  async function load() {
    try {
      const res = await fetch(`${API_URL}/api/conversations`, { credentials: "include", headers: headers(role) })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.message || "Failed")
      setItems(json.conversations || [])
      if (!active && json.conversations?.[0]) setActive(json.conversations[0].id)
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => { load() }, [])

  const selected = items.find((x) => x.id === active)

  return (
    <main className="inbox-page">
      <div className="inbox-shell">
        <div className="inbox-top">
          <div>
            <p>LinkFlo Conversation</p>
            <h1>{title}</h1>
          </div>
          <Link href={role === "merchant" ? "/merchant" : role === "admin" ? "/admin" : "/account"}>Back</Link>
        </div>
        {error ? <div className="chat-error">{error}</div> : null}
        <div className="inbox-grid">
          <aside className="inbox-list">
            {items.length === 0 ? <div className="inbox-empty">No conversations yet.</div> : items.map((c) => (
              <button key={c.id} onClick={() => setActive(c.id)} className={active === c.id ? "active" : ""}>
                <b>{c.product_name || c.product_title || "Product conversation"}</b>
                <span>{role === "admin" ? `${c.customer_name || "Customer"} ↔ ${c.merchant_name || "Merchant"}` : role === "merchant" ? c.customer_name || "Customer" : c.merchant_name || "Merchant"}</span>
                <small>{c.risk_level === "WARNING" ? "⚠️ Warning" : c.last_message || "Open conversation"}</small>
              </button>
            ))}
          </aside>
          <section className="inbox-chat">
            {selected ? <RealtimeChatBox role={role} conversationId={selected.id} product={{ slug: selected.product_slug, name: selected.product_name || selected.product_title }} /> : <div className="chat-empty"><b>Select a conversation</b></div>}
          </section>
        </div>
      </div>
    </main>
  )
}
