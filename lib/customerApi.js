import { API_URL } from './config'

export async function api(path, options = {}) {
  const { headers = {}, credentials = 'include', ...rest } = options
  const isFormData = typeof FormData !== 'undefined' && rest.body instanceof FormData
  const mergedHeaders = isFormData ? { ...headers } : { 'Content-Type': 'application/json', ...headers }

  const res = await fetch(`${API_URL}${path}`, {
    credentials,
    ...rest,
    headers: mergedHeaders,
  })

  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.message || 'Request failed')
  return json
}

export const formatMoney = v => `RM ${Number(v || 0).toFixed(2)}`
export function normalizePhone(p = '') {
  let c = String(p).replace(/\D/g, '')
  if (c.startsWith('0')) c = `6${c}`
  return c
}
