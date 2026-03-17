'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import type { BusinessCard, CardNews, LinkItem } from '@/lib/types'
import { ensureHttps } from '@/lib/utils'

// ─── AFG 로고 배경 SVG ────────────────────────────────────────
function AfgLogoBg({ opacity = 0.06 }: { opacity?: number }) {
  return (
    <svg
      viewBox="0 0 300 240"
      style={{ position:'absolute', right:-20, top:'50%', transform:'translateY(-50%)', width:'70%', opacity, pointerEvents:'none' }}
      fill="none"
    >
      <polygon points="150,12 288,228 12,228" stroke="white" strokeWidth="10" strokeLinejoin="round"/>
      <line x1="38" y1="188" x2="262" y2="188" stroke="white" strokeWidth="9"/>
      <line x1="72" y1="148" x2="228" y2="148" stroke="white" strokeWidth="7.5"/>
      <line x1="106" y1="108" x2="194" y2="108" stroke="white" strokeWidth="6"/>
    </svg>
  )
}

// ─── 메뉴 아이템 ──────────────────────────────────────────────
const MENU = [
  { key:'insurance_claim', label:'보험금청구', icon:'📋' },
  { key:'check_insurance', label:'내보험조회', icon:'🔍' },
  { key:'analysis',        label:'보장분석',  icon:'📊' },
  { key:'consult',         label:'상담신청',  icon:'💬' },
]

// ─── 카드뉴스 카테고리 라벨 ───────────────────────────────────
const NEWS_CATEGORY: Record<string, { label: string; color: string }> = {
  insurance: { label:'보험', color:'#1e40af' },
  finance:   { label:'금융', color:'#047857' },
  policy:    { label:'정책', color:'#7c3aed' },
  news:      { label:'뉴스', color:'#b45309' },
  notice:    { label:'공지', color:'#dc2626' },
}

// ─── 링크 이모지 맵 ──────────────────────────────────────────
const LINK_EMOJI: Record<string, string> = {
  phone:'📞', sms:'💬', email:'✉️', kakao:'💛',
  instagram:'📸', youtube:'▶️', blog:'📝',
  website:'🌐', consult:'📅', custom:'🔗',
}

