export function getToken(role) {
  if (typeof window === "undefined") return ""
  return localStorage.getItem(`${role}_token`) || ""
}
export function setToken(role, token) {
  if (typeof window === "undefined") return
  localStorage.setItem(`${role}_token`, token || "")
}
export function clearToken(role) {
  if (typeof window === "undefined") return
  localStorage.removeItem(`${role}_token`)
}
export function authHeaders(role, extra = {}) {
  const token = getToken(role)
  return { ...extra, Authorization: token ? `Bearer ${token}` : "" }
}
export function money(value) { return `RM ${Number(value || 0).toFixed(2)}` }
