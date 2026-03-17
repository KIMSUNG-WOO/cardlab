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

export function ModernGrayCard({ card }: { card: BusinessCard }) {
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
      style={{ minHeight: '100dvh', maxWidth: 480, margin: '0 auto', background: '#18181b', overflowY: 'auto', overflowX: 'hidden' }}
    >
      {/* 히어로 */}
      <motion.div
        style={{ position: 'relative', width: '100%', overflow: 'hidden', background: '#09090b' }}
        animate={{ height: scrolled ? '44vw' : '84vw' }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'linear-gradient(180deg,transparent 30%,rgba(24,24,27,0.8) 80%,rgba(24,24,27,1) 100%)' }} />
        {card.profile_image_url ? (
          <Image src={card.profile_image_url} alt={card.name} fill style={{ objectFit: 'cover', objectPosition: 'top' }} priority sizes="480px" />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>👤</div>
          </div>
        )}
        {card.team_name && (
          <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 20, padding: '4px 12px', borderRadius: 20, background: 'rgba(39,39,42,0.85)', backdropFilter: 'blur(8px)', color: '#a1a1aa', fontSize: 11, border: '1px solid #3f3f46' }}>
            {card.team_name}
          </div>
        )}
      </motion.div>

      <div style={{ padding: '0 20px 60px', marginTop: -8 }}>
        <motion.div style={{ marginBottom: 20 }} initial={reduce ? {} : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fafafa', marginBottom: 4 }}>{card.name}</h1>
          {card.english_name && <p style={{ fontSize: 13, color: '#71717a', marginBottom: 4 }}>{card.english_name}</p>}
          <p style={{ fontSize: 14, color: '#a1a1aa' }}>{card.position}<span style={{ color: '#52525b' }}> · {card.company_name}</span></p>
        </motion.div>

        {card.short_intro && (
          <motion.div style={{ marginBottom: 24, paddingLeft: 12, borderLeft: '2px solid #3f3f46' }} initial={reduce ? {} : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <p style={{ fontSize: 13, color: '#71717a', lineHeight: 1.7 }}>{card.short_intro}</p>
          </motion.div>
        )}

        <motion.div style={{ marginBottom: 24 }} initial={reduce ? {} : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#52525b', letterSpacing: '0.15em', marginBottom: 12 }}>MENU</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            {MENU_ITEMS.map(item => {
              const url = menuUrls[item.key]
              const Tag = url ? 'a' : 'div'
              return (
                <Tag key={item.key} {...(url ? { href: ensureHttps(url), target: '_blank', rel: 'noopener noreferrer' } : {})}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 4px', background: '#27272a', border: '1px solid #3f3f46', borderRadius: 14, cursor: url ? 'pointer' : 'default', textDecoration: 'none' }}>
                  <span style={{ fontSize: 22 }}>{item.emoji}</span>
                  <span style={{ fontSize: 11, color: '#71717a', textAlign: 'center' }}>{item.label}</span>
                </Tag>
              )
            })}
          </div>
        </motion.div>

        <motion.div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }} initial={reduce ? {} : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}>
          {card.phone && (
            <a href={`tel:${card.phone}`} className="touch-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, background: '#fafafa', color: '#18181b', borderRadius: 16, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>📞 전화 문의</a>
          )}
          {card.phone && (
            <a href={`sms:${card.phone}`} className="touch-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, background: '#27272a', color: '#a1a1aa', borderRadius: 16, textDecoration: 'none', fontSize: 13, fontWeight: 600, border: '1px solid #3f3f46' }}>💬 SMS 문의</a>
          )}
        </motion.div>

        <motion.div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }} initial={reduce ? {} : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}>
          {card.kakao_url && <a href={ensureHttps(card.kakao_url)} target="_blank" rel="noopener noreferrer" className="touch-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52, padding: '0 16px', background: '#27272a', border: '1px solid #3f3f46', borderRadius: 16, textDecoration: 'none', color: '#a1a1aa', fontSize: 13 }}><span>💛 카카오 문의</span><span>›</span></a>}
          {card.inquiry_url && <a href={ensureHttps(card.inquiry_url)} target="_blank" rel="noopener noreferrer" className="touch-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52, padding: '0 16px', background: '#27272a', border: '1px solid #3f3f46', borderRadius: 16, textDecoration: 'none', color: '#a1a1aa', fontSize: 13 }}><span>📝 온라인 문의</span><span>›</span></a>}
          {card.instagram_url && <a href={ensureHttps(card.instagram_url)} target="_blank" rel="noopener noreferrer" className="touch-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52, padding: '0 16px', background: '#27272a', border: '1px solid #3f3f46', borderRadius: 16, textDecoration: 'none', color: '#a1a1aa', fontSize: 13 }}><span>📸 Instagram</span><span>›</span></a>}
          {card.email && <a href={`mailto:${card.email}`} className="touch-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52, padding: '0 16px', background: '#27272a', border: '1px solid #3f3f46', borderRadius: 16, textDecoration: 'none', color: '#a1a1aa', fontSize: 13 }}><span>✉️ {card.email}</span><span>›</span></a>}
          {card.website_url && <a href={ensureHttps(card.website_url)} target="_blank" rel="noopener noreferrer" className="touch-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52, padding: '0 16px', background: '#27272a', border: '1px solid #3f3f46', borderRadius: 16, textDecoration: 'none', color: '#a1a1aa', fontSize: 13 }}><span>🌐 {card.website_url.replace(/^https?:\/\//, '')}</span><span>›</span></a>}
        </motion.div>

        <div style={{ padding: 20, background: '#27272a', border: '1px solid #3f3f46', borderRadius: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#fafafa', marginBottom: 12 }}>{card.company_name}</p>
          <div style={{ paddingTop: 12, borderTop: '1px solid #3f3f46', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {card.address && <p style={{ fontSize: 12, color: '#52525b' }}>📍 {card.address}</p>}
            {card.website_url && <p style={{ fontSize: 12, color: '#52525b' }}>🌐 {card.website_url.replace(/^https?:\/\//, '')}</p>}
            {card.phone && <p style={{ fontSize: 12, color: '#52525b' }}>📞 {card.phone}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
