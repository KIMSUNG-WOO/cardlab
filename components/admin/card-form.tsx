'use client'

import { parseDesign, getLogoStyle, getFooterLogoStyle, isLightBackground } from '@/components/templates/card-base'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TEMPLATE_LIST, DEFAULT_TEMPLATE, TEMPLATES, TEMPLATE_GROUPS } from '@/lib/templates'
import { isValidSlug, nullToEmpty, generateId } from '@/lib/utils'
import type {
  BusinessCard, TemplateKey, LinkItem, LinkType,
  CardNews, AnimationType, CardDesignOptions,
  CustomColors, AllLabels, LabelPrefixType,
  LabelConfig, LabelMode, DesignStyle, FontStyle, BgStyle, InfoLayout
} from '@/lib/types'
import {
  DEFAULT_DESIGN_OPTIONS, DEFAULT_LABELS,
  DEFAULT_LABEL_EMOJIS, COLOR_COMBOS
} from '@/lib/types'
import { ImageUploader } from './image-uploader'

interface Company {
  id: string; name: string
  logo_url: string | null; background_url: string | null
}
interface Props {
  mode: 'create' | 'edit'
  card?: BusinessCard
  companies?: Company[]
}

const LINK_OPTIONS: { type: LinkType; label: string; emoji: string }[] = [
  { type: 'kakao',     label: '카카오 채널', emoji: '💛' },
  { type: 'instagram', label: '인스타그램',  emoji: '📸' },
  { type: 'youtube',   label: '유튜브',      emoji: '▶️' },
  { type: 'blog',      label: '블로그',      emoji: '📝' },
  { type: 'website',   label: '홈페이지',    emoji: '🌐' },
  { type: 'consult',   label: '상담 예약',   emoji: '📅' },
  { type: 'email',     label: '이메일',      emoji: '✉️' },
  { type: 'naver',     label: '네이버',      emoji: '🟢' },
  { type: 'extension', label: '내선번호',    emoji: '📟' },
  { type: 'fax',       label: '팩스',        emoji: '🖷' },
  { type: 'custom',    label: '직접 입력',   emoji: '🔗' },
]

const ANIM_OPTIONS: { type: AnimationType; label: string; desc: string }[] = [
  { type: 'zoom-out',     label: '줌아웃형',     desc: '사진 강조 후 자연스럽게 축소' },
  { type: 'fade-in',      label: '페이드인형',   desc: '부드럽게 나타나는 효과' },
  { type: 'slide-up',     label: '슬라이드업형', desc: '아래에서 위로 등장' },
  { type: 'blur-reveal',  label: '블러 해제형',  desc: '흐릿하다가 선명해지는 효과' },
  { type: 'photo-first',  label: '사진 먼저',    desc: '사진 등장 후 텍스트 순차 등장' },
  { type: 'text-first',   label: '텍스트 먼저',  desc: '텍스트 등장 후 사진 등장' },
  { type: 'simultaneous', label: '동시에 등장',  desc: '모든 요소 동시에 나타남' },
  { type: 'cinematic',    label: '시네마틱형',   desc: '영화 같은 고급스러운 연출' },
  { type: 'bounce',       label: '바운스형',     desc: '탄력 있게 튀어오르는 등장' },
  { type: 'minimal',      label: '미니멀형',     desc: '절제된 심플한 등장' },
  { type: 'none',         label: '없음',         desc: '애니메이션 없이 바로 표시' },
]

const NEWS_CATS = [
  { value: 'insurance', label: '보험' }, { value: 'finance', label: '금융' },
  { value: 'policy', label: '정책변경' }, { value: 'news', label: '뉴스' },
  { value: 'notice', label: '공지' },
]

const DESIGN_STYLE_OPTIONS: { value: DesignStyle; label: string; desc: string; icon: string }[] = [
  { value: 'card',         label: '카드형',       desc: '명함 카드 스타일',     icon: '🃏' },
  { value: 'minimal',      label: '미니멀형',     desc: '여백 중심',            icon: '◻️' },
  { value: 'premium',      label: '프리미엄형',   desc: '고급스러운 연출',      icon: '✨' },
  { value: 'text-focus',   label: '텍스트 중심',  desc: '정보/텍스트 강조',     icon: '📝' },
  { value: 'visual-focus', label: '비주얼 중심',  desc: '사진/이미지 강조',     icon: '🖼️' },
]

const FONT_STYLE_OPTIONS: { value: FontStyle; label: string; desc: string }[] = [
  { value: 'default', label: '기본 (Pretendard)', desc: '모던 산세리프' },
  { value: 'serif',   label: '명조체',            desc: '클래식하고 격조 있는' },
  { value: 'bold',    label: '볼드',              desc: '강조감 있는 굵은 체' },
  { value: 'light',   label: '라이트',            desc: '얇고 세련된 느낌' },
]

const BG_STYLE_OPTIONS: { value: BgStyle; label: string; desc: string; icon: string }[] = [
  { value: 'solid',       label: '단색',        desc: '깔끔한 단색 배경',    icon: '⬛' },
  { value: 'gradient',    label: '그라디언트',  desc: '부드러운 색상 전환',  icon: '🌈' },
  { value: 'blur',        label: '블러',        desc: '배경 블러 효과',      icon: '🌫️' },
  { value: 'image-blend', label: '이미지 혼합', desc: '배경 이미지와 혼합',  icon: '🖼️' },
]

const INFO_LAYOUT_OPTIONS: { value: InfoLayout; label: string; desc: string; icon: string }[] = [
  { value: 'standard',  label: '기본',   desc: '일반적인 정보 배치',    icon: '📋' },
  { value: 'compact',   label: '컴팩트', desc: '간결하게 압축',         icon: '📦' },
  { value: 'expanded',  label: '확장',   desc: '넓고 여유 있게',        icon: '📰' },
]

const I: React.CSSProperties = {
  width: '100%', padding: '10px 14px', background: '#fff',
  border: '1.5px solid #dee2e6', borderRadius: 8,
  color: '#212529', fontSize: 14, fontFamily: 'inherit',
  outline: 'none', boxSizing: 'border-box',
}

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#495057', marginBottom: 6 }}>
        {label}{required && <span style={{ color: '#fa5252', marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: 11, color: '#adb5bd', marginTop: 4 }}>{hint}</p>}
    </div>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '20px 0 14px' }}>
      <div style={{ flex: 1, height: 1, background: '#e9ecef' }} />
      <p style={{ fontSize: 11, fontWeight: 700, color: '#adb5bd', letterSpacing: '0.1em', whiteSpace: 'nowrap', margin: 0 }}>{children}</p>
      <div style={{ flex: 1, height: 1, background: '#e9ecef' }} />
    </div>
  )
}

function NumInput({ label, value, min = 0, max = 100, step = 1, unit, onChange, recommend }: {
  label: string; value: number; min?: number; max?: number
  step?: number; unit?: string; onChange: (v: number) => void; recommend?: number
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, color: '#495057', fontWeight: 600, marginBottom: 4 }}>
        {label}{recommend != null && <span style={{ color: '#adb5bd', fontWeight: 400, marginLeft: 4 }}>(추천: {recommend})</span>}
      </label>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button type="button" onClick={() => onChange(Math.max(min, value - step))}
          style={{ width: 32, height: 36, background: '#f1f3f5', border: '1px solid #dee2e6', borderRadius: '8px 0 0 8px', cursor: 'pointer', fontSize: 16, fontWeight: 700, color: '#495057' }}>−</button>
        <input type="number" min={min} max={max} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ ...I, textAlign: 'center', borderRadius: 0, width: 64, padding: '7px 0', fontSize: 14, fontWeight: 700, borderLeft: 'none', borderRight: 'none' }} />
        <button type="button" onClick={() => onChange(Math.min(max, value + step))}
          style={{ width: 32, height: 36, background: '#f1f3f5', border: '1px solid #dee2e6', borderRadius: '0 8px 8px 0', cursor: 'pointer', fontSize: 16, fontWeight: 700, color: '#495057' }}>+</button>
        {unit && <span style={{ fontSize: 12, color: '#adb5bd', marginLeft: 6 }}>{unit}</span>}
      </div>
    </div>
  )
}

