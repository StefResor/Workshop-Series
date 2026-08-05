import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // TypeScript 7 is pinned in AGENTS.md; Next 16 needs the CLI bridge
  // until it ships a compiler API compatible with the TS 7 compiler API.
  experimental: {
    useTypeScriptCli: true,
  },
  async rewrites() {
    // Public URLs stay /terms and /privacy; pages live under /policies/[slug].
    return [
      { source: '/terms', destination: '/policies/terms' },
      { source: '/privacy', destination: '/policies/privacy' },
    ]
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
      // Pre-index: strip workshop-N- slug prefix (one redirect per known old slug)
      {
        source:
          '/workshops/workshop-1-im-right-youre-wrong-the-fight-that-never-ends',
        destination: '/workshops/im-right-youre-wrong-the-fight-that-never-ends',
        permanent: true,
      },
      {
        source:
          '/workshops/workshop-2-if-we-cant-control-our-partner-why-do-we-keep-trying',
        destination:
          '/workshops/if-we-cant-control-our-partner-why-do-we-keep-trying',
        permanent: true,
      },
      {
        source:
          '/workshops/workshop-3-why-unleashing-on-your-partner-never-gets-you-heard',
        destination:
          '/workshops/why-unleashing-on-your-partner-never-gets-you-heard',
        permanent: true,
      },
      {
        source: '/workshops/workshop-4-the-destructive-force-of-retaliation',
        destination: '/workshops/the-destructive-force-of-retaliation',
        permanent: true,
      },
      {
        source: '/workshops/workshop-5-the-withdrawal-trap',
        destination: '/workshops/the-withdrawal-trap',
        permanent: true,
      },
      {
        source: '/workshops/workshop-6-the-art-skill-of-acceptance',
        destination: '/workshops/the-art-skill-of-acceptance',
        permanent: true,
      },
      {
        source:
          '/workshops/workshop-7-the-art-skill-of-listening-to-understand',
        destination: '/workshops/the-art-skill-of-listening-to-understand',
        permanent: true,
      },
      {
        source:
          '/workshops/workshop-8-responsible-distance-taking-responsible-feedback',
        destination:
          '/workshops/responsible-distance-taking-responsible-feedback',
        permanent: true,
      },
      {
        source:
          '/workshops/workshop-9-the-art-of-generosity-empowering-your-partner',
        destination:
          '/workshops/the-art-of-generosity-empowering-your-partner',
        permanent: true,
      },
      {
        source: '/workshops/workshop-10-the-art-of-the-apology',
        destination: '/workshops/the-art-of-the-apology',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
