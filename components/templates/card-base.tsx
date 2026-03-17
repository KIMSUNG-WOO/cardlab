'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import type { BusinessCard, CardNews, LinkItem, AnimationType, CardDesignOptions } from '@/lib/types'
import { DEFAULT_DESIGN_OPTIONS } from '@/lib/types'
import { ensureHttps, copyToClipboard } from '@/lib/utils'

// ─── 메뉴 아이템 ─────────────────────────────────────────────
const MENU_ITEMS = [
  { key:'insurance_claim', label:'보험금청구', icon:'📋' },
  { key:'check_insurance', label:'내보험조회', icon:'🔍' },
  { key:'analysis',        label:'보장분석',  icon:'📊' },
  { key:'consult',         label:'상담신청',  icon:'💬' },
]

// ─── 카드뉴스 카테고리 ────────────────────────────────────────
const NEWS_CAT: Record<string, { label:string; color:string }> = {
  insurance: { label:'보험', color:'#1e40af' },
  finance:   { label:'금융', color:'#047857' },
  policy:    { label:'정책', color:'#7c3aed' },
  news:      { label:'뉴스', color:'#b45309' },
  notice:    { label:'공지', color:'#dc2626' },
}

// ─── 링크 이모지 기본값 ───────────────────────────────────────
const LINK_EMOJI: Record<string, string> = {
  phone:'📞', sms:'💬', email:'✉️', kakao:'💛',
  instagram:'📸', youtube:'▶️', blog:'📝',
  website:'🌐', consult:'📅', naver:'🟢',
  extension:'📟', fax:'🖷', custom:'🔗',
}

// ─── 애니메이션 클래스 맵 ─────────────────────────────────────
function getAnimClass(type: AnimationType, on: boolean) {
  if (!on) return 'anim-none'
  const map: Record<AnimationType, string> = {
    'zoom-out':   'anim-zoom-out',
    'fade-in':    'anim-fade-in',
    'slide-up':   'anim-slide-up',
    'blur-reveal':'anim-blur-reveal',
    'cinematic':  'anim-cinematic',
    'minimal':    'anim-minimal',
    'none':       'anim-none',
  }
  return map[type] ?? 'anim-zoom-out'
}

// ─── 버튼 라운드 값 ──────────────────────────────────────────
function getBtnRadius(r: CardDesignOptions['btn_radius']) {
  const map = { none:'0', sm:'6px', md:'12px', lg:'16px', full:'9999px' }
  return map[r ?? 'lg']
}

// ─── 버튼 높이 ───────────────────────────────────────────────
function getBtnHeight(s: CardDesignOptions['btn_size']) {
  const map = { sm:'44px', md:'52px', lg:'58px' }
  return map[s ?? 'md']
}

