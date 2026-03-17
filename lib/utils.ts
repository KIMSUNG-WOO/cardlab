import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// slug 유효성 검사: 영문 소문자, 숫자, 하이픈만 허용
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug)
}

// 전화번호 포맷: 010-1234-5678
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }
  return phone
}

// URL에 프로토콜이 없으면 추가
export function ensureHttps(url: string): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

// null/undefined → undefined 변환 (폼 초기값용)
export function nullToEmpty(val: string | null | undefined): string {
  return val ?? ''
}
