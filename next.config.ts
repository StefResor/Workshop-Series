import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // TypeScript 7 is pinned in AGENTS.md; Next 16 needs the CLI bridge
  // until it ships a compiler API compatible with the TS 7 compiler API.
  experimental: {
    useTypeScriptCli: true,
  },
  async redirects() {
    return [
      {
        source: '/services-4',
        destination: '/workshops',
        permanent: true,
      },
      {
        source: '/fees-insurance',
        destination: '/fees',
        permanent: true,
      },
      {
        source: '/book-online',
        destination: '/contact',
        permanent: true,
      },
      {
        source: '/event-details/:slug*',
        destination: '/workshops/:slug*',
        permanent: true,
      },
      {
        source: '/api/events.json',
        destination: '/events.json',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
