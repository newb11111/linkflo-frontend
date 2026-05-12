export function getAdminPassword() {
  if (typeof window === "undefined") return ""
  return localStorage.getItem("admin_password") || ""
}

export function getAdminHeaders(extraHeaders = {}) {
  const password = getAdminPassword()

  return {
    ...extraHeaders,
    "x-admin-password": password,
  }
}
