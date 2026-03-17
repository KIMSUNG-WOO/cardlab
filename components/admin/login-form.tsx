'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

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
      // Supabase Auth는 이메일 기반이므로
      // 아이디를 이메일 형식으로 변환하거나, 실제 이메일 입력 방식을 사용
      // 여기서는 아이디를 "<id>@cardlab.admin" 형식으로 처리
      // Supabase Auth에 dkdl137900@cardlab.admin 으로 등록 필요
      const email = id.includes('@') ? id : `${id}@cardlab.admin`

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        if (authError.message.includes('Invalid login')) {
          setError('아이디 또는 비밀번호가 올바르지 않습니다.')
        } else if (authError.message.includes('Email not confirmed')) {
          setError('이메일 인증이 필요합니다. Supabase 대시보드에서 확인하세요.')
        } else {
          setError('로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.')
        }
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

  function handleIdKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') pwRef.current?.focus()
  }

  function handlePwKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div
      className="w-full max-w-sm rounded-2xl p-7"
      style={{
        background: '#111827',
        border: '1px solid #1e2d42',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
      }}
    >
      <h2 className="text-base font-semibold mb-6" style={{ color: '#e2e8f0' }}>
        관리자 로그인
      </h2>

      {/* 아이디 */}
      <div className="mb-3">
        <label className="block text-xs font-medium mb-1.5" style={{ color: '#64748b' }}>
          아이디
        </label>
        <input
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          onKeyDown={handleIdKeyDown}
          placeholder="관리자 아이디"
          autoComplete="username"
          className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
          style={{
            background: '#0d1520',
            border: '1px solid #1e2d42',
            color: '#e2e8f0',
            caretColor: '#3b82f6',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#2563eb'
            e.target.style.boxShadow = '0 0 0 2px rgba(37,99,235,0.15)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#1e2d42'
            e.target.style.boxShadow = 'none'
          }}
        />
      </div>

      {/* 비밀번호 */}
      <div className="mb-5">
        <label className="block text-xs font-medium mb-1.5" style={{ color: '#64748b' }}>
          비밀번호
        </label>
        <div className="relative">
          <input
            ref={pwRef}
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handlePwKeyDown}
            placeholder="비밀번호"
            autoComplete="current-password"
            className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none transition-all"
            style={{
              background: '#0d1520',
              border: '1px solid #1e2d42',
              color: '#e2e8f0',
              caretColor: '#3b82f6',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#2563eb'
              e.target.style.boxShadow = '0 0 0 2px rgba(37,99,235,0.15)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#1e2d42'
              e.target.style.boxShadow = 'none'
            }}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
            style={{ color: '#374151' }}
            tabIndex={-1}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div
          className="mb-4 px-4 py-3 rounded-xl text-sm"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#f87171',
          }}
        >
          {error}
        </div>
      )}

      {/* 로그인 버튼 */}
      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: loading
            ? '#1e3a5f'
            : 'linear-gradient(135deg, #1e3a5f, #1e40af)',
          color: '#ffffff',
          boxShadow: '0 4px 20px rgba(30,64,175,0.25)',
        }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            로그인 중...
          </span>
        ) : (
          '로그인'
        )}
      </button>
    </div>
  )
}
