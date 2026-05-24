import { getSavedLang, t } from './i18n'

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export function setToken(token) {
  if (typeof window !== 'undefined' && token) localStorage.setItem('linkflo_token', token)
}
export function setUser(user) {
  if (typeof window !== 'undefined' && user) localStorage.setItem('linkflo_user', JSON.stringify(user))
}
export function getToken() {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('linkflo_token') || ''
}
export function getUser() {
  if (typeof window === 'undefined') return null
  try { return JSON.parse(localStorage.getItem('linkflo_user') || 'null') } catch { return null }
}
export function clearAuth() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('linkflo_token')
    localStorage.removeItem('linkflo_user')
  }
}

export async function api(path, options = {}) {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
  const headers = { ...(isFormData ? {} : { 'Content-Type': 'application/json' }), ...(options.headers || {}) }
  const token = getToken()
  if (token && !headers.Authorization) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, credentials: 'include', headers, cache: options.cache || 'no-store' })
  } catch (err) {
    throw new Error(t(getSavedLang(), 'apiConnectionError', { url: API_URL }))
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') clearAuth()
    throw new Error(data.message || `Request failed (${res.status})`)
  }
  return data
}

export async function logout() {
  try {
    await fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' })
  } catch {}
  clearAuth()
}
