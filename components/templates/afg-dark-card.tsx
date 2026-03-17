'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { Phone, MessageSquare, Mail, Globe, Instagram, MapPin, ChevronRight } from 'lucide-react'
import type { BusinessCard } from '@/lib/types'
import { ensureHttps } from '@/lib/utils'

// AFG 로고 SVG 배경 컴포넌트
function AfgLogoBg() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <svg
        viewBox="0 0 400 300"
        style={{ position: 'absolute', right: -40, top: '50%', transform: 'translateY(-50%)', width: '75%', opacity: 0.07 }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* AFG 로고 — 삼각형 겹침 패턴 */}
        <polygon points="200,20 380,280 20,280" stroke="white" strokeWidth="14" fill="none" strokeLinejoin="round"/>
        <line x1="60" y1="220" x2="340" y2="220" stroke="white" strokeWidth="12"/>
        <line x1="100" y1="160" x2="300" y2="160" stroke="white" strokeWidth="10"/>
        <line x1="140" y1="100" x2="260" y2="100" stroke="white" strokeWidth="8"/>
      </svg>
    </div>
  )
}

// 메뉴 아이템
const MENU_ITEMS = [
  { key: 'insurance_claim', label: '보험금청구', emoji: '📋' },
  { key: 'check_insurance', label: '내보험조회', emoji: '🔍' },
  { key: 'analysis', label: '보장분석', emoji: '📊' },
  { key: 'consult', label: '상담신청', emoji: '💬' },
]

