'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const router = useRouter()
  const supabase = createClient()

  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const pwRef = useRef<HTMLInputElement>(null)

  async function handleLogin() {
    if (!id.trim() || !password.trim()) {
      setError('아이디와 비밀번호를 입력해주세요.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const email = id.includes('@') ? id : `${id}@cardlab.admin`
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.')
        return
      }
      router.push('/admin/dashboard')
      router.refresh()
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 360, background: '#111827', border: '1px solid #1e2d42', borderRadius: 20, padding: 28, boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>
      <p style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0', marginBottom: 24 }}>관리자 로그인</p>

      {/* 아이디 */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6 }}>아이디</label>
        <input
          type="text"
          value={id}
          onChange={e => setId(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && pwRef.current?.focus()}
          placeholder="관리자 아이디"
          autoComplete="username"
          style={{ width: '100%', padding: '12px 16px', background: '#0d1520', border: '1px solid #1e2d42', borderRadius: 12, color: '#e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {/* 비밀번호 */}
      <div style={{ marginBottom: 20, position: 'relative' }}>
        <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6 }}>비밀번호</label>
        <div style={{ position: 'relative' }}>
          <input
            ref={pwRef}
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="비밀번호"
            autoComplete="current-password"
            style={{ width: '100%', padding: '12px 44px 12px 16px', background: '#0d1520', border: '1px solid #1e2d42', borderRadius: 12, color: '#e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
          />
          <button
            type="button"
            onClick={() => setShowPw(v => !v)}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#374151', padding: 4 }}
          >
            {showPw ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      {/* 에러 */}
      {error && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, color: '#f87171', fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* 버튼 */}
      <button
        onClick={handleLogin}
        disabled={loading}
        style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #1e3a5f, #1e40af)', color: '#ffffff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
      >
        {loading ? '로그인 중...' : '로그인'}
      </button>
    </div>
  )
}
