'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import type { BusinessCard } from '@/lib/types'
import { ensureHttps } from '@/lib/utils'

const MENU_ITEMS = [
  { key: 'insurance_claim', label: '보험금청구', emoji: '📋' },
  { key: 'check_insurance', label: '내보험조회', emoji: '🔍' },
  { key: 'analysis', label: '보장분석', emoji: '📊' },
  { key: 'consult', label: '상담신청', emoji: '💬' },
]

function CardTemplate({
  card,
  theme,
}: {
  card: BusinessCard
  theme: {
    bg: string; heroBg: string; card: string; cardBorder: string;
    nameText: string; subText: string; mutedText: string;
    accent: string; btnPrimary: string; btnSecondary: string;
    menuBg: string; menuBorder: string; footerBg: string;
    btnSecondaryText: string; menuText: string;
  }
}) {
  const reduce = useReducedMotion()
  const [scrolled, setScrolled] = useState(false)

  const menuUrls: Record<string, string | null> = {
    insurance_claim: card.menu_insurance_claim_url ?? null,
    check_insurance: card.menu_check_insurance_url ?? null,
    analysis: card.menu_analysis_url ?? null,
    consult: card.menu_consult_url ?? null,
  }

  return (
    <div
      onScroll={e => setScrolled((e.target as HTMLElement).scrollTop > 50)}
      style={{ minHeight: '100dvh', maxWidth: 480, margin: '0 auto', background: theme.bg, overflowY: 'auto', overflowX: 'hidden' }}
    >
      <motion.div
        style={{ position: 'relative', width: '100%', overflow: 'hidden', background: theme.heroBg }}
        animate={{ height: scrolled ? '44vw' : '84vw' }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: `linear-gradient(180deg,transparent 30%,${theme.bg}cc 80%,${theme.bg} 100%)` }} />
        {card.profile_image_url ? (
          <Image src={card.profile_image_url} alt={card.name} fill style={{ objectFit: 'cover', objectPosition: 'top' }} priority sizes="480px" />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: theme.heroBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 100, height: 100, borderRadius: '50%', background: theme.card, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>👤</div>
          </div>
        )}
        {card.team_name && (
          <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 20, padding: '4px 12px', borderRadius: 20, background: theme.card + 'cc', backdropFilter: 'blur(8px)', color: theme.subText, fontSize: 11, border: `1px solid ${theme.cardBorder}` }}>
            {card.team_name}
          </div>
        )}
      </motion.div>

      <div style={{ padding: '0 20px 60px', marginTop: -8 }}>
        <motion.div style={{ marginBottom: 20 }} initial={reduce ? {} : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: theme.nameText, marginBottom: 4 }}>{card.name}</h1>
          {card.english_name && <p style={{ fontSize: 13, color: theme.accent, marginBottom: 4 }}>{card.english_name}</p>}
          <p style={{ fontSize: 14, color: theme.subText }}>{card.position}<span style={{ color: theme.mutedText }}> · {card.company_name}</span></p>
        </motion.div>

        {card.short_intro && (
          <motion.div style={{ marginBottom: 24, paddingLeft: 12, borderLeft: `2px solid ${theme.cardBorder}` }} initial={reduce ? {} : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <p style={{ fontSize: 13, color: theme.subText, lineHeight: 1.7 }}>{card.short_intro}</p>
          </motion.div>
        )}

        <motion.div style={{ marginBottom: 24 }} initial={reduce ? {} : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: theme.mutedText, letterSpacing: '0.15em', marginBottom: 12 }}>MENU</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            {MENU_ITEMS.map(item => {
              const url = menuUrls[item.key]
              const Tag = url ? 'a' : 'div'
              return (
                <Tag key={item.key} {...(url ? { href: ensureHttps(url), target: '_blank', rel: 'noopener noreferrer' } : {})}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 4px', background: theme.menuBg, border: `1px solid ${theme.menuBorder}`, borderRadius: 14, cursor: url ? 'pointer' : 'default', textDecoration: 'none' }}>
                  <span style={{ fontSize: 22 }}>{item.emoji}</span>
                  <span style={{ fontSize: 11, color: theme.menuText, textAlign: 'center' }}>{item.label}</span>
                </Tag>
              )
            })}
          </div>
        </motion.div>

        <motion.div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }} initial={reduce ? {} : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}>
          {card.phone && (
            <a href={`tel:${card.phone}`} className="touch-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 52, background: theme.btnPrimary, color: '#fff', borderRadius: 16, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>📞 전화 문의</a>
          )}
          {card.phone && (
            <a href={`sms:${card.phone}`} className="touch-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 52, background: theme.btnSecondary, color: theme.btnSecondaryText, borderRadius: 16, textDecoration: 'none', fontSize: 13, fontWeight: 600, border: `1px solid ${theme.cardBorder}` }}>💬 SMS 문의</a>
          )}
        </motion.div>

        <motion.div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }} initial={reduce ? {} : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}>
          {card.kakao_url && <a href={ensureHttps(card.kakao_url)} target="_blank" rel="noopener noreferrer" className="touch-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52, padding: '0 16px', background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 16, textDecoration: 'none', color: theme.subText, fontSize: 13 }}><span>💛 카카오 문의</span><span>›</span></a>}
          {card.inquiry_url && <a href={ensureHttps(card.inquiry_url)} target="_blank" rel="noopener noreferrer" className="touch-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52, padding: '0 16px', background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 16, textDecoration: 'none', color: theme.subText, fontSize: 13 }}><span>📝 온라인 문의</span><span>›</span></a>}
          {card.instagram_url && <a href={ensureHttps(card.instagram_url)} target="_blank" rel="noopener noreferrer" className="touch-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52, padding: '0 16px', background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 16, textDecoration: 'none', color: theme.subText, fontSize: 13 }}><span>📸 Instagram</span><span>›</span></a>}
          {card.email && <a href={`mailto:${card.email}`} className="touch-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52, padding: '0 16px', background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 16, textDecoration: 'none', color: theme.subText, fontSize: 13 }}><span>✉️ {card.email}</span><span>›</span></a>}
          {card.website_url && <a href={ensureHttps(card.website_url)} target="_blank" rel="noopener noreferrer" className="touch-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52, padding: '0 16px', background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 16, textDecoration: 'none', color: theme.subText, fontSize: 13 }}><span>🌐 {card.website_url.replace(/^https?:\/\//, '')}</span><span>›</span></a>}
        </motion.div>

        <div style={{ padding: 20, background: theme.footerBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: theme.nameText, marginBottom: 12 }}>{card.company_name}</p>
          <div style={{ paddingTop: 12, borderTop: `1px solid ${theme.cardBorder}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {card.address && <p style={{ fontSize: 12, color: theme.mutedText }}>📍 {card.address}</p>}
            {card.website_url && <p style={{ fontSize: 12, color: theme.mutedText }}>🌐 {card.website_url.replace(/^https?:\/\//, '')}</p>}
            {card.phone && <p style={{ fontSize: 12, color: theme.mutedText }}>📞 {card.phone}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AfgLightCard({ card }: { card: BusinessCard }) {
  return <CardTemplate card={card} theme={{ bg:'#f8f9fa', heroBg:'#e9ecef', card:'#ffffff', cardBorder:'#e2e8f0', nameText:'#0f172a', subText:'#475569', mutedText:'#94a3b8', accent:'#1e40af', btnPrimary:'linear-gradient(135deg,#1e3a5f,#1e40af)', btnSecondary:'#f1f5f9', menuBg:'#ffffff', menuBorder:'#e2e8f0', footerBg:'#f1f5f9', btnSecondaryText:'#475569', menuText:'#64748b' }} />
}

export function NavyProCard({ card }: { card: BusinessCard }) {
  return <CardTemplate card={card} theme={{ bg:'#0c1220', heroBg:'#0c1220', card:'#162032', cardBorder:'#1e3a5f', nameText:'#f0f4ff', subText:'#7fa8cc', mutedText:'#3d6080', accent:'#4a9eff', btnPrimary:'linear-gradient(135deg,#1a4a80,#2563eb)', btnSecondary:'#162032', menuBg:'#162032', menuBorder:'#1e3a5f', footerBg:'#0a1828', btnSecondaryText:'#7fa8cc', menuText:'#4a7a9a' }} />
}

export function CleanWhiteCard({ card }: { card: BusinessCard }) {
  return <CardTemplate card={card} theme={{ bg:'#ffffff', heroBg:'#f4f4f5', card:'#ffffff', cardBorder:'#e4e4e7', nameText:'#18181b', subText:'#52525b', mutedText:'#a1a1aa', accent:'#18181b', btnPrimary:'linear-gradient(135deg,#18181b,#3f3f46)', btnSecondary:'#f4f4f5', menuBg:'#fafafa', menuBorder:'#e4e4e7', footerBg:'#f4f4f5', btnSecondaryText:'#52525b', menuText:'#71717a' }} />
}
