'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TEMPLATE_LIST, DEFAULT_TEMPLATE } from '@/lib/templates'
import { isValidSlug, nullToEmpty, generateId } from '@/lib/utils'
import type { BusinessCard, CardFormData, TemplateKey, LinkItem, LinkType, CardNews } from '@/lib/types'
import { ImageUploader } from './image-uploader'

interface Props { mode: 'create' | 'edit'; card?: BusinessCard }

// 추가 가능한 링크 타입 목록
const LINK_OPTIONS: { type: LinkType; label: string; emoji: string; placeholder: string }[] = [
  { type:'kakao',     label:'카카오 채널',  emoji:'💛', placeholder:'https://pf.kakao.com/...' },
  { type:'instagram', label:'인스타그램',   emoji:'📸', placeholder:'https://instagram.com/...' },
  { type:'youtube',   label:'유튜브',       emoji:'▶️', placeholder:'https://youtube.com/...' },
  { type:'blog',      label:'블로그',       emoji:'📝', placeholder:'https://blog.naver.com/...' },
  { type:'website',   label:'홈페이지',     emoji:'🌐', placeholder:'https://...' },
  { type:'consult',   label:'상담 예약',    emoji:'📅', placeholder:'https://...' },
  { type:'email',     label:'이메일',       emoji:'✉️', placeholder:'name@email.com' },
  { type:'custom',    label:'직접 입력',    emoji:'🔗', placeholder:'https://...' },
]

// 카드뉴스 카테고리
const NEWS_CATS = [
  { value:'insurance', label:'보험' },
  { value:'finance',   label:'금융' },
  { value:'policy',    label:'정책변경' },
  { value:'news',      label:'뉴스' },
  { value:'notice',    label:'공지' },
]

// ── 스타일 상수 ──────────────────────────────────────────────
const I: React.CSSProperties = { width:'100%', padding:'10px 14px', background:'#fff', border:'1.5px solid #dee2e6', borderRadius:8, color:'#212529', fontSize:14, fontFamily:'inherit', outline:'none' }
const L: React.CSSProperties = { display:'block', fontSize:12, fontWeight:600, color:'#495057', marginBottom:6 }

function Field({ label, required, hint, half, children }: { label:string; required?:boolean; hint?:string; half?:boolean; children:React.ReactNode }) {
  return (
    <div style={{ flex: half ? '1 1 calc(50% - 6px)' : '1 1 100%', minWidth:0, marginBottom:16 }}>
      <label style={L}>{label}{required && <span style={{ color:'#fa5252', marginLeft:2 }}>*</span>}</label>
      {children}
      {hint && <p style={{ fontSize:11, color:'#adb5bd', marginTop:4 }}>{hint}</p>}
    </div>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18, marginTop:4 }}>
      <div style={{ flex:1, height:1, background:'#e9ecef' }} />
      <p style={{ fontSize:11, fontWeight:700, color:'#adb5bd', letterSpacing:'0.1em', whiteSpace:'nowrap' }}>{children}</p>
      <div style={{ flex:1, height:1, background:'#e9ecef' }} />
    </div>
  )
}