// ─── 공유 버튼 컴포넌트 ───────────────────────────────────────
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
      try {
        await navigator.share({ title: `${name}의 디지털 명함`, url: cardUrl })
      } catch {}
    } else {
      setOpen(v => !v)
    }
  }

  return (
    <div style={{ position:'fixed', top:16, right:16, zIndex:100 }}>
      {open && (
        <div style={{ position:'absolute', top:48, right:0, background:'rgba(20,20,20,0.95)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:14, padding:'8px', minWidth:160, boxShadow:'0 8px 32px rgba(0,0,0,0.4)' }}>
          <button onClick={handleCopy} style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 12px', background:'none', border:'none', color:'#fff', fontSize:13, cursor:'pointer', borderRadius:8, textAlign:'left' }}>
            {copied ? '✅ 복사됨!' : '🔗 링크 복사'}
          </button>
        </div>
      )}
      <button className="share-btn" onClick={handleShare} aria-label="공유">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
      </button>
    </div>
  )
}

// ─── 메인 카드 베이스 ─────────────────────────────────────────
export interface CardTheme {
  // 배경
  pageBg: string
  heroBg: string
  useAfgBg?: boolean       // AFG 배경 이미지 사용 여부
  // 카드/컨테이너
  cardBg: string
  cardBorder: string
  // 텍스트
  textName: string
  textSub: string
  textMuted: string
  // 강조
  accent: string
  accentBg: string
  // 버튼
  btnPrimary: string
  btnPrimaryText: string
  btnSecondary: string
  btnSecondaryText: string
  btnSecondaryBorder: string
  // 메뉴
  menuBg: string
  menuBorder: string
  menuText: string
  menuActiveBg: string
  menuActiveBorder: string
  // 기타
  divider: string
  labelColor: string
  footerBg: string
}

interface CardBaseProps {
  card: BusinessCard
  theme: CardTheme
}

export function CardBase({ card, theme }: CardBaseProps) {
  const [heroCollapsed, setHeroCollapsed] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const design: CardDesignOptions = card.design_options ?? DEFAULT_DESIGN_OPTIONS
  const animClass = getAnimClass(design.animation_type, design.animation_on)
  const speedClass = `anim-speed-${design.animation_speed}`
  const btnRadius = getBtnRadius(design.btn_radius)
  const btnH = getBtnHeight(design.btn_size)

  // 커스텀 색상 override
  const t = design.custom_colors ? {
    ...theme,
    pageBg: design.custom_colors.bg,
    heroBg: design.custom_colors.hero_bg,
    accent: design.custom_colors.accent,
    btnPrimary: design.custom_colors.btn_primary,
    textName: design.custom_colors.text_name,
    textSub: design.custom_colors.text_sub,
  } : theme

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

  const fz = design.font_size === 'sm' ? { name:24, sub:13, label:10, body:12 }
           : design.font_size === 'lg' ? { name:32, sub:15, label:12, body:14 }
           : { name:28, sub:14, label:11, body:13 }

  return (
    <div
      ref={scrollRef}
      className={`${animClass} ${speedClass}`}
      style={{ minHeight:'100dvh', maxWidth:480, margin:'0 auto', background:t.pageBg, overflowY:'auto', overflowX:'hidden', position:'relative' }}
    >
      {/* 공유 버튼 */}
      <ShareButton cardUrl={siteUrl} name={card.name} />

      {/* ══ 히어로 영역 ══ */}
      <div
        className="hero-anim"
        style={{
          position:'relative', width:'100%', overflow:'hidden',
          background: t.useAfgBg ? 'transparent' : t.heroBg,
          height: heroCollapsed ? '42vw' : '88vw',
          maxHeight: heroCollapsed ? '200px' : '520px',
          minHeight: heroCollapsed ? '130px' : '260px',
          transition: 'height 0.55s cubic-bezier(0.22,1,0.36,1), max-height 0.55s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {/* AFG 배경 이미지 */}
        {t.useAfgBg && (
          <div style={{ position:'absolute', inset:0, backgroundImage:'url(/afg-background.png)', backgroundSize:'cover', backgroundPosition:'center' }} />
        )}

        {/* 그라디언트 오버레이 */}
        <div style={{ position:'absolute', inset:0, zIndex:10, background:`linear-gradient(180deg,rgba(0,0,0,0.05) 0%,transparent 30%,${t.pageBg}bb 80%,${t.pageBg} 100%)` }} />

        {/* 프로필 이미지 */}
        {card.profile_image_url ? (
          <Image src={card.profile_image_url} alt={card.name} fill style={{ objectFit:'cover', objectPosition:'top center' }} priority sizes="480px" />
        ) : (
          <div style={{ position:'absolute', inset:0, background:t.heroBg, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ width:110, height:110, borderRadius:'50%', background:t.cardBg, border:`2px solid ${t.cardBorder}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:50 }}>👤</div>
          </div>
        )}

        {/* 팀 뱃지 */}
        {card.team_name && (
          <div style={{ position:'absolute', top:18, left:18, zIndex:20, padding:'4px 14px', borderRadius:20, background:t.cardBg+'dd', backdropFilter:'blur(12px)', color:t.textSub, fontSize:11, fontWeight:500, border:`1px solid ${t.cardBorder}` }}>
            {card.team_name}
          </div>
        )}
      </div>

      {/* ══ 메인 콘텐츠 ══ */}
      <div style={{ padding:'0 20px 72px', marginTop:-6 }}>

        {/* 이름 / 직함 */}
        <div className="fade-up-1" style={{ marginBottom:20 }}>
          {/* 회사 로고 */}
          {card.company_logo_url && (
            <div style={{ marginBottom:10 }}>
              <img src={card.company_logo_url} alt={card.company_name} style={{ height:28, objectFit:'contain', filter: t.pageBg === '#ffffff' || t.pageBg === '#faf9f7' ? 'none' : 'brightness(0) invert(1)' }} />
            </div>
          )}
          <h1 style={{ fontSize:fz.name, fontWeight:700, color:t.textName, marginBottom:4, letterSpacing:'-0.025em', lineHeight:1.2 }}>
            {card.name}
          </h1>
          {card.english_name && (
            <p style={{ fontSize:fz.sub-1, color:t.accent, marginBottom:6, fontWeight:500 }}>{card.english_name}</p>
          )}
          <p style={{ fontSize:fz.sub, color:t.textSub, lineHeight:1.5 }}>
            {card.position}
            {card.company_name && <span style={{ color:t.textMuted }}> · {card.company_name}</span>}
          </p>
        </div>

        {/* 소개 */}
        {card.short_intro && (
          <div className="fade-up-2" style={{ marginBottom:24, paddingLeft:14, borderLeft:`2px solid ${t.accent}44` }}>
            <p style={{ fontSize:fz.body+1, color:t.textSub, lineHeight:1.8 }}>{card.short_intro}</p>
          </div>
        )}

        {/* ── 메뉴 그리드 ── */}
        <div className="fade-up-3" style={{ marginBottom:24 }}>
          <p style={{ fontSize:fz.label, fontWeight:700, color:t.labelColor, letterSpacing:'0.18em', marginBottom:12 }}>MENU</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
            {MENU_ITEMS.map(item => {
              const url = menuUrls[item.key]
              const active = !!url
              const Tag = active ? 'a' : 'div'
              return (
                <Tag key={item.key}
                  {...(active ? { href:ensureHttps(url!), target:'_blank', rel:'noopener noreferrer' } : {})}
                  style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:7, padding:'14px 4px', borderRadius:12, background:active?t.menuActiveBg:t.menuBg, border:`1px solid ${active?t.menuActiveBorder:t.menuBorder}`, textDecoration:'none', cursor:active?'pointer':'default', opacity:active?1:0.45, transition:'all 0.2s' }}
                >
                  {design.show_icon && <span style={{ fontSize: design.icon_size==='lg'?26:design.icon_size==='sm'?18:22 }}>{item.icon}</span>}
                  {design.show_text && <span style={{ fontSize:fz.label-1, color:t.menuText, textAlign:'center', fontWeight:500, lineHeight:1.3 }}>{item.label}</span>}
                </Tag>
              )
            })}
          </div>
        </div>

        {/* ── CTA 버튼 ── */}
        {card.phone && (
          <div className="fade-up-4" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
            <a href={`tel:${card.phone}`} className="touch-btn" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, height:btnH, background:t.btnPrimary, color:t.btnPrimaryText, borderRadius:btnRadius, textDecoration:'none', fontSize:fz.body+1, fontWeight:700, boxShadow:`0 4px 20px ${t.accent}44` }}>
              📞 전화 문의하기
            </a>
            <a href={`sms:${card.phone}`} className="touch-btn" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, height:btnH, background:t.btnSecondary, color:t.btnSecondaryText, borderRadius:btnRadius, textDecoration:'none', fontSize:fz.body+1, fontWeight:600, border:`1px solid ${t.btnSecondaryBorder}` }}>
              💬 SMS 문의
            </a>
          </div>
        )}

        {/* ── 추가 링크 ── */}
        {extraLinks.length > 0 && (
          <div className="fade-up-5" style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:24 }}>
            {extraLinks.filter(l => l.url).map(link => (
              <a key={link.id}
                href={link.type==='email' ? `mailto:${link.url}` : link.type==='phone'||link.type==='extension'||link.type==='fax' ? `tel:${link.url}` : ensureHttps(link.url)}
                target={['email','phone','extension','fax','sms'].includes(link.type) ? '_self' : '_blank'}
                rel="noopener noreferrer"
                className="touch-btn"
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:btnH, padding:'0 18px', background:t.cardBg, border:`1px solid ${t.cardBorder}`, borderRadius:btnRadius, textDecoration:'none', color:t.textSub, fontSize:fz.body+1 }}
              >
                <span style={{ display:'flex', alignItems:'center', gap:12 }}>
                  {design.show_icon && <span style={{ fontSize:18 }}>{link.emoji || LINK_EMOJI[link.type] || '🔗'}</span>}
                  {design.show_text && <span style={{ fontWeight:500 }}>{link.label}</span>}
                </span>
                <span style={{ color:t.textMuted, fontSize:18 }}>›</span>
              </a>
            ))}
          </div>
        )}

        {/* ── 카드뉴스 ── */}
        {card.card_news && card.card_news.length > 0 && (
          <div className="fade-up-6" style={{ marginBottom:28 }}>
            <p style={{ fontSize:fz.label, fontWeight:700, color:t.labelColor, letterSpacing:'0.18em', marginBottom:14 }}>CARD NEWS</p>
            <div className="news-scroll">
              {card.card_news.map((news: CardNews) => {
                const cat = NEWS_CAT[news.category] ?? { label:'기타', color:'#475569' }
                const Tag = news.link_url ? 'a' : 'div'
                return (
                  <Tag key={news.id}
                    {...(news.link_url ? { href:ensureHttps(news.link_url), target:'_blank', rel:'noopener noreferrer' } : {})}
                    style={{ flexShrink:0, width:200, background:t.cardBg, border:`1px solid ${t.cardBorder}`, borderRadius:16, overflow:'hidden', textDecoration:'none', display:'block' }}
                  >
                    {news.image_url && (
                      <div style={{ width:'100%', height:108, position:'relative', overflow:'hidden' }}>
                        <Image src={news.image_url} alt={news.title} fill style={{ objectFit:'cover' }} sizes="200px" />
                      </div>
                    )}
                    <div style={{ padding:12 }}>
                      <span style={{ display:'inline-block', fontSize:10, fontWeight:700, color:cat.color, background:`${cat.color}18`, padding:'2px 8px', borderRadius:20, marginBottom:6 }}>{cat.label}</span>
                      <p style={{ fontSize:12, fontWeight:600, color:t.textName, lineHeight:1.45, marginBottom:4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{news.title}</p>
                      <p style={{ fontSize:11, color:t.textMuted, lineHeight:1.4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{news.summary}</p>
                    </div>
                  </Tag>
                )
              })}
            </div>
          </div>
        )}

        {/* ── 회사 정보 푸터 ── */}
        <div style={{ padding:20, background:t.footerBg, border:`1px solid ${t.cardBorder}`, borderRadius:18 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
            {card.company_logo_url ? (
              <img src={card.company_logo_url} alt={card.company_name} style={{ height:32, objectFit:'contain' }} />
            ) : (
              <div style={{ width:36, height:36, borderRadius:8, background:t.cardBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:`1px solid ${t.cardBorder}` }}>
                🏢
              </div>
            )}
            <p style={{ fontSize:fz.body+2, fontWeight:700, color:t.textName, margin:0 }}>{card.company_name}</p>
          </div>
          <div style={{ paddingTop:12, borderTop:`1px solid ${t.cardBorder}`, display:'flex', flexDirection:'column', gap:7 }}>
            {card.address     && <p style={{ fontSize:12, color:t.textMuted }}>📍 {card.address}</p>}
            {card.website_url && <p style={{ fontSize:12, color:t.textMuted }}>🌐 {card.website_url.replace(/^https?:\/\//,'')}</p>}
            {card.phone       && <p style={{ fontSize:12, color:t.textMuted }}>📞 {card.phone}</p>}
            {card.email       && <p style={{ fontSize:12, color:t.textMuted }}>✉️ {card.email}</p>}
          </div>
        </div>

        <div style={{ height:32 }} />
      </div>
    </div>
  )
}
