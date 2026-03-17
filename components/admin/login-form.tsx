'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const router = useRouter()
  const [id, setId] = useState('')
  const [pw, setPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const pwRef = useRef<HTMLInputElement>(null)

  async function login() {
    if (!id.trim() || !pw.trim()) return setErr('아이디와 비밀번호를 입력해주세요.')
    setErr(''); setLoading(true)
    try {
      const supabase = createClient()
      const email = id.includes('@') ? id : `${id}@cardlab.admin`
      const { error } = await supabase.auth.signInWithPassword({ email, password: pw })
      if (error) { setErr('아이디 또는 비밀번호가 올바르지 않습니다.'); return }
      router.push('/admin/dashboard'); router.refresh()
    } catch { setErr('네트워크 오류가 발생했습니다.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ width:'100%', maxWidth:380, background:'rgba(255,255,255,0.05)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, padding:28, boxShadow:'0 24px 64px rgba(0,0,0,0.5)' }}>
      <p style={{ fontSize:16, fontWeight:700, color:'#fff', marginBottom:24 }}>관리자 로그인</p>

      <div style={{ marginBottom:12 }}>
        <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#94a3b8', marginBottom:6 }}>아이디</label>
        <input
          type="text" value={id} onChange={e=>setId(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&pwRef.current?.focus()}
          autoComplete="username"
          style={{ width:'100%', padding:'12px 16px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, color:'#fff', fontSize:14, outline:'none', boxSizing:'border-box' }}
        />
      </div>

      <div style={{ marginBottom:20 }}>
        <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#94a3b8', marginBottom:6 }}>비밀번호</label>
        <div style={{ position:'relative' }}>
          <input
            ref={pwRef} type={showPw?'text':'password'} value={pw}
            onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()}
            autoComplete="current-password"
            style={{ width:'100%', padding:'12px 44px 12px 16px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, color:'#fff', fontSize:14, outline:'none', boxSizing:'border-box' }}
          />
          <button type="button" onClick={()=>setShowPw(v=>!v)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#64748b', fontSize:16, padding:2 }}>
            {showPw ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      {err && <div style={{ marginBottom:16, padding:'10px 14px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10, color:'#f87171', fontSize:13 }}>{err}</div>}

      <button onClick={login} disabled={loading} style={{ width:'100%', padding:'13px', background:loading?'#1e3a5f':'linear-gradient(135deg,#4263eb,#3b5bdb)', color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1, boxShadow:'0 4px 20px rgba(66,99,235,0.35)' }}>
        {loading ? '로그인 중...' : '로그인'}
      </button>
    </div>
  )
}
