import type { Metadata } from 'next'
import { LoginForm } from '@/components/admin/login-form'

export const metadata: Metadata = { title: '관리자 로그인' }

export default function LoginPage() {
  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px', background: 'linear-gradient(135deg, #080e18 0%, #0a0a0a 100%)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #1e3a5f, #1e40af)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="5" width="20" height="14" rx="3" stroke="white" strokeWidth="2" />
            <line x1="2" y1="10" x2="22" y2="10" stroke="white" strokeWidth="2" />
          </svg>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', margin: 0 }}>CardLab</h1>
        <p style={{ fontSize: 12, color: '#374151', margin: '4px 0 0' }}>관리자 페이지</p>
      </div>
      <LoginForm />
    </main>
  )
}
