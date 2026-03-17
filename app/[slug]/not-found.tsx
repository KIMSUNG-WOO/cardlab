import Link from 'next/link'
export default function NotFound() {
  return (
    <main style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#0a0a0a', padding:'0 24px' }}>
      <p style={{ fontSize:72, fontWeight:800, color:'#1e2d42', marginBottom:12, lineHeight:1 }}>404</p>
      <h1 style={{ fontSize:20, fontWeight:600, color:'#fff', marginBottom:8 }}>명함을 찾을 수 없습니다</h1>
      <p style={{ fontSize:14, color:'#4a5568', marginBottom:36, textAlign:'center' }}>
        존재하지 않거나 비공개 처리된 명함입니다.
      </p>
      <Link href="/" style={{ padding:'12px 28px', borderRadius:12, background:'linear-gradient(135deg,#1e3a5f,#1e40af)', color:'#fff', textDecoration:'none', fontSize:14, fontWeight:600 }}>
        홈으로 돌아가기
      </Link>
    </main>
  )
}
