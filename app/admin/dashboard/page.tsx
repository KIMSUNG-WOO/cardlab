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
      <main style={{ maxWidth:960, margin:'0 auto', padding:'28px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:700, color:'#212529', margin:0 }}>명함 관리</h1>
            <p style={{ fontSize:13, color:'#868e96', marginTop:4 }}>등록된 명함 {cards?.length ?? 0}개</p>
          </div>
          <a href="/admin/cards/new" style={{ padding:'10px 22px', background:'linear-gradient(135deg,#4263eb,#3b5bdb)', color:'#fff', borderRadius:10, textDecoration:'none', fontSize:13, fontWeight:700, boxShadow:'0 4px 12px rgba(66,99,235,0.3)' }}>+ 새 명함</a>
        </div>
        <CardList cards={cards ?? []} />
      </main>
    </div>
  )
}
