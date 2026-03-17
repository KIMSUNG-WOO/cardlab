'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TEMPLATES } from '@/lib/templates'
import type { TemplateKey } from '@/lib/types'
import {
  ExternalLink,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from 'lucide-react'

interface CardSummary {
  id: string
  slug: string
  name: string
  company_name: string
  template_key: TemplateKey
  is_active: boolean
  created_at: string
}

interface Props {
  cards: CardSummary[]
}

export function CardList({ cards: initialCards }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [cards, setCards] = useState(initialCards)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // ── 활성/비활성 토글 ──────────────────────────────────
  async function handleToggle(id: string, current: boolean) {
    setTogglingId(id)
    const { error } = await supabase
      .from('business_cards')
      .update({ is_active: !current, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (!error) {
      setCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_active: !current } : c))
      )
    }
    setTogglingId(null)
  }

  // ── 삭제 (soft delete: is_active=false + deleted_at 기록) ──
  async function handleDelete(id: string) {
    setDeletingId(id)
    // soft delete: deleted_at 컬럼 사용 (스키마에 포함됨)
    const { error } = await supabase
      .from('business_cards')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (!error) {
      // UI에서 즉시 제거
      setCards((prev) => prev.filter((c) => c.id !== id))
    }
    setDeletingId(null)
    setConfirmDeleteId(null)
    router.refresh()
  }

  if (cards.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 rounded-2xl"
        style={{ background: '#0d1520', border: '1px dashed #1e2d42' }}
      >
        <p className="text-sm mb-1" style={{ color: '#374151' }}>
          등록된 명함이 없습니다
        </p>
        <p className="text-xs" style={{ color: '#1e2d42' }}>
          + 새 명함 버튼으로 첫 명함을 만들어보세요
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {cards.map((card) => {
          const template = TEMPLATES[card.template_key]
          const isDeleting = deletingId === card.id
          const isToggling = togglingId === card.id

          return (
            <div
              key={card.id}
              className="rounded-2xl p-4 transition-all"
              style={{
                background: '#0d1520',
                border: `1px solid ${confirmDeleteId === card.id ? 'rgba(239,68,68,0.3)' : '#1e2d42'}`,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                {/* 좌측 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
                      style={{
                        background: card.is_active
                          ? 'rgba(34,197,94,0.1)'
                          : 'rgba(100,116,139,0.1)',
                        color: card.is_active ? '#4ade80' : '#64748b',
                        border: `1px solid ${card.is_active ? 'rgba(34,197,94,0.2)' : 'rgba(100,116,139,0.2)'}`,
                      }}
                    >
                      {card.is_active ? '공개' : '비공개'}
                    </span>
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs"
                      style={{
                        background: '#0f1f35',
                        color: '#3b82f6',
                        border: '1px solid #1e3a5f',
                      }}
                    >
                      {template?.label ?? card.template_key}
                    </span>
                  </div>

                  <p className="font-semibold text-sm truncate" style={{ color: '#e2e8f0' }}>
                    {card.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#4a5568' }}>
                    {card.company_name}
                  </p>
                  <p className="text-xs mt-1 font-mono" style={{ color: '#1e3a5f' }}>
                    /{card.slug}
                  </p>
                </div>

                {/* 우측 액션 버튼 */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {/* 미리보기 */}
                  <a
                    href={`/${card.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: '#374151', background: '#111827' }}
                    title="미리보기"
                  >
                    <ExternalLink size={15} />
                  </a>

                  {/* 수정 */}
                  <a
                    href={`/admin/cards/${card.id}`}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: '#374151', background: '#111827' }}
                    title="수정"
                  >
                    <Pencil size={15} />
                  </a>

                  {/* 토글 */}
                  <button
                    onClick={() => handleToggle(card.id, card.is_active)}
                    disabled={isToggling}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: card.is_active ? '#4ade80' : '#374151', background: '#111827' }}
                    title={card.is_active ? '비공개로 전환' : '공개로 전환'}
                  >
                    {isToggling ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : card.is_active ? (
                      <ToggleRight size={15} />
                    ) : (
                      <ToggleLeft size={15} />
                    )}
                  </button>

                  {/* 삭제 */}
                  <button
                    onClick={() =>
                      confirmDeleteId === card.id
                        ? handleDelete(card.id)
                        : setConfirmDeleteId(card.id)
                    }
                    disabled={isDeleting}
                    className="p-2 rounded-lg transition-colors"
                    style={{
                      color: confirmDeleteId === card.id ? '#ef4444' : '#374151',
                      background: confirmDeleteId === card.id ? 'rgba(239,68,68,0.1)' : '#111827',
                    }}
                    title={confirmDeleteId === card.id ? '한 번 더 누르면 삭제' : '삭제'}
                  >
                    {isDeleting ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                  </button>
                </div>
              </div>

              {/* 삭제 확인 메시지 */}
              {confirmDeleteId === card.id && (
                <div
                  className="mt-3 pt-3 flex items-center justify-between"
                  style={{ borderTop: '1px solid rgba(239,68,68,0.15)' }}
                >
                  <p className="text-xs" style={{ color: '#f87171' }}>
                    삭제 버튼을 한 번 더 누르면 비공개 처리됩니다.
                  </p>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="text-xs px-2 py-1 rounded"
                    style={{ color: '#64748b' }}
                  >
                    취소
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
