import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/admin-header'
import { CardForm } from '@/components/admin/card-form'

export default async function NewCardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  return (
    <div>
      <AdminHeader userEmail={user.email ?? ''} />
      <main style={{ maxWidth:672, margin:'0 auto', padding:'32px 16px' }}>
        <a href="/admin/dashboard" style={{ fontSize:13, color:'#374151', textDecoration:'none', display:'block', marginBottom:16 }}>← 목록으로</a>
        <h1 style={{ fontSize:20, fontWeight:700, color:'#e2e8f0', marginBottom:24 }}>새 명함 만들기</h1>
        <CardForm mode="create" />
      </main>
    </div>
  )
}
