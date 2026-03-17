'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import type { BusinessCard, CardNews, LinkItem } from '@/lib/types'
import { ensureHttps } from '@/lib/utils'

const MENU = [
  { key:'insurance_claim', label:'보험금청구', icon:'📋' },
  { key:'check_insurance', label:'내보험조회', icon:'🔍' },
  { key:'analysis',        label:'보장분석',  icon:'📊' },
  { key:'consult',         label:'상담신청',  icon:'💬' },
]

const NEWS_CATEGORY: Record<string, { label: string; color: string }> = {
  insurance: { label:'보험', color:'#1e40af' },
  finance:   { label:'금융', color:'#047857' },
  policy:    { label:'정책', color:'#7c3aed' },
  news:      { label:'뉴스', color:'#b45309' },
  notice:    { label:'공지', color:'#dc2626' },
}

interface Theme {
  bg: string; heroBg: string
  card: string; cardBorder: string
  name: string; sub: string; muted: string
  accent: string
  btnPrimary: string; btnSecondary: string; btnSecText: string
  menuBg: string; menuBorder: string; menuText: string; menuActiveBg: string; menuActiveBorder: string
  footer: string; footerBorder: string
  divider: string
  menuLabel: string
}

function CardTemplate({ card, theme }: { card: BusinessCard; theme: Theme }) {
  const [heroCollapsed, setHeroCollapsed] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

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
    analysis: card.menu_analysis_url,
    consult: card.menu_consult_url,
  }

  const extraLinks: LinkItem[] = Array.isArray(card.extra_links) ? card.extra_links : []

  return (
    <div
      ref={scrollRef}
      style={{ minHeight:'100dvh', maxWidth:480, margin:'0 auto', background:theme.bg, overflowY:'auto', overflowX:'hidden' }}
    >
      {/* 히어로 */}
      <div
        className="hero-enter"
        style={{
          position:'relative', width:'100%', overflow:'hidden', background:theme.heroBg,
          height: heroCollapsed ? '42vw' : '88vw',
          maxHeight: heroCollapsed ? '200px' : '520px',
          minHeight: heroCollapsed ? '140px' : '260px',
          transition:'height 0.55s cubic-bezier(0.22,1,0.36,1), max-height 0.55s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <div style={{ position:'absolute', inset:0, zIndex:10, background:`linear-gradient(180deg,rgba(0,0,0,0.05) 0%,transparent 35%,${theme.bg}cc 82%,${theme.bg} 100%)` }} />
        {card.profile_image_url ? (
          <Image src={card.profile_image_url} alt={card.name} fill style={{ objectFit:'cover', objectPosition:'top center' }} priority sizes="480px" />
        ) : (
          <div style={{ position:'absolute', inset:0, background:theme.heroBg, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ width:100, height:100, borderRadius:'50%', background:theme.card, display:'flex', alignItems:'center', justifyContent:'center', fontSize:44 }}>👤</div>
          </div>
        )}
        {card.team_name && (
          <div style={{ position:'absolute', top:20, left:20, zIndex:20, padding:'4px 14px', borderRadius:20, background:theme.card+'dd', backdropFilter:'blur(10px)', color:theme.sub, fontSize:11, fontWeight:500, border:`1px solid ${theme.cardBorder}` }}>
            {card.team_name}
          </div>
        )}
      </div>

      <div style={{ padding:'0 20px 60px', marginTop:-6 }}>

        {/* 이름 */}
        <div className="fade-up-1" style={{ marginBottom:20 }}>
          <h1 style={{ fontSize:28, fontWeight:700, color:theme.name, marginBottom:4, letterSpacing:'-0.025em', lineHeight:1.2 }}>{card.name}</h1>
          {card.english_name && <p style={{ fontSize:13, color:theme.accent, marginBottom:6, fontWeight:500 }}>{card.english_name}</p>}
          <p style={{ fontSize:14, color:theme.sub }}>{card.position}<span style={{ color:theme.muted }}> · {card.company_name}</span></p>
        </div>

        {/* 소개 */}
        {card.short_intro && (
          <div className="fade-up-2" style={{ marginBottom:24, paddingLeft:14, borderLeft:`2px solid ${theme.divider}` }}>
            <p style={{ fontSize:13, color:theme.sub, lineHeight:1.75 }}>{card.short_intro}</p>
          </div>
        )}

        {/* 메뉴 */}
        <div className="fade-up-3" style={{ marginBottom:24 }}>
          <p style={{ fontSize:10, fontWeight:700, color:theme.menuLabel, letterSpacing:'0.18em', marginBottom:12 }}>MENU</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
            {MENU.map(item => {
              const url = menuUrls[item.key]
              const isActive = !!url
              const Tag = isActive ? 'a' : 'div'
              return (
                <Tag key={item.key}
                  {...(isActive ? { href:ensureHttps(url!), target:'_blank', rel:'noopener noreferrer' } : {})}
                  style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:7, padding:'14px 4px', borderRadius:14, background:isActive ? theme.menuActiveBg : theme.menuBg, border:`1px solid ${isActive ? theme.menuActiveBorder : theme.menuBorder}`, textDecoration:'none', cursor:isActive?'pointer':'default', opacity:isActive?1:0.5 }}
                >
                  <span style={{ fontSize:22 }}>{item.icon}</span>
                  <span style={{ fontSize:10, color:theme.menuText, textAlign:'center', fontWeight:500, lineHeight:1.3 }}>{item.label}</span>
                </Tag>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        {card.phone && (
          <div className="fade-up-4" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
            <a href={`tel:${card.phone}`} className="touch-btn" style={{ display:'flex', alignItems:'center', justifyContent:'center', height:52, background:theme.btnPrimary, color:'#fff', borderRadius:16, textDecoration:'none', fontSize:13, fontWeight:700 }}>
              📞 전화 문의하기
            </a>
            <a href={`sms:${card.phone}`} className="touch-btn" style={{ display:'flex', alignItems:'center', justifyContent:'center', height:52, background:theme.btnSecondary, color:theme.btnSecText, borderRadius:16, textDecoration:'none', fontSize:13, fontWeight:600, border:`1px solid ${theme.cardBorder}` }}>
              💬 SMS 문의하기
            </a>
          </div>
        )}

        {/* 추가 링크 */}
        {extraLinks.length > 0 && (
          <div className="fade-up-5" style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:24 }}>
            {extraLinks.map(link => (
              <a key={link.id} href={ensureHttps(link.url)} target="_blank" rel="noopener noreferrer" className="touch-btn"
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:52, padding:'0 18px', background:theme.card, border:`1px solid ${theme.cardBorder}`, borderRadius:16, textDecoration:'none', color:theme.sub, fontSize:13 }}>
                <span style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <span>{link.emoji || '🔗'}</span>
                  <span>{link.label}</span>
                </span>
                <span style={{ color:theme.muted, fontSize:18 }}>›</span>
              </a>
            ))}
          </div>
        )}

        {/* 카드뉴스 */}
        {card.card_news && card.card_news.length > 0 && (
          <div className="fade-up-6" style={{ marginBottom:24 }}>
            <p style={{ fontSize:10, fontWeight:700, color:theme.menuLabel, letterSpacing:'0.18em', marginBottom:14 }}>CARD NEWS</p>
            <div className="news-scroll">
              {card.card_news.map((news: CardNews) => {
                const cat = NEWS_CATEGORY[news.category] ?? { label:'기타', color:'#475569' }
                const Tag = news.link_url ? 'a' : 'div'
                return (
                  <Tag key={news.id}
                    {...(news.link_url ? { href:ensureHttps(news.link_url), target:'_blank', rel:'noopener noreferrer' } : {})}
                    style={{ flexShrink:0, width:200, background:theme.card, border:`1px solid ${theme.cardBorder}`, borderRadius:16, overflow:'hidden', textDecoration:'none', display:'block' }}>
                    {news.image_url && (
                      <div style={{ width:'100%', height:100, position:'relative', overflow:'hidden' }}>
                        <Image src={news.image_url} alt={news.title} fill style={{ objectFit:'cover' }} sizes="200px" />
                      </div>
                    )}
                    <div style={{ padding:12 }}>
                      <span style={{ display:'inline-block', fontSize:10, fontWeight:700, color:cat.color, background:`${cat.color}18`, padding:'2px 8px', borderRadius:20, marginBottom:6 }}>{cat.label}</span>
                      <p style={{ fontSize:12, fontWeight:600, color:theme.name, lineHeight:1.45, marginBottom:4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{news.title}</p>
                      <p style={{ fontSize:11, color:theme.muted, lineHeight:1.4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{news.summary}</p>
                    </div>
                  </Tag>
                )
              })}
            </div>
          </div>
        )}

        {/* 회사 정보 */}
        <div style={{ padding:20, background:theme.footer, border:`1px solid ${theme.footerBorder}`, borderRadius:20 }}>
          <p style={{ fontSize:14, fontWeight:700, color:theme.name, marginBottom:14 }}>{card.company_name}</p>
          <div style={{ paddingTop:12, borderTop:`1px solid ${theme.footerBorder}`, display:'flex', flexDirection:'column', gap:6 }}>
            {card.address     && <p style={{ fontSize:12, color:theme.muted }}>📍 {card.address}</p>}
            {card.website_url && <p style={{ fontSize:12, color:theme.muted }}>🌐 {card.website_url.replace(/^https?:\/\//,'')}</p>}
            {card.phone       && <p style={{ fontSize:12, color:theme.muted }}>📞 {card.phone}</p>}
            {card.email       && <p style={{ fontSize:12, color:theme.muted }}>✉️ {card.email}</p>}
          </div>
        </div>
        <div style={{ height:32 }} />
      </div>
    </div>
  )
}

// ── AFG 라이트 ────────────────────────────────────────────────
export function AfgLightCard({ card }: { card: BusinessCard }) {
  return <CardTemplate card={card} theme={{
    bg:'#f5f6f8', heroBg:'#e9ecef',
    card:'#ffffff', cardBorder:'#dee2e6',
    name:'#1a1a2e', sub:'#495057', muted:'#adb5bd',
    accent:'#1e40af',
    btnPrimary:'linear-gradient(135deg,#1e3a5f,#1e40af)',
    btnSecondary:'#f1f3f5', btnSecText:'#495057',
    menuBg:'#ffffff', menuBorder:'#dee2e6', menuText:'#495057',
    menuActiveBg:'#e7f0ff', menuActiveBorder:'#4263eb',
    footer:'#f1f3f5', footerBorder:'#dee2e6',
    divider:'#cbd5e1', menuLabel:'#9ca3af',
  }} />
}

// ── 모던 그레이 ───────────────────────────────────────────────
export function ModernGrayCard({ card }: { card: BusinessCard }) {
  return <CardTemplate card={card} theme={{
    bg:'#18181b', heroBg:'#09090b',
    card:'#27272a', cardBorder:'#3f3f46',
    name:'#fafafa', sub:'#a1a1aa', muted:'#52525b',
    accent:'#e4e4e7',
    btnPrimary:'linear-gradient(135deg,#3f3f46,#52525b)',
    btnSecondary:'#27272a', btnSecText:'#a1a1aa',
    menuBg:'#27272a', menuBorder:'#3f3f46', menuText:'#71717a',
    menuActiveBg:'#3f3f46', menuActiveBorder:'#71717a',
    footer:'#27272a', footerBorder:'#3f3f46',
    divider:'#3f3f46', menuLabel:'#52525b',
  }} />
}

// ── 네이비 프로 ───────────────────────────────────────────────
export function NavyProCard({ card }: { card: BusinessCard }) {
  return <CardTemplate card={card} theme={{
    bg:'#0c1220', heroBg:'#08101c',
    card:'#162032', cardBorder:'#1e3a5f',
    name:'#f0f4ff', sub:'#7fa8cc', muted:'#3d6080',
    accent:'#4a9eff',
    btnPrimary:'linear-gradient(135deg,#1a4a80,#2563eb)',
    btnSecondary:'#162032', btnSecText:'#7fa8cc',
    menuBg:'#162032', menuBorder:'#1e3a5f', menuText:'#4a7a9a',
    menuActiveBg:'#1e3a5f', menuActiveBorder:'#2563eb',
    footer:'#0a1828', footerBorder:'#1e3a5f',
    divider:'#1e3a5f', menuLabel:'#3d6080',
  }} />
}

// ── 클린 화이트 ───────────────────────────────────────────────
export function CleanWhiteCard({ card }: { card: BusinessCard }) {
  return <CardTemplate card={card} theme={{
    bg:'#ffffff', heroBg:'#f4f4f5',
    card:'#fafafa', cardBorder:'#e4e4e7',
    name:'#18181b', sub:'#52525b', muted:'#a1a1aa',
    accent:'#18181b',
    btnPrimary:'linear-gradient(135deg,#18181b,#3f3f46)',
    btnSecondary:'#f4f4f5', btnSecText:'#52525b',
    menuBg:'#fafafa', menuBorder:'#e4e4e7', menuText:'#71717a',
    menuActiveBg:'#f0f0f0', menuActiveBorder:'#18181b',
    footer:'#f4f4f5', footerBorder:'#e4e4e7',
    divider:'#e4e4e7', menuLabel:'#a1a1aa',
  }} />
}
