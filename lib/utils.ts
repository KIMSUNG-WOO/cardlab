export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}
export function isValidSlug(s: string) { return /^[a-z0-9-]+$/.test(s) }
export function ensureHttps(url: string) {
  if (!url) return ''
  return url.startsWith('http') ? url : `https://${url}`
}
export function nullToEmpty(v: string | null | undefined) { return v ?? '' }
export function generateId() {
  return Math.random().toString(36).substring(2, 10)
}
