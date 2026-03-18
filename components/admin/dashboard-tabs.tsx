'use client'
import { useState } from 'react'
import { CardList } from './card-list'
import { CompanyManager } from './company-manager'

interface Card {
  id: string; slug: string; name: string; company_name: string
  template_key: any; is_active: boolean; created_at: string
}
interface Company {
  id: string; name: string; logo_url: string | null
  background_url: string | null; created_at: string
}

export function DashboardTabs({ cards, companies }: { cards: Card[]; companies: Company[] }) {
  const [tab, setTab] = useState<'cards' | 'companies'>('cards')

  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '9px 20px', borderRadius: 9, fontSize: 13, fontWeight: active ? 700 : 500,
    color: active ? '#4263eb' : '#868e96', background: active ? '#e7f0ff' : 'transparent',
    border: 'none', cursor: 'pointer',
  })

  return (
    <>
      {/* 상단 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 4, background: '#f1f3f5', padding: 4, borderRadius: 12 }}>
          <button style={tabBtn(tab === 'cards')} onClick={() => setTab('cards')}>
            명함 관리 ({cards.length})
          </button>
          <button style={tabBtn(tab === 'companies')} onClick={() => setTab('companies')}>
            회사 관리 ({companies.length})
          </button>
        </div>
        {tab === 'cards' && (
          <a href="/admin/cards/new"
            style={{ padding: '10px 22px', background: 'linear-gradient(135deg,#4263eb,#3b5bdb)', color: '#fff', borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 700, boxShadow: '0 4px 12px rgba(66,99,235,0.3)' }}>
            + 새 명함
          </a>
        )}
      </div>

      {tab === 'cards' && <CardList cards={cards} />}
      {tab === 'companies' && <CompanyManager companies={companies} />}
    </>
  )
}
