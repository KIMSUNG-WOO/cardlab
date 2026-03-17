'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Phone,
  MessageSquare,
  Mail,
  Globe,
  Instagram,
  MapPin,
  ChevronRight,
} from 'lucide-react'
import type { BusinessCard } from '@/lib/types'
import { ensureHttps } from '@/lib/utils'

interface Props {
  card: BusinessCard
}

// ── 아이콘 맵 ──────────────────────────────────────────
const LINK_ICONS: Record<string, React.ReactNode> = {
  phone: <Phone size={18} />,
  sms: <MessageSquare size={18} />,
  email: <Mail size={18} />,
  url: <Globe size={18} />,
  kakao: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.55 1.59 4.793 4 6.237V21l4.094-2.273A11.3 11.3 0 0012 18c5.523 0 10-3.477 10-7.5S17.523 3 12 3z" />
    </svg>
  ),
  instagram: <Instagram size={18} />,
  inquiry: <MessageSquare size={18} />,
}

// ── 메뉴 아이템 (AFG 서비스 메뉴) ───────────────────────
const DEFAULT_MENU_ITEMS = [
  {
    label: '보험금청구',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <line x1="7" y1="9" x2="17" y2="9" />
        <line x1="7" y1="13" x2="13" y2="13" />
        <path d="M17 16l-2-2 2-2" />
      </svg>
    ),
  },
  {
    label: '내보험조회',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="7" />
        <line x1="16.5" y1="16.5" x2="21" y2="21" />
        <line x1="11" y1="8" x2="11" y2="14" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
    ),
  },
  {
    label: '보장분석',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    label: '상담신청',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
]

// ── 애니메이션 variants ─────────────────────────────────
const heroVariants = {
  hidden: { opacity: 0, scale: 1.04 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
}

const fadeUpVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.55 + i * 0.1,
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
}

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.85 },
  },
}

const itemVariant = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

// ── AFG 로고 SVG (인라인) ────────────────────────────────
function AfgLogo({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* AFG 로고 형태 — 참고 이미지 기반 재현 */}
      <polygon points="8,40 24,8 40,40" fill="none" stroke="white" strokeWidth="3.5" strokeLinejoin="round" />
      <line x1="13" y1="32" x2="35" y2="32" stroke="white" strokeWidth="3" />
      <line x1="17" y1="24" x2="31" y2="24" stroke="white" strokeWidth="2.5" />
    </svg>
  )
}

