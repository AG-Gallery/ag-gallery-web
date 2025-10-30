const STORAGE_KEY = 'ag-client-id'

function generateClientId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export function ensureClientId(): string | null {
  if (typeof window === 'undefined') return null

  try {
    const existing = window.localStorage.getItem(STORAGE_KEY)
    if (existing && existing.trim().length > 0) return existing

    const next = generateClientId()
    window.localStorage.setItem(STORAGE_KEY, next)
    return next
  } catch {
    return null
  }
}
