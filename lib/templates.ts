import type { TemplateKey } from './types'

export interface TemplateConfig {
  key: TemplateKey
  label: string
  description: string
  preview: string
}

export const TEMPLATES: Record<TemplateKey, TemplateConfig> = {
  'afg-dark': {
    key: 'afg-dark',
    label: 'AFG 다크',
    description: '어센틱금융그룹 공식 — 블랙/딥네이비 프리미엄',
    preview: '#0a0a0a',
  },
  'afg-light': {
    key: 'afg-light',
    label: 'AFG 라이트',
    description: '어센틱금융그룹 — 밝고 깔끔한 화이트',
    preview: '#f8f9fa',
  },
  'modern-gray': {
    key: 'modern-gray',
    label: '모던 그레이',
    description: '세련된 그레이톤 — 토스 스타일 미니멀',
    preview: '#18181b',
  },
  'navy-pro': {
    key: 'navy-pro',
    label: '네이비 프로',
    description: '딥 네이비 — 전문직 고급 느낌',
    preview: '#0c1220',
  },
  'clean-white': {
    key: 'clean-white',
    label: '클린 화이트',
    description: '완전 화이트 — 심플하고 범용적',
    preview: '#ffffff',
  },
}

export const TEMPLATE_LIST = Object.values(TEMPLATES)
export const DEFAULT_TEMPLATE: TemplateKey = 'afg-dark'
