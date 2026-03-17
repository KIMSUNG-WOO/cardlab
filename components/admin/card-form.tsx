'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TEMPLATE_OPTIONS, DEFAULT_TEMPLATE_KEY } from '@/lib/templates'
import { isValidSlug, nullToEmpty } from '@/lib/utils'
import type { BusinessCard, CardFormData, TemplateKey } from '@/lib/types'
import { Loader2, CheckCircle2 } from 'lucide-react'

interface Props {
  mode: 'create' | 'edit'
  card?: BusinessCard
}

// ── 입력 필드 공통 컴포넌트 ────────────────────────────────
function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: '#64748b' }}>
        {label}
        {required && <span className="ml-0.5" style={{ color: '#ef4444' }}>*</span>}
      </label>
      {children}
      {hint && (
        <p className="mt-1 text-xs" style={{ color: '#374151' }}>
          {hint}
        </p>
      )}
    </div>
  )
}

function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  disabled?: boolean
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
      style={{
        background: '#0d1520',
        border: '1px solid #1e2d42',
        color: '#e2e8f0',
        caretColor: '#3b82f6',
        opacity: disabled ? 0.5 : 1,
      }}
      onFocus={(e) => {
        e.target.style.borderColor = '#2563eb'
        e.target.style.boxShadow = '0 0 0 2px rgba(37,99,235,0.12)'
      }}
      onBlur={(e) => {
        e.target.style.borderColor = '#1e2d42'
        e.target.style.boxShadow = 'none'
      }}
    />
  )
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none"
      style={{
        background: '#0d1520',
        border: '1px solid #1e2d42',
        color: '#e2e8f0',
        caretColor: '#3b82f6',
      }}
      onFocus={(e) => {
        e.target.style.borderColor = '#2563eb'
        e.target.style.boxShadow = '0 0 0 2px rgba(37,99,235,0.12)'
      }}
      onBlur={(e) => {
        e.target.style.borderColor = '#1e2d42'
        e.target.style.boxShadow = 'none'
      }}
    />
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="pt-2 pb-1"
      style={{ borderBottom: '1px solid #0d1520' }}
    >
      <p className="text-xs font-semibold tracking-wider" style={{ color: '#1e3a5f' }}>
        {children}
      </p>
    </div>
  )
}

