'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TEMPLATE_LIST, DEFAULT_TEMPLATE } from '@/lib/templates'
import { isValidSlug, nullToEmpty } from '@/lib/utils'
import type { BusinessCard, TemplateKey } from '@/lib/types'
import { ImageUploader } from './image-uploader'

interface Props { mode: 'create' | 'edit'; card?: BusinessCard }

const S = {
  input: { width:'100%', padding:'12px 16px', background:'#0d1520', border:'1px solid #1e2d42', borderRadius:12, color:'#e2e8f0', fontSize:14, outline:'none', boxSizing:'border-box' as const },
  label: { display:'block', fontSize:12, color:'#64748b', marginBottom:6 } as React.CSSProperties,
  section: { fontSize:11, fontWeight:600, color:'#1e3a5f', letterSpacing:'0.1em', paddingBottom:8, borderBottom:'1px solid #0d1520', marginBottom:16, marginTop:8 } as React.CSSProperties,
}

function Field({ label, required, hint, children }: { label:string; required?:boolean; hint?:string; children:React.ReactNode }) {
  return (
    <div style={{ marginBottom:16 }}>
      <label style={S.label}>{label}{required && <span style={{ color:'#ef4444', marginLeft:2 }}>*</span>}</label>
      {children}
      {hint && <p style={{ fontSize:11, color:'#374151', marginTop:4 }}>{hint}</p>}
    </div>
  )
}

