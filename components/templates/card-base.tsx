'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import type {
  BusinessCard, CardNews, LinkItem,
  AnimationType, CardDesignOptions, AllLabels
} from '@/lib/types'
import { DEFAULT_DESIGN_OPTIONS, DEFAULT_LABELS } from '@/lib/types'
import { ensureHttps, copyToClipboard } from '@/lib/utils'

// ─── 메뉴 아이템 (아이콘만 — 라벨은 AllLabels에서 관리) ─────
const MENU_ITEMS = [
  { key: 'insurance_claim', defaultLabel: '보험금청구', icon: '📋' },
  { key: 'check_insurance', defaultLabel: '내보험조회', icon: '🔍' },
  { key: 'analysis',        defaultLabel: '보장분석',   icon: '📊' },
  { key: 'consult',         defaultLabel: '상담신청',   icon: '💬' },
]

const NEWS_CAT: Record<string, { label: string; color: string }> = {
  insurance: { label: '보험', color: '#1e40af' },
  finance:   { label: '금융', color: '#047857' },
  policy:    { label: '정책', color: '#7c3aed' },
  news:      { label: '뉴스', color: '#b45309' },
  notice:    { label: '공지', color: '#dc2626' },
}

function getAnimClass(type: AnimationType, on: boolean): string {
  if (!on) return 'anim-none'
  const map: Record<AnimationType, string> = {
    'zoom-out':     'anim-zoom-out',
    'fade-in':      'anim-fade-in',
    'slide-up':     'anim-slide-up',
    'blur-reveal':  'anim-blur-reveal',
    'cinematic':    'anim-cinematic',
    'photo-first':  'anim-photo-first',
    'text-first':   'anim-text-first',
    'simultaneous': 'anim-simultaneous',
    'minimal':      'anim-minimal',
    'bounce':       'anim-bounce',
    'none':         'anim-none',
  }
  return map[type] ?? 'anim-zoom-out'
}

function getBtnRadius(r: CardDesignOptions['btn_radius']): string {
  return { none: '0', sm: '6px', md: '12px', lg: '16px', full: '9999px' }[r ?? 'lg']
}

function getBtnHeight(s: CardDesignOptions['btn_size']): string {
  return { sm: '44px', md: '52px', lg: '58px' }[s ?? 'md']
}

// ─── LinkItem 앞에 붙는 요소 렌더링 ─────────────────────────
function LinkPrefix({ link, iconSz }: { link: LinkItem; iconSz: number }) {
  const pt = link.prefixType ?? 'none'
  if (pt === 'emoji' && link.prefixEmoji) {
    return <span style={{ fontSize: iconSz, lineHeight: 1 }}>{link.prefixEmoji}</span>
  }
  if (pt === 'text' && link.prefixText) {
    return <span style={{ fontSize: 12, fontWeight: 600, color: 'inherit', opacity: 0.7, whiteSpace: 'nowrap' }}>{link.prefixText}</span>
  }
  if (pt === 'image' && link.prefixImage) {
    return <img src={link.prefixImage} alt="" style={{ height: iconSz, width: 'auto', objectFit: 'contain' }} />
  }
  return null
}

// ─── 공유 버튼 ───────────────────────────────────────────────
function ShareButton({ cardUrl, name }: { cardUrl: string; name: string }) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  async function handleCopy() {
    await copyToClipboard(cardUrl)
    setCopied(true)
    setTimeout(() => { setCopied(false); setOpen(false) }, 1500)
  }

  async function handleShare() {
    if (navigator.share) {
      try { await navigator.share({ title: `${name}의 디지털 명함`, url: cardUrl }) } catch {}
    } else {
      setOpen(v => !v)
    }
  }

  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 100 }}>
      {open && (
        <div style={{ position: 'absolute', top: 48, right: 0, background: 'rgba(20,20,20,0.95)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '8px', minWidth: 160, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <button onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', background: 'none', border: 'none', color: '#fff', fontSize: 13, cursor: 'pointer', borderRadius: 8 }}>
            {copied ? '✅ 복사됨!' : '🔗 링크 복사'}
          </button>
        </div>
      )}
      <button className="share-btn" onClick={handleShare} aria-label="공유">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      </button>
    </div>
  )
}

