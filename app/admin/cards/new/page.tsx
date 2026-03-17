import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/admin-header'
import { CardForm } from '@/components/admin/card-form'

export const metadata: Metadata = { title: '새 명함 만들기' }

export default async function NewCardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  return (
    <div className="min-h-dvh" style={{ background: '#080e18' }}>
      <AdminHeader userEmail={user.email ?? ''} />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <a
            href="/admin/dashboard"
            className="text-sm flex items-center gap-1 mb-4"
            style={{ color: '#374151' }}
          >
            ← 목록으로
          </a>
          <h1 className="text-xl font-bold" style={{ color: '#e2e8f0' }}>
            새 명함 만들기
          </h1>
        </div>
        <CardForm mode="create" />
      </main>
    </div>
  )
}
