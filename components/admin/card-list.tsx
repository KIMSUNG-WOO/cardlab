'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TEMPLATES } from '@/lib/templates'
import type { TemplateKey } from '@/lib/types'

interface Card { id:string; slug:string; name:string; company_name:string; template_key:TemplateKey; is_active:boolean; created_at:string }
const ADMIN_PW = '9004okok!!'

export function CardList({ cards: init }: { cards: Card[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [cards, setCards] = useState(init)
  const [step, setStep] = useState<'none'|'confirm'|'pw'>('none')
  const [targetId, setTargetId] = useState<string|null>(null)
  const [pw, setPw] = useState('')
  const [pwErr, setPwErr] = useState('')
  const [deleting, setDeleting] = useState(false)

  async function toggle(id: string, cur: boolean) {
    await supabase.from('business_cards').update({ is_active: !cur }).eq('id', id)
    setCards(p => p.map(c => c.id === id ? { ...c, is_active: !cur } : c))
  }

  function startDel(id: string) { setTargetId(id); setStep('confirm'); setPw(''); setPwErr('') }
  function cancel() { setStep('none'); setTargetId(null); setPw(''); setPwErr('') }

  async function doDelete() {
    if (pw !== ADMIN_PW) { setPwErr('비밀번호가 올바르지 않습니다.'); return }
    if (!targetId) return
    setDeleting(true)
    try {
      await supabase.from('card_news').delete().eq('card_id', targetId)
      const { error } = await supabase.from('business_cards').delete().eq('id', targetId)
      if (error) throw error
      setCards(p => p.filter(c => c.id !== targetId))
      cancel(); router.refresh()
    } catch (e: any) { setPwErr('삭제 실패: ' + (e?.message ?? '오류')) }
    finally { setDeleting(false) }
  }

  const B: React.CSSProperties = {
    padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
    cursor: 'pointer', border: '1px solid #dee2e6', background: '#f8f9fa',
    color: '#495057', whiteSpace: 'nowrap'
  }

  if (!cards.length) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'60px 0', background:'#fff', border:'2px dashed #dee2e6', borderRadius:16 }}>
      <p style={{ fontSize:14, color:'#adb5bd', marginBottom:4 }}>등록된 명함이 없습니다</p>
      <p style={{ fontSize:12, color:'#dee2e6' }}>+ 새 명함 버튼으로 만들어보세요</p>
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      {/* 삭제 모달 */}
      {step !== 'none' && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ background:'#fff', borderRadius:18, padding:28, maxWidth:360, width:'100%', boxShadow:'0 24px 60px rgba(0,0,0,0.25)' }}>
            {step === 'confirm' ? (
              <>
                <div style={{ fontSize:40, textAlign:'center', marginBottom:12 }}>🗑️</div>
                <h3 style={{ fontSize:17, fontWeight:700, color:'#212529', textAlign:'center', marginBottom:8 }}>명함을 삭제하시겠습니까?</h3>
                <p style={{ fontSize:13, color:'#868e96', textAlign:'center', marginBottom:24, lineHeight:1.6 }}>
                  삭제된 명함은 복구할 수 없습니다.<br/>관련 카드뉴스도 함께 삭제됩니다.
                </p>
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={cancel} style={{ flex:1, padding:'12px', background:'#f1f3f5', border:'1px solid #dee2e6', borderRadius:10, fontSize:14, cursor:'pointer', color:'#495057', fontWeight:600 }}>취소</button>
                  <button onClick={() => setStep('pw')} style={{ flex:1, padding:'12px', background:'#e03131', border:'none', borderRadius:10, fontSize:14, cursor:'pointer', color:'#fff', fontWeight:700 }}>예, 삭제합니다</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize:40, textAlign:'center', marginBottom:12 }}>🔐</div>
                <h3 style={{ fontSize:17, fontWeight:700, color:'#212529', textAlign:'center', marginBottom:8 }}>관리자 비밀번호 확인</h3>
                <p style={{ fontSize:13, color:'#868e96', textAlign:'center', marginBottom:20 }}>삭제를 위해 비밀번호를 입력해주세요.</p>
                <input
                  type="password" value={pw}
                  onChange={e => { setPw(e.target.value); setPwErr('') }}
                  onKeyDown={e => e.key === 'Enter' && doDelete()}
                  placeholder="관리자 비밀번호" autoFocus
                  style={{ width:'100%', padding:'12px 14px', border:`1.5px solid ${pwErr?'#f03e3e':'#dee2e6'}`, borderRadius:10, fontSize:14, outline:'none', boxSizing:'border-box', marginBottom:8 }}
                />
                {pwErr && <p style={{ fontSize:12, color:'#f03e3e', marginBottom:10 }}>{pwErr}</p>}
                <div style={{ display:'flex', gap:10, marginTop:6 }}>
                  <button onClick={cancel} style={{ flex:1, padding:'12px', background:'#f1f3f5', border:'1px solid #dee2e6', borderRadius:10, fontSize:14, cursor:'pointer', color:'#495057', fontWeight:600 }}>취소</button>
                  <button onClick={doDelete} disabled={deleting} style={{ flex:1, padding:'12px', background:deleting?'#adb5bd':'#e03131', border:'none', borderRadius:10, fontSize:14, cursor:deleting?'not-allowed':'pointer', color:'#fff', fontWeight:700 }}>
                    {deleting ? '삭제 중...' : '삭제 확인'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {cards.map(card => {
        const tpl = TEMPLATES[card.template_key]
        return (
          <div key={card.id} style={{ background:'#fff', border:'1.5px solid #e9ecef', borderRadius:14, padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:tpl?.previewGradient??tpl?.preview??'#ccc', flexShrink:0, border:'2px solid #e9ecef' }} />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', gap:6, marginBottom:4 }}>
                <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, fontWeight:700, background:card.is_active?'#d3f9d8':'#f1f3f5', color:card.is_active?'#2f9e44':'#868e96', border:`1px solid ${card.is_active?'#8ce99a':'#dee2e6'}` }}>
                  {card.is_active ? '공개' : '비공개'}
                </span>
                <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:'#e7f0ff', color:'#4263eb', fontWeight:600 }}>
                  {tpl?.label ?? card.template_key}
                </span>
              </div>
              <p style={{ fontSize:15, fontWeight:700, color:'#212529', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{card.name}</p>
              <p style={{ fontSize:11, color:'#4263eb', fontFamily:'monospace' }}>cardlab.digital/{card.slug}</p>
            </div>
            {/* 텍스트 버튼들 */}
            <div style={{ display:'flex', gap:6, flexShrink:0, flexWrap:'wrap', justifyContent:'flex-end' }}>
              <a href={`/${card.slug}`} target="_blank" rel="noopener noreferrer"
                style={{ ...B, textDecoration:'none', display:'inline-flex', alignItems:'center' }}>
                미리보기
              </a>
              <a href={`/admin/cards/${card.id}`}
                style={{ ...B, textDecoration:'none', display:'inline-flex', alignItems:'center', background:'#e7f0ff', color:'#4263eb', borderColor:'#bac8ff' }}>
                수정
              </a>
              <button onClick={() => toggle(card.id, card.is_active)}
                style={{ ...B, background:card.is_active?'#fff9db':'#d3f9d8', color:card.is_active?'#e67700':'#2f9e44', borderColor:card.is_active?'#ffd43b':'#8ce99a' }}>
                {card.is_active ? '비활성화' : '활성화'}
              </button>
              <button onClick={() => startDel(card.id)}
                style={{ ...B, background:'#fff3f3', color:'#c92a2a', borderColor:'#ffc9c9' }}>
                삭제
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
