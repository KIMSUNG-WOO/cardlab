import type { TemplateKey } from './types'

export interface TemplateConfig {
  key: TemplateKey
  label: string
  description: string
  preview: string  // 미리보기 색상
  colors: {
    bg: string
    heroBg: string
    card: string
    cardBorder: string
    nameText: string
    subText: string
    mutedText: string
    accent: string
    btnPrimary: string
    btnSecondary: string
    menuBg: string
    menuBorder: string
    footerBg: string
  }
}

export const TEMPLATES: Record<TemplateKey, TemplateConfig> = {
  'afg-dark': {
    key: 'afg-dark',
    label: 'AFG 다크',
    description: '어센틱금융그룹 공식 — 블랙 배경에 AFG 로고',
    preview: '#0a0a0a',
    colors: {
      bg: '#0a0a0a',
      heroBg: '#080e18',
      card: '#111827',
      cardBorder: '#1e2d42',
      nameText: '#ffffff',
      subText: '#94a3b8',
      mutedText: '#4a5568',
      accent: '#2563eb',
      btnPrimary: 'linear-gradient(135deg,#1e3a5f,#1e40af)',
      btnSecondary: '#111827',
      menuBg: '#111827',
      menuBorder: '#1e2d42',
      footerBg: '#0d1520',
    },
  },
  'afg-light': {
    key: 'afg-light',
    label: 'AFG 라이트',
    description: '어센틱금융그룹 — 밝고 깔끔한 화이트 버전',
    preview: '#f8f9fa',
    colors: {
      bg: '#f8f9fa',
      heroBg: '#e9ecef',
      card: '#ffffff',
      cardBorder: '#e2e8f0',
      nameText: '#0f172a',
      subText: '#475569',
      mutedText: '#94a3b8',
      accent: '#1e40af',
      btnPrimary: 'linear-gradient(135deg,#1e3a5f,#1e40af)',
      btnSecondary: '#f1f5f9',
      menuBg: '#ffffff',
      menuBorder: '#e2e8f0',
      footerBg: '#f1f5f9',
    },
  },
  'modern-gray': {
    key: 'modern-gray',
    label: '모던 그레이',
    description: '세련된 그레이톤 — 토스 스타일 미니멀',
    preview: '#18181b',
    colors: {
      bg: '#18181b',
      heroBg: '#18181b',
      card: '#27272a',
      cardBorder: '#3f3f46',
      nameText: '#fafafa',
      subText: '#a1a1aa',
      mutedText: '#52525b',
      accent: '#e4e4e7',
      btnPrimary: 'linear-gradient(135deg,#3f3f46,#52525b)',
      btnSecondary: '#27272a',
      menuBg: '#27272a',
      menuBorder: '#3f3f46',
      footerBg: '#18181b',
    },
  },
  'navy-pro': {
    key: 'navy-pro',
    label: '네이비 프로',
    description: '딥 네이비 — 전문직/금융 고급 느낌',
    preview: '#0c1220',
    colors: {
      bg: '#0c1220',
      heroBg: '#0c1220',
      card: '#162032',
      cardBorder: '#1e3a5f',
      nameText: '#f0f4ff',
      subText: '#7fa8cc',
      mutedText: '#3d6080',
      accent: '#4a9eff',
      btnPrimary: 'linear-gradient(135deg,#1a4a80,#2563eb)',
      btnSecondary: '#162032',
      menuBg: '#162032',
      menuBorder: '#1e3a5f',
      footerBg: '#0a1828',
    },
  },
  'clean-white': {
    key: 'clean-white',
    label: '클린 화이트',
    description: '완전 화이트 — 심플하고 범용적인 디자인',
    preview: '#ffffff',
    colors: {
      bg: '#ffffff',
      heroBg: '#f4f4f5',
      card: '#ffffff',
      cardBorder: '#e4e4e7',
      nameText: '#18181b',
      subText: '#52525b',
      mutedText: '#a1a1aa',
      accent: '#18181b',
      btnPrimary: 'linear-gradient(135deg,#18181b,#3f3f46)',
      btnSecondary: '#f4f4f5',
      menuBg: '#fafafa',
      menuBorder: '#e4e4e7',
      footerBg: '#f4f4f5',
    },
  },
}

export const TEMPLATE_LIST = Object.values(TEMPLATES)
export const DEFAULT_TEMPLATE: TemplateKey = 'afg-dark'
