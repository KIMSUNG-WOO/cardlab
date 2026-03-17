import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: '관리자',
    template: '%s | CardLab Admin',
  },
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#0a0a0a]">
      {children}
    </div>
  )
}
