"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { io } from "socket.io-client"
import Link from "next/link"
import { API_URL } from "../lib/config"
import { getAdminPassword } from "../lib/adminAuth"

function headersForRole(role) {
  if (role === "admin") return { "x-admin-password": getAdminPassword() }
  return {}
}

function actorClass(type, role) {
  if (type === role) return "chat-msg mine"
  if (type === "merchant") return "chat-msg seller"
  if (type === "admin") return "chat-msg admin"
  return "chat-msg customer"
}

export default function RealtimeChatBox({
  role = "customer",
  product = null,
  refCode = "",
  conversationId: initialConversationId = "",
  compact = false,
}) {
  const [open, setOpen] = useState(!compact)
  const [conversationId, setConversationId] = useState(initialConversationId || "")
  const [messages, setMessages] = useState([])
  const [text, setText] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const socketRef = useRef(null)
  const endRef = useRef(null)

  const productSlug = product?.slug || product?.product_slug || ""
  const checkoutHref = productSlug ? `/checkout/${productSlug}${refCode ? `?ref=${encodeURIComponent(refCode)}` : ""}` : "#"

  const title = useMemo(() => {
    if (role === "customer") return product?.name ? `Ask ${product.name}` : "Ask Seller"
    if (role === "merchant") return "Merchant Inbox"
    if (role === "admin") return "Admin Monitor"
    return "Chat"
  }, [role, product?.name])

  async function api(path, options = {}) {
    const res = await fetch(`${API_URL}${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...headersForRole(role), ...(options.headers || {}) },
      ...options,
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(json.message || "Request failed")
    return json
  }

  async function startConversation(firstMessage = "") {
    if (conversationId) return conversationId
    if (!product?.id && !productSlug) throw new Error("Product missing")
    const json = await api("/api/conversations/start", {
      method: "POST",
      body: JSON.stringify({ productId: product?.id, productSlug, refCode, message: firstMessage }),
    })
    setConversationId(json.conversation.id)
    return json.conversation.id
  }

  async function loadMessages(id = conversationId) {
    if (!id) return
    const json = await api(`/api/conversations/${id}/messages`)
    setMessages(json.messages || [])
  }

  useEffect(() => {
    if (!conversationId) return
    loadMessages(conversationId).catch((e) => setError(e.message))
  }, [conversationId])

  useEffect(() => {
    if (!conversationId || !open) return
    const socket = io(API_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      auth: role === "admin" ? { adminPassword: getAdminPassword() } : {},
    })
    socketRef.current = socket
    socket.on("connect", () => { setError(""); socket.emit("conversation:join", { conversationId }) })
    socket.on("message:new", (msg) => setMessages((old) => old.some((x) => x.id === msg.id) ? old : [...old, msg]))
    socket.on("connect_error", (err) => setError(err?.message || "Chat connection failed"))
    socket.on("message:blocked", (payload) => setError(payload?.message || "Message blocked"))
    socket.on("conversation:error", (payload) => setError(payload?.message || "Chat error"))
    return () => socket.disconnect()
  }, [conversationId, open, role])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, open])

  async function send() {
    const message = text.trim()
    if (!message) return
    setError("")
    setLoading(true)
    try {
      const id = conversationId || await startConversation("")
      setText("")
      if (socketRef.current?.connected) {
        socketRef.current.emit("message:send", { conversationId: id, message })
      } else {
        const json = await api(`/api/conversations/${id}/messages`, { method: "POST", body: JSON.stringify({ message }) })
        setMessages((old) => [...old, json.message])
      }
    } catch (e) {
      setError(e.message)
      if (/Customer login/i.test(e.message)) setError("请先登录顾客账号，才可以和商家聊天。")
    } finally {
      setLoading(false)
    }
  }

  if (compact && !open) {
    return <button className="chat-float-btn" onClick={() => setOpen(true)}>💬 Ask Seller</button>
  }

  return (
    <div className={compact ? "chat-panel floating" : "chat-panel"}>
      <div className="chat-head">
        <div>
          <b>{title}</b>
          <span>Real-time · Protected by LinkFlo</span>
        </div>
        {compact ? <button onClick={() => setOpen(false)}>×</button> : null}
      </div>

      <div className="chat-warning">
        为了保护 佣金和订单，电话、WhatsApp、外部链接、私下转账会被拦截并记录。
      </div>

      <div className="chat-body">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <b>Start the conversation</b>
            <p>Ask about stock, delivery, size, service details or anything before checkout.</p>
          </div>
        ) : messages.map((m) => (
          <div key={m.id} className={actorClass(m.sender_type, role)}>
            <small>{m.sender_type}{m.is_blocked ? " · BLOCKED" : ""}</small>
            <p>{m.is_blocked ? "[Blocked external contact / direct payment attempt]" : m.message}</p>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {error ? <div className="chat-error">{error}</div> : null}

      <div className="chat-actions-row">
        {productSlug ? <Link href={checkoutHref}>Pay Now</Link> : null}
        <Link href={role === "merchant" ? "/merchant/inbox" : role === "admin" ? "/admin" : "/account/inbox"}>{role === "merchant" ? "Merchant Inbox" : role === "admin" ? "Admin" : "My Inbox"}</Link>
      </div>

      <div className="chat-compose">
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your message..." onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }} />
        <button onClick={send} disabled={loading}>{loading ? "..." : "Send"}</button>
      </div>
    </div>
  )
}
