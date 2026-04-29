import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jbdojtggwdpuykranpzu.supabase.co',  // ← ここを書き換える
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig