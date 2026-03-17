'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TEMPLATE_LIST, DEFAULT_TEMPLATE } from '@/lib/templates'
import { isValidSlug, nullToEmpty, generateId } from '@/lib/utils'
import type { BusinessCard, TemplateKey, LinkItem, LinkType, CardNews, AnimationType, CardDesignOptions, CustomColors, ContactLabels } from '@/lib/types'
import { DEFAULT_DESIGN_OPTIONS } from '@/lib/types'
import { ImageUploader } from './image-uploader'

interface Props {
  mode: 'create' | 'edit'
  card?: BusinessCard
  companies?: { id: string; name: string; logo_url: string | null }[]
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
  { type: 'zoom-out',     label: '줌아웃형',      desc: '사진 강조 후 자연스럽게 축소' },
  { type: 'fade-in',      label: '페이드인형',    desc: '부드럽게 나타나는 효과' },
  { type: 'slide-up',     label: '슬라이드업형',  desc: '아래에서 위로 등장' },
  { type: 'blur-reveal',  label: '블러 해제형',   desc: '흐릿하다가 선명해지는 효과' },
  { type: 'photo-first',  label: '사진 먼저',      desc: '사진 등장 후 텍스트 순차 등장' },
  { type: 'text-first',   label: '텍스트 먼저',    desc: '텍스트 등장 후 사진 등장' },
  { type: 'simultaneous', label: '동시에 등장',    desc: '모든 요소 동시에 나타남' },
  { type: 'cinematic',    label: '시네마틱형',     desc: '영화 같은 고급스러운 연출' },
  { type: 'minimal',      label: '미니멀형',       desc: '절제된 심플한 등장' },
  { type: 'none',         label: '없음',           desc: '애니메이션 없이 바로 표시' },
]

const NEWS_CATS = [
  { value: 'insurance', label: '보험' },
  { value: 'finance',   label: '금융' },
  { value: 'policy',    label: '정책변경' },
  { value: 'news',      label: '뉴스' },
  { value: 'notice',    label: '공지' },
]

// 색상 추천
const COLOR_TIPS: Record<string, string> = {
  '#000000': '흰색, 골드와 잘 어울립니다',
  '#ffffff': '블랙, 딥블루와 잘 어울립니다',
  '#0a0a0a': '슬레이트블루, 흰색과 잘 어울립니다',
  '#1e40af': '흰색, 스카이블루와 잘 어울립니다',
  '#18181b': '실버, 라이트그레이와 잘 어울립니다',
  '#0c1220': '파우더블루, 라이트블루와 잘 어울립니다',
}

