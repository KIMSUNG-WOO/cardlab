'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
export function AdminHeader({ userEmail }: { userEmail: string }) {
  const router = useRouter()
  async function logout() { await createClient().auth.signOut(); router.push('/admin/login') }
  return (
    <header style={{ background:'#fff', borderBottom:'1px solid #e9ecef', position:'sticky', top:0, zIndex:50 }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 20px', height:56, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:'linear-gradient(135deg,#4263eb,#3b5bdb)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="3" stroke="white" strokeWidth="2.2"/><line x1="2" y1="10" x2="22" y2="10" stroke="white" strokeWidth="2.2"/></svg>
          </div>
          <span style={{ fontSize:15, fontWeight:700, color:'#212529' }}>CardLab</span>
          <span style={{ fontSize:10, padding:'2px 7px', background:'#e7f0ff', color:'#4263eb', borderRadius:20, fontWeight:700 }}>Admin</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <a href="/admin/companies" style={{ fontSize:12, color:'#868e96', textDecoration:'none', fontWeight:500 }}>회사 관리</a>
          <span style={{ fontSize:12, color:'#adb5bd' }}>{userEmail}</span>
          <button onClick={logout} style={{ fontSize:12, color:'#868e96', background:'none', border:'1px solid #dee2e6', borderRadius:8, padding:'5px 12px', cursor:'pointer', fontWeight:600 }}>로그아웃</button>
        </div>
      </div>
    </header>
  )
}
