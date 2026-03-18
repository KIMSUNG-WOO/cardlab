'use client'

import { useState, useEffect, useRef } from 'react'
import type {
  BusinessCard, CardNews, LinkItem, LabelConfig,
  AnimationType, CardDesignOptions, AllLabels
} from '@/lib/types'
import { DEFAULT_DESIGN_OPTIONS, DEFAULT_LABELS } from '@/lib/types'
import { ensureHttps, copyToClipboard } from '@/lib/utils'

const KAKAO_JS_KEY = 'ec234b7ad8f90acabba0ff14f650a27e'
const CARDLAB_CHANNEL_ID = '_RwpxhX'

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
    'zoom-out': 'anim-zoom-out', 'fade-in': 'anim-fade-in',
    'slide-up': 'anim-slide-up', 'blur-reveal': 'anim-blur-reveal',
    'cinematic': 'anim-cinematic', 'photo-first': 'anim-photo-first',
    'text-first': 'anim-text-first', 'simultaneous': 'anim-simultaneous',
    'minimal': 'anim-minimal', 'bounce': 'anim-bounce', 'none': 'anim-none',
  }
  return map[type] ?? 'anim-zoom-out'
}

function getBtnRadius(r: CardDesignOptions['btn_radius']): string {
  return { none: '0', sm: '6px', md: '12px', lg: '16px', full: '9999px' }[r ?? 'lg']
}

function getBtnHeight(s: CardDesignOptions['btn_size']): string {
  return { sm: '40px', md: '46px', lg: '52px' }[s ?? 'md']
}

function RenderLabelCfg({ cfg, size = 14 }: { cfg?: LabelConfig | null; size?: number }) {
  if (!cfg || cfg.mode === 'none') return null
  if (cfg.mode === 'emoji' && cfg.emoji) return <span style={{ fontSize: size, lineHeight: 1, marginRight: 4 }}>{cfg.emoji}</span>
  if (cfg.mode === 'image' && cfg.imageUrl) return <img src={cfg.imageUrl} alt="" style={{ height: size, width: 'auto', objectFit: 'contain', marginRight: 4 }} />
  if (cfg.mode === 'text' && cfg.text) {
    const ff = cfg.fontFamily === 'serif' ? 'Georgia, serif' : cfg.fontFamily === 'mono' ? 'monospace' : 'inherit'
    return <span style={{ fontSize: cfg.fontSize ?? 11, fontWeight: cfg.fontWeight === 'bold' ? 700 : 400, fontFamily: ff, marginRight: 4, opacity: 0.8 }}>{cfg.text}</span>
  }
  return null
}

function LinkPrefix({ link, iconSz }: { link: LinkItem; iconSz: number }) {
  const pt = link.prefixType ?? 'none'
  if (pt === 'emoji' && link.prefixEmoji) return <span style={{ fontSize: iconSz, lineHeight: 1 }}>{link.prefixEmoji}</span>
  if (pt === 'text' && link.prefixText) return <span style={{ fontSize: 12, fontWeight: 600, color: 'inherit', opacity: 0.7, whiteSpace: 'nowrap' }}>{link.prefixText}</span>
  if (pt === 'image' && link.prefixImage) return <img src={link.prefixImage} alt="" style={{ height: iconSz, width: 'auto', objectFit: 'contain' }} />
  return null
}

function useKakaoSdk() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const win = window as any
    if (win.Kakao?.isInitialized?.()) { setReady(true); return }
    const script = document.createElement('script')
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js'
    script.crossOrigin = 'anonymous'
    script.onload = () => {
      if (win.Kakao && !win.Kakao.isInitialized()) win.Kakao.init(KAKAO_JS_KEY)
      setReady(true)
    }
    document.head.appendChild(script)
  }, [])
  return ready
}

