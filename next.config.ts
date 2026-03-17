import type { NextConfig } from 'next'
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'lmw-bucket-public.s3.ap-northeast-2.amazonaws.com' },
    ],
  },
}
export default nextConfig
