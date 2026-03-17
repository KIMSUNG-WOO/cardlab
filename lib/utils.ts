export function isValidSlug(s: string) { return /^[a-z0-9-]+$/.test(s) }

export function ensureHttps(url: string) {
  if (!url) return ''
  if (url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('sms:')) return url
  return url.startsWith('http') ? url : `https://${url}`
}

export function nullToEmpty(v: string | null | undefined) { return v ?? '' }

export function generateId() {
  return Math.random().toString(36).substring(2, 10)
}

export function formatPhone(phone: string) {
  return phone.replace(/[^0-9]/g, '').replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const el = document.createElement('textarea')
    el.value = text
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    return true
  }
}
