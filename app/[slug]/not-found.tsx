import Link from 'next/link'

export default function NotFound() {
  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center px-6"
      style={{ background: '#0a0a0a' }}
    >
      <div className="text-center">
        <p className="text-6xl font-bold mb-4" style={{ color: '#1e3a5f' }}>
          404
        </p>
        <h1 className="text-xl font-semibold mb-2" style={{ color: '#ffffff' }}>
          명함을 찾을 수 없습니다
        </h1>
        <p className="text-sm mb-8" style={{ color: '#64748b' }}>
          존재하지 않거나 비공개 처리된 명함입니다.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-xl text-sm font-medium transition-colors"
          style={{ background: '#1e3a5f', color: '#ffffff' }}
        >
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  )
}
