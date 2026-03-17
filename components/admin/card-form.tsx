'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TEMPLATE_LIST, DEFAULT_TEMPLATE, COLOR_RECOMMENDATIONS } from '@/lib/templates'
import { isValidSlug, nullToEmpty, generateId } from '@/lib/utils'
import type { BusinessCard, TemplateKey, LinkItem, LinkType, CardNews, AnimationType, CardDesignOptions, CustomColors } from '@/lib/types'
import { DEFAULT_DESIGN_OPTIONS } from '@/lib/types'
import { ImageUploader } from './image-uploader'

interface Props { mode: 'create'|'edit'; card?: BusinessCard; companies?: { id:string; name:string; logo_url:string|null }[] }

const LINK_OPTIONS: { type:LinkType; label:string; emoji:string }[] = [
  { type:'kakao',     label:'카카오 채널', emoji:'💛' },
  { type:'instagram', label:'인스타그램',  emoji:'📸' },
  { type:'youtube',   label:'유튜브',      emoji:'▶️' },
  { type:'blog',      label:'블로그',      emoji:'📝' },
  { type:'website',   label:'홈페이지',    emoji:'🌐' },
  { type:'consult',   label:'상담 예약',   emoji:'📅' },
  { type:'email',     label:'이메일',      emoji:'✉️' },
  { type:'naver',     label:'네이버',      emoji:'🟢' },
  { type:'extension', label:'회사 내선',   emoji:'📟' },
  { type:'fax',       label:'팩스',        emoji:'🖷' },
  { type:'custom',    label:'직접 입력',   emoji:'🔗' },
]

const ANIM_OPTIONS: { type:AnimationType; label:string; desc:string }[] = [
  { type:'zoom-out',   label:'줌아웃형',     desc:'사진 강조 후 자연스럽게 축소' },
  { type:'fade-in',    label:'페이드인형',   desc:'부드럽게 나타나는 효과' },
  { type:'slide-up',   label:'슬라이드업형', desc:'아래에서 위로 등장' },
  { type:'blur-reveal',label:'블러 해제형',  desc:'흐릿하다가 선명해지는 효과' },
  { type:'cinematic',  label:'시네마틱형',   desc:'영화 같은 고급스러운 연출' },
  { type:'minimal',    label:'미니멀형',     desc:'절제된 심플한 등장' },
  { type:'none',       label:'없음',         desc:'애니메이션 없이 바로 표시' },
]

const NEWS_CATS = [
  { value:'insurance', label:'보험' },
  { value:'finance',   label:'금융' },
  { value:'policy',    label:'정책변경' },
  { value:'news',      label:'뉴스' },
  { value:'notice',    label:'공지' },
]

const I: React.CSSProperties = { width:'100%', padding:'10px 14px', background:'#fff', border:'1.5px solid #dee2e6', borderRadius:8, color:'#212529', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }
const L: React.CSSProperties = { display:'block', fontSize:12, fontWeight:600, color:'#495057', marginBottom:6 }

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16, marginTop:4 }}>
      <div style={{ flex:1, height:1, background:'#e9ecef' }} />
      <p style={{ fontSize:11, fontWeight:700, color:'#adb5bd', letterSpacing:'0.1em', whiteSpace:'nowrap', margin:0 }}>{children}</p>
      <div style={{ flex:1, height:1, background:'#e9ecef' }} />
    </div>
  )
}

function Field({ label, required, hint, children }: { label:string; required?:boolean; hint?:string; children:React.ReactNode }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={L}>{label}{required && <span style={{ color:'#fa5252', marginLeft:2 }}>*</span>}</label>
      {children}
      {hint && <p style={{ fontSize:11, color:'#adb5bd', marginTop:4 }}>{hint}</p>}
    </div>
  )
}