export function AfgDarkCard({ card }: { card: BusinessCard }) {
  const reduce = useReducedMotion()
  const heroRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)

  // 스크롤 감지
  useEffect(() => {
    const el = document.getElementById('card-scroll')
    if (!el) return
    const handler = () => setScrolled(el.scrollTop > 50)
    el.addEventListener('scroll', handler)
    return () => el.removeEventListener('scroll', handler)
  }, [])

  const menuUrls: Record<string, string | null> = {
    insurance_claim: card.menu_insurance_claim_url ?? null,
    check_insurance: card.menu_check_insurance_url ?? null,
    analysis: card.menu_analysis_url ?? null,
    consult: card.menu_consult_url ?? null,
  }

  return (
    <div
      id="card-scroll"
      style={{
        minHeight: '100dvh',
        maxWidth: 480,
        margin: '0 auto',
        background: '#0a0a0a',
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      {/* ── 히어로 영역 (myhom 스타일) ── */}
      <motion.div
        ref={heroRef}
        style={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          background: '#080e18',
        }}
        animate={{ height: scrolled ? '45vw' : '85vw' }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        initial={reduce ? {} : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
      >
        {/* AFG 로고 배경 */}
        <AfgLogoBg />

        {/* 그라디언트 오버레이 */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          background: 'linear-gradient(180deg, rgba(8,14,24,0.2) 0%, rgba(8,14,24,0) 30%, rgba(8,14,24,0.7) 80%, rgba(8,14,24,1) 100%)'
        }} />

        {/* 프로필 이미지 */}
        {card.profile_image_url ? (
          <motion.div
            style={{ position: 'absolute', inset: 0 }}
            animate={{ scale: scrolled ? 1.05 : 1 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src={card.profile_image_url}
              alt={card.name}
              fill
              style={{ objectFit: 'cover', objectPosition: 'top' }}
              priority
              sizes="480px"
            />
          </motion.div>
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, #0d1b2e, #152238)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>
              👤
            </div>
          </div>
        )}

        {/* 팀/브랜치 뱃지 */}
        {card.team_name && (
          <div style={{
            position: 'absolute', top: 20, left: 20, zIndex: 20,
            padding: '4px 12px', borderRadius: 20,
            background: 'rgba(30,58,95,0.8)', backdropFilter: 'blur(8px)',
            color: '#94a3b8', fontSize: 11, border: '1px solid rgba(37,99,235,0.3)'
          }}>
            {card.team_name}
          </div>
        )}
      </motion.div>

      {/* ── 메인 정보 카드 ── */}
      <div style={{ padding: '0 20px 60px', marginTop: -8, position: 'relative', zIndex: 20 }}>

        {/* 이름/직함 */}
        <motion.div
          style={{ marginBottom: 20 }}
          initial={reduce ? {} : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.55 }}
        >
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 4, letterSpacing: '-0.02em' }}>
            {card.name}
          </h1>
          {card.english_name && (
            <p style={{ fontSize: 13, color: '#3b82f6', marginBottom: 4 }}>{card.english_name}</p>
          )}
          <p style={{ fontSize: 14, color: '#94a3b8' }}>
            {card.position}
            <span style={{ color: '#4a5568' }}> · {card.company_name}</span>
          </p>
        </motion.div>

        {/* 소개 */}
        {card.short_intro && (
          <motion.div
            style={{ marginBottom: 24, paddingLeft: 12, borderLeft: '2px solid #1e3a5f' }}
            initial={reduce ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
          >
            <p style={{ fontSize: 13, color: '#7f8ea3', lineHeight: 1.7 }}>{card.short_intro}</p>
          </motion.div>
        )}

        {/* ── 메뉴 그리드 ── */}
        <motion.div
          style={{ marginBottom: 24 }}
          initial={reduce ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.5 }}
        >
          <p style={{ fontSize: 11, fontWeight: 600, color: '#374151', letterSpacing: '0.15em', marginBottom: 12 }}>MENU</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {MENU_ITEMS.map(item => {
              const url = menuUrls[item.key]
              const Tag = url ? 'a' : 'div'
              return (
                <Tag
                  key={item.key}
                  {...(url ? { href: ensureHttps(url), target: '_blank', rel: 'noopener noreferrer' } : {})}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    padding: '14px 4px', background: '#111827', border: '1px solid #1e2d42',
                    borderRadius: 14, cursor: url ? 'pointer' : 'default', textDecoration: 'none',
                    transition: 'background 0.2s',
                  }}
                >
                  <span style={{ fontSize: 22 }}>{item.emoji}</span>
                  <span style={{ fontSize: 11, color: '#64748b', textAlign: 'center', lineHeight: 1.3 }}>{item.label}</span>
                </Tag>
              )
            })}
          </div>
        </motion.div>

        {/* ── CTA 버튼 ── */}
        <motion.div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}
          initial={reduce ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.5 }}
        >
          {card.phone && (
            <a href={`tel:${card.phone}`} className="touch-btn" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52,
              background: 'linear-gradient(135deg,#1e3a5f,#1e40af)', color: '#fff',
              borderRadius: 16, textDecoration: 'none', fontSize: 13, fontWeight: 600,
              boxShadow: '0 4px 20px rgba(30,64,175,0.3)'
            }}>
              📞 전화 문의하기
            </a>
          )}
          {card.phone && (
            <a href={`sms:${card.phone}`} className="touch-btn" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52,
              background: '#111827', color: '#94a3b8', borderRadius: 16, textDecoration: 'none',
              fontSize: 13, fontWeight: 600, border: '1px solid #1e2d42'
            }}>
              💬 SMS 문의하기
            </a>
          )}
        </motion.div>

        {/* ── 추가 링크 ── */}
        <motion.div
          style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}
          initial={reduce ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.5 }}
        >
          {card.kakao_url && (
            <a href={ensureHttps(card.kakao_url)} target="_blank" rel="noopener noreferrer" className="touch-btn" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              height: 52, padding: '0 16px', background: '#1a1a1a', border: '1px solid #1e2d42',
              borderRadius: 16, textDecoration: 'none', color: '#94a3b8', fontSize: 13
            }}>
              <span>💛 카카오 문의</span><span style={{ color: '#374151' }}>›</span>
            </a>
          )}
          {card.inquiry_url && (
            <a href={ensureHttps(card.inquiry_url)} target="_blank" rel="noopener noreferrer" className="touch-btn" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              height: 52, padding: '0 16px', background: '#1a1a1a', border: '1px solid #1e2d42',
              borderRadius: 16, textDecoration: 'none', color: '#94a3b8', fontSize: 13
            }}>
              <span>📝 온라인 문의</span><span style={{ color: '#374151' }}>›</span>
            </a>
          )}
          {card.instagram_url && (
            <a href={ensureHttps(card.instagram_url)} target="_blank" rel="noopener noreferrer" className="touch-btn" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              height: 52, padding: '0 16px', background: '#1a1a1a', border: '1px solid #1e2d42',
              borderRadius: 16, textDecoration: 'none', color: '#94a3b8', fontSize: 13
            }}>
              <span>📸 Instagram</span><span style={{ color: '#374151' }}>›</span>
            </a>
          )}
          {card.email && (
            <a href={`mailto:${card.email}`} className="touch-btn" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              height: 52, padding: '0 16px', background: '#1a1a1a', border: '1px solid #1e2d42',
              borderRadius: 16, textDecoration: 'none', color: '#94a3b8', fontSize: 13
            }}>
              <span>✉️ {card.email}</span><span style={{ color: '#374151' }}>›</span>
            </a>
          )}
          {card.website_url && (
            <a href={ensureHttps(card.website_url)} target="_blank" rel="noopener noreferrer" className="touch-btn" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              height: 52, padding: '0 16px', background: '#1a1a1a', border: '1px solid #1e2d42',
              borderRadius: 16, textDecoration: 'none', color: '#94a3b8', fontSize: 13
            }}>
              <span>🌐 {card.website_url.replace(/^https?:\/\//, '')}</span><span style={{ color: '#374151' }}>›</span>
            </a>
          )}
        </motion.div>

        {/* ── 회사 정보 푸터 ── */}
        <motion.div
          style={{ padding: 20, background: '#0d1520', border: '1px solid #1e2d42', borderRadius: 20, position: 'relative', overflow: 'hidden' }}
          initial={reduce ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.5 }}
        >
          <AfgLogoBg />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, position: 'relative', zIndex: 1 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#0f1f35', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
                <polygon points="24,6 44,42 4,42" stroke="white" strokeWidth="3.5" strokeLinejoin="round" fill="none"/>
                <line x1="10" y1="34" x2="38" y2="34" stroke="white" strokeWidth="3"/>
                <line x1="16" y1="26" x2="32" y2="26" stroke="white" strokeWidth="2.5"/>
              </svg>
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', position: 'relative', zIndex: 1 }}>{card.company_name}</p>
          </div>
          <div style={{ paddingTop: 12, borderTop: '1px solid #1e2d42', display: 'flex', flexDirection: 'column', gap: 6, position: 'relative', zIndex: 1 }}>
            {card.address && <p style={{ fontSize: 12, color: '#4a5568' }}>📍 {card.address}</p>}
            {card.website_url && <p style={{ fontSize: 12, color: '#4a5568' }}>🌐 {card.website_url.replace(/^https?:\/\//, '')}</p>}
            {card.phone && <p style={{ fontSize: 12, color: '#4a5568' }}>📞 {card.phone}</p>}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
