import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/admin-header'
import { CardForm } from '@/components/admin/card-form'
import type { BusinessCard } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = { title: '명함 수정' }

export default async function EditCardPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: card } = await supabase
    .from('business_cards')
    .select(`*, card_links(*)`)
    .eq('id', id)
    .single()

  if (!card) notFound()

  const normalizedCard: BusinessCard = {
    ...card,
    links: card.card_links ?? [],
  }

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
            명함 수정
          </h1>
          <p className="text-sm mt-1 font-mono" style={{ color: '#374151' }}>
            /{card.slug}
          </p>
        </div>
        <CardForm mode="edit" card={normalizedCard} />
      </main>
    </div>
  )
}
