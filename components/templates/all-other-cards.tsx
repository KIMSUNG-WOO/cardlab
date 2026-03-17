'use client'
import { CardBase, type CardTheme } from './card-base'
import type { BusinessCard } from '@/lib/types'

const AFG_LIGHT: CardTheme = {
  pageBg:'#f5f6f8', heroBg:'#e9ecef', useAfgBg:false,
  cardBg:'#ffffff', cardBorder:'#dee2e6',
  textName:'#1a1a2e', textSub:'#495057', textMuted:'#adb5bd',
  accent:'#1e40af', accentBg:'rgba(30,64,175,0.08)',
  btnPrimary:'linear-gradient(135deg,#1e3a5f,#1e40af)', btnPrimaryText:'#fff',
  btnSecondary:'#f1f3f5', btnSecondaryText:'#495057', btnSecondaryBorder:'#dee2e6',
  menuBg:'#fff', menuBorder:'#dee2e6', menuText:'#6c757d',
  menuActiveBg:'#e7f0ff', menuActiveBorder:'#4263eb',
  divider:'#dee2e6', labelColor:'#adb5bd', footerBg:'#f1f3f5',
}

const MODERN_GRAY: CardTheme = {
  pageBg:'#18181b', heroBg:'#09090b', useAfgBg:false,
  cardBg:'#27272a', cardBorder:'#3f3f46',
  textName:'#fafafa', textSub:'#a1a1aa', textMuted:'#52525b',
  accent:'#e4e4e7', accentBg:'rgba(228,228,231,0.06)',
  btnPrimary:'linear-gradient(135deg,#3f3f46,#52525b)', btnPrimaryText:'#fff',
  btnSecondary:'#27272a', btnSecondaryText:'#a1a1aa', btnSecondaryBorder:'#3f3f46',
  menuBg:'#27272a', menuBorder:'#3f3f46', menuText:'#71717a',
  menuActiveBg:'#3f3f46', menuActiveBorder:'#71717a',
  divider:'#3f3f46', labelColor:'#52525b', footerBg:'#27272a',
}

const NAVY_PRO: CardTheme = {
  pageBg:'#0c1220', heroBg:'#08101c', useAfgBg:false,
  cardBg:'#162032', cardBorder:'#1e3a5f',
  textName:'#f0f4ff', textSub:'#7fa8cc', textMuted:'#3d6080',
  accent:'#4a9eff', accentBg:'rgba(74,158,255,0.1)',
  btnPrimary:'linear-gradient(135deg,#1a4a80,#2563eb)', btnPrimaryText:'#fff',
  btnSecondary:'#162032', btnSecondaryText:'#7fa8cc', btnSecondaryBorder:'#1e3a5f',
  menuBg:'#162032', menuBorder:'#1e3a5f', menuText:'#4a7a9a',
  menuActiveBg:'#1e3a5f', menuActiveBorder:'#2563eb',
  divider:'#1e3a5f', labelColor:'#3d6080', footerBg:'#0a1828',
}

const CLEAN_WHITE: CardTheme = {
  pageBg:'#ffffff', heroBg:'#f4f4f5', useAfgBg:false,
  cardBg:'#fafafa', cardBorder:'#e4e4e7',
  textName:'#18181b', textSub:'#52525b', textMuted:'#a1a1aa',
  accent:'#18181b', accentBg:'rgba(24,24,27,0.05)',
  btnPrimary:'linear-gradient(135deg,#18181b,#3f3f46)', btnPrimaryText:'#fff',
  btnSecondary:'#f4f4f5', btnSecondaryText:'#52525b', btnSecondaryBorder:'#e4e4e7',
  menuBg:'#fafafa', menuBorder:'#e4e4e7', menuText:'#71717a',
  menuActiveBg:'#f0f0f0', menuActiveBorder:'#18181b',
  divider:'#e4e4e7', labelColor:'#a1a1aa', footerBg:'#f4f4f5',
}

const PREMIUM_BLACK: CardTheme = {
  pageBg:'#000000', heroBg:'#000000', useAfgBg:false,
  cardBg:'#111111', cardBorder:'#222222',
  textName:'#ffffff', textSub:'#888888', textMuted:'#444444',
  accent:'#d4af37', accentBg:'rgba(212,175,55,0.1)',
  btnPrimary:'linear-gradient(135deg,#1a1a1a,#333333)', btnPrimaryText:'#fff',
  btnSecondary:'#111111', btnSecondaryText:'#888888', btnSecondaryBorder:'#222222',
  menuBg:'#111111', menuBorder:'#222222', menuText:'#555555',
  menuActiveBg:'#1a1a1a', menuActiveBorder:'#d4af37',
  divider:'#222222', labelColor:'#333333', footerBg:'#000000',
}

const SLATE_PRO: CardTheme = {
  pageBg:'#1e293b', heroBg:'#0f172a', useAfgBg:false,
  cardBg:'#334155', cardBorder:'#475569',
  textName:'#f8fafc', textSub:'#94a3b8', textMuted:'#475569',
  accent:'#38bdf8', accentBg:'rgba(56,189,248,0.1)',
  btnPrimary:'linear-gradient(135deg,#0284c7,#0369a1)', btnPrimaryText:'#fff',
  btnSecondary:'#334155', btnSecondaryText:'#94a3b8', btnSecondaryBorder:'#475569',
  menuBg:'#334155', menuBorder:'#475569', menuText:'#64748b',
  menuActiveBg:'#1e3a5f', menuActiveBorder:'#38bdf8',
  divider:'#475569', labelColor:'#475569', footerBg:'#0f172a',
}

const WARM_WHITE: CardTheme = {
  pageBg:'#faf9f7', heroBg:'#f0ede8', useAfgBg:false,
  cardBg:'#ffffff', cardBorder:'#e8e0d5',
  textName:'#1c1917', textSub:'#57534e', textMuted:'#a8a29e',
  accent:'#a16207', accentBg:'rgba(161,98,7,0.08)',
  btnPrimary:'linear-gradient(135deg,#292524,#44403c)', btnPrimaryText:'#fff',
  btnSecondary:'#f5f0ea', btnSecondaryText:'#57534e', btnSecondaryBorder:'#e8e0d5',
  menuBg:'#ffffff', menuBorder:'#e8e0d5', menuText:'#78716c',
  menuActiveBg:'#fdf4dc', menuActiveBorder:'#a16207',
  divider:'#e8e0d5', labelColor:'#c4b7a6', footerBg:'#f0ede8',
}

export function AfgLightCard({ card }: { card: BusinessCard })    { return <CardBase card={card} theme={AFG_LIGHT} /> }
export function ModernGrayCard({ card }: { card: BusinessCard })  { return <CardBase card={card} theme={MODERN_GRAY} /> }
export function NavyProCard({ card }: { card: BusinessCard })     { return <CardBase card={card} theme={NAVY_PRO} /> }
export function CleanWhiteCard({ card }: { card: BusinessCard })  { return <CardBase card={card} theme={CLEAN_WHITE} /> }
export function PremiumBlackCard({ card }: { card: BusinessCard }){ return <CardBase card={card} theme={PREMIUM_BLACK} /> }
export function SlateProCard({ card }: { card: BusinessCard })    { return <CardBase card={card} theme={SLATE_PRO} /> }
export function WarmWhiteCard({ card }: { card: BusinessCard })   { return <CardBase card={card} theme={WARM_WHITE} /> }