export function CardForm({ mode, card }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'basic'|'links'|'template'|'news'>('basic')

  const [f, setF] = useState({
    slug:         card?.slug ?? '',
    name:         card?.name ?? '',
    english_name: nullToEmpty(card?.english_name),
    position:     card?.position ?? '',
    company_name: card?.company_name ?? '',
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

  // 추가 링크 상태
  const [extraLinks, setExtraLinks] = useState<LinkItem[]>(
    Array.isArray(card?.extra_links) ? card.extra_links : []
  )
  const [showLinkPicker, setShowLinkPicker] = useState(false)

  // 카드뉴스 상태
  const [newsItems, setNewsItems] = useState<Omit<CardNews,'id'|'card_id'|'created_at'>[]>(
    (card?.card_news ?? []).map(n => ({
      title: n.title, summary: n.summary,
      image_url: n.image_url ?? '', link_url: n.link_url ?? '',
      category: n.category, sort_order: n.sort_order, is_visible: n.is_visible,
    }))
  )

  const set = (k: keyof typeof f) => (v: any) => setF(p => ({...p,[k]:v}))

  // 링크 추가
  function addLink(type: LinkType, label: string, emoji: string) {
    setExtraLinks(prev => [...prev, { id:generateId(), type, label, url:'', emoji }])
    setShowLinkPicker(false)
  }

  function updateLink(id: string, field: 'label'|'url', val: string) {
    setExtraLinks(prev => prev.map(l => l.id===id ? {...l,[field]:val} : l))
  }

  function removeLink(id: string) {
    setExtraLinks(prev => prev.filter(l => l.id !== id))
  }

  // 카드뉴스 추가
  function addNews() {
    setNewsItems(prev => [...prev, {
      title:'', summary:'', image_url:'', link_url:'',
      category:'insurance', sort_order: prev.length, is_visible:true
    }])
  }

  function updateNews(idx: number, field: string, val: any) {
    setNewsItems(prev => prev.map((n,i) => i===idx ? {...n,[field]:val} : n))
  }

  function removeNews(idx: number) {
    setNewsItems(prev => prev.filter((_,i) => i!==idx))
  }

  async function handleSubmit() {
    if (!f.slug)         return setError('URL 경로(slug)를 입력해주세요.')
    if (!isValidSlug(f.slug)) return setError('slug는 영문 소문자, 숫자, 하이픈(-)만 가능합니다.')
    if (!f.name)         return setError('이름을 입력해주세요.')
    if (!f.position)     return setError('직함을 입력해주세요.')
    if (!f.company_name) return setError('회사명을 입력해주세요.')
    setError(''); setSaving(true)

    try {
      const payload = {
        slug:         f.slug.toLowerCase().trim(),
        name:         f.name.trim(),
        english_name: f.english_name.trim() || null,
        position:     f.position.trim(),
        company_name: f.company_name.trim(),
        team_name:    f.team_name.trim() || null,
        short_intro:  f.short_intro.trim() || null,
        phone:        f.phone.trim() || null,
        email:        f.email.trim() || null,
        address:      f.address.trim() || null,
        website_url:  f.website_url.trim() || null,
        inquiry_url:  f.inquiry_url.trim() || null,
        profile_image_url: f.profile_image_url.trim() || null,
        menu_insurance_claim_url: f.menu_insurance_claim_url.trim() || null,
        menu_check_insurance_url: f.menu_check_insurance_url.trim() || null,
        menu_analysis_url:        f.menu_analysis_url.trim() || null,
        menu_consult_url:         f.menu_consult_url.trim() || null,
        extra_links:  extraLinks.filter(l => l.url.trim()),
        template_key: f.template_key,
        is_active:    f.is_active,
        updated_at:   new Date().toISOString(),
      }

      let cardId = card?.id

      if (mode === 'create') {
        const { data: ex } = await supabase.from('business_cards').select('id').eq('slug', payload.slug).single()
        if (ex) { setError(`/${payload.slug} slug는 이미 사용 중입니다.`); setSaving(false); return }
        const { data: newCard, error: e } = await supabase.from('business_cards').insert(payload).select('id').single()
        if (e) throw e
        cardId = newCard.id
      } else {
        const { error: e } = await supabase.from('business_cards').update(payload).eq('id', card!.id)
        if (e) throw e
      }

      // 카드뉴스 저장 (있는 경우)
      if (cardId && newsItems.length > 0) {
        // 기존 삭제 후 재삽입
        await supabase.from('card_news').delete().eq('card_id', cardId)
        const newsPayload = newsItems
          .filter(n => n.title.trim())
          .map((n, idx) => ({
            card_id: cardId,
            title: n.title.trim(),
            summary: n.summary.trim(),
            image_url: n.image_url?.trim() || null,
            link_url: n.link_url?.trim() || null,
            category: n.category,
            sort_order: idx,
            is_visible: n.is_visible,
          }))
        if (newsPayload.length > 0) {
          const { error: ne } = await supabase.from('card_news').insert(newsPayload)
          if (ne) console.error('카드뉴스 저장 오류:', ne)
        }
      }

      setSaved(true)
      setTimeout(() => { router.push('/admin/dashboard'); router.refresh() }, 800)
    } catch (e: any) {
      setError(e?.message ?? '저장 중 오류가 발생했습니다.')
    } finally { setSaving(false) }
  }

  // ── 탭 스타일 ────────────────────────────────────────────
  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding:'8px 16px', borderRadius:8, fontSize:13, fontWeight: active ? 700 : 500,
    color: active ? '#4263eb' : '#868e96',
    background: active ? '#e7f0ff' : 'transparent',
    border:'none', cursor:'pointer', whiteSpace:'nowrap',
  })

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:24, maxWidth:800 }}>

      {/* ── 탭 네비 ── */}
      <div style={{ display:'flex', gap:4, background:'#f1f3f5', padding:4, borderRadius:12, overflow:'auto' }}>
        {(['basic','links','template','news'] as const).map(tab => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)} style={tabStyle(activeTab===tab)}>
            {{ basic:'기본 정보', links:'링크·연락처', template:'디자인 템플릿', news:'카드뉴스' }[tab]}
          </button>
        ))}
      </div>

      {/* ══ 탭: 기본 정보 ════════════════════════════════════ */}
      {activeTab === 'basic' && (
        <div style={{ background:'#fff', border:'1px solid #e9ecef', borderRadius:14, padding:24 }}>
          <SectionHeader>URL 경로</SectionHeader>
          <Field label="Slug (URL 경로)" required hint={`cardlab.digital/${f.slug || 'slug'}`}>
            <input className="admin-input" style={{ ...I, opacity: mode==='edit' ? 0.6 : 1 }} value={f.slug} onChange={e => set('slug')(e.target.value)} placeholder="영문 소문자, 숫자, 하이픈만" disabled={mode==='edit'} />
          </Field>

          <SectionHeader>이름·직함</SectionHeader>
          <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
            <Field label="이름" required half><input className="admin-input" style={I} value={f.name} onChange={e => set('name')(e.target.value)} /></Field>
            <Field label="영문명 (선택)" half><input className="admin-input" style={I} value={f.english_name} onChange={e => set('english_name')(e.target.value)} /></Field>
            <Field label="직함" required half><input className="admin-input" style={I} value={f.position} onChange={e => set('position')(e.target.value)} /></Field>
            <Field label="팀·브랜치명 (선택)" half><input className="admin-input" style={I} value={f.team_name} onChange={e => set('team_name')(e.target.value)} /></Field>
          </div>
          <Field label="회사명" required><input className="admin-input" style={I} value={f.company_name} onChange={e => set('company_name')(e.target.value)} /></Field>
          <Field label="한 줄 소개 (선택)">
            <textarea className="admin-input" style={{ ...I, resize:'none' }} rows={2} value={f.short_intro} onChange={e => set('short_intro')(e.target.value)} />
          </Field>

          <SectionHeader>프로필 사진</SectionHeader>
          <ImageUploader value={f.profile_image_url} onChange={set('profile_image_url')} cardSlug={f.slug || 'card'} />
          <div style={{ marginTop:10 }}>
            <label style={L}>또는 이미지 URL 직접 입력</label>
            <input className="admin-input" style={I} value={f.profile_image_url} onChange={e => set('profile_image_url')(e.target.value)} placeholder="https://..." />
          </div>

          <SectionHeader>메뉴 항목 URL</SectionHeader>
          <p style={{ fontSize:12, color:'#adb5bd', marginBottom:14 }}>입력하면 해당 버튼이 활성화됩니다. 비워두면 비활성 표시됩니다.</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
            <Field label="📋 보험금청구 URL" half><input className="admin-input" style={I} value={f.menu_insurance_claim_url} onChange={e => set('menu_insurance_claim_url')(e.target.value)} placeholder="https://..." /></Field>
            <Field label="🔍 내보험조회 URL" half><input className="admin-input" style={I} value={f.menu_check_insurance_url} onChange={e => set('menu_check_insurance_url')(e.target.value)} placeholder="https://..." /></Field>
            <Field label="📊 보장분석 URL" half><input className="admin-input" style={I} value={f.menu_analysis_url} onChange={e => set('menu_analysis_url')(e.target.value)} placeholder="https://..." /></Field>
            <Field label="💬 상담신청 URL" half><input className="admin-input" style={I} value={f.menu_consult_url} onChange={e => set('menu_consult_url')(e.target.value)} placeholder="https://..." /></Field>
          </div>

          <SectionHeader>공개 설정</SectionHeader>
          <label style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', background:'#f8f9fa', border:'1.5px solid #e9ecef', borderRadius:10, cursor:'pointer' }}>
            <div>
              <p style={{ fontSize:13, fontWeight:600, color:'#212529', margin:0 }}>명함 공개</p>
              <p style={{ fontSize:11, color:'#adb5bd', margin:'3px 0 0' }}>비공개 시 URL 접근이 404 처리됩니다</p>
            </div>
            <div onClick={() => set('is_active')(!f.is_active)} style={{ width:48, height:26, borderRadius:13, background:f.is_active?'#4263eb':'#dee2e6', position:'relative', cursor:'pointer', transition:'background 0.2s', flexShrink:0 }}>
              <div style={{ position:'absolute', top:3, width:20, height:20, borderRadius:'50%', background:'#fff', transform:f.is_active?'translateX(25px)':'translateX(3px)', transition:'transform 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }} />
            </div>
          </label>
        </div>
      )}

      {/* ══ 탭: 링크·연락처 ══════════════════════════════════ */}
      {activeTab === 'links' && (
        <div style={{ background:'#fff', border:'1px solid #e9ecef', borderRadius:14, padding:24 }}>
          <SectionHeader>기본 연락처</SectionHeader>
          <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
            <Field label="휴대폰 번호" half><input className="admin-input" style={I} value={f.phone} onChange={e => set('phone')(e.target.value)} /></Field>
            <Field label="이메일" half><input className="admin-input" style={I} value={f.email} onChange={e => set('email')(e.target.value)} /></Field>
          </div>
          <Field label="주소"><input className="admin-input" style={I} value={f.address} onChange={e => set('address')(e.target.value)} /></Field>
          <Field label="웹사이트 URL"><input className="admin-input" style={I} value={f.website_url} onChange={e => set('website_url')(e.target.value)} placeholder="https://..." /></Field>
          <Field label="온라인 문의 URL"><input className="admin-input" style={I} value={f.inquiry_url} onChange={e => set('inquiry_url')(e.target.value)} placeholder="https://..." /></Field>

          <SectionHeader>추가 링크 버튼</SectionHeader>
          <p style={{ fontSize:12, color:'#adb5bd', marginBottom:14 }}>필요한 링크만 선택해서 추가하세요. 명함에 버튼으로 표시됩니다.</p>

          {/* 등록된 링크 목록 */}
          {extraLinks.map(link => (
            <div key={link.id} style={{ display:'flex', gap:8, alignItems:'center', marginBottom:10, background:'#f8f9fa', border:'1px solid #e9ecef', borderRadius:10, padding:'10px 14px' }}>
              <span style={{ fontSize:18, flexShrink:0 }}>{link.emoji}</span>
              <div style={{ flex:1, display:'flex', gap:8, minWidth:0 }}>
                <input style={{ ...I, flex:'0 0 100px', padding:'7px 10px', fontSize:12 }} value={link.label} onChange={e => updateLink(link.id,'label',e.target.value)} placeholder="버튼 이름" />
                <input style={{ ...I, flex:1, padding:'7px 10px', fontSize:12 }} value={link.url} onChange={e => updateLink(link.id,'url',e.target.value)} placeholder={link.type === 'email' ? 'name@email.com' : 'https://...'} />
              </div>
              <button type="button" onClick={() => removeLink(link.id)} style={{ width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', background:'#fff3f3', border:'1px solid #ffc9c9', borderRadius:6, color:'#c92a2a', cursor:'pointer', fontSize:14, flexShrink:0 }}>✕</button>
            </div>
          ))}

          {/* 링크 추가 버튼 */}
          <div style={{ position:'relative' }}>
            <button type="button" onClick={() => setShowLinkPicker(v => !v)} style={{ width:'100%', padding:'10px', background:'#f1f3f5', border:'1.5px dashed #ced4da', borderRadius:10, color:'#495057', fontSize:13, fontWeight:600, cursor:'pointer' }}>
              + 링크 버튼 추가
            </button>
            {showLinkPicker && (
              <div style={{ position:'absolute', top:'calc(100% + 8px)', left:0, right:0, background:'#fff', border:'1px solid #dee2e6', borderRadius:12, padding:12, zIndex:50, boxShadow:'0 8px 32px rgba(0,0,0,0.12)' }}>
                <p style={{ fontSize:11, color:'#adb5bd', marginBottom:10, fontWeight:600, letterSpacing:'0.08em' }}>추가할 항목 선택</p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                  {LINK_OPTIONS.map(opt => (
                    <button key={opt.type} type="button" onClick={() => addLink(opt.type, opt.label, opt.emoji)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'10px 4px', background:'#f8f9fa', border:'1px solid #e9ecef', borderRadius:10, cursor:'pointer', fontSize:11, color:'#495057', fontWeight:600 }}>
                      <span style={{ fontSize:22 }}>{opt.emoji}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => setShowLinkPicker(false)} style={{ width:'100%', marginTop:10, padding:'8px', background:'none', border:'none', color:'#adb5bd', fontSize:12, cursor:'pointer' }}>닫기</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ 탭: 디자인 템플릿 ═══════════════════════════════ */}
      {activeTab === 'template' && (
        <div style={{ background:'#fff', border:'1px solid #e9ecef', borderRadius:14, padding:24 }}>
          <SectionHeader>디자인 템플릿 선택</SectionHeader>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {TEMPLATE_LIST.map(t => (
              <label key={t.key} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px', background:f.template_key===t.key?'#e7f0ff':'#f8f9fa', border:`1.5px solid ${f.template_key===t.key?'#4263eb':'#e9ecef'}`, borderRadius:12, cursor:'pointer', transition:'all 0.15s' }}>
                <input type="radio" name="template" value={t.key} checked={f.template_key===t.key} onChange={() => set('template_key')(t.key as TemplateKey)} style={{ accentColor:'#4263eb', width:16, height:16 }} />
                <div style={{ width:32, height:32, borderRadius:'50%', background:t.preview, border:'2px solid #dee2e6', flexShrink:0, boxShadow:'0 2px 8px rgba(0,0,0,0.15)' }} />
                <div>
                  <p style={{ fontSize:14, fontWeight:700, color:'#212529', margin:0 }}>{t.label}</p>
                  <p style={{ fontSize:12, color:'#868e96', margin:'2px 0 0' }}>{t.description}</p>
                </div>
                {f.template_key===t.key && <span style={{ marginLeft:'auto', color:'#4263eb', fontSize:16 }}>✓</span>}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ══ 탭: 카드뉴스 ════════════════════════════════════ */}
      {activeTab === 'news' && (
        <div style={{ background:'#fff', border:'1px solid #e9ecef', borderRadius:14, padding:24 }}>
          <SectionHeader>카드뉴스 / 콘텐츠</SectionHeader>
          <p style={{ fontSize:12, color:'#adb5bd', marginBottom:18 }}>보험·금융 관련 카드뉴스를 추가하면 명함 하단에 슬라이드로 표시됩니다.</p>

          {newsItems.map((news, idx) => (
            <div key={idx} style={{ background:'#f8f9fa', border:'1px solid #e9ecef', borderRadius:12, padding:16, marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <span style={{ fontSize:12, fontWeight:700, color:'#495057' }}>카드 #{idx+1}</span>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#868e96', cursor:'pointer' }}>
                    <input type="checkbox" checked={news.is_visible} onChange={e => updateNews(idx,'is_visible',e.target.checked)} style={{ accentColor:'#4263eb' }} />
                    공개
                  </label>
                  <button type="button" onClick={() => removeNews(idx)} style={{ padding:'4px 10px', background:'#fff3f3', border:'1px solid #ffc9c9', borderRadius:6, color:'#c92a2a', cursor:'pointer', fontSize:12 }}>삭제</button>
                </div>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                <div style={{ flex:'1 1 calc(50% - 5px)', minWidth:0 }}>
                  <label style={{ ...L, fontSize:11 }}>카테고리</label>
                  <select style={{ ...I, padding:'9px 12px' }} value={news.category} onChange={e => updateNews(idx,'category',e.target.value)}>
                    {NEWS_CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div style={{ flex:'1 1 100%' }}>
                  <label style={{ ...L, fontSize:11 }}>제목 *</label>
                  <input style={{ ...I, padding:'9px 12px', fontSize:13 }} value={news.title} onChange={e => updateNews(idx,'title',e.target.value)} placeholder="제목을 입력하세요" />
                </div>
                <div style={{ flex:'1 1 100%' }}>
                  <label style={{ ...L, fontSize:11 }}>내용 요약</label>
                  <textarea style={{ ...I, resize:'none', padding:'9px 12px', fontSize:13 }} rows={2} value={news.summary} onChange={e => updateNews(idx,'summary',e.target.value)} placeholder="간단한 설명을 입력하세요" />
                </div>
                <div style={{ flex:'1 1 calc(50% - 5px)', minWidth:0 }}>
                  <label style={{ ...L, fontSize:11 }}>이미지 URL (선택)</label>
                  <input style={{ ...I, padding:'9px 12px', fontSize:13 }} value={news.image_url ?? ''} onChange={e => updateNews(idx,'image_url',e.target.value)} placeholder="https://..." />
                </div>
                <div style={{ flex:'1 1 calc(50% - 5px)', minWidth:0 }}>
                  <label style={{ ...L, fontSize:11 }}>링크 URL (선택)</label>
                  <input style={{ ...I, padding:'9px 12px', fontSize:13 }} value={news.link_url ?? ''} onChange={e => updateNews(idx,'link_url',e.target.value)} placeholder="https://..." />
                </div>
              </div>
            </div>
          ))}

          <button type="button" onClick={addNews} style={{ width:'100%', padding:'12px', background:'#f1f3f5', border:'1.5px dashed #ced4da', borderRadius:10, color:'#495057', fontSize:13, fontWeight:600, cursor:'pointer', marginTop:4 }}>
            + 카드뉴스 추가
          </button>
        </div>
      )}

      {/* ── 에러 + 저장 버튼 ── */}
      {error && (
        <div style={{ padding:'12px 16px', background:'#fff5f5', border:'1px solid #ffc9c9', borderRadius:10, color:'#c92a2a', fontSize:13 }}>
          {error}
        </div>
      )}

      <button onClick={handleSubmit} disabled={saving||saved} style={{ width:'100%', padding:'15px', background: saved ? 'linear-gradient(135deg,#2f9e44,#37b24d)' : 'linear-gradient(135deg,#4263eb,#3b5bdb)', color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:700, cursor: saving||saved?'not-allowed':'pointer', opacity:saving?0.7:1, boxShadow:'0 4px 16px rgba(66,99,235,0.3)' }}>
        {saving ? '저장 중...' : saved ? '✓ 저장 완료! 이동 중...' : mode==='create' ? '명함 생성하기' : '변경 사항 저장'}
      </button>
    </div>
  )
}
