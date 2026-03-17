import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug)
}

export function ensureHttps(url: string): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

export function nullToEmpty(val: string | null | undefined): string {
  return val ?? ''
}