// ── 메인 폼 ───────────────────────────────────────────────
export function CardForm({ mode, card }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [slugError, setSlugError] = useState('')

  // 폼 상태 초기화
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
    return (val: string | boolean) =>
      setForm((prev) => ({ ...prev, [key]: val }))
  }

  // slug 유효성 검사
  function validateSlug(val: string) {
    if (!val) return setSlugError('slug는 필수입니다.')
    if (!isValidSlug(val)) return setSlugError('영문 소문자, 숫자, 하이픈(-)만 사용 가능합니다.')
    if (val.length < 2) return setSlugError('2자 이상 입력해주세요.')
    if (val.length > 50) return setSlugError('50자 이하로 입력해주세요.')
    setSlugError('')
  }

  async function handleSubmit() {
    // 유효성 검사
    if (!form.slug) return setError('slug를 입력해주세요.')
    if (slugError) return setError(slugError)
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
        // slug 중복 체크
        const { data: existing } = await supabase
          .from('business_cards')
          .select('id')
          .eq('slug', payload.slug)
          .single()

        if (existing) {
          setError(`"/${payload.slug}" slug는 이미 사용 중입니다. 다른 slug를 입력해주세요.`)
          setSaving(false)
          return
        }

        const { error: insertError } = await supabase
          .from('business_cards')
          .insert(payload)

        if (insertError) throw insertError
      } else {
        const { error: updateError } = await supabase
          .from('business_cards')
          .update(payload)
          .eq('id', card!.id)

        if (updateError) throw updateError
      }

      setSaved(true)
      setTimeout(() => {
        router.push('/admin/dashboard')
        router.refresh()
      }, 800)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '저장 중 오류가 발생했습니다.'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-5"
      style={{
        background: '#0d1520',
        border: '1px solid #1e2d42',
      }}
    >
      {/* ── 기본 정보 ── */}
      <SectionTitle>기본 정보</SectionTitle>

      <Field
        label="Slug (URL 경로)"
        required
        hint={`cardlab.digital/${form.slug || 'slug'}`}
      >
        <Input
          value={form.slug}
          onChange={(v) => {
            set('slug')(v)
            validateSlug(v)
          }}
          placeholder="예: kim-suho, authentic-lee"
          disabled={mode === 'edit'}
        />
        {slugError && (
          <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>
            {slugError}
          </p>
        )}
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="이름" required>
          <Input value={form.name} onChange={set('name')} placeholder="홍길동" />
        </Field>
        <Field label="영문명 / 부제목">
          <Input value={form.english_name} onChange={set('english_name')} placeholder="Authentic Planner" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="직함" required>
          <Input value={form.position} onChange={set('position')} placeholder="재무설계사" />
        </Field>
        <Field label="팀 / 브랜치명">
          <Input value={form.team_name} onChange={set('team_name')} placeholder="WITH Branch" />
        </Field>
      </div>

      <Field label="회사명" required>
        <Input value={form.company_name} onChange={set('company_name')} placeholder="어센틱금융그룹" />
      </Field>

      <Field label="한 줄 소개">
        <Textarea
          value={form.short_intro}
          onChange={set('short_intro')}
          placeholder="고객과의 소통, 그게 우선입니다."
          rows={2}
        />
      </Field>

      {/* ── 연락처 ── */}
      <SectionTitle>연락처 정보</SectionTitle>

      <div className="grid grid-cols-2 gap-3">
        <Field label="휴대폰">
          <Input value={form.phone} onChange={set('phone')} placeholder="010-0000-0000" type="tel" />
        </Field>
        <Field label="이메일">
          <Input value={form.email} onChange={set('email')} placeholder="name@email.com" type="email" />
        </Field>
      </div>

      <Field label="주소">
        <Input value={form.address} onChange={set('address')} placeholder="인천광역시 남동구 인주대로593 6층" />
      </Field>

      {/* ── 링크 ── */}
      <SectionTitle>링크 & SNS</SectionTitle>

      <Field label="웹사이트 URL">
        <Input value={form.website_url} onChange={set('website_url')} placeholder="https://www.afg.kr" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="인스타그램 URL">
          <Input value={form.instagram_url} onChange={set('instagram_url')} placeholder="https://instagram.com/..." />
        </Field>
        <Field label="카카오 채널 URL">
          <Input value={form.kakao_url} onChange={set('kakao_url')} placeholder="https://pf.kakao.com/..." />
        </Field>
      </div>

      <Field label="문의 URL">
        <Input value={form.inquiry_url} onChange={set('inquiry_url')} placeholder="https://..." />
      </Field>

      {/* ── 이미지 ── */}
      <SectionTitle>이미지</SectionTitle>

      <Field label="프로필 이미지 URL" hint="Supabase Storage에 업로드 후 URL 입력">
        <Input value={form.profile_image_url} onChange={set('profile_image_url')} placeholder="https://...supabase.co/storage/..." />
      </Field>

      <Field label="커버 / 배경 이미지 URL">
        <Input value={form.cover_image_url} onChange={set('cover_image_url')} placeholder="https://..." />
      </Field>

      {/* ── 디자인 템플릿 ── */}
      <SectionTitle>디자인 템플릿</SectionTitle>

      <Field label="템플릿 선택" required>
        <div className="grid grid-cols-1 gap-2">
          {TEMPLATE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all"
              style={{
                background:
                  form.template_key === opt.value ? '#0f1f35' : '#0a1220',
                border: `1px solid ${
                  form.template_key === opt.value ? '#2563eb' : '#1e2d42'
                }`,
              }}
            >
              <input
                type="radio"
                name="template"
                value={opt.value}
                checked={form.template_key === opt.value}
                onChange={() => set('template_key')(opt.value as TemplateKey)}
                className="sr-only"
              />
              <div
                className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{
                  borderColor:
                    form.template_key === opt.value ? '#2563eb' : '#1e2d42',
                  background:
                    form.template_key === opt.value ? '#2563eb' : 'transparent',
                }}
              >
                {form.template_key === opt.value && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: '#e2e8f0' }}>
                  {opt.label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#374151' }}>
                  {opt.description}
                </p>
              </div>
            </label>
          ))}
        </div>
      </Field>

      {/* ── 공개 설정 ── */}
      <SectionTitle>공개 설정</SectionTitle>

      <label className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer" style={{ background: '#0a1220', border: '1px solid #1e2d42' }}>
        <div>
          <p className="text-sm font-medium" style={{ color: '#e2e8f0' }}>
            명함 공개
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#374151' }}>
            비공개 시 URL 접근이 404로 처리됩니다
          </p>
        </div>
        <div
          className="relative w-12 h-6 rounded-full transition-colors"
          style={{ background: form.is_active ? '#1e40af' : '#1e2d42' }}
          onClick={() => set('is_active')(!form.is_active)}
        >
          <div
            className="absolute top-0.5 w-5 h-5 rounded-full transition-transform"
            style={{
              background: '#ffffff',
              transform: form.is_active ? 'translateX(26px)' : 'translateX(2px)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            }}
          />
        </div>
      </label>

      {/* ── 에러 메시지 ── */}
      {error && (
        <div
          className="px-4 py-3 rounded-xl text-sm"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#f87171',
          }}
        >
          {error}
        </div>
      )}

      {/* ── 저장 버튼 ── */}
      <button
        onClick={handleSubmit}
        disabled={saving || saved}
        className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-60 mt-2"
        style={{
          background: saved
            ? 'linear-gradient(135deg, #065f46, #047857)'
            : 'linear-gradient(135deg, #1e3a5f, #1e40af)',
          color: '#ffffff',
          boxShadow: '0 4px 20px rgba(30,64,175,0.25)',
        }}
      >
        {saving ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            저장 중...
          </span>
        ) : saved ? (
          <span className="flex items-center justify-center gap-2">
            <CheckCircle2 size={16} />
            저장 완료!
          </span>
        ) : mode === 'create' ? (
          '명함 생성하기'
        ) : (
          '변경 사항 저장'
        )}
      </button>
    </div>
  )
}
