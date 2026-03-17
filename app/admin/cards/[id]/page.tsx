import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/admin-header'
import { CardForm } from '@/components/admin/card-form'

interface Props { params: Promise<{ id: string }> }

export default async function EditCardPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: card } = await supabase.from('business_cards').select('*, card_links(*)').eq('id', id).single()
  if (!card) notFound()

  const normalizedCard = { ...card, links: card.card_links ?? [] }

  return (
    <div>
      <AdminHeader userEmail={user.email ?? ''} />
      <main style={{ maxWidth: 672, margin: '0 auto', padding: '32px 16px' }}>
        <a href="/admin/dashboard" style={{ fontSize: 13, color: '#374151', textDecoration: 'none', display: 'block', marginBottom: 16 }}>← 목록으로</a>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>명함 수정</h1>
        <p style={{ fontSize: 12, color: '#374151', fontFamily: 'monospace', marginBottom: 24 }}>/{card.slug}</p>
        <CardForm mode="edit" card={normalizedCard} />
      </main>
    </div>
  )
}
