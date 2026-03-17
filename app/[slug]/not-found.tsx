import Link from 'next/link'
export default function NotFound() {
  return (
    <main style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#0a0a0a' }}>
      <p style={{ fontSize:64, fontWeight:700, color:'#1e3a5f', marginBottom:16 }}>404</p>
      <h1 style={{ fontSize:20, fontWeight:600, color:'#fff', marginBottom:8 }}>명함을 찾을 수 없습니다</h1>
      <p style={{ fontSize:14, color:'#64748b', marginBottom:32 }}>존재하지 않거나 비공개 처리된 명함입니다.</p>
      <Link href="/" style={{ padding:'12px 24px', borderRadius:12, background:'#1e3a5f', color:'#fff', textDecoration:'none', fontSize:14 }}>홈으로</Link>
    </main>
  )
}