// ── 메인 컴포넌트 ────────────────────────────────────────
export function AuthenticFinanceCard({ card }: Props) {
  const shouldReduceMotion = useReducedMotion()

  const profileBg = card.cover_image_url || null

  // 전화 버튼 (links 배열에 phone 없으면 기본 phone 필드 사용)
  const phoneLink =
    card.links?.find((l) => l.type === 'phone') ??
    (card.phone ? { type: 'phone', url: `tel:${card.phone}`, label: '전화 문의하기' } : null)

  const smsLink =
    card.links?.find((l) => l.type === 'sms') ??
    (card.phone ? { type: 'sms', url: `sms:${card.phone}`, label: 'SMS 문의하기' } : null)

  const kakaoLink = card.links?.find((l) => l.type === 'kakao') ??
    (card.kakao_url ? { type: 'kakao', url: card.kakao_url, label: '카카오 문의' } : null)

  const instaLink = card.links?.find((l) => l.type === 'instagram') ??
    (card.instagram_url ? { type: 'instagram', url: card.instagram_url, label: 'Instagram' } : null)

  const emailLink = card.links?.find((l) => l.type === 'email') ??
    (card.email ? { type: 'email', url: `mailto:${card.email}`, label: '이메일' } : null)

  const siteLink = card.links?.find((l) => l.type === 'url') ??
    (card.website_url ? { type: 'url', url: ensureHttps(card.website_url), label: '웹사이트' } : null)

  return (
    <div
      className="min-h-dvh w-full flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #080e18 0%, #0a0a0a 35%, #080e18 100%)',
        maxWidth: '480px',
        margin: '0 auto',
      }}
    >
      {/* ── 히어로 영역 ── */}
      <motion.div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: '3/4', maxHeight: '72vw', minHeight: '260px' }}
        variants={shouldReduceMotion ? {} : heroVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 배경 그라디언트 오버레이 */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              'linear-gradient(180deg, rgba(8,14,24,0.15) 0%, rgba(8,14,24,0.0) 40%, rgba(8,14,24,0.85) 85%, rgba(8,14,24,1) 100%)',
          }}
        />

        {/* 프로필 이미지 */}
        {card.profile_image_url ? (
          <Image
            src={card.profile_image_url}
            alt={card.name}
            fill
            className="object-cover object-top"
            priority
            sizes="(max-width: 480px) 100vw, 480px"
          />
        ) : (
          /* 이미지 없을 때 플레이스홀더 */
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0d1b2e 0%, #152238 100%)' }}
          >
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center"
              style={{ background: '#1e3a5f' }}
            >
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </div>
          </div>
        )}

        {/* 상단 브랜치/팀명 */}
        {card.team_name && (
          <div
            className="absolute top-5 left-5 z-20 px-3 py-1 rounded-full text-xs font-medium tracking-wider"
            style={{
              background: 'rgba(30,58,95,0.75)',
              backdropFilter: 'blur(8px)',
              color: '#94a3b8',
              border: '1px solid rgba(37,99,235,0.3)',
            }}
          >
            {card.team_name}
          </div>
        )}
      </motion.div>

      {/* ── 메인 정보 카드 영역 ── */}
      <div className="flex-1 px-5 pb-8 -mt-2">

        {/* 이름 + 직함 */}
        <motion.div
          className="mb-5"
          variants={shouldReduceMotion ? {} : fadeUpVariants}
          custom={0}
          initial="hidden"
          animate="visible"
        >
          <h1
            className="text-3xl font-bold tracking-tight mb-1"
            style={{ color: '#ffffff', letterSpacing: '-0.02em' }}
          >
            {card.name}
          </h1>
          {card.english_name && (
            <p className="text-sm font-medium mb-2" style={{ color: '#3b82f6' }}>
              {card.english_name}
            </p>
          )}
          <p className="text-base font-medium" style={{ color: '#94a3b8' }}>
            {card.position}
            {card.company_name && (
              <span style={{ color: '#64748b' }}> · {card.company_name}</span>
            )}
          </p>
        </motion.div>

        {/* 소개 문구 */}
        {card.short_intro && (
          <motion.div
            className="mb-6 pl-3"
            style={{ borderLeft: '2px solid #1e3a5f' }}
            variants={shouldReduceMotion ? {} : fadeUpVariants}
            custom={1}
            initial="hidden"
            animate="visible"
          >
            <p
              className="text-sm leading-relaxed"
              style={{ color: '#7f8ea3' }}
            >
              {card.short_intro}
            </p>
          </motion.div>
        )}

        {/* ── 메뉴 그리드 ── */}
        <motion.div
          className="mb-6"
          variants={shouldReduceMotion ? {} : staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <p
            className="text-xs font-semibold tracking-widest mb-3"
            style={{ color: '#374151' }}
          >
            MENU
          </p>
          <div className="grid grid-cols-4 gap-2">
            {DEFAULT_MENU_ITEMS.map((item) => (
              <motion.button
                key={item.label}
                variants={shouldReduceMotion ? {} : itemVariant}
                className="flex flex-col items-center gap-2 py-3 rounded-xl transition-colors touch-btn"
                style={{
                  background: '#111827',
                  border: '1px solid #1e2d42',
                  color: '#94a3b8',
                }}
                onClick={() => {/* 추후 기능 연결 */}}
              >
                <span style={{ color: '#4a7ab5' }}>{item.icon}</span>
                <span className="text-xs font-medium" style={{ color: '#64748b' }}>
                  {item.label}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── 주요 CTA 버튼 (전화/SMS) ── */}
        <motion.div
          className="grid grid-cols-2 gap-3 mb-4"
          variants={shouldReduceMotion ? {} : fadeUpVariants}
          custom={2}
          initial="hidden"
          animate="visible"
        >
          {phoneLink && (
            <a
              href={phoneLink.url}
              className="touch-btn flex items-center justify-center gap-2 rounded-2xl font-semibold text-sm transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #1e3a5f, #1e40af)',
                color: '#ffffff',
                height: '52px',
                boxShadow: '0 4px 20px rgba(30,64,175,0.3)',
              }}
            >
              <Phone size={16} />
              전화 문의하기
            </a>
          )}
          {smsLink && (
            <a
              href={smsLink.url}
              className="touch-btn flex items-center justify-center gap-2 rounded-2xl font-semibold text-sm transition-all active:scale-95"
              style={{
                background: '#111827',
                color: '#94a3b8',
                height: '52px',
                border: '1px solid #1e2d42',
              }}
            >
              <MessageSquare size={16} />
              SMS 문의하기
            </a>
          )}
        </motion.div>

        {/* ── 추가 링크 버튼들 ── */}
        <motion.div
          className="flex flex-col gap-2 mb-6"
          variants={shouldReduceMotion ? {} : staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {kakaoLink && (
            <motion.a
              variants={shouldReduceMotion ? {} : itemVariant}
              href={ensureHttps(kakaoLink.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="touch-btn flex items-center justify-between px-4 rounded-2xl text-sm transition-all active:scale-95"
              style={{
                background: '#1a1a1a',
                color: '#94a3b8',
                height: '52px',
                border: '1px solid #1e2d42',
              }}
            >
              <span className="flex items-center gap-3">
                <span style={{ color: '#F9E000' }}>{LINK_ICONS.kakao}</span>
                카카오 문의
              </span>
              <ChevronRight size={16} style={{ color: '#374151' }} />
            </motion.a>
          )}

          {instaLink && (
            <motion.a
              variants={shouldReduceMotion ? {} : itemVariant}
              href={ensureHttps(instaLink.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="touch-btn flex items-center justify-between px-4 rounded-2xl text-sm transition-all active:scale-95"
              style={{
                background: '#1a1a1a',
                color: '#94a3b8',
                height: '52px',
                border: '1px solid #1e2d42',
              }}
            >
              <span className="flex items-center gap-3">
                <Instagram size={18} style={{ color: '#e1306c' }} />
                Instagram
              </span>
              <ChevronRight size={16} style={{ color: '#374151' }} />
            </motion.a>
          )}

          {emailLink && (
            <motion.a
              variants={shouldReduceMotion ? {} : itemVariant}
              href={emailLink.url}
              className="touch-btn flex items-center justify-between px-4 rounded-2xl text-sm transition-all active:scale-95"
              style={{
                background: '#1a1a1a',
                color: '#94a3b8',
                height: '52px',
                border: '1px solid #1e2d42',
              }}
            >
              <span className="flex items-center gap-3">
                <Mail size={18} style={{ color: '#3b82f6' }} />
                {card.email}
              </span>
              <ChevronRight size={16} style={{ color: '#374151' }} />
            </motion.a>
          )}

          {siteLink && (
            <motion.a
              variants={shouldReduceMotion ? {} : itemVariant}
              href={ensureHttps(siteLink.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="touch-btn flex items-center justify-between px-4 rounded-2xl text-sm transition-all active:scale-95"
              style={{
                background: '#1a1a1a',
                color: '#94a3b8',
                height: '52px',
                border: '1px solid #1e2d42',
              }}
            >
              <span className="flex items-center gap-3">
                <Globe size={18} style={{ color: '#94a3b8' }} />
                {card.website_url?.replace(/^https?:\/\//, '')}
              </span>
              <ChevronRight size={16} style={{ color: '#374151' }} />
            </motion.a>
          )}
        </motion.div>

        {/* ── 회사 정보 푸터 ── */}
        <motion.div
          className="rounded-2xl p-5"
          style={{
            background: '#0d1520',
            border: '1px solid #1e2d42',
          }}
          variants={shouldReduceMotion ? {} : fadeUpVariants}
          custom={4}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center gap-3 mb-3">
            {/* AFG 로고 */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#0f1f35' }}
            >
              <AfgLogo size={28} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: '#e2e8f0' }}>
                {card.company_name}
              </p>
            </div>
          </div>

          <div
            className="pt-3 flex flex-col gap-1.5"
            style={{ borderTop: '1px solid #1e2d42' }}
          >
            {card.address && (
              <div className="flex items-start gap-2">
                <MapPin size={13} className="mt-0.5 flex-shrink-0" style={{ color: '#374151' }} />
                <p className="text-xs leading-relaxed" style={{ color: '#4a5568' }}>
                  {card.address}
                </p>
              </div>
            )}
            {card.website_url && (
              <div className="flex items-center gap-2">
                <Globe size={13} className="flex-shrink-0" style={{ color: '#374151' }} />
                <p className="text-xs" style={{ color: '#4a5568' }}>
                  {card.website_url?.replace(/^https?:\/\//, '')}
                </p>
              </div>
            )}
            {card.phone && (
              <div className="flex items-center gap-2">
                <Phone size={13} className="flex-shrink-0" style={{ color: '#374151' }} />
                <p className="text-xs" style={{ color: '#4a5568' }}>
                  {card.phone}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* 하단 여백 */}
        <div className="h-8" />
      </div>
    </div>
  )
}