// ─── 테마 인터페이스 ─────────────────────────────────────────
export interface CardTheme {
  pageBg: string
  heroBg: string
  useAfgBg?: boolean
  customBgUrl?: string       // v5: 커스텀 배경 이미지 URL
  cardBg: string
  cardBorder: string
  textName: string
  textSub: string
  textMuted: string
  accent: string
  accentBg: string
  btnPrimary: string
  btnPrimaryText: string
  btnSecondary: string
  btnSecondaryText: string
  btnSecondaryBorder: string
  menuBg: string
  menuBorder: string
  menuText: string
  menuActiveBg: string
  menuActiveBorder: string
  divider: string
  labelColor: string
  footerBg: string
}

// ─── 메인 CardBase ───────────────────────────────────────────
export function CardBase({ card, theme }: { card: BusinessCard; theme: CardTheme }) {
  const [heroCollapsed, setHeroCollapsed] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // design_options 마이그레이션 (이전 버전 호환)
  const raw: any = card.design_options ?? {}
  const design: CardDesignOptions = {
    ...DEFAULT_DESIGN_OPTIONS,
    ...raw,
    icon_size:         typeof raw.icon_size === 'number'        ? raw.icon_size        : 22,
    font_size_name:    typeof raw.font_size_name === 'number'   ? raw.font_size_name   : 28,
    font_size_sub:     typeof raw.font_size_sub === 'number'    ? raw.font_size_sub    : 14,
    font_size_body:    typeof raw.font_size_body === 'number'   ? raw.font_size_body   : 13,
    animation_delay:   typeof raw.animation_delay === 'number'  ? raw.animation_delay  : 0,
    profile_position_y: typeof raw.profile_position_y === 'number' ? raw.profile_position_y : 15,
    labels: raw.labels ?? null,
    // 이전 contact_labels 호환
    ...(raw.contact_labels && !raw.labels ? {
      labels: {
        phone:   raw.contact_labels.phone   ?? '',
        email:   raw.contact_labels.email   ?? '',
        address: raw.contact_labels.address ?? '',
        website: raw.contact_labels.website ?? '',
      }
    } : {}),
  }

  // labels 병합 (기본값 적용)
  const lb: AllLabels = { ...DEFAULT_LABELS, ...(design.labels ?? {}) }

  const animClass  = getAnimClass(design.animation_type, design.animation_on)
  const speedClass = `anim-speed-${design.animation_speed}`
  const btnRadius  = getBtnRadius(design.btn_radius)
  const btnH       = getBtnHeight(design.btn_size)
  const animDelay  = design.animation_delay ? `${design.animation_delay}s` : undefined

  // 커스텀 색상 적용
  const cc: any = design.custom_colors
  const t: CardTheme = cc ? {
    ...theme,
    pageBg:     cc.page_bg    ?? theme.pageBg,
    heroBg:     cc.page_bg    ?? theme.heroBg,
    cardBg:     cc.card_bg    ?? theme.cardBg,
    accent:     cc.accent     ?? theme.accent,
    btnPrimary: cc.btn_color  ?? theme.btnPrimary,
    textName:   cc.name_color ?? theme.textName,
    textSub:    cc.desc_color ?? theme.textSub,
  } : theme

  // 배경 이미지: 회사 배경 > AFG 배경 > 없음
  const bgImageUrl =
    card.company_background_url ||
    (t.useAfgBg ? '/afg-background.png' : null) ||
    t.customBgUrl ||
    null

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const h = () => setHeroCollapsed(el.scrollTop > 60)
    el.addEventListener('scroll', h, { passive: true })
    return () => el.removeEventListener('scroll', h)
  }, [])

  const menuUrls: Record<string, string | null | undefined> = {
    insurance_claim: card.menu_insurance_claim_url,
    check_insurance: card.menu_check_insurance_url,
    analysis:        card.menu_analysis_url,
    consult:         card.menu_consult_url,
  }

  const extraLinks: LinkItem[] = Array.isArray(card.extra_links) ? card.extra_links : []
  const siteUrl = typeof window !== 'undefined' ? window.location.href : ''
  const iconSz  = design.icon_size ?? 22
  const fz = {
    name:  design.font_size_name  ?? 28,
    sub:   design.font_size_sub   ?? 14,
    body:  design.font_size_body  ?? 13,
    label: 11 as number,
  }

  // 프로필 이미지 세로 위치 (objectPosition)
  const profilePosY = design.profile_position_y ?? 15
  const objectPos   = `center ${profilePosY}%`

  // 밝은 배경 여부 (로고 필터용)
  const isLightBg = ['#ffffff', '#faf9f7', '#f5f6f8', '#f4f4f5', '#f0ede8'].includes(t.pageBg)

  return (
    <div
      ref={scrollRef}
      className={`${animClass} ${speedClass}`}
      style={{
        minHeight: '100dvh',
        maxWidth: 480,
        margin: '0 auto',
        background: t.pageBg,
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
        animationDelay: animDelay,
      }}
    >
      <ShareButton cardUrl={siteUrl} name={card.name} />

      {/* ── 히어로 영역 ── */}
      <div
        className="hero-anim"
        style={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          background: bgImageUrl ? 'transparent' : t.heroBg,
          // 모바일 최적화: 스크롤 시 자연스럽게 줄어들되 너무 작아지지 않도록
          height: heroCollapsed ? '38vw' : '82vw',
          maxHeight: heroCollapsed ? '180px' : '480px',
          minHeight: heroCollapsed ? '120px' : '240px',
          transition: 'height 0.5s cubic-bezier(0.22,1,0.36,1), max-height 0.5s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {/* 배경 이미지 (회사 배경 또는 AFG 배경) */}
        {bgImageUrl && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${bgImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',  // 상단 30% — 얼굴 가리지 않게
          }} />
        )}

        {/* 그라디언트 오버레이 — 하단이 페이지 배경색으로 부드럽게 */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          background: `linear-gradient(
            180deg,
            rgba(0,0,0,0.08) 0%,
            transparent 25%,
            transparent 55%,
            ${t.pageBg}90 78%,
            ${t.pageBg} 100%
          )`,
        }} />

        {/* 프로필 이미지 */}
        {card.profile_image_url ? (
          <Image
            src={card.profile_image_url}
            alt={card.name}
            fill
            style={{ objectFit: 'cover', objectPosition: objectPos, zIndex: 5 }}
            priority
            sizes="480px"
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 5,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 100, height: 100, borderRadius: '50%',
              background: t.cardBg, border: `2px solid ${t.cardBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 46,
            }}>👤</div>
          </div>
        )}

        {/* 팀 뱃지 */}
        {card.team_name && (
          <div style={{
            position: 'absolute', top: 16, left: 16, zIndex: 20,
            padding: '4px 14px', borderRadius: 20,
            background: t.cardBg + 'dd', backdropFilter: 'blur(12px)',
            color: t.textSub, fontSize: 11, fontWeight: 500,
            border: `1px solid ${t.cardBorder}`,
          }}>
            {card.team_name}
          </div>
        )}
      </div>

      {/* ── 본문 콘텐츠 ── */}
      <div style={{ padding: '0 20px 80px', marginTop: -8 }}>

        {/* 이름 · 직함 */}
        <div className="fade-up-1" style={{ marginBottom: 20 }}>
          {/* 회사 로고 */}
          {card.company_logo_url && (
            <div style={{ marginBottom: 10 }}>
              <img
                src={card.company_logo_url}
                alt={card.company_name}
                style={{
                  height: 26, objectFit: 'contain',
                  filter: isLightBg ? 'none' : 'brightness(0) invert(1)',
                }}
              />
            </div>
          )}

          <h1 style={{
            fontSize: fz.name, fontWeight: 700,
            color: t.textName, marginBottom: 4,
            letterSpacing: '-0.025em', lineHeight: 1.2,
          }}>
            {card.name}
          </h1>

          {card.english_name && (
            <p style={{ fontSize: fz.sub - 1, color: t.accent, marginBottom: 6, fontWeight: 500 }}>
              {card.english_name}
            </p>
          )}

          <p style={{ fontSize: fz.sub, color: t.textSub, lineHeight: 1.5 }}>
            {card.position}
            {card.company_name && (
              <span style={{ color: t.textMuted }}> · {card.company_name}</span>
            )}
          </p>
        </div>

        {/* 소개 */}
        {card.short_intro && (
          <div className="fade-up-2" style={{ marginBottom: 24, paddingLeft: 14, borderLeft: `2px solid ${t.accent}44` }}>
            <p style={{ fontSize: fz.body + 1, color: t.textSub, lineHeight: 1.8 }}>
              {card.short_intro}
            </p>
          </div>
        )}

        {/* 메뉴 */}
        <div className="fade-up-3" style={{ marginBottom: 24 }}>
          {lb.menu_section && (
            <p style={{ fontSize: fz.label, fontWeight: 700, color: t.labelColor, letterSpacing: '0.18em', marginBottom: 12 }}>
              {lb.menu_section}
            </p>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            {MENU_ITEMS.map(item => {
              const url    = menuUrls[item.key]
              const active = !!url
              const Tag    = active ? 'a' : 'div'
              return (
                <Tag
                  key={item.key}
                  {...(active ? { href: ensureHttps(url!), target: '_blank', rel: 'noopener noreferrer' } : {})}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
                    padding: '14px 4px', borderRadius: 12,
                    background: active ? t.menuActiveBg : t.menuBg,
                    border: `1px solid ${active ? t.menuActiveBorder : t.menuBorder}`,
                    textDecoration: 'none',
                    cursor: active ? 'pointer' : 'default',
                    opacity: active ? 1 : 0.45,
                    transition: 'all 0.2s',
                  }}
                >
                  {design.show_icon && (
                    <span style={{ fontSize: iconSz }}>{item.icon}</span>
                  )}
                  {design.show_text && (
                    <span style={{ fontSize: fz.label - 1, color: t.menuText, textAlign: 'center', fontWeight: 500, lineHeight: 1.3 }}>
                      {item.defaultLabel}
                    </span>
                  )}
                </Tag>
              )
            })}
          </div>
        </div>

        {/* 전화 · SMS 버튼 */}
        {card.phone && (
          <div className="fade-up-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <a
              href={`tel:${card.phone}`}
              className="touch-btn"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                height: btnH, background: t.btnPrimary, color: t.btnPrimaryText,
                borderRadius: btnRadius, textDecoration: 'none',
                fontSize: fz.body + 1, fontWeight: 700,
                boxShadow: `0 4px 20px ${t.accent}44`,
              }}
            >
              {lb.call_btn || '전화 문의하기'}
            </a>
            <a
              href={`sms:${card.phone}`}
              className="touch-btn"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                height: btnH, background: t.btnSecondary, color: t.btnSecondaryText,
                borderRadius: btnRadius, textDecoration: 'none',
                fontSize: fz.body + 1, fontWeight: 600,
                border: `1px solid ${t.btnSecondaryBorder}`,
              }}
            >
              {lb.sms_btn || 'SMS 문의'}
            </a>
          </div>
        )}

        {/* 추가 링크 버튼들 */}
        {extraLinks.length > 0 && (
          <div className="fade-up-5" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {extraLinks.filter(l => l.url).map(link => (
              <a
                key={link.id}
                href={
                  link.type === 'email'
                    ? `mailto:${link.url}`
                    : ['phone', 'extension', 'fax'].includes(link.type)
                      ? `tel:${link.url}`
                      : ensureHttps(link.url)
                }
                target={['email', 'phone', 'extension', 'fax', 'sms'].includes(link.type) ? '_self' : '_blank'}
                rel="noopener noreferrer"
                className="touch-btn"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  height: btnH, padding: '0 18px',
                  background: t.cardBg, border: `1px solid ${t.cardBorder}`,
                  borderRadius: btnRadius, textDecoration: 'none',
                  color: t.textSub, fontSize: fz.body + 1,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <LinkPrefix link={link} iconSz={iconSz} />
                  <span style={{ fontWeight: 500 }}>{link.label}</span>
                </span>
                <span style={{ color: t.textMuted, fontSize: 18 }}>›</span>
              </a>
            ))}
          </div>
        )}

        {/* 카드뉴스 */}
        {card.card_news && card.card_news.length > 0 && (
          <div className="fade-up-6" style={{ marginBottom: 28 }}>
            {lb.news_section && (
              <p style={{ fontSize: fz.label, fontWeight: 700, color: t.labelColor, letterSpacing: '0.18em', marginBottom: 14 }}>
                {lb.news_section}
              </p>
            )}
            <div className="news-scroll">
              {card.card_news.map((news: CardNews) => {
                const cat = NEWS_CAT[news.category] ?? { label: '기타', color: '#475569' }
                const Tag = news.link_url ? 'a' : 'div'
                return (
                  <Tag
                    key={news.id}
                    {...(news.link_url ? { href: ensureHttps(news.link_url), target: '_blank', rel: 'noopener noreferrer' } : {})}
                    style={{
                      flexShrink: 0, width: 200,
                      background: t.cardBg, border: `1px solid ${t.cardBorder}`,
                      borderRadius: 16, overflow: 'hidden', textDecoration: 'none', display: 'block',
                    }}
                  >
                    {news.image_url && (
                      <div style={{ width: '100%', height: 108, position: 'relative', overflow: 'hidden' }}>
                        <Image src={news.image_url} alt={news.title} fill style={{ objectFit: 'cover' }} sizes="200px" />
                      </div>
                    )}
                    <div style={{ padding: 12 }}>
                      <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, color: cat.color, background: `${cat.color}18`, padding: '2px 8px', borderRadius: 20, marginBottom: 6 }}>
                        {cat.label}
                      </span>
                      <p style={{ fontSize: 12, fontWeight: 600, color: t.textName, lineHeight: 1.45, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {news.title}
                      </p>
                      <p style={{ fontSize: 11, color: t.textMuted, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {news.summary}
                      </p>
                    </div>
                  </Tag>
                )
              })}
            </div>
          </div>
        )}

        {/* 하단 회사 정보 — 라벨 없이 텍스트만 */}
        <div style={{ padding: 20, background: t.footerBg, border: `1px solid ${t.cardBorder}`, borderRadius: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            {card.company_logo_url ? (
              <img src={card.company_logo_url} alt={card.company_name} style={{ height: 30, objectFit: 'contain' }} />
            ) : (
              <div style={{ width: 34, height: 34, borderRadius: 8, background: t.cardBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${t.cardBorder}`, fontSize: 16 }}>
                🏢
              </div>
            )}
            <p style={{ fontSize: fz.body + 2, fontWeight: 700, color: t.textName, margin: 0 }}>
              {card.company_name}
            </p>
          </div>

          <div style={{ paddingTop: 12, borderTop: `1px solid ${t.cardBorder}`, display: 'flex', flexDirection: 'column', gap: 7 }}>
            {card.address && (
              <p style={{ fontSize: 12, color: t.textMuted, margin: 0 }}>
                {lb.address ? `${lb.address} ` : ''}{card.address}
              </p>
            )}
            {card.website_url && (
              <p style={{ fontSize: 12, color: t.textMuted, margin: 0 }}>
                {lb.website ? `${lb.website} ` : ''}{card.website_url.replace(/^https?:\/\//, '')}
              </p>
            )}
            {card.phone && (
              <p style={{ fontSize: 12, color: t.textMuted, margin: 0 }}>
                {lb.phone ? `${lb.phone} ` : ''}{card.phone}
              </p>
            )}
            {card.email && (
              <p style={{ fontSize: 12, color: t.textMuted, margin: 0 }}>
                {lb.email ? `${lb.email} ` : ''}{card.email}
              </p>
            )}
          </div>
        </div>

        <div style={{ height: 32 }} />
      </div>
    </div>
  )
}
