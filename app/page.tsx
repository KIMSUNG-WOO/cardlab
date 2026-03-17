import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'CardLab — 디지털 명함 플랫폼',
  description: '전문가를 위한 모바일 디지털 명함. 고급스럽고 신뢰감 있는 당신의 첫인상.',
}

export default function HomePage() {
  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #0d1b2e 100%)' }}
    >
      {/* AFG 로고 심볼 (SVG 인라인) */}
      <div className="flex flex-col items-center gap-8 px-6 text-center">
        {/* 브랜드 심볼 */}
        <div className="relative">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1e3a5f, #1e40af)' }}
          >
            <svg
              width="44"
              height="44"
              viewBox="0 0 44 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* 카드 아이콘 심볼 */}
              <rect x="4" y="10" width="36" height="24" rx="4" stroke="white" strokeWidth="2.5" fill="none"/>
              <line x1="4" y1="18" x2="40" y2="18" stroke="white" strokeWidth="2.5"/>
              <rect x="8" y="22" width="10" height="2.5" rx="1.25" fill="white"/>
              <rect x="8" y="27" width="16" height="2" rx="1" fill="rgba(255,255,255,0.5)"/>
            </svg>
          </div>
        </div>

        {/* 브랜드명 */}
        <div>
          <h1
            className="text-4xl font-bold tracking-tight mb-2"
            style={{ color: '#ffffff' }}
          >
            CardLab
          </h1>
          <p
            className="text-base font-medium mb-1"
            style={{ color: '#94a3b8' }}
          >
            디지털 명함 플랫폼
          </p>
          <p
            className="text-sm"
            style={{ color: '#4a5568' }}
          >
            Professional Digital Business Card
          </p>
        </div>

        {/* 설명 */}
        <p
          className="text-sm leading-relaxed max-w-xs"
          style={{ color: '#64748b' }}
        >
          모바일에 최적화된 프리미엄 디지털 명함으로<br />
          당신의 첫인상을 완성하세요.
        </p>

        {/* 구분선 */}
        <div
          className="w-12 h-px"
          style={{ background: '#1e3a5f' }}
        />

        {/* 푸터 */}
        <p
          className="text-xs"
          style={{ color: '#2d3748' }}
        >
          © 2025 CardLab. All rights reserved.
        </p>
      </div>

      {/* 관리자 링크 (숨겨진 접근 - 하단 우측 작은 링크) */}
      <div className="fixed bottom-6 right-6">
        <Link
          href="/admin/login"
          className="text-xs px-3 py-2 rounded-lg transition-colors"
          style={{ color: '#1e3a5f', background: 'transparent' }}
          aria-label="관리자"
        >
          ···
        </Link>
      </div>
    </main>
  )
}
