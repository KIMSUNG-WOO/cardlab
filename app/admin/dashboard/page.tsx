import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/admin-header'
import { CardList } from '@/components/admin/card-list'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: cards } = await supabase
    .from('business_cards')
    .select('id,slug,name,company_name,template_key,is_active,created_at')
    .order('created_at', { ascending: false })

  return (
    <div>
      <AdminHeader userEmail={user.email ?? ''} />
      <main style={{ maxWidth:896, margin:'0 auto', padding:'32px 16px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <div>
            <h1 style={{ fontSize:20, fontWeight:700, color:'#e2e8f0', margin:0 }}>명함 관리</h1>
            <p style={{ fontSize:13, color:'#4a5568', marginTop:4 }}>등록된 명함 {cards?.length ?? 0}개</p>
          </div>
          <a href="/admin/cards/new" style={{ padding:'10px 20px', background:'linear-gradient(135deg,#1e3a5f,#1e40af)', color:'#fff', borderRadius:12, textDecoration:'none', fontSize:13, fontWeight:600 }}>+ 새 명함</a>
        </div>
        <CardList cards={cards ?? []} />
      </main>
    </div>
  )
}
