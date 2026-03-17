import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/admin-header'
import { CompanyManager } from '@/components/admin/company-manager'

export default async function CompaniesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <AdminHeader userEmail={user.email ?? ''} />
      <main style={{ maxWidth:960, margin:'0 auto', padding:'28px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:700, color:'#212529', margin:0 }}>회사 관리</h1>
            <p style={{ fontSize:13, color:'#868e96', marginTop:4 }}>등록된 회사 {companies?.length ?? 0}개</p>
          </div>
        </div>
        <CompanyManager companies={companies ?? []} />
      </main>
    </div>
  )
}