function ShareButton({ cardUrl, name, profileImageUrl, description }: {
  cardUrl: string; name: string
  profileImageUrl?: string | null
  description?: string | null
}) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)
  const kakaoReady = useKakaoSdk()

  async function handleCopy() {
    await copyToClipboard(cardUrl); setCopied(true)
    setTimeout(() => { setCopied(false); setOpen(false) }, 1500)
  }

  function handleKakaoShare() {
    const win = window as any
    if (!win.Kakao?.isInitialized?.()) return
    win.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: name + '의 디지털 명함',
        description: description || name + '님의 모바일 명함입니다.',
        imageUrl: profileImageUrl || 'https://cardlab.digital/og-default.png',
        link: { mobileWebUrl: cardUrl, webUrl: cardUrl },
      },
      buttons: [
        { title: '모바일 명함 보기', link: { mobileWebUrl: cardUrl, webUrl: cardUrl } },
        { title: '채널 추가하기', link: { mobileWebUrl: 'https://pf.kakao.com/' + CARDLAB_CHANNEL_ID, webUrl: 'https://pf.kakao.com/' + CARDLAB_CHANNEL_ID } },
      ],
    })
    setOpen(false)
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try { await navigator.share({ title: name + '의 디지털 명함', url: cardUrl }) } catch {}
    } else {
      await copyToClipboard(cardUrl); setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
    setOpen(false)
  }

  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 100 }}>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: -1 }} />
          <div style={{ position: 'absolute', top: 48, right: 0, background: 'rgba(20,20,20,0.97)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: '6px', minWidth: 180, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
            {kakaoReady && (
              <button onClick={handleKakaoShare} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 14px', background: '#FEE500', border: 'none', color: '#3C1E1E', fontSize: 14, fontWeight: 700, cursor: 'pointer', borderRadius: 10, marginBottom: 5 }}>
                <span style={{ fontSize: 18 }}>💬</span> 카카오톡 공유
              </button>
            )}
            <button onClick={handleNativeShare} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', borderRadius: 10 }}>
              <span style={{ fontSize: 18 }}>{copied ? '✅' : '🔗'}</span> {copied ? '복사됨!' : '링크 복사'}
            </button>
          </div>
        </>
      )}
      <button className="share-btn" onClick={() => setOpen(v => !v)} aria-label="공유">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      </button>
    </div>
  )
}

function CopyPhone({ phone, color, fontSize }: { phone: string; color: string; fontSize: number }) {
  const [done, setDone] = useState(false)
  async function handle() { await copyToClipboard(phone); setDone(true); setTimeout(() => setDone(false), 2000) }
  return (
    <button onClick={handle} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color, fontSize, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
      {done ? '✅ 복사됨!' : phone}
      {!done && <span style={{ fontSize: 10, opacity: 0.45, marginLeft: 2 }}>탭하여 복사</span>}
    </button>
  )
}

export interface CardTheme {
  pageBg: string; heroBg: string
  useAfgBg?: boolean; customBgUrl?: string
  cardBg: string; cardBorder: string
  textName: string; textSub: string; textMuted: string
  accent: string; accentBg: string
  btnPrimary: string; btnPrimaryText: string
  btnSecondary: string; btnSecondaryText: string; btnSecondaryBorder: string
  menuBg: string; menuBorder: string; menuText: string
  menuActiveBg: string; menuActiveBorder: string
  divider: string; labelColor: string; footerBg: string
}

export function parseDesign(raw: any): CardDesignOptions {
  return {
    ...DEFAULT_DESIGN_OPTIONS,
    animation_type:     raw?.animation_type     ?? DEFAULT_DESIGN_OPTIONS.animation_type,
    animation_speed:    raw?.animation_speed    ?? 'normal',
    animation_delay:    typeof raw?.animation_delay  === 'number' ? raw.animation_delay  : 0,
    animation_on:       typeof raw?.animation_on     === 'boolean' ? raw.animation_on    : true,
    show_icon:          typeof raw?.show_icon         === 'boolean' ? raw.show_icon       : true,
    show_text:          typeof raw?.show_text         === 'boolean' ? raw.show_text       : true,
    icon_size:          typeof raw?.icon_size         === 'number'  ? raw.icon_size       : 22,
    font_size_name:     typeof raw?.font_size_name    === 'number'  ? raw.font_size_name  : 28,
    font_size_sub:      typeof raw?.font_size_sub     === 'number'  ? raw.font_size_sub   : 14,
    font_size_body:     typeof raw?.font_size_body    === 'number'  ? raw.font_size_body  : 13,
    font_size_team:     typeof raw?.font_size_team    === 'number'  ? raw.font_size_team  : 11,
    logo_height:        typeof raw?.logo_height       === 'number'  ? raw.logo_height     : 26,
    btn_radius:         raw?.btn_radius ?? 'lg',
    btn_size:           raw?.btn_size   ?? 'md',
    profile_position_y: typeof raw?.profile_position_y === 'number' ? raw.profile_position_y : 15,
    profile_position_x: typeof raw?.profile_position_x === 'number' ? raw.profile_position_x : 50,
    profile_zoom:       typeof raw?.profile_zoom       === 'number' ? raw.profile_zoom       : 100,
    custom_colors:      raw?.custom_colors ?? null,
    labels:             raw?.labels ?? null,
  }
}

