import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/admin-header'
import { CardForm } from '@/components/admin/card-form'

export default async function NewCardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: companies } = await supabase
    .from('companies')
    .select('id,name,logo_url')
    .order('name')

  return (
    <div>
      <AdminHeader userEmail={user.email ?? ''} />
      <main style={{ maxWidth:1200, margin:'0 auto', padding:'28px 20px' }}>
        <a href="/admin/dashboard" style={{ fontSize:13, color:'#868e96', textDecoration:'none', display:'inline-block', marginBottom:20 }}>← 목록으로</a>
        <h1 style={{ fontSize:22, fontWeight:700, color:'#212529', marginBottom:28 }}>새 명함 만들기</h1>
        <CardForm mode="create" companies={companies ?? []} />
      </main>
    </div>
  )
}
