import type { Metadata } from 'next'
import { LoginForm } from '@/components/admin/login-form'
export const metadata: Metadata = { title: '관리자 로그인' }
export default function LoginPage() {
  return (
    <main style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 20px', background:'linear-gradient(135deg,#1a1d23 0%,#0f1117 100%)' }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:32 }}>
        <div style={{ width:52, height:52, borderRadius:14, background:'linear-gradient(135deg,#4263eb,#3b5bdb)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16, boxShadow:'0 8px 24px rgba(66,99,235,0.4)' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="5" width="20" height="14" rx="3" stroke="white" strokeWidth="2"/>
            <line x1="2" y1="10" x2="22" y2="10" stroke="white" strokeWidth="2"/>
          </svg>
        </div>
        <h1 style={{ fontSize:22, fontWeight:700, color:'#fff', margin:0 }}>CardLab</h1>
        <p style={{ fontSize:13, color:'#6c757d', margin:'4px 0 0' }}>관리자 페이지</p>
      </div>
      <LoginForm />
    </main>
  )
}