export function CardForm({ mode, card }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [f, setF] = useState({
    slug: card?.slug ?? '',
    name: card?.name ?? '',
    english_name: nullToEmpty(card?.english_name),
    position: card?.position ?? '',
    company_name: card?.company_name ?? '',
    team_name: nullToEmpty(card?.team_name),
    short_intro: nullToEmpty(card?.short_intro),
    phone: nullToEmpty(card?.phone),
    email: nullToEmpty(card?.email),
    website_url: nullToEmpty(card?.website_url),
    instagram_url: nullToEmpty(card?.instagram_url),
    kakao_url: nullToEmpty(card?.kakao_url),
    inquiry_url: nullToEmpty(card?.inquiry_url),
    address: nullToEmpty(card?.address),
    profile_image_url: nullToEmpty(card?.profile_image_url),
    // 메뉴 URL
    menu_insurance_claim_url: nullToEmpty(card?.menu_insurance_claim_url),
    menu_check_insurance_url: nullToEmpty(card?.menu_check_insurance_url),
    menu_analysis_url: nullToEmpty(card?.menu_analysis_url),
    menu_consult_url: nullToEmpty(card?.menu_consult_url),
    // 템플릿
    template_key: (card?.template_key ?? DEFAULT_TEMPLATE) as TemplateKey,
    is_active: card?.is_active ?? true,
  })

  const set = (key: keyof typeof f) => (val: any) => setF(p => ({ ...p, [key]: val }))

  async function handleSubmit() {
    if (!f.slug) return setError('slug를 입력해주세요.')
    if (!isValidSlug(f.slug)) return setError('slug는 영문 소문자, 숫자, 하이픈(-)만 가능합니다.')
    if (!f.name) return setError('이름을 입력해주세요.')
    if (!f.position) return setError('직함을 입력해주세요.')
    if (!f.company_name) return setError('회사명을 입력해주세요.')
    setError(''); setSaving(true)

    try {
      const payload = {
        slug: f.slug.toLowerCase().trim(),
        name: f.name.trim(),
        english_name: f.english_name.trim() || null,
        position: f.position.trim(),
        company_name: f.company_name.trim(),
        team_name: f.team_name.trim() || null,
        short_intro: f.short_intro.trim() || null,
        phone: f.phone.trim() || null,
        email: f.email.trim() || null,
        website_url: f.website_url.trim() || null,
        instagram_url: f.instagram_url.trim() || null,
        kakao_url: f.kakao_url.trim() || null,
        inquiry_url: f.inquiry_url.trim() || null,
        address: f.address.trim() || null,
        profile_image_url: f.profile_image_url.trim() || null,
        menu_insurance_claim_url: f.menu_insurance_claim_url.trim() || null,
        menu_check_insurance_url: f.menu_check_insurance_url.trim() || null,
        menu_analysis_url: f.menu_analysis_url.trim() || null,
        menu_consult_url: f.menu_consult_url.trim() || null,
        template_key: f.template_key,
        is_active: f.is_active,
        updated_at: new Date().toISOString(),
      }

      if (mode === 'create') {
        const { data: ex } = await supabase.from('business_cards').select('id').eq('slug', payload.slug).single()
        if (ex) { setError(`/${payload.slug} slug는 이미 사용 중입니다.`); setSaving(false); return }
        const { error: e } = await supabase.from('business_cards').insert(payload)
        if (e) throw e
      } else {
        const { error: e } = await supabase.from('business_cards').update(payload).eq('id', card!.id)
        if (e) throw e
      }

      setSaved(true)
      setTimeout(() => { router.push('/admin/dashboard'); router.refresh() }, 800)
    } catch (e: any) {
      setError(e?.message ?? '저장 중 오류가 발생했습니다.')
    } finally { setSaving(false) }
  }

  const baseSlug = f.slug || 'slug'

  return (
    <div style={{ background:'#0d1520', border:'1px solid #1e2d42', borderRadius:20, padding:24 }}>

      {/* 기본 정보 */}
      <p style={S.section}>기본 정보</p>

      <Field label="Slug (URL 경로)" required hint={`cardlab.digital/${baseSlug}`}>
        <input style={{ ...S.input, opacity: mode === 'edit' ? 0.5 : 1 }} value={f.slug} onChange={e => set('slug')(e.target.value)} placeholder="예: kim-suho, authentic-lee" disabled={mode === 'edit'} />
      </Field>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <Field label="이름" required><input style={S.input} value={f.name} onChange={e => set('name')(e.target.value)} placeholder="홍길동" /></Field>
        <Field label="영문명 (선택)"><input style={S.input} value={f.english_name} onChange={e => set('english_name')(e.target.value)} placeholder="예: Hong Gil-dong" /></Field>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <Field label="직함" required><input style={S.input} value={f.position} onChange={e => set('position')(e.target.value)} placeholder="재무설계사" /></Field>
        <Field label="팀/브랜치명"><input style={S.input} value={f.team_name} onChange={e => set('team_name')(e.target.value)} placeholder="WITH Branch" /></Field>
      </div>

      <Field label="회사명" required><input style={S.input} value={f.company_name} onChange={e => set('company_name')(e.target.value)} placeholder="어센틱금융그룹" /></Field>

      <Field label="한 줄 소개">
        <textarea style={{ ...S.input, resize:'none' }} rows={2} value={f.short_intro} onChange={e => set('short_intro')(e.target.value)} placeholder="고객과의 소통, 그게 우선입니다." />
      </Field>

      {/* 프로필 이미지 */}
      <p style={S.section}>프로필 이미지</p>
      <Field label="파일 업로드 또는 URL 직접 입력">
        <ImageUploader
          value={f.profile_image_url}
          onChange={set('profile_image_url')}
          cardSlug={f.slug || 'card'}
        />
        <div style={{ marginTop:8 }}>
          <input
            style={S.input}
            value={f.profile_image_url}
            onChange={e => set('profile_image_url')(e.target.value)}
            placeholder="https://... (URL 직접 입력)"
          />
        </div>
      </Field>

      {/* 연락처 */}
      <p style={S.section}>연락처</p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <Field label="휴대폰"><input style={S.input} value={f.phone} onChange={e => set('phone')(e.target.value)} placeholder="010-0000-0000" /></Field>
        <Field label="이메일"><input style={S.input} value={f.email} onChange={e => set('email')(e.target.value)} placeholder="name@email.com" /></Field>
      </div>
      <Field label="주소"><input style={S.input} value={f.address} onChange={e => set('address')(e.target.value)} placeholder="인천광역시 남동구 인주대로593 6층" /></Field>

      {/* 메뉴 항목 URL */}
      <p style={S.section}>메뉴 항목 연결 URL</p>
      <p style={{ fontSize:11, color:'#4a5568', marginBottom:12 }}>각 메뉴 버튼을 클릭했을 때 이동할 URL을 입력하세요. 비워두면 버튼이 비활성 상태로 표시됩니다.</p>
      <Field label="📋 보험금청구 URL"><input style={S.input} value={f.menu_insurance_claim_url} onChange={e => set('menu_insurance_claim_url')(e.target.value)} placeholder="https://..." /></Field>
      <Field label="🔍 내보험조회 URL"><input style={S.input} value={f.menu_check_insurance_url} onChange={e => set('menu_check_insurance_url')(e.target.value)} placeholder="https://..." /></Field>
      <Field label="📊 보장분석 URL"><input style={S.input} value={f.menu_analysis_url} onChange={e => set('menu_analysis_url')(e.target.value)} placeholder="https://..." /></Field>
      <Field label="💬 상담신청 URL"><input style={S.input} value={f.menu_consult_url} onChange={e => set('menu_consult_url')(e.target.value)} placeholder="https://..." /></Field>

      {/* 추가 링크 */}
      <p style={S.section}>추가 링크 (선택)</p>
      <Field label="웹사이트 URL"><input style={S.input} value={f.website_url} onChange={e => set('website_url')(e.target.value)} placeholder="https://www.afg.kr" /></Field>
      <Field label="카카오 채널 URL"><input style={S.input} value={f.kakao_url} onChange={e => set('kakao_url')(e.target.value)} placeholder="https://pf.kakao.com/..." /></Field>
      <Field label="온라인 문의 URL"><input style={S.input} value={f.inquiry_url} onChange={e => set('inquiry_url')(e.target.value)} placeholder="https://..." /></Field>
      <Field label="인스타그램 URL"><input style={S.input} value={f.instagram_url} onChange={e => set('instagram_url')(e.target.value)} placeholder="https://instagram.com/..." /></Field>

      {/* 디자인 템플릿 */}
      <p style={S.section}>디자인 템플릿</p>
      <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
        {TEMPLATE_LIST.map(t => (
          <label key={t.key} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background: f.template_key === t.key ? '#0f1f35' : '#0a1220', border:`1px solid ${f.template_key === t.key ? '#2563eb' : '#1e2d42'}`, borderRadius:12, cursor:'pointer' }}>
            <input type="radio" name="template" value={t.key} checked={f.template_key === t.key} onChange={() => set('template_key')(t.key as TemplateKey)} style={{ accentColor:'#2563eb' }} />
            {/* 색상 미리보기 동그라미 */}
            <div style={{ width:24, height:24, borderRadius:'50%', background:t.preview, border:'2px solid #1e2d42', flexShrink:0 }} />
            <div>
              <p style={{ fontSize:13, fontWeight:600, color:'#e2e8f0', margin:0 }}>{t.label}</p>
              <p style={{ fontSize:11, color:'#374151', margin:'2px 0 0' }}>{t.description}</p>
            </div>
          </label>
        ))}
      </div>

      {/* 공개 설정 */}
      <p style={S.section}>공개 설정</p>
      <label style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', background:'#0a1220', border:'1px solid #1e2d42', borderRadius:12, cursor:'pointer', marginBottom:24 }}>
        <div>
          <p style={{ fontSize:13, fontWeight:600, color:'#e2e8f0', margin:0 }}>명함 공개</p>
          <p style={{ fontSize:11, color:'#374151', margin:'2px 0 0' }}>비공개 시 URL 접근이 404 처리됩니다</p>
        </div>
        <div onClick={() => set('is_active')(!f.is_active)} style={{ width:48, height:24, borderRadius:12, background: f.is_active ? '#1e40af' : '#1e2d42', position:'relative', cursor:'pointer', transition:'background 0.2s' }}>
          <div style={{ position:'absolute', top:2, width:20, height:20, borderRadius:'50%', background:'#fff', transform: f.is_active ? 'translateX(26px)' : 'translateX(2px)', transition:'transform 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.3)' }} />
        </div>
      </label>

      {error && <div style={{ marginBottom:16, padding:'12px 16px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:12, color:'#f87171', fontSize:13 }}>{error}</div>}

      <button
        onClick={handleSubmit}
        disabled={saving || saved}
        style={{ width:'100%', padding:'14px', background: saved ? 'linear-gradient(135deg,#065f46,#047857)' : 'linear-gradient(135deg,#1e3a5f,#1e40af)', color:'#fff', border:'none', borderRadius:12, fontSize:14, fontWeight:600, cursor: saving || saved ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}
      >
        {saving ? '저장 중...' : saved ? '✓ 저장 완료!' : mode === 'create' ? '명함 생성하기' : '변경 사항 저장'}
      </button>
    </div>
  )
}
