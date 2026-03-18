import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/admin-header'
import { DashboardTabs } from '@/components/admin/dashboard-tabs'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const [{ data: cards }, { data: companies }] = await Promise.all([
    supabase
      .from('business_cards')
      .select('id,slug,name,company_name,template_key,is_active,created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false }),
  ])

  return (
    <div>
      <AdminHeader userEmail={user.email ?? ''} />
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '28px 20px' }}>
        <DashboardTabs cards={cards ?? []} companies={companies ?? []} />
      </main>
    </div>
  )
}
