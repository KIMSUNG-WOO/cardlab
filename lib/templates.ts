import type { TemplateKey } from './types'

export interface TemplateConfig {
  key: TemplateKey
  label: string
  description: string
  preview: string
  previewGradient?: string
  category: 'afg' | 'dark' | 'light' | 'pro'
}

export const TEMPLATES: Record<TemplateKey, TemplateConfig> = {
  'afg-dark': {
    key: 'afg-dark',
    label: 'AFG 다크',
    description: '어센틱금융그룹 공식 — 전용 배경 + 딥블랙',
    preview: '#0a0a0a',
    previewGradient: 'linear-gradient(135deg, #0a0a0a 0%, #0d1520 100%)',
    category: 'afg',
  },
  'afg-light': {
    key: 'afg-light',
    label: 'AFG 라이트',
    description: '어센틱금융그룹 — 밝고 깔끔한 화이트',
    preview: '#f5f6f8',
    previewGradient: 'linear-gradient(135deg, #f5f6f8 0%, #e9ecef 100%)',
    category: 'afg',
  },
  'modern-gray': {
    key: 'modern-gray',
    label: '모던 그레이',
    description: '세련된 다크 그레이 — 토스 스타일',
    preview: '#18181b',
    previewGradient: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
    category: 'dark',
  },
  'navy-pro': {
    key: 'navy-pro',
    label: '네이비 프로',
    description: '딥 네이비 — 금융/전문직 프리미엄',
    preview: '#0c1220',
    previewGradient: 'linear-gradient(135deg, #0c1220 0%, #162032 100%)',
    category: 'pro',
  },
  'clean-white': {
    key: 'clean-white',
    label: '클린 화이트',
    description: '순백 미니멀 — 범용적이고 깔끔',
    preview: '#ffffff',
    previewGradient: 'linear-gradient(135deg, #ffffff 0%, #f4f4f5 100%)',
    category: 'light',
  },
  'premium-black': {
    key: 'premium-black',
    label: '프리미엄 블랙',
    description: '완전 블랙 — CEO/대표 전용 고급',
    preview: '#000000',
    previewGradient: 'linear-gradient(135deg, #000000 0%, #111111 100%)',
    category: 'dark',
  },
  'slate-pro': {
    key: 'slate-pro',
    label: '슬레이트 프로',
    description: '차콜 슬레이트 — 컨설턴트/전문직',
    preview: '#1e293b',
    previewGradient: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    category: 'pro',
  },
  'warm-white': {
    key: 'warm-white',
    label: '웜 화이트',
    description: '따뜻한 크림 화이트 — 친근하고 세련',
    preview: '#faf9f7',
    previewGradient: 'linear-gradient(135deg, #faf9f7 0%, #f0ede8 100%)',
    category: 'light',
  },
}

export const TEMPLATE_LIST = Object.values(TEMPLATES)
export const DEFAULT_TEMPLATE: TemplateKey = 'afg-dark'

// 색상 추천 시스템
export const COLOR_RECOMMENDATIONS: Record<string, { compatible: string[]; tip: string }> = {
  '#000000': { compatible: ['#ffffff', '#f5f5f5', '#d4af37'], tip: '블랙에는 화이트, 실버, 골드가 잘 어울립니다' },
  '#ffffff': { compatible: ['#000000', '#1a1a1a', '#4263eb'], tip: '화이트에는 블랙, 차콜, 로열블루가 잘 어울립니다' },
  '#0a0a0a': { compatible: ['#94a3b8', '#3b82f6', '#f8fafc'], tip: '딥블랙에는 슬레이트, 블루, 화이트가 잘 어울립니다' },
  '#18181b': { compatible: ['#a1a1aa', '#e4e4e7', '#71717a'], tip: '다크그레이에는 실버, 라이트그레이가 잘 어울립니다' },
  '#0c1220': { compatible: ['#4a9eff', '#7fa8cc', '#f0f4ff'], tip: '네이비에는 스카이블루, 파우더블루, 라이트블루가 잘 어울립니다' },
}
