'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function AdminHeader({ userEmail }: { userEmail: string }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(8,14,24,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #0d1b2e' }}>
      <div style={{ maxWidth: 896, margin: '0 auto', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #1e3a5f, #1e40af)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="5" width="20" height="14" rx="3" stroke="white" strokeWidth="2.2" />
              <line x1="2" y1="10" x2="22" y2="10" stroke="white" strokeWidth="2.2" />
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>CardLab</span>
          <span style={{ fontSize: 10, padding: '2px 6px', background: '#0d1520', color: '#3b82f6', borderRadius: 4 }}>Admin</span>
        </div>
        <button
          onClick={handleLogout}
          style={{ fontSize: 12, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          로그아웃
        </button>
      </div>
    </header>
  )
}
