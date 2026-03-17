'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { Phone, MessageSquare, Mail, Globe, Instagram, MapPin, ChevronRight } from 'lucide-react'
import type { BusinessCard } from '@/lib/types'
import { ensureHttps } from '@/lib/utils'

const MENU_ITEMS = [
  { label: '보험금청구', icon: '📋' },
  { label: '내보험조회', icon: '🔍' },
  { label: '보장분석', icon: '📊' },
  { label: '상담신청', icon: '💬' },
]

export function AuthenticFinanceCard({ card }: { card: BusinessCard }) {
  const reduce = useReducedMotion()

  const phoneUrl = card.phone ? `tel:${card.phone}` : null
  const smsUrl = card.phone ? `sms:${card.phone}` : null

  return (
    <div style={{ minHeight: '100dvh', width: '100%', maxWidth: 480, margin: '0 auto', background: 'linear-gradient(180deg, #080e18 0%, #0a0a0a 40%, #080e18 100%)', display: 'flex', flexDirection: 'column' }}>

      {/* 히어로 이미지 */}
      <motion.div
        style={{ position: 'relative', width: '100%', aspectRatio: '3/4', maxHeight: '70vw', minHeight: 260, overflow: 'hidden' }}
        initial={reduce ? {} : { opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'linear-gradient(180deg, rgba(8,14,24,0.1) 0%, rgba(8,14,24,0) 40%, rgba(8,14,24,0.9) 90%, rgba(8,14,24,1) 100%)' }} />
        {card.profile_image_url ? (
          <Image src={card.profile_image_url} alt={card.name} fill className="object-cover object-top" priority sizes="480px" />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0d1b2e, #152238)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>👤</div>
          </div>
        )}
        {card.team_name && (
          <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 20, padding: '4px 12px', borderRadius: 20, background: 'rgba(30,58,95,0.75)', backdropFilter: 'blur(8px)', color: '#94a3b8', fontSize: 11, border: '1px solid rgba(37,99,235,0.3)' }}>
            {card.team_name}
          </div>
        )}
      </motion.div>

      {/* 본문 */}
      <div style={{ flex: 1, padding: '0 20px 40px' }}>

        {/* 이름/직함 */}
        <motion.div
          style={{ marginBottom: 20 }}
          initial={reduce ? {} : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.55 }}
        >
          <h1 style={{ fontSize: 30, fontWeight: 700, color: '#ffffff', marginBottom: 4, letterSpacing: '-0.02em' }}>{card.name}</h1>
          {card.english_name && <p style={{ fontSize: 13, color: '#3b82f6', marginBottom: 6 }}>{card.english_name}</p>}
          <p style={{ fontSize: 15, color: '#94a3b8' }}>{card.position}<span style={{ color: '#4a5568' }}> · {card.company_name}</span></p>
        </motion.div>

        {/* 소개 */}
        {card.short_intro && (
          <motion.div
            style={{ marginBottom: 24, paddingLeft: 12, borderLeft: '2px solid #1e3a5f' }}
            initial={reduce ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5 }}
          >
            <p style={{ fontSize: 13, color: '#7f8ea3', lineHeight: 1.6 }}>{card.short_intro}</p>
          </motion.div>
        )}

        {/* 메뉴 */}
        <motion.div
          style={{ marginBottom: 24 }}
          initial={reduce ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.5 }}
        >
          <p style={{ fontSize: 11, fontWeight: 600, color: '#374151', letterSpacing: '0.15em', marginBottom: 12 }}>MENU</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {MENU_ITEMS.map(item => (
              <div key={item.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '12px 4px', background: '#111827', border: '1px solid #1e2d42', borderRadius: 12, cursor: 'pointer' }}>
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <span style={{ fontSize: 11, color: '#64748b', textAlign: 'center' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA 버튼 */}
        <motion.div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}
          initial={reduce ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.5 }}
        >
          {phoneUrl && (
            <a href={phoneUrl} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, background: 'linear-gradient(135deg, #1e3a5f, #1e40af)', color: '#ffffff', borderRadius: 16, textDecoration: 'none', fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(30,64,175,0.3)' }}>
              📞 전화 문의하기
            </a>
          )}
          {smsUrl && (
            <a href={smsUrl} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, background: '#111827', color: '#94a3b8', borderRadius: 16, textDecoration: 'none', fontSize: 13, fontWeight: 600, border: '1px solid #1e2d42' }}>
              💬 SMS 문의하기
            </a>
          )}
        </motion.div>

        {/* 추가 링크 */}
        <motion.div
          style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}
          initial={reduce ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.5 }}
        >
          {card.kakao_url && (
            <a href={ensureHttps(card.kakao_url)} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52, padding: '0 16px', background: '#1a1a1a', border: '1px solid #1e2d42', borderRadius: 16, textDecoration: 'none', color: '#94a3b8', fontSize: 13 }}>
              <span>💛 카카오 문의</span>
              <span style={{ color: '#374151' }}>›</span>
            </a>
          )}
          {card.instagram_url && (
            <a href={ensureHttps(card.instagram_url)} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52, padding: '0 16px', background: '#1a1a1a', border: '1px solid #1e2d42', borderRadius: 16, textDecoration: 'none', color: '#94a3b8', fontSize: 13 }}>
              <span>📸 Instagram</span>
              <span style={{ color: '#374151' }}>›</span>
            </a>
          )}
          {card.email && (
            <a href={`mailto:${card.email}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52, padding: '0 16px', background: '#1a1a1a', border: '1px solid #1e2d42', borderRadius: 16, textDecoration: 'none', color: '#94a3b8', fontSize: 13 }}>
              <span>✉️ {card.email}</span>
              <span style={{ color: '#374151' }}>›</span>
            </a>
          )}
          {card.website_url && (
            <a href={ensureHttps(card.website_url)} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52, padding: '0 16px', background: '#1a1a1a', border: '1px solid #1e2d42', borderRadius: 16, textDecoration: 'none', color: '#94a3b8', fontSize: 13 }}>
              <span>🌐 {card.website_url.replace(/^https?:\/\//, '')}</span>
              <span style={{ color: '#374151' }}>›</span>
            </a>
          )}
        </motion.div>

        {/* 회사 정보 */}
        <motion.div
          style={{ padding: 20, background: '#0d1520', border: '1px solid #1e2d42', borderRadius: 20 }}
          initial={reduce ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.5 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#0f1f35', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
                <polygon points="8,40 24,8 40,40" fill="none" stroke="white" strokeWidth="3" strokeLinejoin="round" />
                <line x1="13" y1="32" x2="35" y2="32" stroke="white" strokeWidth="2.5" />
                <line x1="17" y1="24" x2="31" y2="24" stroke="white" strokeWidth="2" />
              </svg>
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>{card.company_name}</p>
          </div>
          <div style={{ paddingTop: 12, borderTop: '1px solid #1e2d42', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {card.address && <p style={{ fontSize: 12, color: '#4a5568' }}>📍 {card.address}</p>}
            {card.website_url && <p style={{ fontSize: 12, color: '#4a5568' }}>🌐 {card.website_url.replace(/^https?:\/\//, '')}</p>}
            {card.phone && <p style={{ fontSize: 12, color: '#4a5568' }}>📞 {card.phone}</p>}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