// ── 실시간 미리보기 컴포넌트 ────────────────────────────────
function LivePreview({ f, extraLinks, design }: { f: any; extraLinks: LinkItem[]; design: CardDesignOptions }) {
  const tpl = TEMPLATE_LIST.find(t => t.key === f.template_key)
  const isLight = ['afg-light','clean-white','warm-white'].includes(f.template_key)
  const bg = tpl?.preview ?? '#0a0a0a'
  const textColor = isLight ? '#1a1a1a' : '#ffffff'
  const subColor = isLight ? '#666' : '#94a3b8'
  const cardBg = isLight ? '#ffffff' : 'rgba(255,255,255,0.08)'
  const borderColor = isLight ? '#e9ecef' : 'rgba(255,255,255,0.12)'

  return (
    <div style={{ background:'#f1f3f5', borderRadius:16, padding:12, position:'sticky', top:80 }}>
      <p style={{ fontSize:11, fontWeight:700, color:'#adb5bd', letterSpacing:'0.1em', marginBottom:10, textAlign:'center' }}>LIVE PREVIEW</p>
      {/* 폰 프레임 */}
      <div style={{ maxWidth:240, margin:'0 auto', background:'#222', borderRadius:32, padding:'8px 4px', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ background: bg, borderRadius:26, overflow:'hidden', minHeight:380 }}>
          {/* 히어로 */}
          <div style={{ height:140, background: f.template_key==='afg-dark'||f.template_key==='afg-light' ? `${bg}` : bg, position:'relative', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
            {f.profile_image_url ? (
              <img src={f.profile_image_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }} />
            ) : (
              <div style={{ fontSize:40 }}>👤</div>
            )}
            <div style={{ position:'absolute', inset:0, background:`linear-gradient(180deg,transparent 40%,${bg} 100%)` }} />
          </div>
          {/* 콘텐츠 */}
          <div style={{ padding:'8px 14px 14px' }}>
            {f.name && <p style={{ fontSize:15, fontWeight:700, color:textColor, marginBottom:2 }}>{f.name}</p>}
            {f.position && <p style={{ fontSize:10, color:subColor, marginBottom:8 }}>{f.position}{f.company_name && ` · ${f.company_name}`}</p>}
            {/* 메뉴 미니 그리드 */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:4, marginBottom:8 }}>
              {['📋','🔍','📊','💬'].map((icon,i) => (
                <div key={i} style={{ background:cardBg, border:`1px solid ${borderColor}`, borderRadius:8, padding:'6px 2px', textAlign:'center', fontSize:14 }}>{icon}</div>
              ))}
            </div>
            {/* CTA 미니 */}
            {f.phone && (
              <div style={{ height:28, background: tpl?.previewGradient ?? bg, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#fff', fontWeight:600 }}>
                📞 전화 문의하기
              </div>
            )}
          </div>
        </div>
      </div>
      {/* 템플릿 이름 */}
      <p style={{ fontSize:11, color:'#868e96', textAlign:'center', marginTop:8 }}>{tpl?.label ?? f.template_key}</p>
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
  const [showColorTip, setShowColorTip] = useState<string|null>(null)

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

  const [extraLinks, setExtraLinks] = useState<LinkItem[]>(
    Array.isArray(card?.extra_links) ? card.extra_links : []
  )

  const [design, setDesign] = useState<CardDesignOptions>({
    ...DEFAULT_DESIGN_OPTIONS,
    ...(card?.design_options ?? {}),
  })

  const [newsItems, setNewsItems] = useState<Omit<CardNews,'id'|'card_id'|'created_at'>[]>(
    (card?.card_news ?? []).map(n => ({
      title:n.title, summary:n.summary,
      image_url:n.image_url??'', link_url:n.link_url??'',
      category:n.category, sort_order:n.sort_order, is_visible:n.is_visible,
    }))
  )

  const set = (k: keyof typeof f) => (v: any) => setF(p => ({...p,[k]:v}))
  const setDes = (k: keyof CardDesignOptions) => (v: any) => setDesign(p => ({...p,[k]:v}))
  const setCustomColor = (k: keyof CustomColors) => (v: string) =>
    setDesign(p => ({ ...p, custom_colors: { ...(p.custom_colors ?? { bg:'#0a0a0a', hero_bg:'#080e18', accent:'#3b82f6', btn_primary:'#1e40af', text_name:'#ffffff', text_sub:'#94a3b8' }), [k]:v } }))

  function addLink(type: LinkType, label: string, emoji: string) {
    setExtraLinks(p => [...p, { id:generateId(), type, label, url:'', emoji }])
    setShowLinkPicker(false)
  }
  function updateLink(id:string, f:'label'|'url', v:string) { setExtraLinks(p=>p.map(l=>l.id===id?{...l,[f]:v}:l)) }
  function removeLink(id:string) { setExtraLinks(p=>p.filter(l=>l.id!==id)) }
  function addNews() { setNewsItems(p=>[...p,{ title:'',summary:'',image_url:'',link_url:'',category:'insurance',sort_order:p.length,is_visible:true }]) }
  function updateNews(idx:number,k:string,v:any) { setNewsItems(p=>p.map((n,i)=>i===idx?{...n,[k]:v}:n)) }
  function removeNews(idx:number) { setNewsItems(p=>p.filter((_,i)=>i!==idx)) }

  // 회사 선택 시 회사명/로고 자동 반영
  function handleCompanySelect(companyId: string) {
    const found = companies.find(c => c.id === companyId)
    if (found) {
      setF(p => ({ ...p, company_id: companyId, company_name: found.name }))
    } else {
      setF(p => ({ ...p, company_id: '', company_name: '' }))
    }
  }

  async function handleSubmit() {
    if (!f.slug)          return setError('URL 경로를 입력해주세요.')
    if (!isValidSlug(f.slug)) return setError('slug는 영문 소문자, 숫자, 하이픈(-)만 가능합니다.')
    if (!f.name)          return setError('이름을 입력해주세요.')
    if (!f.position)      return setError('직함을 입력해주세요.')
    if (!f.company_name)  return setError('회사명을 입력해주세요.')
    setError(''); setSaving(true)
    try {
      // 선택된 회사의 로고 URL 가져오기
      const selectedCompany = companies.find(c => c.id === f.company_id)
      const payload = {
        slug:         f.slug.toLowerCase().trim(),
        name:         f.name.trim(),
        english_name: f.english_name.trim()||null,
        position:     f.position.trim(),
        company_name: f.company_name.trim(),
        company_id:   f.company_id||null,
        company_logo_url: selectedCompany?.logo_url ?? null,
        team_name:    f.team_name.trim()||null,
        short_intro:  f.short_intro.trim()||null,
        phone:        f.phone.trim()||null,
        email:        f.email.trim()||null,
        address:      f.address.trim()||null,
        website_url:  f.website_url.trim()||null,
        inquiry_url:  f.inquiry_url.trim()||null,
        profile_image_url: f.profile_image_url.trim()||null,
        menu_insurance_claim_url: f.menu_insurance_claim_url.trim()||null,
        menu_check_insurance_url: f.menu_check_insurance_url.trim()||null,
        menu_analysis_url:        f.menu_analysis_url.trim()||null,
        menu_consult_url:         f.menu_consult_url.trim()||null,
        extra_links:  extraLinks.filter(l=>l.url.trim()),
        design_options: design,
        template_key: f.template_key,
        is_active:    f.is_active,
        updated_at:   new Date().toISOString(),
      }
      let cardId = card?.id
      if (mode==='create') {
        const {data:ex}=await supabase.from('business_cards').select('id').eq('slug',payload.slug).single()
        if(ex){setError(`/${payload.slug} slug는 이미 사용 중입니다.`);setSaving(false);return}
        const {data:nc,error:e}=await supabase.from('business_cards').insert(payload).select('id').single()
        if(e) throw e; cardId=nc.id
      } else {
        const {error:e}=await supabase.from('business_cards').update(payload).eq('id',card!.id)
        if(e) throw e
      }
      if(cardId) {
        await supabase.from('card_news').delete().eq('card_id',cardId)
        const np=newsItems.filter(n=>n.title.trim()).map((n,i)=>({card_id:cardId,...n,sort_order:i,image_url:n.image_url||null,link_url:n.link_url||null}))
        if(np.length>0) await supabase.from('card_news').insert(np)
      }
      setSaved(true)
      setTimeout(()=>{router.push('/admin/dashboard');router.refresh()},800)
    } catch(e:any){
      setError(e?.message??'저장 중 오류가 발생했습니다.')
    } finally { setSaving(false) }
  }

  const tabStyle=(active:boolean):React.CSSProperties=>({
    padding:'8px 14px',borderRadius:8,fontSize:12,fontWeight:active?700:500,
    color:active?'#4263eb':'#868e96',background:active?'#e7f0ff':'transparent',
    border:'none',cursor:'pointer',whiteSpace:'nowrap',
  })

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:24, alignItems:'start' }}>

      {/* ── 왼쪽: 편집 패널 ── */}
      <div>
        {/* 탭 */}
        <div style={{ display:'flex',gap:4,background:'#f1f3f5',padding:4,borderRadius:12,marginBottom:20,overflow:'auto' }}>
          {(['basic','links','design','anim','news'] as const).map(tab=>(
            <button key={tab} type="button" onClick={()=>setActiveTab(tab)} style={tabStyle(activeTab===tab)}>
              {({basic:'기본정보',links:'링크',design:'디자인',anim:'애니메이션',news:'카드뉴스'})[tab]}
            </button>
          ))}
        </div>

        {/* ══ 기본정보 탭 ══ */}
        {activeTab==='basic' && (
          <div className="admin-card">
            <SectionHeader>URL 경로</SectionHeader>
            <Field label="Slug" required hint={`cardlab.digital/${f.slug||'slug'}`}>
              <input className="admin-input" style={{...I,opacity:mode==='edit'?0.6:1}} value={f.slug} onChange={e=>set('slug')(e.target.value)} placeholder="영문 소문자·숫자·하이픈만" disabled={mode==='edit'} />
            </Field>

            <SectionHeader>이름·직함</SectionHeader>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <Field label="이름" required><input className="admin-input" style={I} value={f.name} onChange={e=>set('name')(e.target.value)} /></Field>
              <Field label="영문명"><input className="admin-input" style={I} value={f.english_name} onChange={e=>set('english_name')(e.target.value)} /></Field>
              <Field label="직함" required><input className="admin-input" style={I} value={f.position} onChange={e=>set('position')(e.target.value)} /></Field>
              <Field label="팀·브랜치명"><input className="admin-input" style={I} value={f.team_name} onChange={e=>set('team_name')(e.target.value)} /></Field>
            </div>

            <SectionHeader>회사</SectionHeader>
            {companies.length > 0 && (
              <Field label="회사 선택 (등록된 회사)">
                <select className="admin-input" style={{...I}} value={f.company_id} onChange={e=>handleCompanySelect(e.target.value)}>
                  <option value="">직접 입력</option>
                  {companies.map(c=>(
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </Field>
            )}
            <Field label="회사명" required><input className="admin-input" style={I} value={f.company_name} onChange={e=>set('company_name')(e.target.value)} /></Field>
            <Field label="한 줄 소개">
              <textarea className="admin-input" style={{...I,resize:'none'}} rows={2} value={f.short_intro} onChange={e=>set('short_intro')(e.target.value)} />
            </Field>

            <SectionHeader>프로필 사진</SectionHeader>
            <ImageUploader value={f.profile_image_url} onChange={set('profile_image_url')} cardSlug={f.slug||'card'} />
            <div style={{marginTop:10}}>
              <label style={L}>또는 이미지 URL 직접 입력</label>
              <input className="admin-input" style={I} value={f.profile_image_url} onChange={e=>set('profile_image_url')(e.target.value)} placeholder="https://..." />
            </div>

            <SectionHeader>메뉴 항목 URL</SectionHeader>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <Field label="📋 보험금청구"><input className="admin-input" style={I} value={f.menu_insurance_claim_url} onChange={e=>set('menu_insurance_claim_url')(e.target.value)} placeholder="https://..." /></Field>
              <Field label="🔍 내보험조회"><input className="admin-input" style={I} value={f.menu_check_insurance_url} onChange={e=>set('menu_check_insurance_url')(e.target.value)} placeholder="https://..." /></Field>
              <Field label="📊 보장분석"><input className="admin-input" style={I} value={f.menu_analysis_url} onChange={e=>set('menu_analysis_url')(e.target.value)} placeholder="https://..." /></Field>
              <Field label="💬 상담신청"><input className="admin-input" style={I} value={f.menu_consult_url} onChange={e=>set('menu_consult_url')(e.target.value)} placeholder="https://..." /></Field>
            </div>

            <SectionHeader>공개 설정</SectionHeader>
            <label style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px',background:'#f8f9fa',border:'1.5px solid #e9ecef',borderRadius:10,cursor:'pointer'}}>
              <div>
                <p style={{fontSize:13,fontWeight:600,color:'#212529',margin:0}}>명함 공개</p>
                <p style={{fontSize:11,color:'#adb5bd',margin:'3px 0 0'}}>비공개 시 URL이 404 처리됩니다</p>
              </div>
              <div onClick={()=>set('is_active')(!f.is_active)} style={{width:48,height:26,borderRadius:13,background:f.is_active?'#4263eb':'#dee2e6',position:'relative',cursor:'pointer',transition:'background 0.2s',flexShrink:0}}>
                <div style={{position:'absolute',top:3,width:20,height:20,borderRadius:'50%',background:'#fff',transform:f.is_active?'translateX(25px)':'translateX(3px)',transition:'transform 0.2s',boxShadow:'0 1px 4px rgba(0,0,0,0.2)'}} />
              </div>
            </label>
          </div>
        )}

        {/* ══ 링크 탭 ══ */}
        {activeTab==='links' && (
          <div className="admin-card">
            <SectionHeader>기본 연락처</SectionHeader>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <Field label="휴대폰"><input className="admin-input" style={I} value={f.phone} onChange={e=>set('phone')(e.target.value)} /></Field>
              <Field label="이메일"><input className="admin-input" style={I} value={f.email} onChange={e=>set('email')(e.target.value)} /></Field>
            </div>
            <Field label="주소"><input className="admin-input" style={I} value={f.address} onChange={e=>set('address')(e.target.value)} /></Field>
            <Field label="웹사이트"><input className="admin-input" style={I} value={f.website_url} onChange={e=>set('website_url')(e.target.value)} placeholder="https://..." /></Field>
            <Field label="온라인 문의 URL"><input className="admin-input" style={I} value={f.inquiry_url} onChange={e=>set('inquiry_url')(e.target.value)} placeholder="https://..." /></Field>

            <SectionHeader>추가 링크 버튼</SectionHeader>
            <p style={{fontSize:12,color:'#adb5bd',marginBottom:12}}>필요한 항목만 선택해서 추가하세요. 명함에 버튼으로 표시됩니다.</p>

            {extraLinks.map(link=>(
              <div key={link.id} style={{display:'flex',gap:8,alignItems:'center',marginBottom:8,background:'#f8f9fa',border:'1px solid #e9ecef',borderRadius:10,padding:'10px 12px'}}>
                <span style={{fontSize:18,flexShrink:0}}>{link.emoji}</span>
                <div style={{flex:1,display:'flex',gap:8,minWidth:0}}>
                  <input style={{...I,flex:'0 0 90px',padding:'7px 10px',fontSize:12}} value={link.label} onChange={e=>updateLink(link.id,'label',e.target.value)} placeholder="버튼명" />
                  <input style={{...I,flex:1,padding:'7px 10px',fontSize:12}} value={link.url} onChange={e=>updateLink(link.id,'url',e.target.value)} placeholder={link.type==='email'?'name@email.com':link.type==='extension'||link.type==='fax'?'전화번호':'https://...'} />
                </div>
                <button type="button" onClick={()=>removeLink(link.id)} style={{width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',background:'#fff3f3',border:'1px solid #ffc9c9',borderRadius:6,color:'#c92a2a',cursor:'pointer',fontSize:14,flexShrink:0}}>✕</button>
              </div>
            ))}

            <div style={{position:'relative'}}>
              <button type="button" onClick={()=>setShowLinkPicker(v=>!v)} style={{width:'100%',padding:'10px',background:'#f1f3f5',border:'1.5px dashed #ced4da',borderRadius:10,color:'#495057',fontSize:13,fontWeight:600,cursor:'pointer'}}>
                + 링크 버튼 추가
              </button>
              {showLinkPicker && (
                <div style={{position:'absolute',top:'calc(100% + 8px)',left:0,right:0,background:'#fff',border:'1px solid #dee2e6',borderRadius:14,padding:14,zIndex:50,boxShadow:'0 8px 32px rgba(0,0,0,0.12)'}}>
                  <p style={{fontSize:11,color:'#adb5bd',marginBottom:10,fontWeight:700,letterSpacing:'0.08em'}}>추가할 항목 선택</p>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
                    {LINK_OPTIONS.map(opt=>(
                      <button key={opt.type} type="button" onClick={()=>addLink(opt.type,opt.label,opt.emoji)} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,padding:'10px 4px',background:'#f8f9fa',border:'1px solid #e9ecef',borderRadius:10,cursor:'pointer',fontSize:11,color:'#495057',fontWeight:600}}>
                        <span style={{fontSize:20}}>{opt.emoji}</span>{opt.label}
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={()=>setShowLinkPicker(false)} style={{width:'100%',marginTop:10,padding:'7px',background:'none',border:'none',color:'#adb5bd',fontSize:12,cursor:'pointer'}}>닫기</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ 디자인 탭 ══ */}
        {activeTab==='design' && (
          <div className="admin-card">
            <SectionHeader>템플릿 선택</SectionHeader>
            <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
              {TEMPLATE_LIST.map(t=>(
                <label key={t.key} style={{display:'flex',alignItems:'center',gap:14,padding:'12px 16px',background:f.template_key===t.key?'#e7f0ff':'#f8f9fa',border:`1.5px solid ${f.template_key===t.key?'#4263eb':'#e9ecef'}`,borderRadius:12,cursor:'pointer',transition:'all 0.15s'}}>
                  <input type="radio" name="template" value={t.key} checked={f.template_key===t.key} onChange={()=>set('template_key')(t.key as TemplateKey)} style={{accentColor:'#4263eb',width:16,height:16}} />
                  <div style={{width:28,height:28,borderRadius:'50%',background:t.previewGradient??t.preview,border:'2px solid #dee2e6',flexShrink:0,boxShadow:'0 2px 8px rgba(0,0,0,0.15)'}} />
                  <div>
                    <p style={{fontSize:13,fontWeight:700,color:'#212529',margin:0}}>{t.label}</p>
                    <p style={{fontSize:11,color:'#868e96',margin:'2px 0 0'}}>{t.description}</p>
                  </div>
                  {f.template_key===t.key && <span style={{marginLeft:'auto',color:'#4263eb',fontSize:16}}>✓</span>}
                </label>
              ))}
            </div>

            <SectionHeader>커스텀 색상 (선택)</SectionHeader>
            <p style={{fontSize:12,color:'#adb5bd',marginBottom:12}}>템플릿 색상을 직접 커스터마이징합니다. 비워두면 템플릿 기본값 사용.</p>
            <label style={{display:'flex',alignItems:'center',gap:10,marginBottom:14,cursor:'pointer'}}>
              <input type="checkbox" checked={!!design.custom_colors} onChange={e=>setDesign(p=>({...p,custom_colors:e.target.checked?{bg:'#0a0a0a',hero_bg:'#080e18',accent:'#3b82f6',btn_primary:'#1e40af',text_name:'#ffffff',text_sub:'#94a3b8'}:null}))} style={{accentColor:'#4263eb',width:16,height:16}} />
              <span style={{fontSize:13,color:'#495057',fontWeight:600}}>커스텀 색상 사용</span>
            </label>
            {design.custom_colors && (
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                {([
                  ['bg','페이지 배경'],['hero_bg','히어로 배경'],
                  ['accent','강조 색상'],['btn_primary','버튼 색상'],
                  ['text_name','이름 색상'],['text_sub','부제 색상'],
                ] as [keyof CustomColors,string][]).map(([key,label])=>(
                  <div key={key}>
                    <label style={{...L,fontSize:11}}>{label}</label>
                    <div style={{display:'flex',gap:6,alignItems:'center'}}>
                      <input type="color" value={(design.custom_colors as any)?.[key]??'#000000'} onChange={e=>{setCustomColor(key)(e.target.value);setShowColorTip((design.custom_colors as any)?.[key])}} style={{width:36,height:36,border:'none',borderRadius:6,cursor:'pointer',background:'none'}} />
                      <input style={{...I,flex:1,padding:'6px 10px',fontSize:12,fontFamily:'monospace'}} value={(design.custom_colors as any)?.[key]??''} onChange={e=>setCustomColor(key)(e.target.value)} placeholder="#000000" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <SectionHeader>버튼 스타일</SectionHeader>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div>
                <label style={L}>버튼 모양 (코너)</label>
                <select className="admin-input" style={{...I}} value={design.btn_radius} onChange={e=>setDes('btn_radius')(e.target.value)}>
                  {[['none','직각'],['sm','약간 둥글게'],['md','보통'],['lg','많이 둥글게'],['full','완전 원형']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={L}>버튼 크기</label>
                <select className="admin-input" style={{...I}} value={design.btn_size} onChange={e=>setDes('btn_size')(e.target.value)}>
                  {[['sm','작게'],['md','보통'],['lg','크게']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>

            <SectionHeader>아이콘 · 텍스트 설정</SectionHeader>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
              <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13,color:'#495057',fontWeight:600}}>
                <input type="checkbox" checked={design.show_icon} onChange={e=>setDes('show_icon')(e.target.checked)} style={{accentColor:'#4263eb',width:15,height:15}} />
                아이콘 표시
              </label>
              <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13,color:'#495057',fontWeight:600}}>
                <input type="checkbox" checked={design.show_text} onChange={e=>setDes('show_text')(e.target.checked)} style={{accentColor:'#4263eb',width:15,height:15}} />
                텍스트 표시
              </label>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div>
                <label style={L}>아이콘 크기</label>
                <select className="admin-input" style={{...I}} value={design.icon_size} onChange={e=>setDes('icon_size')(e.target.value)}>
                  {[['sm','작게'],['md','보통'],['lg','크게']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={L}>글씨 크기</label>
                <select className="admin-input" style={{...I}} value={design.font_size} onChange={e=>setDes('font_size')(e.target.value)}>
                  {[['sm','작게'],['md','보통'],['lg','크게']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ══ 애니메이션 탭 ══ */}
        {activeTab==='anim' && (
          <div className="admin-card">
            <SectionHeader>애니메이션 설정</SectionHeader>
            <label style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px',background:'#f8f9fa',border:'1.5px solid #e9ecef',borderRadius:10,cursor:'pointer',marginBottom:16}}>
              <div>
                <p style={{fontSize:13,fontWeight:600,color:'#212529',margin:0}}>애니메이션 ON/OFF</p>
                <p style={{fontSize:11,color:'#adb5bd',margin:'3px 0 0'}}>끄면 명함이 바로 표시됩니다</p>
              </div>
              <div onClick={()=>setDes('animation_on')(!design.animation_on)} style={{width:48,height:26,borderRadius:13,background:design.animation_on?'#4263eb':'#dee2e6',position:'relative',cursor:'pointer',transition:'background 0.2s',flexShrink:0}}>
                <div style={{position:'absolute',top:3,width:20,height:20,borderRadius:'50%',background:'#fff',transform:design.animation_on?'translateX(25px)':'translateX(3px)',transition:'transform 0.2s',boxShadow:'0 1px 4px rgba(0,0,0,0.2)'}} />
              </div>
            </label>

            {design.animation_on && (
              <>
                <p style={{fontSize:12,fontWeight:600,color:'#495057',marginBottom:10}}>애니메이션 종류 선택</p>
                <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:16}}>
                  {ANIM_OPTIONS.map(opt=>(
                    <label key={opt.type} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:design.animation_type===opt.type?'#e7f0ff':'#f8f9fa',border:`1.5px solid ${design.animation_type===opt.type?'#4263eb':'#e9ecef'}`,borderRadius:10,cursor:'pointer'}}>
                      <input type="radio" name="anim" value={opt.type} checked={design.animation_type===opt.type} onChange={()=>setDes('animation_type')(opt.type as AnimationType)} style={{accentColor:'#4263eb',width:15,height:15}} />
                      <div>
                        <p style={{fontSize:13,fontWeight:600,color:'#212529',margin:0}}>{opt.label}</p>
                        <p style={{fontSize:11,color:'#868e96',margin:'2px 0 0'}}>{opt.desc}</p>
                      </div>
                      {design.animation_type===opt.type && <span style={{marginLeft:'auto',color:'#4263eb'}}>✓</span>}
                    </label>
                  ))}
                </div>

                <p style={{fontSize:12,fontWeight:600,color:'#495057',marginBottom:10}}>애니메이션 속도</p>
                <div style={{display:'flex',gap:8}}>
                  {[['slow','느리게'],['normal','보통'],['fast','빠르게']].map(([v,l])=>(
                    <button key={v} type="button" onClick={()=>setDes('animation_speed')(v)} style={{flex:1,padding:'10px',border:`1.5px solid ${design.animation_speed===v?'#4263eb':'#dee2e6'}`,background:design.animation_speed===v?'#e7f0ff':'#fff',borderRadius:8,fontSize:12,cursor:'pointer',fontWeight:design.animation_speed===v?700:400,color:design.animation_speed===v?'#4263eb':'#495057'}}>
                      {l}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ══ 카드뉴스 탭 ══ */}
        {activeTab==='news' && (
          <div className="admin-card">
            <SectionHeader>카드뉴스 / 콘텐츠</SectionHeader>
            <p style={{fontSize:12,color:'#adb5bd',marginBottom:16}}>보험·금융 관련 카드뉴스를 추가하면 명함 하단에 슬라이드로 표시됩니다.</p>
            {newsItems.map((news,idx)=>(
              <div key={idx} style={{background:'#f8f9fa',border:'1px solid #e9ecef',borderRadius:12,padding:14,marginBottom:10}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                  <span style={{fontSize:12,fontWeight:700,color:'#495057'}}>카드 #{idx+1}</span>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <label style={{display:'flex',alignItems:'center',gap:5,fontSize:12,color:'#868e96',cursor:'pointer'}}>
                      <input type="checkbox" checked={news.is_visible} onChange={e=>updateNews(idx,'is_visible',e.target.checked)} style={{accentColor:'#4263eb'}} />공개
                    </label>
                    <button type="button" onClick={()=>removeNews(idx)} style={{padding:'4px 10px',background:'#fff3f3',border:'1px solid #ffc9c9',borderRadius:6,color:'#c92a2a',cursor:'pointer',fontSize:12}}>삭제</button>
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  <div style={{gridColumn:'1/-1'}}>
                    <label style={{...L,fontSize:11}}>카테고리</label>
                    <select style={{...I,padding:'8px 12px'}} value={news.category} onChange={e=>updateNews(idx,'category',e.target.value)}>
                      {NEWS_CATS.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div style={{gridColumn:'1/-1'}}>
                    <label style={{...L,fontSize:11}}>제목 *</label>
                    <input style={{...I,padding:'8px 12px',fontSize:13}} value={news.title} onChange={e=>updateNews(idx,'title',e.target.value)} placeholder="제목 입력" />
                  </div>
                  <div style={{gridColumn:'1/-1'}}>
                    <label style={{...L,fontSize:11}}>요약</label>
                    <textarea style={{...I,resize:'none',padding:'8px 12px',fontSize:13}} rows={2} value={news.summary} onChange={e=>updateNews(idx,'summary',e.target.value)} placeholder="간단한 설명" />
                  </div>
                  <div>
                    <label style={{...L,fontSize:11}}>이미지 URL</label>
                    <input style={{...I,padding:'8px 12px',fontSize:12}} value={news.image_url??''} onChange={e=>updateNews(idx,'image_url',e.target.value)} placeholder="https://..." />
                  </div>
                  <div>
                    <label style={{...L,fontSize:11}}>링크 URL</label>
                    <input style={{...I,padding:'8px 12px',fontSize:12}} value={news.link_url??''} onChange={e=>updateNews(idx,'link_url',e.target.value)} placeholder="https://..." />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={addNews} style={{width:'100%',padding:'12px',background:'#f1f3f5',border:'1.5px dashed #ced4da',borderRadius:10,color:'#495057',fontSize:13,fontWeight:600,cursor:'pointer'}}>
              + 카드뉴스 추가
            </button>
          </div>
        )}

        {/* 에러 + 저장 */}
        {error && <div style={{marginTop:16,padding:'12px 16px',background:'#fff5f5',border:'1px solid #ffc9c9',borderRadius:10,color:'#c92a2a',fontSize:13}}>{error}</div>}
        <button onClick={handleSubmit} disabled={saving||saved} style={{width:'100%',marginTop:16,padding:'15px',background:saved?'linear-gradient(135deg,#2f9e44,#37b24d)':'linear-gradient(135deg,#4263eb,#3b5bdb)',color:'#fff',border:'none',borderRadius:12,fontSize:15,fontWeight:700,cursor:saving||saved?'not-allowed':'pointer',opacity:saving?0.7:1,boxShadow:'0 4px 16px rgba(66,99,235,0.3)'}}>
          {saving?'저장 중...':saved?'✓ 저장 완료!':mode==='create'?'명함 생성하기':'변경 사항 저장'}
        </button>
      </div>

      {/* ── 오른쪽: 실시간 미리보기 ── */}
      <div>
        <LivePreview f={f} extraLinks={extraLinks} design={design} />
      </div>
    </div>
  )
}
