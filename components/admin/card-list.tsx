'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TEMPLATES } from '@/lib/templates'
import type { TemplateKey } from '@/lib/types'

interface Card { id:string; slug:string; name:string; company_name:string; template_key:TemplateKey; is_active:boolean; created_at:string }

export function CardList({ cards: init }: { cards: Card[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [cards, setCards] = useState(init)
  const [confirmId, setConfirmId] = useState<string|null>(null)

  async function toggle(id:string, cur:boolean) {
    await supabase.from('business_cards').update({ is_active:!cur }).eq('id',id)
    setCards(p => p.map(c => c.id===id ? {...c,is_active:!cur} : c))
  }
  async function del(id:string) {
    await supabase.from('business_cards').update({ is_active:false }).eq('id',id)
    setCards(p => p.filter(c => c.id!==id))
    setConfirmId(null); router.refresh()
  }

  if (!cards.length) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'80px 0', background:'#0d1520', border:'1px dashed #1e2d42', borderRadius:20 }}>
      <p style={{ fontSize:14, color:'#374151' }}>등록된 명함이 없습니다</p>
      <p style={{ fontSize:12, color:'#1e2d42', marginTop:4 }}>+ 새 명함 버튼으로 만들어보세요</p>
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      {cards.map(card => {
        const tpl = TEMPLATES[card.template_key]
        return (
          <div key={card.id} style={{ background:'#0d1520', border:`1px solid ${confirmId===card.id?'rgba(239,68,68,0.3)':'#1e2d42'}`, borderRadius:16, padding:16 }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', gap:6, marginBottom:6 }}>
                  <span style={{ fontSize:11, padding:'2px 8px', borderRadius:6, background: card.is_active?'rgba(34,197,94,0.1)':'rgba(100,116,139,0.1)', color: card.is_active?'#4ade80':'#64748b', border:`1px solid ${card.is_active?'rgba(34,197,94,0.2)':'rgba(100,116,139,0.2)'}` }}>{card.is_active?'공개':'비공개'}</span>
                  <span style={{ fontSize:11, padding:'2px 8px', borderRadius:6, background:'#0f1f35', color:'#3b82f6', border:'1px solid #1e3a5f' }}>
                    <span style={{ display:'inline-block', width:8, height:8, borderRadius:'50%', background:tpl?.preview??'#333', marginRight:4, verticalAlign:'middle' }}/>
                    {tpl?.label??card.template_key}
                  </span>
                </div>
                <p style={{ fontSize:14, fontWeight:600, color:'#e2e8f0', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{card.name}</p>
                <p style={{ fontSize:12, color:'#4a5568', marginBottom:4 }}>{card.company_name}</p>
                <p style={{ fontSize:11, color:'#1e3a5f', fontFamily:'monospace' }}>/{card.slug}</p>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <a href={`/${card.slug}`} target="_blank" rel="noopener noreferrer" style={{ width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', background:'#111827', borderRadius:8, textDecoration:'none', fontSize:14 }} title="미리보기">🔗</a>
                <a href={`/admin/cards/${card.id}`} style={{ width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', background:'#111827', borderRadius:8, textDecoration:'none', fontSize:14 }} title="수정">✏️</a>
                <button onClick={()=>toggle(card.id,card.is_active)} style={{ width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', background:'#111827', border:'none', borderRadius:8, cursor:'pointer', fontSize:14 }} title="공개/비공개">{card.is_active?'🟢':'⚫'}</button>
                <button onClick={()=>confirmId===card.id?del(card.id):setConfirmId(card.id)} style={{ width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', background: confirmId===card.id?'rgba(239,68,68,0.1)':'#111827', border:'none', borderRadius:8, cursor:'pointer', fontSize:14 }} title="삭제">🗑️</button>
              </div>
            </div>
            {confirmId===card.id && (
              <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid rgba(239,68,68,0.15)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <p style={{ fontSize:12, color:'#f87171' }}>한 번 더 누르면 비공개 처리됩니다.</p>
                <button onClick={()=>setConfirmId(null)} style={{ fontSize:12, color:'#64748b', background:'none', border:'none', cursor:'pointer' }}>취소</button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
