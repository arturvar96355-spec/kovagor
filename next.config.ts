import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  output: 'standalone', // самодостаточная сборка для Docker (.next/standalone/server.js)
}

export default nextConfig
