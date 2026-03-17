'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TEMPLATE_OPTIONS, DEFAULT_TEMPLATE_KEY } from '@/lib/templates'
import { isValidSlug, nullToEmpty } from '@/lib/utils'
import type { BusinessCard, CardFormData, TemplateKey } from '@/lib/types'

interface Props {
  mode: 'create' | 'edit'
  card?: BusinessCard
}

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  background: '#0d1520',
  border: '1px solid #1e2d42',
  borderRadius: 12,
  color: '#e2e8f0',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box' as const,
}

const labelStyle = {
  display: 'block',
  fontSize: 12,
  color: '#64748b',
  marginBottom: 6,
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}{required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}</label>
      {children}
      {hint && <p style={{ fontSize: 11, color: '#374151', marginTop: 4 }}>{hint}</p>}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 11, fontWeight: 600, color: '#1e3a5f', letterSpacing: '0.1em', paddingBottom: 8, borderBottom: '1px solid #0d1520', marginBottom: 16, marginTop: 8 }}>{children}</p>
}

export function CardForm({ mode, card }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState<CardFormData>({
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
    cover_image_url: nullToEmpty(card?.cover_image_url),
    template_key: card?.template_key ?? DEFAULT_TEMPLATE_KEY,
    is_active: card?.is_active ?? true,
  })

  function set(key: keyof CardFormData) {
    return (val: string | boolean) => setForm(prev => ({ ...prev, [key]: val }))
  }

  async function handleSubmit() {
    if (!form.slug) return setError('slug를 입력해주세요.')
    if (!isValidSlug(form.slug)) return setError('slug는 영문 소문자, 숫자, 하이픈(-)만 사용 가능합니다.')
    if (!form.name) return setError('이름을 입력해주세요.')
    if (!form.position) return setError('직함을 입력해주세요.')
    if (!form.company_name) return setError('회사명을 입력해주세요.')

    setError('')
    setSaving(true)

    try {
      const payload = {
        slug: form.slug.toLowerCase().trim(),
        name: form.name.trim(),
        english_name: form.english_name.trim() || null,
        position: form.position.trim(),
        company_name: form.company_name.trim(),
        team_name: form.team_name.trim() || null,
        short_intro: form.short_intro.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        website_url: form.website_url.trim() || null,
        instagram_url: form.instagram_url.trim() || null,
        kakao_url: form.kakao_url.trim() || null,
        inquiry_url: form.inquiry_url.trim() || null,
        address: form.address.trim() || null,
        profile_image_url: form.profile_image_url.trim() || null,
        cover_image_url: form.cover_image_url.trim() || null,
        template_key: form.template_key,
        is_active: form.is_active,
        updated_at: new Date().toISOString(),
      }

      if (mode === 'create') {
        const { data: existing } = await supabase.from('business_cards').select('id').eq('slug', payload.slug).single()
        if (existing) {
          setError(`"/${payload.slug}" slug는 이미 사용 중입니다.`)
          setSaving(false)
          return
        }
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
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ background: '#0d1520', border: '1px solid #1e2d42', borderRadius: 20, padding: 24 }}>
      <SectionTitle>기본 정보</SectionTitle>

      <Field label="Slug (URL 경로)" required hint={`cardlab.digital/${form.slug || 'slug'}`}>
        <input style={inputStyle} value={form.slug} onChange={e => set('slug')(e.target.value)} placeholder="예: kim-suho" disabled={mode === 'edit'} />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="이름" required><input style={inputStyle} value={form.name} onChange={e => set('name')(e.target.value)} placeholder="홍길동" /></Field>
        <Field label="영문명"><input style={inputStyle} value={form.english_name} onChange={e => set('english_name')(e.target.value)} placeholder="Authentic Planner" /></Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="직함" required><input style={inputStyle} value={form.position} onChange={e => set('position')(e.target.value)} placeholder="재무설계사" /></Field>
        <Field label="팀/브랜치명"><input style={inputStyle} value={form.team_name} onChange={e => set('team_name')(e.target.value)} placeholder="WITH Branch" /></Field>
      </div>

      <Field label="회사명" required><input style={inputStyle} value={form.company_name} onChange={e => set('company_name')(e.target.value)} placeholder="어센틱금융그룹" /></Field>

      <Field label="한 줄 소개">
        <textarea style={{ ...inputStyle, resize: 'none' }} rows={2} value={form.short_intro} onChange={e => set('short_intro')(e.target.value)} placeholder="고객과의 소통, 그게 우선입니다." />
      </Field>

      <SectionTitle>연락처</SectionTitle>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="휴대폰"><input style={inputStyle} value={form.phone} onChange={e => set('phone')(e.target.value)} placeholder="010-0000-0000" /></Field>
        <Field label="이메일"><input style={inputStyle} value={form.email} onChange={e => set('email')(e.target.value)} placeholder="name@email.com" /></Field>
      </div>

      <Field label="주소"><input style={inputStyle} value={form.address} onChange={e => set('address')(e.target.value)} placeholder="인천광역시 남동구 인주대로593 6층" /></Field>

      <SectionTitle>링크 & SNS</SectionTitle>

      <Field label="웹사이트 URL"><input style={inputStyle} value={form.website_url} onChange={e => set('website_url')(e.target.value)} placeholder="https://www.afg.kr" /></Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="인스타그램 URL"><input style={inputStyle} value={form.instagram_url} onChange={e => set('instagram_url')(e.target.value)} placeholder="https://instagram.com/..." /></Field>
        <Field label="카카오 채널 URL"><input style={inputStyle} value={form.kakao_url} onChange={e => set('kakao_url')(e.target.value)} placeholder="https://pf.kakao.com/..." /></Field>
      </div>

      <SectionTitle>이미지</SectionTitle>

      <Field label="프로필 이미지 URL" hint="Supabase Storage 업로드 후 URL 입력">
        <input style={inputStyle} value={form.profile_image_url} onChange={e => set('profile_image_url')(e.target.value)} placeholder="https://...supabase.co/storage/..." />
      </Field>

      <SectionTitle>디자인 템플릿</SectionTitle>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {TEMPLATE_OPTIONS.map(opt => (
          <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: form.template_key === opt.value ? '#0f1f35' : '#0a1220', border: `1px solid ${form.template_key === opt.value ? '#2563eb' : '#1e2d42'}`, borderRadius: 12, cursor: 'pointer' }}>
            <input type="radio" name="template" value={opt.value} checked={form.template_key === opt.value} onChange={() => set('template_key')(opt.value as TemplateKey)} style={{ accentColor: '#2563eb' }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', margin: 0 }}>{opt.label}</p>
              <p style={{ fontSize: 11, color: '#374151', margin: '2px 0 0' }}>{opt.description}</p>
            </div>
          </label>
        ))}
      </div>

      <SectionTitle>공개 설정</SectionTitle>

      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#0a1220', border: '1px solid #1e2d42', borderRadius: 12, cursor: 'pointer', marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', margin: 0 }}>명함 공개</p>
          <p style={{ fontSize: 11, color: '#374151', margin: '2px 0 0' }}>비공개 시 URL 접근이 404로 처리됩니다</p>
        </div>
        <div onClick={() => set('is_active')(!form.is_active)} style={{ width: 48, height: 24, borderRadius: 12, background: form.is_active ? '#1e40af' : '#1e2d42', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
          <div style={{ position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%', background: '#ffffff', transform: form.is_active ? 'translateX(26px)' : 'translateX(2px)', transition: 'transform 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
        </div>
      </label>

      {error && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, color: '#f87171', fontSize: 13 }}>
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={saving || saved}
        style={{ width: '100%', padding: '14px', background: saved ? 'linear-gradient(135deg, #065f46, #047857)' : 'linear-gradient(135deg, #1e3a5f, #1e40af)', color: '#ffffff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: saving || saved ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}
      >
        {saving ? '저장 중...' : saved ? '✓ 저장 완료!' : mode === 'create' ? '명함 생성하기' : '변경 사항 저장'}
      </button>
    </div>
  )
}