export function AfgDarkCard({ card }: { card: BusinessCard }) {
  const [heroCollapsed, setHeroCollapsed] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // 스크롤 감지 → 히어로 축소
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handler = () => setHeroCollapsed(el.scrollTop > 60)
    el.addEventListener('scroll', handler, { passive: true })
    return () => el.removeEventListener('scroll', handler)
  }, [])

  const menuUrls: Record<string, string | null | undefined> = {
    insurance_claim: card.menu_insurance_claim_url,
    check_insurance: card.menu_check_insurance_url,
    analysis:        card.menu_analysis_url,
    consult:         card.menu_consult_url,
  }

  const extraLinks: LinkItem[] = Array.isArray(card.extra_links) ? card.extra_links : []
  const hasPhone = !!card.phone

  return (
    <div
      ref={scrollRef}
      style={{
        minHeight:'100dvh', maxWidth:480, margin:'0 auto',
        background:'linear-gradient(180deg,#08101c 0%,#0a0a0a 40%)',
        overflowY:'auto', overflowX:'hidden', position:'relative',
      }}
    >
      {/* ══ 히어로 영역 ══════════════════════════════════════ */}
      <div
        className="hero-enter"
        style={{
          position:'relative', width:'100%', overflow:'hidden',
          background:'#080e18',
          height: heroCollapsed ? '42vw' : '88vw',
          maxHeight: heroCollapsed ? '200px' : '520px',
          minHeight: heroCollapsed ? '140px' : '260px',
          transition:'height 0.55s cubic-bezier(0.22,1,0.36,1), max-height 0.55s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {/* AFG 로고 배경 */}
        <div style={{ position:'absolute', inset:0, overflow:'hidden' }}>
          <AfgLogoBg opacity={0.07} />
        </div>

        {/* 그라디언트 오버레이 */}
        <div style={{ position:'absolute', inset:0, zIndex:10, background:'linear-gradient(180deg,rgba(8,16,28,0.15) 0%,rgba(8,16,28,0) 35%,rgba(10,10,10,0.75) 82%,rgba(10,10,10,1) 100%)' }} />

        {/* 프로필 이미지 */}
        {card.profile_image_url ? (
          <Image
            src={card.profile_image_url}
            alt={card.name}
            fill
            style={{ objectFit:'cover', objectPosition:'top center', transition:'transform 0.55s ease' }}
            priority
            sizes="480px"
          />
        ) : (
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,#0d1b2e,#152238)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ width:100, height:100, borderRadius:'50%', background:'#1e3a5f', display:'flex', alignItems:'center', justifyContent:'center', fontSize:44 }}>👤</div>
          </div>
        )}

        {/* 팀 뱃지 */}
        {card.team_name && (
          <div style={{ position:'absolute', top:20, left:20, zIndex:20, padding:'4px 14px', borderRadius:20, background:'rgba(14,26,46,0.82)', backdropFilter:'blur(10px)', color:'#94a3b8', fontSize:11, fontWeight:500, border:'1px solid rgba(37,99,235,0.25)', letterSpacing:'0.04em' }}>
            {card.team_name}
          </div>
        )}
      </div>

      {/* ══ 메인 콘텐츠 ══════════════════════════════════════ */}
      <div style={{ padding:'0 20px 60px', marginTop:-6 }}>

        {/* 이름 / 직함 */}
        <div className="fade-up-1" style={{ marginBottom:20 }}>
          <h1 style={{ fontSize:28, fontWeight:700, color:'#fff', marginBottom:4, letterSpacing:'-0.025em', lineHeight:1.2 }}>
            {card.name}
          </h1>
          {card.english_name && (
            <p style={{ fontSize:13, color:'#3b82f6', marginBottom:6, fontWeight:500, letterSpacing:'0.01em' }}>
              {card.english_name}
            </p>
          )}
          <p style={{ fontSize:14, color:'#94a3b8', lineHeight:1.5 }}>
            {card.position}
            {card.company_name && <span style={{ color:'#4a5568' }}> · {card.company_name}</span>}
          </p>
        </div>

        {/* 한 줄 소개 */}
        {card.short_intro && (
          <div className="fade-up-2" style={{ marginBottom:24, paddingLeft:14, borderLeft:'2px solid #1e3a5f' }}>
            <p style={{ fontSize:13, color:'#7b8ea6', lineHeight:1.75 }}>{card.short_intro}</p>
          </div>
        )}

        {/* ── 메뉴 그리드 ── */}
        <div className="fade-up-3" style={{ marginBottom:24 }}>
          <p style={{ fontSize:10, fontWeight:700, color:'#2d3748', letterSpacing:'0.18em', marginBottom:12 }}>MENU</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
            {MENU.map(item => {
              const url = menuUrls[item.key]
              const isActive = !!url
              const Tag = isActive ? 'a' : 'div'
              return (
                <Tag
                  key={item.key}
                  {...(isActive ? { href: ensureHttps(url!), target:'_blank', rel:'noopener noreferrer' } : {})}
                  style={{
                    display:'flex', flexDirection:'column', alignItems:'center', gap:7,
                    padding:'14px 4px', borderRadius:14,
                    background: isActive ? '#0f1f35' : '#111520',
                    border:`1px solid ${isActive ? '#1e3a5f' : '#1a2030'}`,
                    textDecoration:'none', cursor: isActive ? 'pointer' : 'default',
                    opacity: isActive ? 1 : 0.5,
                    transition:'background 0.2s',
                  }}
                >
                  <span style={{ fontSize:22 }}>{item.icon}</span>
                  <span style={{ fontSize:10, color: isActive ? '#7fa8cc' : '#374151', textAlign:'center', fontWeight:500, lineHeight:1.3 }}>
                    {item.label}
                  </span>
                </Tag>
              )
            })}
          </div>
        </div>

        {/* ── CTA 버튼 ── */}
        {hasPhone && (
          <div className="fade-up-4" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
            <a href={`tel:${card.phone}`} className="touch-btn" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, height:52, background:'linear-gradient(135deg,#1e3a5f,#1e40af)', color:'#fff', borderRadius:16, textDecoration:'none', fontSize:13, fontWeight:700, boxShadow:'0 4px 20px rgba(30,64,175,0.28)' }}>
              📞 전화 문의하기
            </a>
            <a href={`sms:${card.phone}`} className="touch-btn" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, height:52, background:'#111827', color:'#94a3b8', borderRadius:16, textDecoration:'none', fontSize:13, fontWeight:600, border:'1px solid #1e2d42' }}>
              💬 SMS 문의하기
            </a>
          </div>
        )}

        {/* ── 추가 링크 (extra_links) ── */}
        {extraLinks.length > 0 && (
          <div className="fade-up-5" style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:24 }}>
            {extraLinks.map(link => (
              <a
                key={link.id}
                href={ensureHttps(link.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="touch-btn"
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:52, padding:'0 18px', background:'#111827', border:'1px solid #1e2d42', borderRadius:16, textDecoration:'none', color:'#94a3b8', fontSize:13 }}
              >
                <span style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <span>{link.emoji || LINK_EMOJI[link.type] || '🔗'}</span>
                  <span>{link.label}</span>
                </span>
                <span style={{ color:'#2d3748', fontSize:18 }}>›</span>
              </a>
            ))}
          </div>
        )}

        {/* ── 카드뉴스 섹션 ── */}
        {card.card_news && card.card_news.length > 0 && (
          <div className="fade-up-6" style={{ marginBottom:24 }}>
            <p style={{ fontSize:10, fontWeight:700, color:'#2d3748', letterSpacing:'0.18em', marginBottom:14 }}>CARD NEWS</p>
            <div className="news-scroll">
              {card.card_news.map((news: CardNews) => {
                const cat = NEWS_CATEGORY[news.category] ?? { label:'기타', color:'#475569' }
                const Tag = news.link_url ? 'a' : 'div'
                return (
                  <Tag
                    key={news.id}
                    {...(news.link_url ? { href: ensureHttps(news.link_url), target:'_blank', rel:'noopener noreferrer' } : {})}
                    style={{ flexShrink:0, width:200, background:'#0d1520', border:'1px solid #1e2d42', borderRadius:16, overflow:'hidden', textDecoration:'none', display:'block' }}
                  >
                    {news.image_url && (
                      <div style={{ width:'100%', height:100, position:'relative', overflow:'hidden' }}>
                        <Image src={news.image_url} alt={news.title} fill style={{ objectFit:'cover' }} sizes="200px" />
                      </div>
                    )}
                    <div style={{ padding:12 }}>
                      <span style={{ display:'inline-block', fontSize:10, fontWeight:700, color:cat.color, background:`${cat.color}18`, padding:'2px 8px', borderRadius:20, marginBottom:6 }}>
                        {cat.label}
                      </span>
                      <p style={{ fontSize:12, fontWeight:600, color:'#e2e8f0', lineHeight:1.45, marginBottom:4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                        {news.title}
                      </p>
                      <p style={{ fontSize:11, color:'#4a5568', lineHeight:1.4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                        {news.summary}
                      </p>
                    </div>
                  </Tag>
                )
              })}
            </div>
          </div>
        )}

        {/* ── 회사 정보 푸터 ── */}
        <div style={{ padding:20, background:'#0d1520', border:'1px solid #1a2535', borderRadius:20, position:'relative', overflow:'hidden' }}>
          <AfgLogoBg opacity={0.05} />
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14, position:'relative', zIndex:1 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:'#0a1828', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:'1px solid #1e3a5f' }}>
              <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
                <polygon points="24,6 44,42 4,42" stroke="white" strokeWidth="3.5" strokeLinejoin="round"/>
                <line x1="10" y1="34" x2="38" y2="34" stroke="white" strokeWidth="3"/>
                <line x1="16" y1="26" x2="32" y2="26" stroke="white" strokeWidth="2.5"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize:14, fontWeight:700, color:'#e2e8f0', margin:0 }}>{card.company_name}</p>
            </div>
          </div>
          <div style={{ paddingTop:12, borderTop:'1px solid #1a2535', display:'flex', flexDirection:'column', gap:6, position:'relative', zIndex:1 }}>
            {card.address    && <p style={{ fontSize:12, color:'#3d5066' }}>📍 {card.address}</p>}
            {card.website_url && <p style={{ fontSize:12, color:'#3d5066' }}>🌐 {card.website_url.replace(/^https?:\/\//,'')}</p>}
            {card.phone       && <p style={{ fontSize:12, color:'#3d5066' }}>📞 {card.phone}</p>}
            {card.email       && <p style={{ fontSize:12, color:'#3d5066' }}>✉️ {card.email}</p>}
          </div>
        </div>

        <div style={{ height:32 }} />
      </div>
    </div>
  )
}
