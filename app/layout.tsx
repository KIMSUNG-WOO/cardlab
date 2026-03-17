import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'CardLab — 디지털 명함 플랫폼',
    template: '%s | CardLab',
  },
  description: '모바일에 최적화된 프리미엄 디지털 명함 서비스',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cardlab.digital'
  ),
  openGraph: {
    type: 'website',
    siteName: 'CardLab',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
