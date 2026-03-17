'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface CardSummary {
  id: string
  slug: string
  name: string
  company_name: string
  template_key: string
  is_active: boolean
  created_at: string
}

export function CardList({ cards: initialCards }: { cards: CardSummary[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [cards, setCards] = useState(initialCards)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  async function handleToggle(id: string, current: boolean) {
    await supabase.from('business_cards').update({ is_active: !current }).eq('id', id)
    setCards(prev => prev.map(c => c.id === id ? { ...c, is_active: !current } : c))
  }

  async function handleDelete(id: string) {
    await supabase.from('business_cards').update({ is_active: false }).eq('id', id)
    setCards(prev => prev.filter(c => c.id !== id))
    setConfirmDeleteId(null)
    router.refresh()
  }

  const templateLabel: Record<string, string> = {
    'authentic-finance': '어센틱 금융그룹',
    'minimal-dark': '미니멀 다크',
  }

  if (cards.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', background: '#0d1520', border: '1px dashed #1e2d42', borderRadius: 20 }}>
        <p style={{ fontSize: 14, color: '#374151' }}>등록된 명함이 없습니다</p>
        <p style={{ fontSize: 12, color: '#1e2d42', marginTop: 4 }}>+ 새 명함 버튼으로 만들어보세요</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {cards.map(card => (
        <div key={card.id} style={{ background: '#0d1520', border: `1px solid ${confirmDeleteId === card.id ? 'rgba(239,68,68,0.3)' : '#1e2d42'}`, borderRadius: 16, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            {/* 정보 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: card.is_active ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)', color: card.is_active ? '#4ade80' : '#64748b', border: `1px solid ${card.is_active ? 'rgba(34,197,94,0.2)' : 'rgba(100,116,139,0.2)'}` }}>
                  {card.is_active ? '공개' : '비공개'}
                </span>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: '#0f1f35', color: '#3b82f6', border: '1px solid #1e3a5f' }}>
                  {templateLabel[card.template_key] ?? card.template_key}
                </span>
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.name}</p>
              <p style={{ fontSize: 12, color: '#4a5568', marginBottom: 4 }}>{card.company_name}</p>
              <p style={{ fontSize: 11, color: '#1e3a5f', fontFamily: 'monospace' }}>/{card.slug}</p>
            </div>

            {/* 버튼 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <a href={`/${card.slug}`} target="_blank" rel="noopener noreferrer" style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111827', borderRadius: 8, color: '#64748b', textDecoration: 'none', fontSize: 14 }} title="미리보기">🔗</a>
              <a href={`/admin/cards/${card.id}`} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111827', borderRadius: 8, color: '#64748b', textDecoration: 'none', fontSize: 14 }} title="수정">✏️</a>
              <button onClick={() => handleToggle(card.id, card.is_active)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111827', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }} title="공개/비공개">
                {card.is_active ? '🟢' : '⚫'}
              </button>
              <button onClick={() => confirmDeleteId === card.id ? handleDelete(card.id) : setConfirmDeleteId(card.id)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: confirmDeleteId === card.id ? 'rgba(239,68,68,0.1)' : '#111827', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }} title="삭제">🗑️</button>
            </div>
          </div>

          {confirmDeleteId === card.id && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 12, color: '#f87171' }}>한 번 더 누르면 비공개 처리됩니다.</p>
              <button onClick={() => setConfirmDeleteId(null)} style={{ fontSize: 12, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>취소</button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
