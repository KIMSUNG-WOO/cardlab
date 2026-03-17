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
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'60px 0', background:'#fff', border:'2px dashed #dee2e6', borderRadius:16 }}>
      <p style={{ fontSize:14, color:'#adb5bd', marginBottom:4 }}>등록된 명함이 없습니다</p>
      <p style={{ fontSize:12, color:'#dee2e6' }}>+ 새 명함 버튼으로 만들어보세요</p>
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      {cards.map(card => {
        const tpl = TEMPLATES[card.template_key]
        return (
          <div key={card.id} style={{ background:'#fff', border:`1.5px solid ${confirmId===card.id?'#ffc9c9':'#e9ecef'}`, borderRadius:14, padding:16, display:'flex', alignItems:'center', gap:12, transition:'border-color 0.15s' }}>

            {/* 템플릿 색상 닷 */}
            <div style={{ width:36, height:36, borderRadius:10, background:tpl?.preview??'#ccc', border:'2px solid #e9ecef', flexShrink:0 }} />

            {/* 정보 */}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, fontWeight:700, background:card.is_active?'#d3f9d8':'#f1f3f5', color:card.is_active?'#2f9e44':'#868e96', border:`1px solid ${card.is_active?'#8ce99a':'#dee2e6'}` }}>
                  {card.is_active?'공개':'비공개'}
                </span>
                <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:'#e7f0ff', color:'#4263eb', fontWeight:600 }}>
                  {tpl?.label??card.template_key}
                </span>
              </div>
              <p style={{ fontSize:15, fontWeight:700, color:'#212529', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{card.name}</p>
              <p style={{ fontSize:12, color:'#868e96', marginBottom:2 }}>{card.company_name}</p>
              <p style={{ fontSize:11, color:'#4263eb', fontFamily:'monospace' }}>cardlab.digital/{card.slug}</p>
            </div>

            {/* 액션 버튼 */}
            <div style={{ display:'flex', gap:6, flexShrink:0 }}>
              <a href={`/${card.slug}`} target="_blank" rel="noopener noreferrer"
                style={{ width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', background:'#f1f3f5', borderRadius:8, textDecoration:'none', fontSize:15, border:'1px solid #dee2e6' }} title="미리보기">🔗</a>
              <a href={`/admin/cards/${card.id}`}
                style={{ width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', background:'#f1f3f5', borderRadius:8, textDecoration:'none', fontSize:15, border:'1px solid #dee2e6' }} title="수정">✏️</a>
              <button onClick={()=>toggle(card.id,card.is_active)}
                style={{ width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', background:'#f1f3f5', border:'1px solid #dee2e6', borderRadius:8, cursor:'pointer', fontSize:15 }} title="공개/비공개">
                {card.is_active?'🟢':'⚫'}
              </button>
              <button onClick={()=>confirmId===card.id?del(card.id):setConfirmId(card.id)}
                style={{ width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', background:confirmId===card.id?'#fff3f3':'#f1f3f5', border:`1px solid ${confirmId===card.id?'#ffc9c9':'#dee2e6'}`, borderRadius:8, cursor:'pointer', fontSize:15 }} title="삭제">🗑️</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
