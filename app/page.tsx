import Link from 'next/link'
export default function HomePage() {
  return (
    <main style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#080e18 0%,#0a0a0a 100%)' }}>
      <div style={{ textAlign:'center', padding:'0 24px' }}>
        <div style={{ width:64, height:64, borderRadius:16, background:'linear-gradient(135deg,#1e3a5f,#1e40af)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="5" width="20" height="14" rx="3" stroke="white" strokeWidth="2"/>
            <line x1="2" y1="10" x2="22" y2="10" stroke="white" strokeWidth="2"/>
            <rect x="5" y="13" width="5" height="2" rx="1" fill="white"/>
          </svg>
        </div>
        <h1 style={{ fontSize:36, fontWeight:700, color:'#fff', marginBottom:8 }}>CardLab</h1>
        <p style={{ fontSize:14, color:'#64748b' }}>디지털 명함 플랫폼</p>
      </div>
      <div style={{ position:'fixed', bottom:24, right:24 }}>
        <Link href="/admin/login" style={{ fontSize:12, color:'#1e3a5f' }}>···</Link>
      </div>
    </main>
  )
}
