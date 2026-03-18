import type { TemplateKey } from './types'

export interface TemplateConfig {
  key: TemplateKey
  label: string
  description: string
  preview: string
  previewGradient?: string
  category: 'afg' | 'dark' | 'light' | 'pro' | 'style'
  styleTag?: string
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
  // ── 스타일별 신규 템플릿 ──
  'card-type': {
    key: 'card-type',
    label: '카드형',
    description: '명함 카드 느낌 — 깔끔한 정보 배치',
    preview: '#1a1a2e',
    previewGradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    category: 'style',
    styleTag: '카드형',
  },
  'minimal-type': {
    key: 'minimal-type',
    label: '미니멀형',
    description: '여백 중심 — 텍스트만 강조',
    preview: '#fafafa',
    previewGradient: 'linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)',
    category: 'style',
    styleTag: '미니멀형',
  },
  'premium-type': {
    key: 'premium-type',
    label: '프리미엄형',
    description: '골드/블랙 — 최고급 명함 느낌',
    preview: '#0a0a0a',
    previewGradient: 'linear-gradient(135deg, #0a0a0a 0%, #1a1200 50%, #0a0a0a 100%)',
    category: 'style',
    styleTag: '프리미엄형',
  },
  'text-focus': {
    key: 'text-focus',
    label: '텍스트 중심형',
    description: '정보/텍스트 강조 — 사진 최소화',
    preview: '#f8fafc',
    previewGradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    category: 'style',
    styleTag: '텍스트형',
  },
  'visual-focus': {
    key: 'visual-focus',
    label: '비주얼 중심형',
    description: '사진/이미지 강조 — 풀스크린 프로필',
    preview: '#0f0f0f',
    previewGradient: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)',
    category: 'style',
    styleTag: '비주얼형',
  },
  'ceo-type': {
    key: 'ceo-type',
    label: 'CEO형',
    description: '대표/임원 전용 — 권위 있는 블랙 골드',
    preview: '#050505',
    previewGradient: 'linear-gradient(135deg, #050505 0%, #1a1000 100%)',
    category: 'style',
    styleTag: 'CEO형',
  },
  'consultant-type': {
    key: 'consultant-type',
    label: '컨설턴트형',
    description: '전문 컨설턴트 — 네이비 & 화이트',
    preview: '#0d2137',
    previewGradient: 'linear-gradient(135deg, #0d2137 0%, #1a3a5c 100%)',
    category: 'style',
    styleTag: '컨설턴트형',
  },
  'finance-expert': {
    key: 'finance-expert',
    label: '금융전문가형',
    description: '금융 전문가 — 딥블루 & 실버',
    preview: '#0a1628',
    previewGradient: 'linear-gradient(135deg, #0a1628 0%, #132040 100%)',
    category: 'style',
    styleTag: '금융전문가형',
  },
}

export const TEMPLATE_LIST = Object.values(TEMPLATES)
export const DEFAULT_TEMPLATE: TemplateKey = 'afg-dark'

// 카테고리별 그룹
export const TEMPLATE_GROUPS: { label: string; keys: TemplateKey[] }[] = [
  { label: 'AFG 공식', keys: ['afg-dark', 'afg-light'] },
  { label: '다크/딥', keys: ['modern-gray', 'navy-pro', 'premium-black', 'slate-pro'] },
  { label: '라이트', keys: ['clean-white', 'warm-white'] },
  { label: '스타일별', keys: ['card-type', 'minimal-type', 'premium-type', 'text-focus', 'visual-focus', 'ceo-type', 'consultant-type', 'finance-expert'] },
]