function LabelCfgEditor({ label, value, onChange, cardSlug }: {
  label: string; value?: LabelConfig; onChange: (v: LabelConfig) => void; cardSlug: string
}) {
  const cfg: LabelConfig = value ?? { mode: 'none' }
  const modeBtn = (m: LabelMode, txt: string) => (
    <button type="button" onClick={() => onChange({ ...cfg, mode: m })}
      style={{ flex: 1, padding: '6px 4px', fontSize: 11, fontWeight: cfg.mode === m ? 700 : 400, border: `1.5px solid ${cfg.mode === m ? '#4263eb' : '#dee2e6'}`, background: cfg.mode === m ? '#e7f0ff' : '#fff', borderRadius: 7, cursor: 'pointer', color: cfg.mode === m ? '#4263eb' : '#495057' }}>
      {txt}
    </button>
  )
  return (
    <div style={{ background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: 10, padding: '10px 12px', marginBottom: 10 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#495057', marginBottom: 8 }}>{label}</label>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        {modeBtn('none', '없음')}{modeBtn('emoji', '이모지')}
        {modeBtn('image', '이미지')}{modeBtn('text', '텍스트')}
      </div>
      {cfg.mode === 'emoji' && (
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {DEFAULT_LABEL_EMOJIS.map(e => (
              <button key={e.key} type="button" onClick={() => onChange({ ...cfg, emoji: e.emoji })}
                style={{ padding: '4px 10px', fontSize: 14, border: `1.5px solid ${cfg.emoji === e.emoji ? '#4263eb' : '#dee2e6'}`, background: cfg.emoji === e.emoji ? '#e7f0ff' : '#fff', borderRadius: 8, cursor: 'pointer', minWidth: 36, textAlign: 'center' }}>
                {e.emoji || '∅'} <span style={{ fontSize: 9, color: '#868e96' }}>{e.label}</span>
              </button>
            ))}
          </div>
          <input style={{ ...I, padding: '7px 10px', fontSize: 16 }}
            value={cfg.emoji ?? ''} onChange={e => onChange({ ...cfg, emoji: e.target.value })} placeholder="이모지 직접 입력" />
        </div>
      )}
      {cfg.mode === 'image' && (
        <div>
          <ImageUploader value={cfg.imageUrl ?? ''} onChange={url => onChange({ ...cfg, imageUrl: url })} cardSlug={`${cardSlug}-lbl`} bucket="card-images" folder="labels" />
          <input style={{ ...I, padding: '7px 10px', fontSize: 12, marginTop: 6 }}
            value={cfg.imageUrl ?? ''} onChange={e => onChange({ ...cfg, imageUrl: e.target.value })} placeholder="또는 이미지 URL" />
        </div>
      )}
      {cfg.mode === 'text' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input style={{ ...I, padding: '7px 10px', fontSize: 13 }}
            value={cfg.text ?? ''} onChange={e => onChange({ ...cfg, text: e.target.value })} placeholder="예: Mobile, Mail, Tel" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            <div>
              <label style={{ fontSize: 10, color: '#868e96', display: 'block', marginBottom: 3 }}>크기(px)</label>
              <input type="number" min={0} max={100} value={cfg.fontSize ?? 12}
                onChange={e => onChange({ ...cfg, fontSize: Number(e.target.value) })}
                style={{ ...I, padding: '5px 8px', fontSize: 12 }} />
            </div>
            <div>
              <label style={{ fontSize: 10, color: '#868e96', display: 'block', marginBottom: 3 }}>굵기</label>
              <select value={cfg.fontWeight ?? 'normal'} onChange={e => onChange({ ...cfg, fontWeight: e.target.value as any })}
                style={{ ...I, padding: '5px 8px', fontSize: 12 }}>
                <option value="normal">보통</option>
                <option value="bold">굵게</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, color: '#868e96', display: 'block', marginBottom: 3 }}>글씨체</label>
              <select value={cfg.fontFamily ?? 'pretendard'} onChange={e => onChange({ ...cfg, fontFamily: e.target.value as any })}
                style={{ ...I, padding: '5px 8px', fontSize: 12 }}>
                <option value="pretendard">기본</option>
                <option value="serif">명조체</option>
                <option value="mono">고정폭</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function getPreviewAnimClass(type: AnimationType, on: boolean): string {
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

function LivePreview({ f, extraLinks, design, companies, newsItems, animKey }: {
  f: any; extraLinks: LinkItem[]; design: CardDesignOptions
  companies: Company[]; newsItems: any[]; animKey: number
}) {
  const tpl = TEMPLATE_LIST.find(t => t.key === f.template_key)
  const isLight = ['afg-light', 'clean-white', 'warm-white', 'minimal-type', 'text-focus'].includes(f.template_key)

  const cc = design.custom_colors as any
  const pageBg    = cc?.page_bg    || tpl?.preview   || '#0a0a0a'
  const cardBg    = cc?.card_bg    || (isLight ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.07)')
  const textName  = cc?.name_color || (isLight ? '#1a1a1a' : '#ffffff')
  const textSub   = cc?.desc_color || (isLight ? '#555555' : '#94a3b8')
  const textMuted = isLight ? '#888' : '#64748b'
  const btnColor  = cc?.btn_color  || tpl?.previewGradient || (isLight ? '#1e40af' : '#1e3a5f')
  const accent    = cc?.accent     || (isLight ? '#1e40af' : '#3b82f6')
  const border    = isLight ? '#e9ecef' : 'rgba(255,255,255,0.1)'
  const footerBg  = isLight ? '#f8f9fa' : 'rgba(255,255,255,0.04)'
  const menuActiveBg = isLight ? `${accent}14` : 'rgba(255,255,255,0.1)'
  const teamBadgeBg  = cc?.team_badge_bg   ?? (cardBg + 'dd')
  const teamBadgeText = cc?.team_badge_text ?? textSub
  const isLightBg = isLightBackground(pageBg)

  const selectedCompany = companies.find(c => c.id === f.company_id)
  const bgImageUrl = f.company_background_url || selectedCompany?.background_url ||
    (['afg-dark', 'afg-light'].includes(f.template_key) ? '/afg-background.png' : null)
  const logoUrl = f.company_logo_url || selectedCompany?.logo_url || null

  const btnR = { none: '0', sm: '6px', md: '12px', lg: '16px', full: '9999px' }[design.btn_radius || 'lg']
  const btnH = { sm: '40px', md: '46px', lg: '52px' }[design.btn_size || 'md']

  const fzName  = design.font_size_name  ?? 28
  const fzSub   = design.font_size_sub   ?? 14
  const fzBody  = design.font_size_body  ?? 13
  const fzTeam  = design.font_size_team  ?? 11
  const iconSz  = design.icon_size       ?? 22
  const logoH   = design.logo_height     ?? 26
  const profileY = design.profile_position_y ?? 15
  const profileX = (design as any).profile_position_x ?? 50
  const profileZoom = (design as any).profile_zoom ?? 100
  const profileScale = profileZoom / 100
  const objectPos = `${profileX}% ${profileY}%`

  const logoImgStyle    = getLogoStyle(isLightBg, logoH)
  const footerLogoStyle = getFooterLogoStyle(isLightBg, logoH)

  const hasBackground = !!bgImageUrl
  const profileLeft   = hasBackground ? '30%' : '0'
  const profileWidth  = hasBackground ? '70%' : '100%'

  const animClass  = getPreviewAnimClass(design.animation_type, design.animation_on)
  const speedClass = 'anim-speed-' + design.animation_speed
  const animDelay  = design.animation_delay ? design.animation_delay + 's' : undefined

  const lb: AllLabels = { ...DEFAULT_LABELS, ...(design.labels ?? {}) }

  function PreviewLabel({ cfgKey }: { cfgKey: string }) {
    const cfgMap: Record<string, string> = {
      phone: 'phone_cfg', email: 'email_cfg', address: 'address_cfg',
      website: 'website_cfg', extension: 'extension_cfg', fax: 'fax_cfg',
    }
    const cfg = (lb as any)[cfgMap[cfgKey]] as LabelConfig | undefined
    if (cfg && cfg.mode === 'emoji' && cfg.emoji) return <span style={{ fontSize: 13, marginRight: 5 }}>{cfg.emoji}</span>
    if (cfg && cfg.mode === 'text' && cfg.text) return <span style={{ fontSize: 11, marginRight: 5, opacity: 0.8 }}>{cfg.text}</span>
    const simple = (lb as any)[cfgKey] as string | undefined
    if (simple) return <span style={{ marginRight: 5 }}>{simple}</span>
    return null
  }

  const rowStylePreview: React.CSSProperties = {
    fontSize: 13, color: textMuted, margin: 0, padding: '10px 0',
    display: 'flex', alignItems: 'flex-start',
    borderBottom: `1px solid ${border}33`,
    lineHeight: 1.5, textDecoration: 'none',
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: '0.1em', margin: 0 }}>LIVE PREVIEW</p>
        <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>실제 명함과 동일</p>
      </div>

      <div
        key={animKey}
        className={`${animClass} ${speedClass}`}
        style={{ width: '100%', background: pageBg, borderRadius: 16, overflow: 'hidden', border: '1px solid #e9ecef', boxShadow: '0 4px 24px rgba(0,0,0,0.12)', maxHeight: '92vh', overflowY: 'auto', animationDelay: animDelay }}
      >
        <div className="hero-anim" style={{ position: 'relative', width: '100%', overflow: 'hidden', height: '68vw', maxHeight: 360, minHeight: 180, background: pageBg }}>
          {bgImageUrl && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 1, backgroundImage: `url(${bgImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center 20%' }} />
          )}
          {hasBackground && logoUrl && (
            <div style={{ position: 'absolute', bottom: 14, left: 14, zIndex: 2, pointerEvents: 'none' }}>
              <img src={logoUrl} alt="" style={{ height: logoH, width: 'auto', maxWidth: 120, objectFit: 'contain', opacity: 0.9, mixBlendMode: isLightBg ? 'normal' : 'screen' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            </div>
          )}
          {f.profile_image_url ? (
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: profileLeft, width: profileWidth, zIndex: 5, overflow: 'hidden' }}>
              <img src={f.profile_image_url} alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: objectPos, transform: profileScale !== 1 ? `scale(${profileScale})` : undefined, transformOrigin: `${profileX}% ${profileY}%` }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              {hasBackground && (
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '40%', background: `linear-gradient(to right, ${pageBg}cc, transparent)`, pointerEvents: 'none' }} />
              )}
            </div>
          ) : (
            <div style={{ position: 'absolute', inset: 0, zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 88, height: 88, borderRadius: '50%', background: cardBg, border: `2px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38 }}>👤</div>
            </div>
          )}
          <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: `linear-gradient(180deg, rgba(0,0,0,0.02) 0%, transparent 15%, transparent 48%, ${pageBg}55 72%, ${pageBg} 100%)` }} />
          {f.team_name && (
            <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 20, padding: '3px 10px', borderRadius: 20, background: teamBadgeBg, backdropFilter: 'blur(12px)', color: teamBadgeText, fontSize: fzTeam, fontWeight: 600, border: `1px solid ${border}` }}>
              {f.team_name}
            </div>
          )}
        </div>

        <div style={{ padding: '0 18px 80px', marginTop: -4 }}>
          <div className="fade-up-1" style={{ marginBottom: 16 }}>
            {logoUrl && (
              <img src={logoUrl} alt="" style={logoImgStyle}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            )}
            {f.name && <h1 style={{ fontSize: fzName, fontWeight: 700, color: textName, margin: '0 0 3px', letterSpacing: '-0.025em', lineHeight: 1.2 }}>{f.name}</h1>}
            {f.english_name && <p style={{ fontSize: Math.max(fzSub - 1, 10), color: accent, margin: '0 0 4px', fontWeight: 500 }}>{f.english_name}</p>}
            {f.position && <p style={{ fontSize: fzSub, color: textSub, lineHeight: 1.5, margin: 0 }}>{f.position}{f.company_name && <span style={{ color: textMuted }}> · {f.company_name}</span>}</p>}
          </div>
          {f.short_intro && (
            <div className="fade-up-2" style={{ marginBottom: 18, paddingLeft: 12, borderLeft: `2px solid ${accent}44` }}>
              <p style={{ fontSize: fzBody + 1, color: textSub, lineHeight: 1.8, margin: 0 }}>{f.short_intro}</p>
            </div>
          )}
          <div className="fade-up-3" style={{ marginBottom: 16 }}>
            {lb.menu_section && <p style={{ fontSize: 11, fontWeight: 700, color: isLight ? '#94a3b8' : '#475569', letterSpacing: '0.18em', marginBottom: 9 }}>{lb.menu_section}</p>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
              {[
                { key: 'insurance_claim', label: lb.menu_insurance || '보험금청구', icon: '📋', url: f.menu_insurance_claim_url },
                { key: 'check_insurance', label: lb.menu_check     || '내보험조회', icon: '🔍', url: f.menu_check_insurance_url },
                { key: 'analysis',        label: lb.menu_analysis  || '보장분석',   icon: '📊', url: f.menu_analysis_url },
                { key: 'consult',         label: lb.menu_consult   || '상담신청',   icon: '💬', url: f.menu_consult_url },
              ].map(item => {
                const active = !!item.url
                return (
                  <div key={item.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '10px 3px', borderRadius: 10, background: active ? menuActiveBg : (isLight ? '#f8f9fa' : 'rgba(255,255,255,0.05)'), border: `1px solid ${active ? accent + '40' : border}`, opacity: active ? 1 : 0.4 }}>
                    {design.show_icon && <span style={{ fontSize: iconSz }}>{item.icon}</span>}
                    {design.show_text && <span style={{ fontSize: 10, color: isLight ? '#495057' : '#94a3b8', textAlign: 'center', fontWeight: 500, lineHeight: 1.3 }}>{item.label}</span>}
                  </div>
                )
              })}
            </div>
          </div>
          {f.phone && (
            <div className="fade-up-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 7 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: btnH, background: btnColor, color: '#fff', borderRadius: btnR, fontSize: fzBody, fontWeight: 700 }}>{lb.call_btn || '전화 문의하기'}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: btnH, background: cardBg, border: `1px solid ${border}`, borderRadius: btnR, fontSize: fzBody, color: textSub, fontWeight: 600 }}>{lb.sms_btn || 'SMS 문의'}</div>
            </div>
          )}
          {extraLinks.filter(l => l.url).length > 0 && (
            <div className="fade-up-5" style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
              {extraLinks.filter(l => l.url).map(link => (
                <div key={link.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: btnH, padding: '0 15px', background: cardBg, border: `1px solid ${border}`, borderRadius: btnR, color: textSub, fontSize: fzBody }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {link.prefixType === 'emoji' && link.prefixEmoji && <span style={{ fontSize: iconSz }}>{link.prefixEmoji}</span>}
                    {link.prefixType === 'image' && link.prefixImage && <img src={link.prefixImage} alt="" style={{ height: iconSz, width: 'auto', objectFit: 'contain' }} />}
                    {link.prefixType === 'text' && link.prefixText && <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.7, whiteSpace: 'nowrap' }}>{link.prefixText}</span>}
                    <span style={{ fontWeight: 500 }}>{link.label}</span>
                    {(link.type === 'fax' || link.type === 'extension') && link.url && (
                      <span style={{ fontSize: fzBody - 1, color: textMuted }}>{link.url}</span>
                    )}
                  </span>
                  <span style={{ color: textMuted, fontSize: 16, flexShrink: 0 }}>›</span>
                </div>
              ))}
            </div>
          )}
          {newsItems.filter((n: any) => n.title?.trim()).length > 0 && (
            <div className="fade-up-6" style={{ marginBottom: 20 }}>
              {lb.news_section && <p style={{ fontSize: 11, fontWeight: 700, color: isLight ? '#94a3b8' : '#475569', letterSpacing: '0.18em', marginBottom: 11 }}>{lb.news_section}</p>}
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
                {newsItems.filter((n: any) => n.title?.trim()).slice(0, 3).map((news: any, i: number) => (
                  <div key={i} style={{ flexShrink: 0, width: 185, background: cardBg, border: `1px solid ${border}`, borderRadius: 13, overflow: 'hidden' }}>
                    {news.image_url && <div style={{ width: '100%', height: 98, overflow: 'hidden' }}><img src={news.image_url} alt={news.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
                    <div style={{ padding: 10 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: textName, margin: '0 0 3px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{news.title}</p>
                      <p style={{ fontSize: 10, color: textMuted, lineHeight: 1.4, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{news.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ padding: '14px 16px', background: footerBg, border: `1px solid ${border}`, borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              {logoUrl
                ? <img src={logoUrl} alt="" style={footerLogoStyle} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                : <div style={{ width: 28, height: 28, borderRadius: 6, background: cardBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${border}`, fontSize: 13 }}>🏢</div>
              }
              {f.company_name && <p style={{ fontSize: fzBody + 1, fontWeight: 700, color: textName, margin: 0 }}>{f.company_name}</p>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {f.address && (
                <div style={rowStylePreview}>
                  <PreviewLabel cfgKey="address" />
                  <span style={{ flex: 1 }}>{f.address}</span>
                  <span style={{ fontSize: 11, color: accent, marginLeft: 6, flexShrink: 0, fontWeight: 600 }}>지도 ›</span>
                </div>
              )}
              {f.website_url && (
                <div style={rowStylePreview}>
                  <PreviewLabel cfgKey="website" />
                  <span style={{ flex: 1 }}>{f.website_url.replace(/^https?:\/\//, '')}</span>
                  <span style={{ fontSize: 11, color: accent, marginLeft: 6, flexShrink: 0, fontWeight: 600 }}>열기 ›</span>
                </div>
              )}
              {f.phone && (
                <div style={rowStylePreview}>
                  <PreviewLabel cfgKey="phone" />
                  <span style={{ flex: 1 }}>{f.phone}</span>
                  <span style={{ fontSize: 10, opacity: 0.45, marginLeft: 2 }}>탭하여 복사</span>
                </div>
              )}
              {f.email && (
                <div style={{ ...rowStylePreview, borderBottom: 'none' }}>
                  <PreviewLabel cfgKey="email" />
                  <span style={{ flex: 1 }}>{f.email}</span>
                  <span style={{ fontSize: 11, color: accent, marginLeft: 6, flexShrink: 0, fontWeight: 600 }}>메일 ›</span>
                </div>
              )}
            </div>
          </div>
          <div style={{ height: 24 }} />
        </div>
      </div>

      <div style={{ marginTop: 8, padding: '7px 11px', background: '#f8f9fa', borderRadius: 9, display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 10, color: '#9ca3af' }}>
        <span>이름 {design.font_size_name}px</span>
        <span>팀 {design.font_size_team}px</span>
        <span>로고 {design.logo_height}px</span>
        <span>본문 {design.font_size_body}px</span>
        <span>{TEMPLATES[f.template_key as TemplateKey]?.label ?? f.template_key}</span>
      </div>
    </div>
  )
}

export function CardForm({ mode, card, companies = [] }: Props) {
  const router   = useRouter()
  const supabase = createClient()
  const [saving, setSaving]       = useState(false)
  const [saved,  setSaved]        = useState(false)
  const [error,  setError]        = useState('')
  const [activeTab, setActiveTab] = useState<'basic' | 'links' | 'design' | 'anim' | 'labels' | 'news'>('basic')
  const [showLinkPicker, setShowLinkPicker] = useState(false)
  const [animKey, setAnimKey] = useState(0)
  const [tplGroupIdx, setTplGroupIdx] = useState(0)

  const [f, setF] = useState({
    slug:                     card?.slug ?? '',
    name:                     card?.name ?? '',
    english_name:             nullToEmpty(card?.english_name),
    position:                 card?.position ?? '',
    company_name:             card?.company_name ?? '',
    company_id:               nullToEmpty(card?.company_id),
    company_logo_url:         nullToEmpty(card?.company_logo_url),
    company_background_url:   nullToEmpty((card as any)?.company_background_url),
    team_name:                nullToEmpty(card?.team_name),
    short_intro:              nullToEmpty(card?.short_intro),
    phone:                    nullToEmpty(card?.phone),
    email:                    nullToEmpty(card?.email),
    address:                  nullToEmpty(card?.address),
    website_url:              nullToEmpty(card?.website_url),
    inquiry_url:              nullToEmpty(card?.inquiry_url),
    profile_image_url:        nullToEmpty(card?.profile_image_url),
    menu_insurance_claim_url: nullToEmpty(card?.menu_insurance_claim_url),
    menu_check_insurance_url: nullToEmpty(card?.menu_check_insurance_url),
    menu_analysis_url:        nullToEmpty(card?.menu_analysis_url),
    menu_consult_url:         nullToEmpty(card?.menu_consult_url),
    template_key:             (card?.template_key ?? DEFAULT_TEMPLATE) as TemplateKey,
    is_active:                card?.is_active ?? true,
  })

  function migrateDesign(raw: any): CardDesignOptions {
    if (!raw) return { ...DEFAULT_DESIGN_OPTIONS }
    const labels = raw.labels ?? (raw.contact_labels ? {
      phone: raw.contact_labels.phone ?? '', email: raw.contact_labels.email ?? '',
      address: raw.contact_labels.address ?? '', website: raw.contact_labels.website ?? '',
    } : null)
    return {
      ...DEFAULT_DESIGN_OPTIONS,
      animation_type:     raw.animation_type    ?? DEFAULT_DESIGN_OPTIONS.animation_type,
      animation_speed:    raw.animation_speed   ?? 'normal',
      animation_delay:    raw.animation_delay   ?? 0,
      animation_on:       raw.animation_on      ?? true,
      show_icon:          raw.show_icon          ?? true,
      show_text:          raw.show_text          ?? true,
      icon_size:          typeof raw.icon_size   === 'number' ? raw.icon_size   : 22,
      font_size_name:     typeof raw.font_size_name === 'number' ? raw.font_size_name : 28,
      font_size_sub:      typeof raw.font_size_sub  === 'number' ? raw.font_size_sub  : 14,
      font_size_body:     typeof raw.font_size_body === 'number' ? raw.font_size_body : 13,
      font_size_team:     typeof raw.font_size_team === 'number' ? raw.font_size_team : 11,
      logo_height:        typeof raw.logo_height === 'number'    ? raw.logo_height    : 26,
      btn_radius:         raw.btn_radius ?? 'lg',
      btn_size:           raw.btn_size   ?? 'md',
      profile_position_y: typeof raw.profile_position_y === 'number' ? raw.profile_position_y : 15,
      profile_position_x: typeof raw.profile_position_x === 'number' ? raw.profile_position_x : 50,
      profile_zoom:       typeof raw.profile_zoom       === 'number' ? raw.profile_zoom       : 100,
      custom_colors: raw.custom_colors ? {
        page_bg:    raw.custom_colors.page_bg    ?? '#0a0a0a',
        card_bg:    raw.custom_colors.card_bg    ?? '#1a1a2e',
        btn_color:  raw.custom_colors.btn_color  ?? '#1e40af',
        name_color: raw.custom_colors.name_color ?? '#ffffff',
        desc_color: raw.custom_colors.desc_color ?? '#94a3b8',
        accent:     raw.custom_colors.accent     ?? '#3b82f6',
        team_badge_bg:   raw.custom_colors.team_badge_bg   ?? undefined,
        team_badge_text: raw.custom_colors.team_badge_text ?? undefined,
      } : null,
      labels,
      design_style: raw.design_style ?? 'card',
      font_style:   raw.font_style   ?? 'default',
      bg_style:     raw.bg_style     ?? 'solid',
      info_layout:  raw.info_layout  ?? 'standard',
    }
  }

  const [design, setDesign]     = useState<CardDesignOptions>(migrateDesign(card?.design_options))
  const [extraLinks, setLinks]  = useState<LinkItem[]>(Array.isArray(card?.extra_links) ? card.extra_links : [])
  const [newsItems, setNews]    = useState<Omit<CardNews, 'id' | 'card_id' | 'created_at'>[]>(
    (card?.card_news ?? []).map(n => ({
      title: n.title, summary: n.summary,
      image_url: n.image_url ?? '', link_url: n.link_url ?? '',
      category: n.category, sort_order: n.sort_order, is_visible: n.is_visible,
    }))
  )

  const prevAnimRef = useRef({
    type: design.animation_type,
    speed: design.animation_speed,
    on: design.animation_on,
    delay: design.animation_delay,
  })
  useEffect(() => {
    const prev = prevAnimRef.current
    if (
      prev.type  !== design.animation_type  ||
      prev.speed !== design.animation_speed ||
      prev.on    !== design.animation_on    ||
      prev.delay !== design.animation_delay
    ) {
      prevAnimRef.current = {
        type:  design.animation_type,
        speed: design.animation_speed,
        on:    design.animation_on,
        delay: design.animation_delay,
      }
      setAnimKey(k => k + 1)
    }
  }, [design.animation_type, design.animation_speed, design.animation_on, design.animation_delay])

  const set    = (k: keyof typeof f) => (v: any) => setF(p => ({ ...p, [k]: v }))
  const setDes = (k: keyof CardDesignOptions) => (v: any) => setDesign(p => ({ ...p, [k]: v }))

  function setCC(k: keyof CustomColors, v: string) {
    setDesign(p => ({
      ...p,
      custom_colors: {
        page_bg: '#0a0a0a', card_bg: '#1a1a2e', btn_color: '#1e40af',
        name_color: '#ffffff', desc_color: '#94a3b8', accent: '#3b82f6',
        ...(p.custom_colors ?? {}),
        [k]: v,
      },
    }))
  }

  function setLbl(k: keyof AllLabels, v: any) {
    setDesign(p => ({ ...p, labels: { ...(p.labels ?? {}), [k]: v } }))
  }
  function setLblCfg(k: keyof AllLabels, cfg: LabelConfig) {
    setDesign(p => ({ ...p, labels: { ...(p.labels ?? {}), [k]: cfg } }))
  }

  function addLink(type: LinkType, label: string, emoji: string) {
    setLinks(p => [...p, { id: generateId(), type, label, url: '', emoji, prefixType: 'none' }])
    setShowLinkPicker(false)
  }
  function updateLink(id: string, field: keyof LinkItem, v: any) {
    setLinks(p => p.map(l => l.id === id ? { ...l, [field]: v } : l))
  }
  function removeLink(id: string) { setLinks(p => p.filter(l => l.id !== id)) }

  function addNews() {
    setNews(p => [...p, { title: '', summary: '', image_url: '', link_url: '', category: 'insurance', sort_order: p.length, is_visible: true }])
  }
  function updateNews(idx: number, k: string, v: any) {
    setNews(p => p.map((n, i) => i === idx ? { ...n, [k]: v } : n))
  }
  function removeNews(idx: number) { setNews(p => p.filter((_, i) => i !== idx)) }

  function handleCompanySelect(cid: string) {
    const found = companies.find(c => c.id === cid)
    if (found) {
      setF(p => ({
        ...p, company_id: cid, company_name: found.name,
        company_logo_url: found.logo_url ?? '',
        company_background_url: found.background_url ?? '',
      }))
    } else {
      setF(p => ({ ...p, company_id: '', company_name: '', company_logo_url: '', company_background_url: '' }))
    }
  }

  async function handleSubmit() {
    if (!f.slug)              return setError('URL 경로를 입력해주세요.')
    if (!isValidSlug(f.slug)) return setError('slug는 영문 소문자, 숫자, 하이픈(-)만 가능합니다.')
    if (!f.name)              return setError('이름을 입력해주세요.')
    if (!f.position)          return setError('직함을 입력해주세요.')
    if (!f.company_name)      return setError('회사명을 입력해주세요.')
    setError(''); setSaving(true)
    try {
      const payload = {
        slug: f.slug.toLowerCase().trim(), name: f.name.trim(),
        english_name: f.english_name.trim() || null, position: f.position.trim(),
        company_name: f.company_name.trim(), company_id: f.company_id || null,
        company_logo_url: f.company_logo_url || null,
        company_background_url: f.company_background_url || null,
        team_name: f.team_name.trim() || null, short_intro: f.short_intro.trim() || null,
        phone: f.phone.trim() || null, email: f.email.trim() || null,
        address: f.address.trim() || null, website_url: f.website_url.trim() || null,
        inquiry_url: f.inquiry_url.trim() || null,
        profile_image_url: f.profile_image_url.trim() || null,
        menu_insurance_claim_url: f.menu_insurance_claim_url.trim() || null,
        menu_check_insurance_url: f.menu_check_insurance_url.trim() || null,
        menu_analysis_url: f.menu_analysis_url.trim() || null,
        menu_consult_url: f.menu_consult_url.trim() || null,
        extra_links: extraLinks.filter(l => l.url.trim()),
        design_options: design,
        template_key: f.template_key, is_active: f.is_active,
        updated_at: new Date().toISOString(),
      }
      let cardId = card?.id
      if (mode === 'create') {
        const { data: ex } = await supabase.from('business_cards').select('id').eq('slug', payload.slug).single()
        if (ex) { setError(`/${payload.slug} slug는 이미 사용 중입니다.`); setSaving(false); return }
        const { data: nc, error: e } = await supabase.from('business_cards').insert(payload).select('id').single()
        if (e) throw e; cardId = nc.id
      } else {
        const { error: e } = await supabase.from('business_cards').update(payload).eq('id', card!.id)
        if (e) throw e
      }
      if (cardId) {
        await supabase.from('card_news').delete().eq('card_id', cardId)
        const np = newsItems.filter(n => n.title.trim()).map((n, i) => ({
          card_id: cardId!, ...n, sort_order: i,
          image_url: n.image_url || null, link_url: n.link_url || null,
        }))
        if (np.length > 0) await supabase.from('card_news').insert(np)
      }
      setSaved(true)
      setTimeout(() => { router.push('/admin/dashboard'); router.refresh() }, 800)
    } catch (e: any) {
      setError(e?.message ?? '저장 중 오류가 발생했습니다.')
    } finally { setSaving(false) }
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 12px', borderRadius: 8, fontSize: 12,
    fontWeight: active ? 700 : 500,
    color: active ? '#4263eb' : '#868e96',
    background: active ? '#e7f0ff' : 'transparent',
    border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
  })

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 460px', gap: 28, alignItems: 'start' }}>

      <div>
        <div style={{ display: 'flex', gap: 4, background: '#f1f3f5', padding: 4, borderRadius: 12, marginBottom: 20, overflow: 'auto' }}>
          {(['basic', 'links', 'design', 'anim', 'labels', 'news'] as const).map(tab => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)} style={tabStyle(activeTab === tab)}>
              {{ basic: '기본정보', links: '링크·연락처', design: '디자인', anim: '애니메이션', labels: '텍스트·라벨', news: '카드뉴스' }[tab]}
            </button>
          ))}
        </div>

        {activeTab === 'basic' && (
          <div className="admin-card">
            <SectionHeader>URL 경로</SectionHeader>
            <Field label="Slug" required hint={`cardlab.digital/${f.slug || 'slug'}`}>
              <input className="admin-input" style={{ ...I, opacity: mode === 'edit' ? 0.6 : 1 }}
                value={f.slug} onChange={e => set('slug')(e.target.value)}
                placeholder="영문소문자·숫자·하이픈" disabled={mode === 'edit'} />
            </Field>
            <SectionHeader>이름·직함</SectionHeader>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="이름" required><input className="admin-input" style={I} value={f.name} onChange={e => set('name')(e.target.value)} /></Field>
              <Field label="영문명"><input className="admin-input" style={I} value={f.english_name} onChange={e => set('english_name')(e.target.value)} /></Field>
              <Field label="직함" required><input className="admin-input" style={I} value={f.position} onChange={e => set('position')(e.target.value)} /></Field>
              <Field label="팀·브랜치명"><input className="admin-input" style={I} value={f.team_name} onChange={e => set('team_name')(e.target.value)} /></Field>
            </div>
            <SectionHeader>회사 (선택 시 로고+배경 자동 세팅)</SectionHeader>
            {companies.length > 0 && (
              <Field label="회사 선택">
                <select className="admin-input" style={I} value={f.company_id} onChange={e => handleCompanySelect(e.target.value)}>
                  <option value="">직접 입력</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}{c.background_url ? ' (배경 ✓)' : ''}</option>)}
                </select>
              </Field>
            )}
            <Field label="회사명" required><input className="admin-input" style={I} value={f.company_name} onChange={e => set('company_name')(e.target.value)} /></Field>
            <Field label="한 줄 소개"><textarea className="admin-input" style={{ ...I, resize: 'none' }} rows={2} value={f.short_intro} onChange={e => set('short_intro')(e.target.value)} /></Field>
            <SectionHeader>프로필 사진</SectionHeader>
            <ImageUploader value={f.profile_image_url} onChange={set('profile_image_url')} cardSlug={f.slug || 'card'} />
            <div style={{ marginTop: 10 }}><input className="admin-input" style={I} value={f.profile_image_url} onChange={e => set('profile_image_url')(e.target.value)} placeholder="또는 URL 직접 입력" /></div>
            <SectionHeader>회사 로고</SectionHeader>
            <ImageUploader value={f.company_logo_url} onChange={set('company_logo_url')} cardSlug={`${f.slug || 'card'}-logo`} bucket="card-images" folder="logos" />
            <div style={{ marginTop: 10 }}><input className="admin-input" style={I} value={f.company_logo_url} onChange={e => set('company_logo_url')(e.target.value)} placeholder="https://..." /></div>
            <SectionHeader>회사 배경 이미지</SectionHeader>
            <p style={{ fontSize: 12, color: '#adb5bd', marginBottom: 10 }}>프로필 사진 뒤에 표시되는 브랜드 배경입니다.</p>
            <ImageUploader value={f.company_background_url} onChange={set('company_background_url')} cardSlug={`${f.slug || 'card'}-bg`} bucket="card-images" folder="backgrounds" />
            <div style={{ marginTop: 10 }}><input className="admin-input" style={I} value={f.company_background_url} onChange={e => set('company_background_url')(e.target.value)} placeholder="https://..." /></div>
            <SectionHeader>메뉴 항목 URL</SectionHeader>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="📋 보험금청구"><input className="admin-input" style={I} value={f.menu_insurance_claim_url} onChange={e => set('menu_insurance_claim_url')(e.target.value)} placeholder="https://..." /></Field>
              <Field label="🔍 내보험조회"><input className="admin-input" style={I} value={f.menu_check_insurance_url} onChange={e => set('menu_check_insurance_url')(e.target.value)} placeholder="https://..." /></Field>
              <Field label="📊 보장분석"><input className="admin-input" style={I} value={f.menu_analysis_url} onChange={e => set('menu_analysis_url')(e.target.value)} placeholder="https://..." /></Field>
              <Field label="💬 상담신청"><input className="admin-input" style={I} value={f.menu_consult_url} onChange={e => set('menu_consult_url')(e.target.value)} placeholder="https://..." /></Field>
            </div>
            <SectionHeader>공개 설정</SectionHeader>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#f8f9fa', border: '1.5px solid #e9ecef', borderRadius: 10, cursor: 'pointer' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#212529', margin: 0 }}>명함 공개</p>
                <p style={{ fontSize: 11, color: '#adb5bd', margin: '3px 0 0' }}>비공개 시 URL이 404 처리됩니다</p>
              </div>
              <div onClick={() => set('is_active')(!f.is_active)} style={{ width: 48, height: 26, borderRadius: 13, background: f.is_active ? '#4263eb' : '#dee2e6', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transform: f.is_active ? 'translateX(25px)' : 'translateX(3px)', transition: 'transform 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
              </div>
            </label>
          </div>
        )}

        {activeTab === 'links' && (
          <div className="admin-card">
            <SectionHeader>연락처</SectionHeader>
            <Field label="전화번호"><input className="admin-input" style={I} value={f.phone} onChange={e => set('phone')(e.target.value)} placeholder="010-0000-0000" /></Field>
            <Field label="이메일"><input className="admin-input" style={I} value={f.email} onChange={e => set('email')(e.target.value)} placeholder="name@email.com" /></Field>
            <Field label="주소"><input className="admin-input" style={I} value={f.address} onChange={e => set('address')(e.target.value)} /></Field>
            <Field label="웹사이트"><input className="admin-input" style={I} value={f.website_url} onChange={e => set('website_url')(e.target.value)} placeholder="https://..." /></Field>
            <Field label="온라인 문의 URL"><input className="admin-input" style={I} value={f.inquiry_url} onChange={e => set('inquiry_url')(e.target.value)} placeholder="https://..." /></Field>
            <SectionHeader>추가 링크 버튼</SectionHeader>
            <p style={{ fontSize: 12, color: '#adb5bd', marginBottom: 12 }}>팩스·내선은 버튼에 번호가 함께 표시됩니다.</p>
            {extraLinks.map(link => (
              <div key={link.id} style={{ background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: 12, padding: 14, marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 18 }}>{link.emoji}</span>
                  <input style={{ ...I, flex: '0 0 90px', padding: '7px 10px', fontSize: 12 }} value={link.label} onChange={e => updateLink(link.id, 'label', e.target.value)} placeholder="버튼명" />
                  <input style={{ ...I, flex: 1, padding: '7px 10px', fontSize: 12 }} value={link.url} onChange={e => updateLink(link.id, 'url', e.target.value)} placeholder={link.type === 'email' ? 'name@email.com' : link.type === 'fax' || link.type === 'extension' ? '번호 입력' : 'https://...'} />
                  <button type="button" onClick={() => removeLink(link.id)} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff3f3', border: '1px solid #ffc9c9', borderRadius: 6, color: '#c92a2a', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}>✕</button>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6c757d', marginBottom: 6 }}>항목 앞 요소</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {(['none', 'emoji', 'text', 'image'] as LabelPrefixType[]).map(pt => (
                      <button key={pt} type="button" onClick={() => updateLink(link.id, 'prefixType', pt)}
                        style={{ flex: 1, padding: '6px 4px', fontSize: 11, border: `1.5px solid ${link.prefixType === pt ? '#4263eb' : '#dee2e6'}`, background: link.prefixType === pt ? '#e7f0ff' : '#fff', borderRadius: 7, cursor: 'pointer', fontWeight: link.prefixType === pt ? 700 : 400, color: link.prefixType === pt ? '#4263eb' : '#495057' }}>
                        {{ none: '없음', emoji: '이모지', text: '텍스트', image: '이미지' }[pt]}
                      </button>
                    ))}
                  </div>
                  {link.prefixType === 'emoji' && (
                    <div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, margin: '8px 0 6px' }}>
                        {DEFAULT_LABEL_EMOJIS.map(e => (
                          <button key={e.key} type="button" onClick={() => updateLink(link.id, 'prefixEmoji', e.emoji)}
                            style={{ padding: '4px 8px', fontSize: 14, border: `1.5px solid ${link.prefixEmoji === e.emoji ? '#4263eb' : '#dee2e6'}`, background: link.prefixEmoji === e.emoji ? '#e7f0ff' : '#fff', borderRadius: 7, cursor: 'pointer' }}>
                            {e.emoji || '∅'}
                          </button>
                        ))}
                      </div>
                      <input style={{ ...I, padding: '7px 10px', fontSize: 14 }} value={link.prefixEmoji ?? ''} onChange={e => updateLink(link.id, 'prefixEmoji', e.target.value)} placeholder="이모지 직접 입력" />
                    </div>
                  )}
                  {link.prefixType === 'text' && <input style={{ ...I, padding: '7px 10px', fontSize: 13, marginTop: 8 }} value={link.prefixText ?? ''} onChange={e => updateLink(link.id, 'prefixText', e.target.value)} placeholder="텍스트 라벨 예: Mobile" />}
                  {link.prefixType === 'image' && (
                    <div style={{ marginTop: 8 }}>
                      <ImageUploader value={link.prefixImage ?? ''} onChange={v => updateLink(link.id, 'prefixImage', v)} cardSlug={`link-${link.id}`} bucket="card-images" folder="icons" />
                      <input style={{ ...I, padding: '7px 10px', fontSize: 12, marginTop: 6 }} value={link.prefixImage ?? ''} onChange={e => updateLink(link.id, 'prefixImage', e.target.value)} placeholder="또는 이미지 URL" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div style={{ position: 'relative' }}>
              <button type="button" onClick={() => setShowLinkPicker(v => !v)} style={{ width: '100%', padding: '10px', background: '#f1f3f5', border: '1.5px dashed #ced4da', borderRadius: 10, color: '#495057', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ 링크 버튼 추가</button>
              {showLinkPicker && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, background: '#fff', border: '1px solid #dee2e6', borderRadius: 14, padding: 14, zIndex: 50, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                    {LINK_OPTIONS.map(opt => (
                      <button key={opt.type} type="button" onClick={() => addLink(opt.type, opt.label, opt.emoji)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 4px', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: 10, cursor: 'pointer', fontSize: 11, color: '#495057', fontWeight: 600 }}>
                        <span style={{ fontSize: 20 }}>{opt.emoji}</span>{opt.label}
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={() => setShowLinkPicker(false)} style={{ width: '100%', marginTop: 10, padding: '7px', background: 'none', border: 'none', color: '#adb5bd', fontSize: 12, cursor: 'pointer' }}>닫기</button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'design' && (
          <div className="admin-card">

            {/* ── A. 템플릿 선택 (그룹 탭으로 스크롤 단축) ── */}
            <SectionHeader>템플릿</SectionHeader>
            <div style={{ display: 'flex', gap: 4, background: '#f8f9fa', padding: 3, borderRadius: 10, marginBottom: 12, overflow: 'auto' }}>
              {TEMPLATE_GROUPS.map((g, i) => (
                <button key={i} type="button" onClick={() => setTplGroupIdx(i)}
                  style={{ padding: '5px 10px', borderRadius: 7, fontSize: 11, fontWeight: tplGroupIdx === i ? 700 : 500, color: tplGroupIdx === i ? '#4263eb' : '#868e96', background: tplGroupIdx === i ? '#e7f0ff' : 'transparent', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {g.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              {TEMPLATE_GROUPS[tplGroupIdx].keys.map(key => {
                const t = TEMPLATES[key]
                return (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: f.template_key === key ? '#e7f0ff' : '#f8f9fa', border: `1.5px solid ${f.template_key === key ? '#4263eb' : '#e9ecef'}`, borderRadius: 10, cursor: 'pointer' }}>
                    <input type="radio" name="template" value={key} checked={f.template_key === key} onChange={() => set('template_key')(key)} style={{ accentColor: '#4263eb', width: 15, height: 15 }} />
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: t.previewGradient ?? t.preview, border: '2px solid #dee2e6', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#212529', margin: 0 }}>{t.label}</p>
                      <p style={{ fontSize: 10, color: '#868e96', margin: '1px 0 0' }}>{t.description}</p>
                    </div>
                    {(t as any).styleTag && <span style={{ fontSize: 9, background: '#4263eb18', color: '#4263eb', padding: '2px 7px', borderRadius: 20, fontWeight: 700, flexShrink: 0 }}>{(t as any).styleTag}</span>}
                    {f.template_key === key && <span style={{ color: '#4263eb', fontSize: 14 }}>✓</span>}
                  </label>
                )
              })}
            </div>

            {/* ── B. 스타일 프리셋 ── */}
            <SectionHeader>스타일 프리셋</SectionHeader>

            {/* B1. 디자인 스타일 */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#495057', marginBottom: 8 }}>카드 스타일</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6 }}>
                {DESIGN_STYLE_OPTIONS.map(opt => (
                  <button key={opt.value} type="button" onClick={() => setDes('design_style')(opt.value)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 4px', border: `1.5px solid ${(design as any).design_style === opt.value ? '#4263eb' : '#e9ecef'}`, background: (design as any).design_style === opt.value ? '#e7f0ff' : '#f8f9fa', borderRadius: 9, cursor: 'pointer' }}>
                    <span style={{ fontSize: 18 }}>{opt.icon}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: (design as any).design_style === opt.value ? '#4263eb' : '#495057', textAlign: 'center', lineHeight: 1.3 }}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* B2. 폰트 스타일 */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#495057', marginBottom: 8 }}>폰트 스타일</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
                {FONT_STYLE_OPTIONS.map(opt => (
                  <button key={opt.value} type="button" onClick={() => setDes('font_style')(opt.value)}
                    style={{ padding: '8px 4px', border: `1.5px solid ${(design as any).font_style === opt.value ? '#4263eb' : '#e9ecef'}`, background: (design as any).font_style === opt.value ? '#e7f0ff' : '#f8f9fa', borderRadius: 9, cursor: 'pointer', textAlign: 'center' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: (design as any).font_style === opt.value ? '#4263eb' : '#212529', margin: 0 }}>{opt.label}</p>
                    <p style={{ fontSize: 9, color: '#868e96', margin: '2px 0 0' }}>{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* B3. 배경 스타일 */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#495057', marginBottom: 8 }}>배경 스타일</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
                {BG_STYLE_OPTIONS.map(opt => (
                  <button key={opt.value} type="button" onClick={() => setDes('bg_style')(opt.value)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 4px', border: `1.5px solid ${(design as any).bg_style === opt.value ? '#4263eb' : '#e9ecef'}`, background: (design as any).bg_style === opt.value ? '#e7f0ff' : '#f8f9fa', borderRadius: 9, cursor: 'pointer' }}>
                    <span style={{ fontSize: 16 }}>{opt.icon}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: (design as any).bg_style === opt.value ? '#4263eb' : '#495057', textAlign: 'center', lineHeight: 1.3 }}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* B4. 정보 배치 */}
            <div style={{ marginBottom: 4 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#495057', marginBottom: 8 }}>정보 배치 스타일</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
                {INFO_LAYOUT_OPTIONS.map(opt => (
                  <button key={opt.value} type="button" onClick={() => setDes('info_layout')(opt.value)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 4px', border: `1.5px solid ${(design as any).info_layout === opt.value ? '#4263eb' : '#e9ecef'}`, background: (design as any).info_layout === opt.value ? '#e7f0ff' : '#f8f9fa', borderRadius: 9, cursor: 'pointer' }}>
                    <span style={{ fontSize: 18 }}>{opt.icon}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: (design as any).info_layout === opt.value ? '#4263eb' : '#212529' }}>{opt.label}</span>
                    <span style={{ fontSize: 9, color: '#868e96', textAlign: 'center' }}>{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── C. 색상 커스터마이징 ── */}
            <SectionHeader>색상 커스터마이징</SectionHeader>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, cursor: 'pointer' }}>
              <input type="checkbox" checked={!!design.custom_colors}
                onChange={e => setDesign(p => ({ ...p, custom_colors: e.target.checked ? { page_bg: '#0a0a0a', card_bg: '#1a1a2e', btn_color: '#1e40af', name_color: '#ffffff', desc_color: '#94a3b8', accent: '#3b82f6' } : null }))}
                style={{ accentColor: '#4263eb', width: 16, height: 16 }} />
              <span style={{ fontSize: 13, color: '#495057', fontWeight: 600 }}>색상 직접 설정</span>
            </label>
            {design.custom_colors && (
              <>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#495057', marginBottom: 8 }}>💡 어울리는 조합 추천 (클릭하면 즉시 적용)</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  {Object.entries(COLOR_COMBOS).map(([key, combo]) => (
                    <button key={key} type="button"
                      onClick={() => {
                        const c = combo.colors
                        setDesign(p => ({
                          ...p,
                          custom_colors: {
                            ...(p.custom_colors ?? {}),
                            card_bg:    c[0].value,
                            btn_color:  c[1].value,
                            name_color: c[2].value,
                            desc_color: c[3].value,
                            accent:     c[4].value,
                            page_bg:    p.custom_colors?.page_bg ?? '#0a0a0a',
                          } as CustomColors,
                        }))
                      }}
                      style={{ display: 'flex', flexDirection: 'column', padding: '8px 12px', background: '#f8f9fa', border: '1.5px solid #e9ecef', borderRadius: 10, cursor: 'pointer', gap: 6, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#212529' }}>{combo.label}</span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {combo.colors.map(c => (
                          <div key={c.name} title={c.name + ': ' + c.value} style={{ width: 16, height: 16, borderRadius: 3, background: c.value, border: '1px solid rgba(0,0,0,0.1)' }} />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {([
                    ['page_bg',    '페이지 배경색'],
                    ['card_bg',    '카드 배경색'],
                    ['btn_color',  '버튼 색'],
                    ['name_color', '이름 색'],
                    ['desc_color', '설명 글씨 색'],
                    ['accent',     '강조 색'],
                  ] as [keyof CustomColors, string][]).map(([key, label]) => {
                    const val = (design.custom_colors as any)?.[key] ?? '#000000'
                    return (
                      <div key={key}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#495057', marginBottom: 6 }}>{label}</label>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input type="color" value={val} onChange={e => setCC(key, e.target.value)} style={{ width: 40, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 2 }} />
                          <input style={{ ...I, flex: 1, padding: '8px 10px', fontSize: 13, fontFamily: 'monospace' }} value={val} onChange={e => setCC(key, e.target.value)} placeholder="#000000" />
                        </div>
                      </div>
                    )
                  })}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#495057', marginBottom: 6 }}>팀명 뱃지 배경색</label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="color" value={(design.custom_colors as any)?.team_badge_bg ?? '#0d1a2ddd'} onChange={e => setCC('team_badge_bg' as any, e.target.value)} style={{ width: 40, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 2 }} />
                      <input style={{ ...I, flex: 1, padding: '8px 10px', fontSize: 13, fontFamily: 'monospace' }} value={(design.custom_colors as any)?.team_badge_bg ?? ''} onChange={e => setCC('team_badge_bg' as any, e.target.value)} placeholder="#0d1a2d (빈칸=기본값)" />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#495057', marginBottom: 6 }}>팀명 뱃지 글씨색</label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="color" value={(design.custom_colors as any)?.team_badge_text ?? '#8fafc8'} onChange={e => setCC('team_badge_text' as any, e.target.value)} style={{ width: 40, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 2 }} />
                      <input style={{ ...I, flex: 1, padding: '8px 10px', fontSize: 13, fontFamily: 'monospace' }} value={(design.custom_colors as any)?.team_badge_text ?? ''} onChange={e => setCC('team_badge_text' as any, e.target.value)} placeholder="#8fafc8 (빈칸=기본값)" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── D. 버튼 스타일 ── */}
            <SectionHeader>버튼 스타일</SectionHeader>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#495057', marginBottom: 6 }}>버튼 모양</label>
                <select className="admin-input" style={I} value={design.btn_radius} onChange={e => setDes('btn_radius')(e.target.value)}>
                  {[['none', '직각'], ['sm', '약간'], ['md', '보통'], ['lg', '많이'], ['full', '원형']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#495057', marginBottom: 6 }}>버튼 크기</label>
                <select className="admin-input" style={I} value={design.btn_size} onChange={e => setDes('btn_size')(e.target.value)}>
                  {[['sm', '작게(40px)'], ['md', '보통(46px)'], ['lg', '크게(52px)']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>

            {/* ── E. 글씨 크기 ── */}
            <SectionHeader>글씨 크기 (0~100px)</SectionHeader>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <NumInput label="이름" value={design.font_size_name} recommend={28} unit="px" onChange={v => setDes('font_size_name')(v)} />
              <NumInput label="직함/회사" value={design.font_size_sub} recommend={14} unit="px" onChange={v => setDes('font_size_sub')(v)} />
              <NumInput label="본문" value={design.font_size_body} recommend={13} unit="px" onChange={v => setDes('font_size_body')(v)} />
              <NumInput label="팀·브랜치명" value={design.font_size_team} recommend={11} unit="px" onChange={v => setDes('font_size_team')(v)} />
            </div>

            {/* ── F. 로고 크기 ── */}
            <SectionHeader>로고 크기 (0~100px)</SectionHeader>
            <NumInput label="회사 로고 높이" value={design.logo_height ?? 26} recommend={26} unit="px" onChange={v => setDes('logo_height')(v)} />

            {/* ── G. 프로필 사진 편집 ── */}
            <SectionHeader>📸 프로필 사진 편집</SectionHeader>
            <div style={{ background: '#f0f4ff', border: '1px solid #c5d7ff', borderRadius: 12, padding: '14px 16px', marginBottom: 4 }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#495057' }}>확대/축소 (줌)</label>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#4263eb' }}>{(design as any).profile_zoom ?? 100}%</span>
                </div>
                <input type="range" min={80} max={200} step={5} value={(design as any).profile_zoom ?? 100}
                  onChange={e => setDes('profile_zoom' as any)(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#4263eb' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#adb5bd', marginTop: 2 }}>
                  <span>80%</span><span>200%</span>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#495057' }}>상하 위치 (위↑ 아래↓)</label>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#4263eb' }}>{design.profile_position_y ?? 15}%</span>
                </div>
                <input type="range" min={0} max={80} step={5} value={design.profile_position_y ?? 15}
                  onChange={e => setDes('profile_position_y')(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#4263eb' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#adb5bd', marginTop: 2 }}>
                  <span>위</span><span>아래</span>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#495057' }}>좌우 위치 (왼↔오른)</label>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#4263eb' }}>{(design as any).profile_position_x ?? 50}%</span>
                </div>
                <input type="range" min={0} max={100} step={5} value={(design as any).profile_position_x ?? 50}
                  onChange={e => setDes('profile_position_x' as any)(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#4263eb' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#adb5bd', marginTop: 2 }}>
                  <span>왼쪽</span><span>오른쪽</span>
                </div>
              </div>
              <p style={{ fontSize: 11, color: '#6b7280', margin: '10px 0 0' }}>💡 오른쪽 미리보기에서 실시간 확인</p>
            </div>

            {/* ── H. 아이콘 설정 ── */}
            <SectionHeader>아이콘 설정</SectionHeader>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#495057' }}>
                <input type="checkbox" checked={design.show_icon} onChange={e => setDes('show_icon')(e.target.checked)} style={{ accentColor: '#4263eb', width: 15, height: 15 }} />아이콘 표시
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#495057' }}>
                <input type="checkbox" checked={design.show_text} onChange={e => setDes('show_text')(e.target.checked)} style={{ accentColor: '#4263eb', width: 15, height: 15 }} />텍스트 표시
              </label>
            </div>
            <NumInput label="아이콘 크기" value={design.icon_size} recommend={22} unit="px" onChange={v => setDes('icon_size')(v)} />
          </div>
        )}

        {activeTab === 'anim' && (
          <div className="admin-card">
            <SectionHeader>애니메이션 설정</SectionHeader>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#f8f9fa', border: '1.5px solid #e9ecef', borderRadius: 10, cursor: 'pointer', marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#212529', margin: 0 }}>애니메이션 ON/OFF</p>
                <p style={{ fontSize: 11, color: '#adb5bd', margin: '3px 0 0' }}>끄면 명함이 바로 표시됩니다</p>
              </div>
              <div onClick={() => setDes('animation_on')(!design.animation_on)} style={{ width: 48, height: 26, borderRadius: 13, background: design.animation_on ? '#4263eb' : '#dee2e6', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transform: design.animation_on ? 'translateX(25px)' : 'translateX(3px)', transition: 'transform 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
              </div>
            </label>
            {design.animation_on && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
                  {ANIM_OPTIONS.map(opt => (
                    <label key={opt.type} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: design.animation_type === opt.type ? '#e7f0ff' : '#f8f9fa', border: `1.5px solid ${design.animation_type === opt.type ? '#4263eb' : '#e9ecef'}`, borderRadius: 10, cursor: 'pointer' }}>
                      <input type="radio" name="anim" value={opt.type} checked={design.animation_type === opt.type} onChange={() => setDes('animation_type')(opt.type)} style={{ accentColor: '#4263eb', width: 15, height: 15 }} />
                      <div><p style={{ fontSize: 13, fontWeight: 600, color: '#212529', margin: 0 }}>{opt.label}</p><p style={{ fontSize: 11, color: '#868e96', margin: '1px 0 0' }}>{opt.desc}</p></div>
                      {design.animation_type === opt.type && <span style={{ marginLeft: 'auto', color: '#4263eb' }}>✓</span>}
                    </label>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                  {[['slow', '느리게'], ['normal', '보통'], ['fast', '빠르게']].map(([v, l]) => (
                    <button key={v} type="button" onClick={() => setDes('animation_speed')(v)}
                      style={{ flex: 1, padding: '10px', border: `1.5px solid ${design.animation_speed === v ? '#4263eb' : '#dee2e6'}`, background: design.animation_speed === v ? '#e7f0ff' : '#fff', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: design.animation_speed === v ? 700 : 400, color: design.animation_speed === v ? '#4263eb' : '#495057' }}>{l}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="range" min={0} max={2} step={0.1} value={design.animation_delay ?? 0}
                    onChange={e => setDes('animation_delay')(parseFloat(e.target.value))} style={{ flex: 1, accentColor: '#4263eb' }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#4263eb', minWidth: 36 }}>{(design.animation_delay ?? 0).toFixed(1)}초</span>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'labels' && (
          <div className="admin-card">
            <SectionHeader>버튼 텍스트</SectionHeader>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <Field label="전화 버튼"><input style={I} value={design.labels?.call_btn ?? ''} onChange={e => setLbl('call_btn', e.target.value)} placeholder="전화 문의하기" /></Field>
              <Field label="SMS 버튼"><input style={I} value={design.labels?.sms_btn ?? ''} onChange={e => setLbl('sms_btn', e.target.value)} placeholder="SMS 문의" /></Field>
              <Field label="카카오 버튼"><input style={I} value={design.labels?.kakao_btn ?? ''} onChange={e => setLbl('kakao_btn', e.target.value)} placeholder="카카오 채널" /></Field>
              <Field label="상담 예약 버튼"><input style={I} value={design.labels?.consult_btn ?? ''} onChange={e => setLbl('consult_btn', e.target.value)} placeholder="상담 예약" /></Field>
              <Field label="이메일 버튼"><input style={I} value={design.labels?.email_btn ?? ''} onChange={e => setLbl('email_btn', e.target.value)} placeholder="이메일 문의" /></Field>
            </div>
            <SectionHeader>메뉴 항목 이름</SectionHeader>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <Field label="📋 보험금청구"><input style={I} value={design.labels?.menu_insurance ?? ''} onChange={e => setLbl('menu_insurance', e.target.value)} placeholder="보험금청구" /></Field>
              <Field label="🔍 내보험조회"><input style={I} value={design.labels?.menu_check ?? ''} onChange={e => setLbl('menu_check', e.target.value)} placeholder="내보험조회" /></Field>
              <Field label="📊 보장분석"><input style={I} value={design.labels?.menu_analysis ?? ''} onChange={e => setLbl('menu_analysis', e.target.value)} placeholder="보장분석" /></Field>
              <Field label="💬 상담신청"><input style={I} value={design.labels?.menu_consult ?? ''} onChange={e => setLbl('menu_consult', e.target.value)} placeholder="상담신청" /></Field>
            </div>
            <SectionHeader>섹션 제목</SectionHeader>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <Field label="메뉴 섹션 제목"><input style={I} value={design.labels?.menu_section ?? ''} onChange={e => setLbl('menu_section', e.target.value)} placeholder="MENU" /></Field>
              <Field label="카드뉴스 섹션 제목"><input style={I} value={design.labels?.news_section ?? ''} onChange={e => setLbl('news_section', e.target.value)} placeholder="CARD NEWS" /></Field>
            </div>
            <SectionHeader>하단 정보 라벨 (이모지/이미지/텍스트 선택)</SectionHeader>
            <p style={{ fontSize: 12, color: '#adb5bd', marginBottom: 14 }}>각 항목 앞 요소를 선택하세요. '없음' = 라벨 없이 값만 표시.</p>
            <LabelCfgEditor label="📞 전화번호 앞 라벨" value={design.labels?.phone_cfg} onChange={cfg => setLblCfg('phone_cfg', cfg)} cardSlug={f.slug || 'card'} />
            <LabelCfgEditor label="✉️ 이메일 앞 라벨" value={design.labels?.email_cfg} onChange={cfg => setLblCfg('email_cfg', cfg)} cardSlug={f.slug || 'card'} />
            <LabelCfgEditor label="📍 주소 앞 라벨" value={design.labels?.address_cfg} onChange={cfg => setLblCfg('address_cfg', cfg)} cardSlug={f.slug || 'card'} />
            <LabelCfgEditor label="🌐 웹사이트 앞 라벨" value={design.labels?.website_cfg} onChange={cfg => setLblCfg('website_cfg', cfg)} cardSlug={f.slug || 'card'} />
            <LabelCfgEditor label="📟 내선번호 앞 라벨" value={design.labels?.extension_cfg} onChange={cfg => setLblCfg('extension_cfg', cfg)} cardSlug={f.slug || 'card'} />
            <LabelCfgEditor label="🖷 팩스 앞 라벨" value={design.labels?.fax_cfg} onChange={cfg => setLblCfg('fax_cfg', cfg)} cardSlug={f.slug || 'card'} />
          </div>
        )}

        {activeTab === 'news' && (
          <div className="admin-card">
            <SectionHeader>카드뉴스 / 콘텐츠</SectionHeader>
            {newsItems.map((news, idx) => (
              <div key={idx} style={{ background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: 12, padding: 14, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#495057' }}>카드 #{idx + 1}</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#868e96', cursor: 'pointer' }}>
                      <input type="checkbox" checked={news.is_visible} onChange={e => updateNews(idx, 'is_visible', e.target.checked)} style={{ accentColor: '#4263eb' }} />공개
                    </label>
                    <button type="button" onClick={() => removeNews(idx)} style={{ padding: '4px 10px', background: '#fff3f3', border: '1px solid #ffc9c9', borderRadius: 6, color: '#c92a2a', cursor: 'pointer', fontSize: 12 }}>삭제</button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#495057', marginBottom: 4 }}>카테고리</label>
                    <select style={{ ...I, padding: '8px 12px' }} value={news.category} onChange={e => updateNews(idx, 'category', e.target.value)}>
                      {NEWS_CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#495057', marginBottom: 4 }}>제목 *</label>
                    <input style={{ ...I, padding: '8px 12px', fontSize: 13 }} value={news.title} onChange={e => updateNews(idx, 'title', e.target.value)} placeholder="제목 입력" />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#495057', marginBottom: 4 }}>요약</label>
                    <textarea style={{ ...I, resize: 'none', padding: '8px 12px', fontSize: 13 }} rows={2} value={news.summary} onChange={e => updateNews(idx, 'summary', e.target.value)} placeholder="간단한 설명" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#495057', marginBottom: 4 }}>이미지 URL</label>
                    <input style={{ ...I, padding: '8px 12px', fontSize: 12 }} value={news.image_url ?? ''} onChange={e => updateNews(idx, 'image_url', e.target.value)} placeholder="https://..." />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#495057', marginBottom: 4 }}>링크 URL</label>
                    <input style={{ ...I, padding: '8px 12px', fontSize: 12 }} value={news.link_url ?? ''} onChange={e => updateNews(idx, 'link_url', e.target.value)} placeholder="https://..." />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={addNews} style={{ width: '100%', padding: '12px', background: '#f1f3f5', border: '1.5px dashed #ced4da', borderRadius: 10, color: '#495057', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              + 카드뉴스 추가
            </button>
          </div>
        )}

        {error && <div style={{ marginTop: 16, padding: '12px 16px', background: '#fff5f5', border: '1px solid #ffc9c9', borderRadius: 10, color: '#c92a2a', fontSize: 13 }}>{error}</div>}
        <button onClick={handleSubmit} disabled={saving || saved}
          style={{ width: '100%', marginTop: 16, padding: '15px', background: saved ? 'linear-gradient(135deg,#2f9e44,#37b24d)' : 'linear-gradient(135deg,#4263eb,#3b5bdb)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: saving || saved ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, boxShadow: '0 4px 16px rgba(66,99,235,0.3)' }}>
          {saving ? '저장 중...' : saved ? '✓ 저장 완료!' : mode === 'create' ? '명함 생성하기' : '변경 사항 저장'}
        </button>
      </div>

      <div style={{ position: 'sticky', top: 20, alignSelf: 'start' }}>
        <LivePreview f={f} extraLinks={extraLinks} design={design} companies={companies} newsItems={newsItems} animKey={animKey} />
      </div>
    </div>
  )
}
