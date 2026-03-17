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

  const [{ data: card }, { data: companies }] = await Promise.all([
    supabase.from('business_cards').select('*, card_news(*)').eq('id', id).single(),
    supabase.from('companies').select('id,name,logo_url').order('name'),
  ])

  if (!card) notFound()

  return (
    <div>
      <AdminHeader userEmail={user.email ?? ''} />
      <main style={{ maxWidth:1200, margin:'0 auto', padding:'28px 20px' }}>
        <a href="/admin/dashboard" style={{ fontSize:13, color:'#868e96', textDecoration:'none', display:'inline-block', marginBottom:20 }}>← 목록으로</a>
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:22, fontWeight:700, color:'#212529', margin:0 }}>명함 수정</h1>
          <p style={{ fontSize:12, color:'#adb5bd', fontFamily:'monospace', marginTop:4 }}>/{card.slug}</p>
        </div>
        <CardForm mode="edit" card={card} companies={companies ?? []} />
      </main>
    </div>
  )
}
