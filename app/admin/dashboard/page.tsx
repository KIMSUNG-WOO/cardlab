import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CardList } from '@/components/admin/card-list'
import { AdminHeader } from '@/components/admin/admin-header'

export const metadata: Metadata = { title: '대시보드' }

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const { data: cards, error } = await supabase
    .from('business_cards')
    .select('id, slug, name, company_name, template_key, is_active, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-dvh" style={{ background: '#080e18' }}>
      <AdminHeader userEmail={user.email ?? ''} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#e2e8f0' }}>
              명함 관리
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#4a5568' }}>
              등록된 명함 {cards?.length ?? 0}개
            </p>
          </div>
          <a
            href="/admin/cards/new"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #1e3a5f, #1e40af)',
              color: '#ffffff',
              boxShadow: '0 4px 16px rgba(30,64,175,0.25)',
            }}
          >
            + 새 명함
          </a>
        </div>

        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#f87171',
            }}
          >
            명함 목록을 불러오는 중 오류가 발생했습니다.
          </div>
        )}

        <CardList cards={cards ?? []} />
      </main>
    </div>
  )
}