export function isLightBackground(pageBg: string): boolean {
  return ['#ffffff', '#faf9f7', '#f5f6f8', '#f4f4f5', '#f0ede8'].includes(pageBg)
}

export function getLogoStyle(isLightBg: boolean, logoH: number): React.CSSProperties {
  return isLightBg
    ? { display: 'block', height: logoH, width: 'auto', maxWidth: 160, objectFit: 'contain', marginBottom: 10 }
    : { display: 'block', height: logoH, width: 'auto', maxWidth: 160, objectFit: 'contain', marginBottom: 10, mixBlendMode: 'screen' }
}

export function getFooterLogoStyle(isLightBg: boolean, logoH: number): React.CSSProperties {
  return isLightBg
    ? { height: Math.max(logoH - 4, 18), width: 'auto', maxWidth: 90, objectFit: 'contain' }
    : { height: Math.max(logoH - 4, 18), width: 'auto', maxWidth: 90, objectFit: 'contain', mixBlendMode: 'screen' }
}

export function CardBase({ card, theme }: { card: BusinessCard; theme: CardTheme }) {
  const [heroCollapsed, setHeroCollapsed] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const design = parseDesign(card.design_options)
  const lb: AllLabels = { ...DEFAULT_LABELS, ...(design.labels ?? {}) }
  const animClass  = getAnimClass(design.animation_type, design.animation_on)
  const speedClass = 'anim-speed-' + design.animation_speed
  const btnRadius  = getBtnRadius(design.btn_radius)
  const btnH       = getBtnHeight(design.btn_size)
  const animDelay  = design.animation_delay ? design.animation_delay + 's' : undefined

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

  const teamBadgeBg   = cc?.team_badge_bg   ?? (t.cardBg + 'dd')
  const teamBadgeText = cc?.team_badge_text ?? t.textSub
  const bgImageUrl = card.company_background_url || (t.useAfgBg ? '/afg-background.png' : null) || t.customBgUrl || null

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const h = () => setHeroCollapsed(el.scrollTop > 80)
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
  const logoH   = design.logo_height ?? 26
  const fz = {
    name:  design.font_size_name  ?? 28,
    sub:   design.font_size_sub   ?? 14,
    body:  design.font_size_body  ?? 13,
    team:  design.font_size_team  ?? 11,
    label: 11 as number,
  }

  const profilePosY  = design.profile_position_y ?? 15
  const profilePosX  = (design as any).profile_position_x ?? 50
  const profileZoom  = (design as any).profile_zoom ?? 100
  const objectPos    = profilePosX + '% ' + profilePosY + '%'
  const profileScale = profileZoom / 100

  const isLightBg       = isLightBackground(t.pageBg)
  const logoImgStyle    = getLogoStyle(isLightBg, logoH)
  const footerLogoStyle = getFooterLogoStyle(isLightBg, logoH)

  const kakaoDesc = card.short_intro
    ? card.short_intro.slice(0, 60)
    : card.position + ' · ' + card.company_name

  function FooterLabel({ cfgKey }: { cfgKey: string }) {
    const cfgMap: Record<string, string> = {
      phone: 'phone_cfg', email: 'email_cfg', address: 'address_cfg',
      website: 'website_cfg', extension: 'extension_cfg', fax: 'fax_cfg',
    }
    const cfg = (lb as any)[cfgMap[cfgKey]] as LabelConfig | undefined
    if (cfg && cfg.mode !== 'none') return <RenderLabelCfg cfg={cfg} size={13} />
    const simple = (lb as any)[cfgKey] as string | undefined
    if (simple) return <span style={{ marginRight: 5 }}>{simple}</span>
    return null
  }

  function getLinkHref(link: LinkItem): string {
    switch (link.type) {
      case 'email':     return 'mailto:' + link.url
      case 'phone': case 'extension': case 'fax': return 'tel:' + link.url
      case 'sms':       return 'sms:' + link.url
      case 'kakao':     return link.url.startsWith('http') ? link.url : 'https://pf.kakao.com/' + link.url
      case 'instagram': return link.url.startsWith('http') ? link.url : 'https://instagram.com/' + link.url.replace('@', '')
      case 'youtube':   return link.url.startsWith('http') ? link.url : 'https://youtube.com/' + link.url
      case 'naver':     return link.url.startsWith('http') ? link.url : 'https://blog.naver.com/' + link.url
      default:          return ensureHttps(link.url)
    }
  }

  const rowStyle: React.CSSProperties = {
    fontSize: 13, color: t.textMuted, margin: 0, padding: '10px 0',
    display: 'flex', alignItems: 'flex-start',
    borderBottom: '1px solid ' + t.cardBorder + '33',
    lineHeight: 1.5, textDecoration: 'none',
  }

  return (
    <div ref={scrollRef} className={animClass + ' ' + speedClass}
      style={{ minHeight: '100dvh', maxWidth: 480, margin: '0 auto', background: t.pageBg, overflowY: 'auto', overflowX: 'hidden', position: 'relative', animationDelay: animDelay }}>
      <ShareButton
        cardUrl={siteUrl}
        name={card.name}
        profileImageUrl={card.profile_image_url}
        description={kakaoDesc}
      />

      <div className="hero-anim" style={{ position: 'relative', width: '100%', overflow: 'hidden', height: heroCollapsed ? '30vw' : '68vw', maxHeight: heroCollapsed ? '140px' : '360px', minHeight: heroCollapsed ? '90px' : '180px', transition: 'height 0.4s cubic-bezier(0.22,1,0.36,1), max-height 0.4s cubic-bezier(0.22,1,0.36,1)', background: t.heroBg }}>
        {bgImageUrl && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, backgroundImage: 'url(' + bgImageUrl + ')', backgroundSize: 'cover', backgroundPosition: 'center 20%' }} />
        )}
        {card.profile_image_url ? (
          <div style={{ position: 'absolute', inset: 0, zIndex: 5, overflow: 'hidden' }}>
            <img src={card.profile_image_url} alt={card.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: objectPos, transform: profileScale !== 1 ? 'scale(' + profileScale + ')' : undefined, transformOrigin: profilePosX + '% ' + profilePosY + '%' }} />
          </div>
        ) : (
          <div style={{ position: 'absolute', inset: 0, zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 88, height: 88, borderRadius: '50%', background: t.cardBg, border: '2px solid ' + t.cardBorder, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38 }}>👤</div>
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'linear-gradient(180deg, rgba(0,0,0,0.02) 0%, transparent 15%, transparent 48%, ' + t.pageBg + '55 72%, ' + t.pageBg + ' 100%)' }} />
        {card.team_name && (
          <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 20, padding: '3px 10px', borderRadius: 20, background: teamBadgeBg, backdropFilter: 'blur(12px)', color: teamBadgeText, fontSize: fz.team, fontWeight: 600, border: '1px solid ' + t.cardBorder }}>
            {card.team_name}
          </div>
        )}
      </div>

      <div style={{ padding: '0 18px 80px', marginTop: -4 }}>
        <div className="fade-up-1" style={{ marginBottom: 16 }}>
          {card.company_logo_url && <img src={card.company_logo_url} alt={card.company_name} style={logoImgStyle} />}
          <h1 style={{ fontSize: fz.name, fontWeight: 700, color: t.textName, margin: '0 0 3px', letterSpacing: '-0.025em', lineHeight: 1.2 }}>{card.name}</h1>
          {card.english_name && <p style={{ fontSize: Math.max(fz.sub - 1, 10), color: t.accent, margin: '0 0 4px', fontWeight: 500 }}>{card.english_name}</p>}
          <p style={{ fontSize: fz.sub, color: t.textSub, lineHeight: 1.5, margin: 0 }}>
            {card.position}{card.company_name && <span style={{ color: t.textMuted }}> · {card.company_name}</span>}
          </p>
        </div>

        {card.short_intro && (
          <div className="fade-up-2" style={{ marginBottom: 18, paddingLeft: 12, borderLeft: '2px solid ' + t.accent + '44' }}>
            <p style={{ fontSize: fz.body + 1, color: t.textSub, lineHeight: 1.8, margin: 0 }}>{card.short_intro}</p>
          </div>
        )}

        <div className="fade-up-3" style={{ marginBottom: 16 }}>
          {lb.menu_section && <p style={{ fontSize: fz.label, fontWeight: 700, color: t.labelColor, letterSpacing: '0.18em', marginBottom: 9 }}>{lb.menu_section}</p>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
            {MENU_ITEMS.map(item => {
              const url = menuUrls[item.key]; const active = !!url
              const labelMap: Record<string, string> = {
                insurance_claim: lb.menu_insurance ?? '보험금청구',
                check_insurance: lb.menu_check     ?? '내보험조회',
                analysis:        lb.menu_analysis  ?? '보장분석',
                consult:         lb.menu_consult   ?? '상담신청',
              }
              const Tag = active ? 'a' : 'div'
              return (
                <Tag key={item.key} {...(active ? { href: ensureHttps(url!), target: '_blank', rel: 'noopener noreferrer' } : {})}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '10px 3px', borderRadius: 10, background: active ? t.menuActiveBg : t.menuBg, border: '1px solid ' + (active ? t.menuActiveBorder : t.menuBorder), textDecoration: 'none', cursor: active ? 'pointer' : 'default', opacity: active ? 1 : 0.4 }}>
                  {design.show_icon && <span style={{ fontSize: iconSz }}>{item.icon}</span>}
                  {design.show_text && <span style={{ fontSize: fz.label - 1, color: t.menuText, textAlign: 'center', fontWeight: 500, lineHeight: 1.3 }}>{labelMap[item.key]}</span>}
                </Tag>
              )
            })}
          </div>
        </div>

        {card.phone && (
          <div className="fade-up-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 7 }}>
            <a href={'tel:' + card.phone} className="touch-btn"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: btnH, background: t.btnPrimary, color: t.btnPrimaryText, borderRadius: btnRadius, textDecoration: 'none', fontSize: fz.body, fontWeight: 700, boxShadow: '0 4px 16px ' + t.accent + '33' }}>
              {lb.call_btn || '전화 문의하기'}
            </a>
            <a href={'sms:' + card.phone} className="touch-btn"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: btnH, background: t.btnSecondary, color: t.btnSecondaryText, borderRadius: btnRadius, textDecoration: 'none', fontSize: fz.body, fontWeight: 600, border: '1px solid ' + t.btnSecondaryBorder }}>
              {lb.sms_btn || 'SMS 문의'}
            </a>
          </div>
        )}

        {extraLinks.length > 0 && (
          <div className="fade-up-5" style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
            {extraLinks.filter(l => l.url).map(link => (
              <a key={link.id} href={getLinkHref(link)}
                target={['email', 'phone', 'extension', 'fax', 'sms'].includes(link.type) ? '_self' : '_blank'}
                rel="noopener noreferrer" className="touch-btn"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: btnH, padding: '0 15px', background: t.cardBg, border: '1px solid ' + t.cardBorder, borderRadius: btnRadius, textDecoration: 'none', color: t.textSub, fontSize: fz.body }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <LinkPrefix link={link} iconSz={iconSz} />
                  <span style={{ fontWeight: 500 }}>{link.label}</span>
                  {(link.type === 'fax' || link.type === 'extension') && link.url && (
                    <span style={{ fontSize: fz.body - 1, color: t.textMuted }}>{link.url}</span>
                  )}
                </span>
                <span style={{ color: t.textMuted, fontSize: 16, flexShrink: 0 }}>›</span>
              </a>
            ))}
          </div>
        )}

        {card.card_news && card.card_news.length > 0 && (
          <div className="fade-up-6" style={{ marginBottom: 20 }}>
            {lb.news_section && <p style={{ fontSize: fz.label, fontWeight: 700, color: t.labelColor, letterSpacing: '0.18em', marginBottom: 11 }}>{lb.news_section}</p>}
            <div className="news-scroll">
              {card.card_news.map((news: CardNews) => {
                const cat = NEWS_CAT[news.category] ?? { label: '기타', color: '#475569' }
                const Tag = news.link_url ? 'a' : 'div'
                return (
                  <Tag key={news.id} {...(news.link_url ? { href: ensureHttps(news.link_url), target: '_blank', rel: 'noopener noreferrer' } : {})}
                    style={{ flexShrink: 0, width: 185, background: t.cardBg, border: '1px solid ' + t.cardBorder, borderRadius: 13, overflow: 'hidden', textDecoration: 'none', display: 'block' }}>
                    {news.image_url && <div style={{ width: '100%', height: 98, overflow: 'hidden' }}><img src={news.image_url} alt={news.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
                    <div style={{ padding: 10 }}>
                      <span style={{ display: 'inline-block', fontSize: 9, fontWeight: 700, color: cat.color, background: cat.color + '18', padding: '2px 7px', borderRadius: 20, marginBottom: 4 }}>{cat.label}</span>
                      <p style={{ fontSize: 11, fontWeight: 600, color: t.textName, lineHeight: 1.4, margin: '0 0 3px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{news.title}</p>
                      <p style={{ fontSize: 10, color: t.textMuted, lineHeight: 1.4, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{news.summary}</p>
                    </div>
                  </Tag>
                )
              })}
            </div>
          </div>
        )}

        <div style={{ padding: '14px 16px', background: t.footerBg, border: '1px solid ' + t.cardBorder, borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            {card.company_logo_url
              ? <img src={card.company_logo_url} alt={card.company_name} style={footerLogoStyle} />
              : <div style={{ width: 28, height: 28, borderRadius: 6, background: t.cardBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid ' + t.cardBorder, fontSize: 13 }}>🏢</div>
            }
            <p style={{ fontSize: fz.body + 1, fontWeight: 700, color: t.textName, margin: 0 }}>{card.company_name}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {card.address && (
              <a href={'https://map.kakao.com/link/search/' + encodeURIComponent(card.address)}
                target="_blank" rel="noopener noreferrer" style={{ ...rowStyle, textDecoration: 'none' }}>
                <FooterLabel cfgKey="address" />
                <span style={{ flex: 1 }}>{card.address}</span>
                <span style={{ fontSize: 11, color: t.accent, marginLeft: 6, flexShrink: 0, fontWeight: 600 }}>지도 ›</span>
              </a>
            )}
            {card.website_url && (
              <a href={ensureHttps(card.website_url)} target="_blank" rel="noopener noreferrer" style={{ ...rowStyle, textDecoration: 'none' }}>
                <FooterLabel cfgKey="website" />
                <span style={{ flex: 1 }}>{card.website_url.replace(/^https?:\/\//, '')}</span>
                <span style={{ fontSize: 11, color: t.accent, marginLeft: 6, flexShrink: 0, fontWeight: 600 }}>열기 ›</span>
              </a>
            )}
            {card.phone && (
              <div style={rowStyle}>
                <FooterLabel cfgKey="phone" />
                <CopyPhone phone={card.phone} color={t.textMuted} fontSize={13} />
              </div>
            )}
            {card.email && (
              <a href={'mailto:' + card.email} style={{ ...rowStyle, textDecoration: 'none', borderBottom: 'none' }}>
                <FooterLabel cfgKey="email" />
                <span style={{ flex: 1 }}>{card.email}</span>
                <span style={{ fontSize: 11, color: t.accent, marginLeft: 6, flexShrink: 0, fontWeight: 600 }}>메일 ›</span>
              </a>
            )}
          </div>
        </div>
        <div style={{ height: 24 }} />
      </div>
    </div>
  )
}
