'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, ChevronDown } from 'lucide-react'

interface Props {
  userEmail: string
}

export function AdminHeader({ userEmail }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: 'rgba(8,14,24,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #0d1b2e',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1e3a5f, #1e40af)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="5" width="20" height="14" rx="3" stroke="white" strokeWidth="2.2" fill="none" />
              <line x1="2" y1="10" x2="22" y2="10" stroke="white" strokeWidth="2.2" />
            </svg>
          </div>
          <span className="text-sm font-bold" style={{ color: '#e2e8f0' }}>
            CardLab
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#0d1520', color: '#3b82f6', fontSize: '10px' }}>
            Admin
          </span>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors"
          style={{ color: '#64748b', background: 'transparent' }}
        >
          <LogOut size={13} />
          로그아웃
        </button>
      </div>
    </header>
  )
}
