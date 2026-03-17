import type { TemplateConfig, TemplateKey } from './types'

// =============================================
// 템플릿 시스템 정의
// 새 템플릿은 이 객체에 추가하기만 하면 됨
// =============================================

export const TEMPLATES: Record<TemplateKey, TemplateConfig> = {
  // ─────────────────────────────────────────
  // 1. 어센틱 금융그룹 전용 템플릿
  // ─────────────────────────────────────────
  'authentic-finance': {
    key: 'authentic-finance',
    label: '어센틱 금융그룹',
    description: '블랙/딥네이비 기반 프리미엄 금융 전문가 디자인',
    bgPrimary: '#0a0a0a',
    bgSecondary: '#0d1b2e',
    bgCard: '#111827',
    textPrimary: '#ffffff',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    accentColor: '#1e40af',
    accentLight: '#3b82f6',
    btnPrimary: 'bg-[#1e3a5f] hover:bg-[#1e40af] text-white border border-[#2563eb]/30',
    btnSecondary: 'bg-[#1a1a1a] hover:bg-[#222] text-[#94a3b8] border border-[#2a3444]',
    btnText: '#ffffff',
    borderColor: '#1e3a5f',
    cardRadius: '1.25rem',
    motionStyle: 'fade-slide',
  },

  // ─────────────────────────────────────────
  // 2. 미니멀 다크 (범용)
  // ─────────────────────────────────────────
  'minimal-dark': {
    key: 'minimal-dark',
    label: '미니멀 다크',
    description: '심플하고 모던한 다크 테마',
    bgPrimary: '#0f0f0f',
    bgSecondary: '#141414',
    bgCard: '#1c1c1c',
    textPrimary: '#f5f5f5',
    textSecondary: '#a3a3a3',
    textMuted: '#737373',
    accentColor: '#525252',
    accentLight: '#737373',
    btnPrimary: 'bg-white hover:bg-gray-100 text-black',
    btnSecondary: 'bg-[#1c1c1c] hover:bg-[#262626] text-[#a3a3a3] border border-[#333]',
    btnText: '#000000',
    borderColor: '#262626',
    cardRadius: '1rem',
    motionStyle: 'fade-slide',
  },

  // ─────────────────────────────────────────
  // 3. 클린 코퍼레이트 (일반 기업)
  // ─────────────────────────────────────────
  'clean-corporate': {
    key: 'clean-corporate',
    label: '클린 코퍼레이트',
    description: '밝고 깔끔한 기업 전용 화이트 테마',
    bgPrimary: '#f8fafc',
    bgSecondary: '#ffffff',
    bgCard: '#ffffff',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    accentColor: '#0ea5e9',
    accentLight: '#38bdf8',
    btnPrimary: 'bg-[#0ea5e9] hover:bg-[#0284c7] text-white',
    btnSecondary: 'bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#475569]',
    btnText: '#ffffff',
    borderColor: '#e2e8f0',
    cardRadius: '0.75rem',
    motionStyle: 'zoom-fade',
  },

  // ─────────────────────────────────────────
  // 4. 틸 프리미엄 (고급 서비스)
  // ─────────────────────────────────────────
  'teal-premium': {
    key: 'teal-premium',
    label: '틸 프리미엄',
    description: '고급스러운 틸/에메랄드 프리미엄 테마',
    bgPrimary: '#0d1f1f',
    bgSecondary: '#0f2727',
    bgCard: '#132929',
    textPrimary: '#f0fafa',
    textSecondary: '#7fb9b9',
    textMuted: '#4d8a8a',
    accentColor: '#0d9488',
    accentLight: '#14b8a6',
    btnPrimary: 'bg-[#0d9488] hover:bg-[#0f766e] text-white',
    btnSecondary: 'bg-[#132929] hover:bg-[#1a3535] text-[#7fb9b9] border border-[#0d9488]/30',
    btnText: '#ffffff',
    borderColor: '#0d9488',
    cardRadius: '1rem',
    motionStyle: 'slide-up',
  },
}

// 기본 템플릿
export const DEFAULT_TEMPLATE_KEY: TemplateKey = 'authentic-finance'

// 템플릿 목록 (드롭다운용)
export const TEMPLATE_OPTIONS = Object.values(TEMPLATES).map((t) => ({
  value: t.key,
  label: t.label,
  description: t.description,
}))

// 템플릿 가져오기
export function getTemplate(key: TemplateKey): TemplateConfig {
  return TEMPLATES[key] ?? TEMPLATES[DEFAULT_TEMPLATE_KEY]
}
