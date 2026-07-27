import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // TypeScript 7 is pinned in AGENTS.md; Next 16 needs the CLI bridge
  // until it ships a compiler API compatible with TS 7.
  experimental: {
    useTypeScriptCli: true,
  },
}

export default nextConfig
