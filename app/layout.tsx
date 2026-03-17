import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'CardLab', template: '%s | CardLab' },
  description: '모바일 디지털 명함 플랫폼',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cardlab.digital'),
  icons: {
    icon: [
      { url: '/icons/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/icons/favicon.svg',
    shortcut: '/icons/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#0a0a0a" />
        <link rel="icon" href="/icons/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/favicon.svg" />
      </head>
      <body>{children}</body>
    </html>
  )
}