function getColorTip(color: string): string {
  return COLOR_TIPS[color.toLowerCase()] ?? ''
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
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

const I: React.CSSProperties = {
  width: '100%', padding: '10px 14px', background: '#fff',
  border: '1.5px solid #dee2e6', borderRadius: 8,
  color: '#212529', fontSize: 14, fontFamily: 'inherit',
  outline: 'none', boxSizing: 'border-box',
}

// ── 실시간 미리보기 (실제 명함 수준) ─────────────────────────
function LivePreview({ f, extraLinks, design, companies }: {
  f: any; extraLinks: LinkItem[]; design: CardDesignOptions
  companies: { id: string; name: string; logo_url: string | null }[]
}) {
  const tpl = TEMPLATE_LIST.find(t => t.key === f.template_key)
  const isLight = ['afg-light', 'clean-white', 'warm-white'].includes(f.template_key)
  const isAfg = f.template_key === 'afg-dark' || f.template_key === 'afg-light'

  const cc = design.custom_colors
  const bg      = cc?.page_bg   || tpl?.preview || '#0a0a0a'
  const cardBg  = cc?.card_bg   || (isLight ? '#ffffff' : 'rgba(255,255,255,0.07)')
  const textName= cc?.name_color|| (isLight ? '#1a1a1a' : '#ffffff')
  const textSub = cc?.desc_color|| (isLight ? '#555555' : '#94a3b8')
  const btnColor= cc?.btn_color || tpl?.previewGradient || (isLight ? '#1e40af' : '#1e3a5f')
  const border  = isLight ? '#e9ecef' : 'rgba(255,255,255,0.1)'
  const accent  = cc?.accent    || '#3b82f6'

  const fz = {
    name: Math.round((design.font_size_name || 28) * 0.53),
    sub:  Math.round((design.font_size_sub  || 14) * 0.72),
    body: Math.round((design.font_size_body || 13) * 0.72),
    icon: Math.round((design.icon_size      || 22) * 0.6),
  }

  const selectedCompany = companies.find(c => c.id === f.company_id)
  const logoUrl = selectedCompany?.logo_url || null
  const btnR = { none:'0', sm:'4px', md:'8px', lg:'10px', full:'9999px' }[design.btn_radius || 'lg']
  const btnH = { sm:'26px', md:'30px', lg:'34px' }[design.btn_size || 'md']

  return (
    <div style={{ background: '#e5e7eb', borderRadius: 20, padding: 12, position: 'sticky', top: 80 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: '0.1em', marginBottom: 10, textAlign: 'center' }}>LIVE PREVIEW</p>

      {/* 폰 프레임 */}
      <div style={{ maxWidth: 265, margin: '0 auto', background: '#111', borderRadius: 36, padding: '10px 5px 14px', boxShadow: '0 24px 60px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.08)' }}>
        {/* 노치 */}
        <div style={{ width: 70, height: 6, background: '#1a1a1a', borderRadius: 10, margin: '0 auto 8px' }} />

        {/* 화면 */}
        <div style={{ background: bg, borderRadius: 26, overflow: 'hidden', maxHeight: 580, overflowY: 'auto' }}>

          {/* 히어로 영역 */}
          <div style={{ height: 155, position: 'relative', overflow: 'hidden', background: f.template_key === 'afg-dark' ? '#08101c' : (isLight ? '#f0f0f0' : bg) }}>
            {/* AFG 배경 */}
            {(f.template_key === 'afg-dark' || f.template_key === 'afg-light') && (
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/afg-background.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
            )}
            {/* 프로필 이미지 */}
            {f.profile_image_url ? (
              <img src={f.profile_image_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: cardBg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>👤</div>
              </div>
            )}
            {/* 그라디언트 */}
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg,transparent 40%,${bg} 100%)` }} />
            {/* 팀 뱃지 */}
            {f.team_name && (
              <div style={{ position: 'absolute', top: 8, left: 10, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: 8, padding: '2px 7px', borderRadius: 8 }}>
                {f.team_name}
              </div>
            )}
          </div>

          {/* 콘텐츠 */}
          <div style={{ padding: '6px 12px 14px' }}>
            {/* 회사 로고 */}
            {logoUrl && (
              <img src={logoUrl} alt="" style={{ height: 14, objectFit: 'contain', marginBottom: 5, display: 'block', filter: isLight ? 'none' : 'brightness(0) invert(1)' }} />
            )}
            {/* 이름 */}
            {f.name && <p style={{ fontSize: fz.name, fontWeight: 700, color: textName, marginBottom: 2, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{f.name}</p>}
            {/* 직함 */}
            {f.position && <p style={{ fontSize: fz.sub, color: textSub, marginBottom: 8, lineHeight: 1.3 }}>
              {f.position}{f.company_name && <span style={{ opacity: 0.65 }}> · {f.company_name}</span>}
            </p>}
            {/* 소개 */}
            {f.short_intro && (
              <p style={{ fontSize: Math.max(7, fz.body - 1), color: textSub, lineHeight: 1.5, marginBottom: 8, paddingLeft: 6, borderLeft: `2px solid ${accent}55` }}>
                {f.short_intro.slice(0, 50)}{f.short_intro.length > 50 ? '...' : ''}
              </p>
            )}
            {/* 메뉴 그리드 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 4, marginBottom: 8 }}>
              {['📋','🔍','📊','💬'].map((icon, i) => (
                <div key={i} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 7, padding: '5px 2px', textAlign: 'center', fontSize: fz.icon }}>
                  {design.show_icon ? icon : ''}
                  {design.show_text && <p style={{ fontSize: 7, color: textSub, margin: '2px 0 0', lineHeight: 1 }}>{['보험금청구','내보험조회','보장분석','상담신청'][i]}</p>}
                </div>
              ))}
            </div>
            {/* CTA 버튼 */}
            {f.phone && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 6 }}>
                <div style={{ height: btnH, background: btnColor, borderRadius: btnR, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', fontWeight: 700 }}>
                  📞 전화 문의
                </div>
                <div style={{ height: btnH, background: cardBg, border: `1px solid ${border}`, borderRadius: btnR, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: textSub }}>
                  💬 SMS
                </div>
              </div>
            )}
            {/* 추가 링크 미리보기 */}
            {extraLinks.filter(l => l.url).slice(0, 2).map(link => (
              <div key={link.id} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 7px', background: cardBg, border: `1px solid ${border}`, borderRadius: 6, marginTop: 3, fontSize: 8, color: textSub }}>
                {design.show_icon && <span style={{ fontSize: Math.max(8, fz.icon * 0.7) }}>{link.emoji}</span>}
                {design.show_text && <span>{link.label}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <p style={{ fontSize: 11, color: '#6b7280', textAlign: 'center', marginTop: 10 }}>{tpl?.label ?? f.template_key}</p>

      {/* 빠른 설정 표시 */}
      <div style={{ marginTop: 10, padding: '8px 12px', background: '#fff', borderRadius: 10, fontSize: 10, color: '#9ca3af', lineHeight: 1.8 }}>
        <span style={{ marginRight: 10 }}>이름 {design.font_size_name}px</span>
        <span style={{ marginRight: 10 }}>본문 {design.font_size_body}px</span>
        <span>아이콘 {design.icon_size}px</span>
      </div>
    </div>
  )
}

export function CardForm({ mode, card, companies = [] }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'basic'|'links'|'design'|'anim'|'news'>('basic')
  const [showLinkPicker, setShowLinkPicker] = useState(false)

  const [f, setF] = useState({
    slug:         card?.slug ?? '',
    name:         card?.name ?? '',
    english_name: nullToEmpty(card?.english_name),
    position:     card?.position ?? '',
    company_name: card?.company_name ?? '',
    company_id:   nullToEmpty(card?.company_id),
    team_name:    nullToEmpty(card?.team_name),
    short_intro:  nullToEmpty(card?.short_intro),
    phone:        nullToEmpty(card?.phone),
    email:        nullToEmpty(card?.email),
    address:      nullToEmpty(card?.address),
    website_url:  nullToEmpty(card?.website_url),
    inquiry_url:  nullToEmpty(card?.inquiry_url),
    profile_image_url: nullToEmpty(card?.profile_image_url),
    menu_insurance_claim_url: nullToEmpty(card?.menu_insurance_claim_url),
    menu_check_insurance_url: nullToEmpty(card?.menu_check_insurance_url),
    menu_analysis_url:        nullToEmpty(card?.menu_analysis_url),
    menu_consult_url:         nullToEmpty(card?.menu_consult_url),
    template_key: (card?.template_key ?? DEFAULT_TEMPLATE) as TemplateKey,
    is_active:    card?.is_active ?? true,
  })

  // 기존 design_options를 새 필드명에 맞게 마이그레이션
  function migrateDesign(existing: any): CardDesignOptions {
    const base = { ...DEFAULT_DESIGN_OPTIONS }
    if (!existing) return base
    return {
      ...base,
      animation_type:   existing.animation_type   ?? base.animation_type,
      animation_speed:  existing.animation_speed  ?? base.animation_speed,
      animation_delay:  existing.animation_delay  ?? 0,
      animation_on:     existing.animation_on     ?? base.animation_on,
      show_icon:        existing.show_icon         ?? base.show_icon,
      show_text:        existing.show_text         ?? base.show_text,
      icon_size:        typeof existing.icon_size === 'number' ? existing.icon_size : 22,
      font_size_name:   existing.font_size_name   ?? 28,
      font_size_sub:    existing.font_size_sub    ?? 14,
      font_size_body:   existing.font_size_body   ?? 13,
      btn_radius:       existing.btn_radius        ?? base.btn_radius,
      btn_size:         existing.btn_size          ?? base.btn_size,
      custom_colors:    existing.custom_colors
        ? {
            page_bg:    existing.custom_colors.page_bg    ?? existing.custom_colors.bg         ?? '#0a0a0a',
            card_bg:    existing.custom_colors.card_bg    ?? '#1a1a2e',
            btn_color:  existing.custom_colors.btn_color  ?? existing.custom_colors.btn_primary ?? '#1e40af',
            name_color: existing.custom_colors.name_color ?? existing.custom_colors.text_name   ?? '#ffffff',
            desc_color: existing.custom_colors.desc_color ?? existing.custom_colors.text_sub    ?? '#94a3b8',
            accent:     existing.custom_colors.accent     ?? '#3b82f6',
          }
        : null,
      contact_labels: existing.contact_labels ?? null,
    }
  }

  const [design, setDesign] = useState<CardDesignOptions>(migrateDesign(card?.design_options))
  const [extraLinks, setExtraLinks] = useState<LinkItem[]>(Array.isArray(card?.extra_links) ? card.extra_links : [])
  const [newsItems, setNewsItems] = useState<Omit<CardNews,'id'|'card_id'|'created_at'>[]>(
    (card?.card_news ?? []).map(n => ({
      title: n.title, summary: n.summary,
      image_url: n.image_url ?? '', link_url: n.link_url ?? '',
      category: n.category, sort_order: n.sort_order, is_visible: n.is_visible,
    }))
  )

  const set = (k: keyof typeof f) => (v: any) => setF(p => ({ ...p, [k]: v }))
  const setDes = (k: keyof CardDesignOptions) => (v: any) => setDesign(p => ({ ...p, [k]: v }))

  function setCC(k: keyof CustomColors, v: string) {
    setDesign(p => ({
      ...p,
      custom_colors: {
        page_bg:    p.custom_colors?.page_bg    ?? '#0a0a0a',
        card_bg:    p.custom_colors?.card_bg    ?? '#1a1a2e',
        btn_color:  p.custom_colors?.btn_color  ?? '#1e40af',
        name_color: p.custom_colors?.name_color ?? '#ffffff',
        desc_color: p.custom_colors?.desc_color ?? '#94a3b8',
        accent:     p.custom_colors?.accent     ?? '#3b82f6',
        [k]: v,
      }
    }))
  }

  function setCL(k: keyof ContactLabels, v: string) {
    setDesign(p => ({ ...p, contact_labels: { ...(p.contact_labels ?? {}), [k]: v } }))
  }

  function addLink(type: LinkType, label: string, emoji: string) {
    setExtraLinks(p => [...p, { id: generateId(), type, label, url: '', emoji }])
    setShowLinkPicker(false)
  }
  function updateLink(id: string, field: 'label'|'url', v: string) { setExtraLinks(p => p.map(l => l.id === id ? { ...l, [field]: v } : l)) }
  function removeLink(id: string) { setExtraLinks(p => p.filter(l => l.id !== id)) }
  function addNews() { setNewsItems(p => [...p, { title:'', summary:'', image_url:'', link_url:'', category:'insurance', sort_order:p.length, is_visible:true }]) }
  function updateNews(idx: number, k: string, v: any) { setNewsItems(p => p.map((n, i) => i === idx ? { ...n, [k]: v } : n)) }
  function removeNews(idx: number) { setNewsItems(p => p.filter((_, i) => i !== idx)) }

  function handleCompanySelect(companyId: string) {
    const found = companies.find(c => c.id === companyId)
    if (found) setF(p => ({ ...p, company_id: companyId, company_name: found.name }))
    else setF(p => ({ ...p, company_id: '', company_name: '' }))
  }

  async function handleSubmit() {
    if (!f.slug)         return setError('URL 경로를 입력해주세요.')
    if (!isValidSlug(f.slug)) return setError('slug는 영문 소문자, 숫자, 하이픈(-)만 가능합니다.')
    if (!f.name)         return setError('이름을 입력해주세요.')
    if (!f.position)     return setError('직함을 입력해주세요.')
    if (!f.company_name) return setError('회사명을 입력해주세요.')
    setError(''); setSaving(true)
    try {
      const selectedCompany = companies.find(c => c.id === f.company_id)
      const payload = {
        slug: f.slug.toLowerCase().trim(),
        name: f.name.trim(),
        english_name:  f.english_name.trim()  || null,
        position:      f.position.trim(),
        company_name:  f.company_name.trim(),
        company_id:    f.company_id || null,
        company_logo_url: selectedCompany?.logo_url ?? null,
        team_name:     f.team_name.trim()     || null,
        short_intro:   f.short_intro.trim()   || null,
        phone:         f.phone.trim()         || null,
        email:         f.email.trim()         || null,
        address:       f.address.trim()       || null,
        website_url:   f.website_url.trim()   || null,
        inquiry_url:   f.inquiry_url.trim()   || null,
        profile_image_url: f.profile_image_url.trim() || null,
        menu_insurance_claim_url: f.menu_insurance_claim_url.trim() || null,
        menu_check_insurance_url: f.menu_check_insurance_url.trim() || null,
        menu_analysis_url:        f.menu_analysis_url.trim()        || null,
        menu_consult_url:         f.menu_consult_url.trim()         || null,
        extra_links:  extraLinks.filter(l => l.url.trim()),
        design_options: design,
        template_key: f.template_key,
        is_active:    f.is_active,
        updated_at:   new Date().toISOString(),
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
          card_id: cardId, ...n, sort_order: i,
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
    padding: '8px 14px', borderRadius: 8, fontSize: 12,
    fontWeight: active ? 700 : 500,
    color: active ? '#4263eb' : '#868e96',
    background: active ? '#e7f0ff' : 'transparent',
    border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
  })

  // 숫자 +/- 버튼
  function NumInput({ label, value, min, max, step, unit, onChange, recommend }: {
    label:string; value:number; min:number; max:number; step?:number; unit?:string
    onChange:(v:number)=>void; recommend?:number
  }) {
    const s = step ?? 1
    return (
      <div>
        <label style={{ display:'block', fontSize:11, color:'#495057', fontWeight:600, marginBottom:4 }}>
          {label} {recommend && <span style={{ color:'#adb5bd' }}>(추천: {recommend})</span>}
        </label>
        <div style={{ display:'flex', alignItems:'center', gap:0 }}>
          <button type="button" onClick={() => onChange(Math.max(min, value - s))}
            style={{ width:32, height:36, background:'#f1f3f5', border:'1px solid #dee2e6', borderRadius:'8px 0 0 8px', cursor:'pointer', fontSize:16, fontWeight:700, color:'#495057' }}>−</button>
          <input type="number" min={min} max={max} value={value}
            onChange={e => onChange(Number(e.target.value))}
            style={{ ...I, textAlign:'center', borderRadius:0, width:64, padding:'7px 0', fontSize:14, fontWeight:700, borderLeft:'none', borderRight:'none' }}
          />
          <button type="button" onClick={() => onChange(Math.min(max, value + s))}
            style={{ width:32, height:36, background:'#f1f3f5', border:'1px solid #dee2e6', borderRadius:'0 8px 8px 0', cursor:'pointer', fontSize:16, fontWeight:700, color:'#495057' }}>+</button>
          {unit && <span style={{ fontSize:12, color:'#adb5bd', marginLeft:6 }}>{unit}</span>}
        </div>
      </div>
    )
  }

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 285px', gap:24, alignItems:'start' }}>

      {/* ── 왼쪽: 편집 ── */}
      <div>
        {/* 탭 */}
        <div style={{ display:'flex', gap:4, background:'#f1f3f5', padding:4, borderRadius:12, marginBottom:20, overflow:'auto' }}>
          {(['basic','links','design','anim','news'] as const).map(tab => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)} style={tabStyle(activeTab === tab)}>
              {{ basic:'기본정보', links:'링크·연락처', design:'디자인', anim:'애니메이션', news:'카드뉴스' }[tab]}
            </button>
          ))}
        </div>

        {/* ══ 기본정보 ══ */}
        {activeTab === 'basic' && (
          <div className="admin-card">
            <SectionHeader>URL 경로</SectionHeader>
            <Field label="Slug" required hint={`cardlab.digital/${f.slug || 'slug'}`}>
              <input className="admin-input" style={{ ...I, opacity: mode==='edit' ? 0.6 : 1 }}
                value={f.slug} onChange={e => set('slug')(e.target.value)}
                placeholder="영문소문자·숫자·하이픈" disabled={mode==='edit'} />
            </Field>

            <SectionHeader>이름·직함</SectionHeader>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <Field label="이름" required><input className="admin-input" style={I} value={f.name} onChange={e => set('name')(e.target.value)} /></Field>
              <Field label="영문명"><input className="admin-input" style={I} value={f.english_name} onChange={e => set('english_name')(e.target.value)} /></Field>
              <Field label="직함" required><input className="admin-input" style={I} value={f.position} onChange={e => set('position')(e.target.value)} /></Field>
              <Field label="팀·브랜치명"><input className="admin-input" style={I} value={f.team_name} onChange={e => set('team_name')(e.target.value)} /></Field>
            </div>

            <SectionHeader>회사</SectionHeader>
            {companies.length > 0 && (
              <Field label="회사 선택">
                <select className="admin-input" style={I} value={f.company_id} onChange={e => handleCompanySelect(e.target.value)}>
                  <option value="">직접 입력</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
            )}
            <Field label="회사명" required>
              <input className="admin-input" style={I} value={f.company_name} onChange={e => set('company_name')(e.target.value)} />
            </Field>
            <Field label="한 줄 소개">
              <textarea className="admin-input" style={{ ...I, resize:'none' }} rows={2} value={f.short_intro} onChange={e => set('short_intro')(e.target.value)} />
            </Field>

            <SectionHeader>프로필 사진</SectionHeader>
            <ImageUploader value={f.profile_image_url} onChange={set('profile_image_url')} cardSlug={f.slug || 'card'} />
            <div style={{ marginTop:10 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#495057', marginBottom:6 }}>또는 URL 직접 입력</label>
              <input className="admin-input" style={I} value={f.profile_image_url} onChange={e => set('profile_image_url')(e.target.value)} placeholder="https://..." />
            </div>

            <SectionHeader>메뉴 항목 URL</SectionHeader>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <Field label="📋 보험금청구"><input className="admin-input" style={I} value={f.menu_insurance_claim_url} onChange={e => set('menu_insurance_claim_url')(e.target.value)} placeholder="https://..." /></Field>
              <Field label="🔍 내보험조회"><input className="admin-input" style={I} value={f.menu_check_insurance_url} onChange={e => set('menu_check_insurance_url')(e.target.value)} placeholder="https://..." /></Field>
              <Field label="📊 보장분석"><input className="admin-input" style={I} value={f.menu_analysis_url} onChange={e => set('menu_analysis_url')(e.target.value)} placeholder="https://..." /></Field>
              <Field label="💬 상담신청"><input className="admin-input" style={I} value={f.menu_consult_url} onChange={e => set('menu_consult_url')(e.target.value)} placeholder="https://..." /></Field>
            </div>

            <SectionHeader>공개 설정</SectionHeader>
            <label style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', background:'#f8f9fa', border:'1.5px solid #e9ecef', borderRadius:10, cursor:'pointer' }}>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:'#212529', margin:0 }}>명함 공개</p>
                <p style={{ fontSize:11, color:'#adb5bd', margin:'3px 0 0' }}>비공개 시 URL이 404 처리됩니다</p>
              </div>
              <div onClick={() => set('is_active')(!f.is_active)} style={{ width:48, height:26, borderRadius:13, background:f.is_active?'#4263eb':'#dee2e6', position:'relative', cursor:'pointer', transition:'background 0.2s', flexShrink:0 }}>
                <div style={{ position:'absolute', top:3, width:20, height:20, borderRadius:'50%', background:'#fff', transform:f.is_active?'translateX(25px)':'translateX(3px)', transition:'transform 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }} />
              </div>
            </label>
          </div>
        )}

        {/* ══ 링크·연락처 ══ */}
        {activeTab === 'links' && (
          <div className="admin-card">
            <SectionHeader>연락처 (항목 제목 수정 가능)</SectionHeader>
            <p style={{ fontSize:12, color:'#adb5bd', marginBottom:14 }}>
              왼쪽 파란 칸: 버튼/라벨 이름 수정 · 오른쪽: 실제 값 입력
            </p>

            {/* 전화 */}
            <div style={{ display:'flex', gap:8, marginBottom:10, alignItems:'flex-end' }}>
              <div style={{ flex:'0 0 100px' }}>
                <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#4263eb', marginBottom:5 }}>전화 라벨</label>
                <input style={{ ...I, padding:'9px 10px', fontSize:12, borderColor:'#bac8ff', color:'#4263eb', fontWeight:700 }}
                  value={design.contact_labels?.phone ?? '📞 전화'}
                  onChange={e => setCL('phone', e.target.value)} />
              </div>
              <div style={{ flex:1 }}>
                <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#495057', marginBottom:5 }}>휴대폰 번호</label>
                <input className="admin-input" style={I} value={f.phone} onChange={e => set('phone')(e.target.value)} placeholder="010-0000-0000" />
              </div>
            </div>

            {/* 이메일 */}
            <div style={{ display:'flex', gap:8, marginBottom:10, alignItems:'flex-end' }}>
              <div style={{ flex:'0 0 100px' }}>
                <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#4263eb', marginBottom:5 }}>이메일 라벨</label>
                <input style={{ ...I, padding:'9px 10px', fontSize:12, borderColor:'#bac8ff', color:'#4263eb', fontWeight:700 }}
                  value={design.contact_labels?.email ?? '✉️ 이메일'}
                  onChange={e => setCL('email', e.target.value)} />
              </div>
              <div style={{ flex:1 }}>
                <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#495057', marginBottom:5 }}>이메일 주소</label>
                <input className="admin-input" style={I} value={f.email} onChange={e => set('email')(e.target.value)} placeholder="name@email.com" />
              </div>
            </div>

            <Field label="주소"><input className="admin-input" style={I} value={f.address} onChange={e => set('address')(e.target.value)} /></Field>
            <Field label="웹사이트"><input className="admin-input" style={I} value={f.website_url} onChange={e => set('website_url')(e.target.value)} placeholder="https://..." /></Field>
            <Field label="온라인 문의 URL"><input className="admin-input" style={I} value={f.inquiry_url} onChange={e => set('inquiry_url')(e.target.value)} placeholder="https://..." /></Field>

            <SectionHeader>추가 링크 버튼</SectionHeader>
            <p style={{ fontSize:12, color:'#adb5bd', marginBottom:12 }}>버튼명 수정 가능 · 필요한 항목만 추가하세요.</p>

            {extraLinks.map(link => (
              <div key={link.id} style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8, background:'#f8f9fa', border:'1px solid #e9ecef', borderRadius:10, padding:'10px 12px' }}>
                <span style={{ fontSize:18, flexShrink:0 }}>{link.emoji}</span>
                <div style={{ flex:1, display:'flex', gap:8, minWidth:0 }}>
                  <input style={{ ...I, flex:'0 0 90px', padding:'7px 10px', fontSize:12 }}
                    value={link.label} onChange={e => updateLink(link.id, 'label', e.target.value)} placeholder="버튼명" />
                  <input style={{ ...I, flex:1, padding:'7px 10px', fontSize:12 }}
                    value={link.url} onChange={e => updateLink(link.id, 'url', e.target.value)}
                    placeholder={link.type==='email'?'name@email.com':link.type==='extension'||link.type==='fax'?'전화번호':'https://...'} />
                </div>
                <button type="button" onClick={() => removeLink(link.id)}
                  style={{ width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', background:'#fff3f3', border:'1px solid #ffc9c9', borderRadius:6, color:'#c92a2a', cursor:'pointer', fontSize:14 }}>✕</button>
              </div>
            ))}
            <div style={{ position:'relative' }}>
              <button type="button" onClick={() => setShowLinkPicker(v => !v)}
                style={{ width:'100%', padding:'10px', background:'#f1f3f5', border:'1.5px dashed #ced4da', borderRadius:10, color:'#495057', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                + 링크 버튼 추가
              </button>
              {showLinkPicker && (
                <div style={{ position:'absolute', top:'calc(100% + 8px)', left:0, right:0, background:'#fff', border:'1px solid #dee2e6', borderRadius:14, padding:14, zIndex:50, boxShadow:'0 8px 32px rgba(0,0,0,0.12)' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
                    {LINK_OPTIONS.map(opt => (
                      <button key={opt.type} type="button" onClick={() => addLink(opt.type, opt.label, opt.emoji)}
                        style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'10px 4px', background:'#f8f9fa', border:'1px solid #e9ecef', borderRadius:10, cursor:'pointer', fontSize:11, color:'#495057', fontWeight:600 }}>
                        <span style={{ fontSize:20 }}>{opt.emoji}</span>{opt.label}
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={() => setShowLinkPicker(false)}
                    style={{ width:'100%', marginTop:10, padding:'7px', background:'none', border:'none', color:'#adb5bd', fontSize:12, cursor:'pointer' }}>닫기</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ 디자인 ══ */}
        {activeTab === 'design' && (
          <div className="admin-card">
            <SectionHeader>템플릿 선택</SectionHeader>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
              {TEMPLATE_LIST.map(t => (
                <label key={t.key} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', background:f.template_key===t.key?'#e7f0ff':'#f8f9fa', border:`1.5px solid ${f.template_key===t.key?'#4263eb':'#e9ecef'}`, borderRadius:12, cursor:'pointer' }}>
                  <input type="radio" name="template" value={t.key} checked={f.template_key===t.key} onChange={() => set('template_key')(t.key as TemplateKey)} style={{ accentColor:'#4263eb', width:16, height:16 }} />
                  <div style={{ width:28, height:28, borderRadius:'50%', background:t.previewGradient??t.preview, border:'2px solid #dee2e6', flexShrink:0 }} />
                  <div>
                    <p style={{ fontSize:13, fontWeight:700, color:'#212529', margin:0 }}>{t.label}</p>
                    <p style={{ fontSize:11, color:'#868e96', margin:'2px 0 0' }}>{t.description}</p>
                  </div>
                  {f.template_key === t.key && <span style={{ marginLeft:'auto', color:'#4263eb', fontSize:16 }}>✓</span>}
                </label>
              ))}
            </div>

            <SectionHeader>색상 커스터마이징 (쉬운 용어)</SectionHeader>
            <label style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14, cursor:'pointer' }}>
              <input type="checkbox" checked={!!design.custom_colors}
                onChange={e => setDesign(p => ({ ...p, custom_colors: e.target.checked ? { page_bg:'#0a0a0a', card_bg:'#1a1a2e', btn_color:'#1e40af', name_color:'#ffffff', desc_color:'#94a3b8', accent:'#3b82f6' } : null }))}
                style={{ accentColor:'#4263eb', width:16, height:16 }} />
              <span style={{ fontSize:13, color:'#495057', fontWeight:600 }}>색상 직접 설정</span>
            </label>
            {design.custom_colors && (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {([
                  ['page_bg',   '페이지 배경색'],
                  ['card_bg',   '카드 배경색'],
                  ['btn_color', '버튼 색'],
                  ['name_color','이름 색'],
                  ['desc_color','설명 글씨 색'],
                  ['accent',    '강조 색'],
                ] as [keyof CustomColors, string][]).map(([key, label]) => {
                  const val = (design.custom_colors as any)?.[key] ?? '#000000'
                  const tip = getColorTip(val)
                  return (
                    <div key={key}>
                      <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#495057', marginBottom:6 }}>{label}</label>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <input type="color" value={val} onChange={e => setCC(key, e.target.value)}
                          style={{ width:40, height:40, border:'none', borderRadius:8, cursor:'pointer', padding:2 }} />
                        <input style={{ ...I, flex:1, padding:'8px 10px', fontSize:13, fontFamily:'monospace' }}
                          value={val} onChange={e => setCC(key, e.target.value)} placeholder="#000000" />
                      </div>
                      {tip && <p style={{ fontSize:11, color:'#4263eb', marginTop:4 }}>💡 {tip}</p>}
                    </div>
                  )
                })}
              </div>
            )}

            <SectionHeader>버튼 스타일</SectionHeader>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#495057', marginBottom:6 }}>버튼 모양</label>
                <select className="admin-input" style={I} value={design.btn_radius} onChange={e => setDes('btn_radius')(e.target.value)}>
                  {[['none','직각'],['sm','약간'],['md','보통'],['lg','많이'],['full','원형']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#495057', marginBottom:6 }}>버튼 크기</label>
                <select className="admin-input" style={I} value={design.btn_size} onChange={e => setDes('btn_size')(e.target.value)}>
                  {[['sm','작게'],['md','보통'],['lg','크게']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>

            <SectionHeader>글씨 크기 (숫자 직접 입력)</SectionHeader>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:16 }}>
              <NumInput label="이름" value={design.font_size_name} min={16} max={48} unit="px" recommend={28}
                onChange={v => setDes('font_size_name')(v)} />
              <NumInput label="직함/회사" value={design.font_size_sub} min={10} max={24} unit="px" recommend={14}
                onChange={v => setDes('font_size_sub')(v)} />
              <NumInput label="본문" value={design.font_size_body} min={10} max={20} unit="px" recommend={13}
                onChange={v => setDes('font_size_body')(v)} />
            </div>

            <SectionHeader>아이콘 설정</SectionHeader>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
              <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, fontWeight:600, color:'#495057' }}>
                <input type="checkbox" checked={design.show_icon} onChange={e => setDes('show_icon')(e.target.checked)} style={{ accentColor:'#4263eb', width:15, height:15 }} />
                아이콘 표시
              </label>
              <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, fontWeight:600, color:'#495057' }}>
                <input type="checkbox" checked={design.show_text} onChange={e => setDes('show_text')(e.target.checked)} style={{ accentColor:'#4263eb', width:15, height:15 }} />
                텍스트 표시
              </label>
            </div>
            <NumInput label="아이콘 크기" value={design.icon_size} min={12} max={40} step={2} unit="px" recommend={22}
              onChange={v => setDes('icon_size')(v)} />
          </div>
        )}

        {/* ══ 애니메이션 ══ */}
        {activeTab === 'anim' && (
          <div className="admin-card">
            <SectionHeader>애니메이션 설정</SectionHeader>
            <label style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', background:'#f8f9fa', border:'1.5px solid #e9ecef', borderRadius:10, cursor:'pointer', marginBottom:16 }}>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:'#212529', margin:0 }}>애니메이션 ON/OFF</p>
                <p style={{ fontSize:11, color:'#adb5bd', margin:'3px 0 0' }}>끄면 명함이 바로 표시됩니다</p>
              </div>
              <div onClick={() => setDes('animation_on')(!design.animation_on)}
                style={{ width:48, height:26, borderRadius:13, background:design.animation_on?'#4263eb':'#dee2e6', position:'relative', cursor:'pointer', transition:'background 0.2s', flexShrink:0 }}>
                <div style={{ position:'absolute', top:3, width:20, height:20, borderRadius:'50%', background:'#fff', transform:design.animation_on?'translateX(25px)':'translateX(3px)', transition:'transform 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }} />
              </div>
            </label>

            {design.animation_on && (
              <>
                <p style={{ fontSize:12, fontWeight:600, color:'#495057', marginBottom:10 }}>애니메이션 종류 (10가지)</p>
                <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:20 }}>
                  {ANIM_OPTIONS.map(opt => (
                    <label key={opt.type} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', background:design.animation_type===opt.type?'#e7f0ff':'#f8f9fa', border:`1.5px solid ${design.animation_type===opt.type?'#4263eb':'#e9ecef'}`, borderRadius:10, cursor:'pointer' }}>
                      <input type="radio" name="anim" value={opt.type} checked={design.animation_type===opt.type} onChange={() => setDes('animation_type')(opt.type)} style={{ accentColor:'#4263eb', width:15, height:15 }} />
                      <div>
                        <p style={{ fontSize:13, fontWeight:600, color:'#212529', margin:0 }}>{opt.label}</p>
                        <p style={{ fontSize:11, color:'#868e96', margin:'1px 0 0' }}>{opt.desc}</p>
                      </div>
                      {design.animation_type===opt.type && <span style={{ marginLeft:'auto', color:'#4263eb' }}>✓</span>}
                    </label>
                  ))}
                </div>

                <p style={{ fontSize:12, fontWeight:600, color:'#495057', marginBottom:10 }}>속도</p>
                <div style={{ display:'flex', gap:8, marginBottom:20 }}>
                  {[['slow','느리게'],['normal','보통'],['fast','빠르게']].map(([v,l]) => (
                    <button key={v} type="button" onClick={() => setDes('animation_speed')(v)}
                      style={{ flex:1, padding:'10px', border:`1.5px solid ${design.animation_speed===v?'#4263eb':'#dee2e6'}`, background:design.animation_speed===v?'#e7f0ff':'#fff', borderRadius:8, fontSize:12, cursor:'pointer', fontWeight:design.animation_speed===v?700:400, color:design.animation_speed===v?'#4263eb':'#495057' }}>{l}</button>
                  ))}
                </div>

                <p style={{ fontSize:12, fontWeight:600, color:'#495057', marginBottom:8 }}>딜레이 (대기 시간)</p>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                  <input type="range" min={0} max={2} step={0.1} value={design.animation_delay ?? 0}
                    onChange={e => setDes('animation_delay')(parseFloat(e.target.value))}
                    style={{ flex:1, accentColor:'#4263eb', height:6 }} />
                  <span style={{ fontSize:14, fontWeight:700, color:'#4263eb', minWidth:36 }}>{(design.animation_delay ?? 0).toFixed(1)}초</span>
                </div>
                <p style={{ fontSize:11, color:'#adb5bd' }}>입장 전 대기 시간 (0 = 즉시 시작)</p>
              </>
            )}
          </div>
        )}

        {/* ══ 카드뉴스 ══ */}
        {activeTab === 'news' && (
          <div className="admin-card">
            <SectionHeader>카드뉴스 / 콘텐츠</SectionHeader>
            <p style={{ fontSize:12, color:'#adb5bd', marginBottom:16 }}>보험·금융 관련 카드뉴스를 추가하면 명함 하단에 슬라이드로 표시됩니다.</p>
            {newsItems.map((news, idx) => (
              <div key={idx} style={{ background:'#f8f9fa', border:'1px solid #e9ecef', borderRadius:12, padding:14, marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:'#495057' }}>카드 #{idx+1}</span>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <label style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#868e96', cursor:'pointer' }}>
                      <input type="checkbox" checked={news.is_visible} onChange={e => updateNews(idx,'is_visible',e.target.checked)} style={{ accentColor:'#4263eb' }} />공개
                    </label>
                    <button type="button" onClick={() => removeNews(idx)} style={{ padding:'4px 10px', background:'#fff3f3', border:'1px solid #ffc9c9', borderRadius:6, color:'#c92a2a', cursor:'pointer', fontSize:12 }}>삭제</button>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  <div style={{ gridColumn:'1/-1' }}>
                    <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#495057', marginBottom:4 }}>카테고리</label>
                    <select style={{ ...I, padding:'8px 12px' }} value={news.category} onChange={e => updateNews(idx,'category',e.target.value)}>
                      {NEWS_CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div style={{ gridColumn:'1/-1' }}>
                    <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#495057', marginBottom:4 }}>제목 *</label>
                    <input style={{ ...I, padding:'8px 12px', fontSize:13 }} value={news.title} onChange={e => updateNews(idx,'title',e.target.value)} placeholder="제목 입력" />
                  </div>
                  <div style={{ gridColumn:'1/-1' }}>
                    <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#495057', marginBottom:4 }}>요약</label>
                    <textarea style={{ ...I, resize:'none', padding:'8px 12px', fontSize:13 }} rows={2} value={news.summary} onChange={e => updateNews(idx,'summary',e.target.value)} placeholder="간단한 설명" />
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#495057', marginBottom:4 }}>이미지 URL</label>
                    <input style={{ ...I, padding:'8px 12px', fontSize:12 }} value={news.image_url??''} onChange={e => updateNews(idx,'image_url',e.target.value)} placeholder="https://..." />
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#495057', marginBottom:4 }}>링크 URL</label>
                    <input style={{ ...I, padding:'8px 12px', fontSize:12 }} value={news.link_url??''} onChange={e => updateNews(idx,'link_url',e.target.value)} placeholder="https://..." />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={addNews} style={{ width:'100%', padding:'12px', background:'#f1f3f5', border:'1.5px dashed #ced4da', borderRadius:10, color:'#495057', fontSize:13, fontWeight:600, cursor:'pointer' }}>
              + 카드뉴스 추가
            </button>
          </div>
        )}

        {/* 에러 + 저장 */}
        {error && <div style={{ marginTop:16, padding:'12px 16px', background:'#fff5f5', border:'1px solid #ffc9c9', borderRadius:10, color:'#c92a2a', fontSize:13 }}>{error}</div>}
        <button onClick={handleSubmit} disabled={saving||saved}
          style={{ width:'100%', marginTop:16, padding:'15px', background:saved?'linear-gradient(135deg,#2f9e44,#37b24d)':'linear-gradient(135deg,#4263eb,#3b5bdb)', color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:700, cursor:saving||saved?'not-allowed':'pointer', opacity:saving?0.7:1, boxShadow:'0 4px 16px rgba(66,99,235,0.3)' }}>
          {saving ? '저장 중...' : saved ? '✓ 저장 완료!' : mode==='create' ? '명함 생성하기' : '변경 사항 저장'}
        </button>
      </div>

      {/* ── 오른쪽: 실시간 미리보기 ── */}
      <div>
        <LivePreview f={f} extraLinks={extraLinks} design={design} companies={companies} />
      </div>
    </div>
  )
}
