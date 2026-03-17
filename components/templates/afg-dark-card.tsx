'use client'
import { CardBase, type CardTheme } from './card-base'
import type { BusinessCard } from '@/lib/types'

const AFG_DARK_THEME: CardTheme = {
  pageBg: '#080e18',
  heroBg: '#080e18',
  useAfgBg: true,
  cardBg: '#0d1a2d',
  cardBorder: '#1a2d45',
  textName: '#f0f4ff',
  textSub: '#8fafc8',
  textMuted: '#3d5a75',
  accent: '#3b82f6',
  accentBg: 'rgba(59,130,246,0.1)',
  btnPrimary: 'linear-gradient(135deg,#1e3a5f,#1e40af)',
  btnPrimaryText: '#ffffff',
  btnSecondary: '#0d1a2d',
  btnSecondaryText: '#8fafc8',
  btnSecondaryBorder: '#1a2d45',
  menuBg: '#0a1422',
  menuBorder: '#152338',
  menuText: '#4a7a9a',
  menuActiveBg: '#0f2035',
  menuActiveBorder: '#1e40af',
  divider: '#1a2d45',
  labelColor: '#2a4060',
  footerBg: '#080e18',
}

export function AfgDarkCard({ card }: { card: BusinessCard }) {
  return <CardBase card={card} theme={AFG_DARK_THEME} />
}
