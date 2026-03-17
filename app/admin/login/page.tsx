import type { Metadata } from 'next'
import { LoginForm } from '@/components/admin/login-form'

export const metadata: Metadata = {
  title: '로그인',
}

export default function LoginPage() {
  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center px-5"
      style={{ background: 'linear-gradient(135deg, #080e18 0%, #0a0a0a 60%, #080e18 100%)' }}
    >
      {/* 브랜드 헤더 */}
      <div className="flex flex-col items-center mb-10">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
          style={{ background: 'linear-gradient(135deg, #1e3a5f, #1e40af)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="5" width="20" height="14" rx="3" stroke="white" strokeWidth="2" fill="none" />
            <line x1="2" y1="10" x2="22" y2="10" stroke="white" strokeWidth="2" />
            <rect x="5" y="13" width="5" height="2" rx="1" fill="white" />
          </svg>
        </div>
        <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>
          CardLab
        </h1>
        <p className="text-xs mt-1" style={{ color: '#374151' }}>
          관리자 페이지
        </p>
      </div>

      {/* 로그인 폼 */}
      <LoginForm />
    </main>
  )
}
