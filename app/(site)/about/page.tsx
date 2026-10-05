import type { Metadata } from 'next'
import Image from 'next/image'
import { urlForImage } from '@/lib/image'
import { buildPageMetadata } from '@/lib/seo'
import type { PageDoc, PagePortrait } from '@/lib/types'
import { sanityFetch } from '@/sanity/lib/fetch'
import { pageBySlugQuery } from '@/sanity/queries'

const FALLBACK_SRC = '/stefanie-schumacher.webp'
const FALLBACK_WIDTH = 1024
const FALLBACK_HEIGHT = 951
const DEFAULT_ALT = 'Portrait of Stefanie Schumacher, MS, LPC, EMDR'

export async function generateMetadata(): Promise<Metadata> {
  const page = await sanityFetch<PageDoc | null>(pageBySlugQuery, {
    slug: 'about',
  })
  return buildPageMetadata({
    title: 'About',
    description:
      page?.summary ||
      'Licensed psychotherapist Stefanie Schumacher — the Connection Workshop for individuals and couples. Private practice since 2015.',
    path: '/about',
  })
}

function paragraphs(body?: string) {
  return (body || '')
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
}

function portraitImage(portrait?: PagePortrait) {
  const assetId = portrait?.asset?._id
  if (!assetId) {
    return {
      src: FALLBACK_SRC,
      width: FALLBACK_WIDTH,
      height: FALLBACK_HEIGHT,
      alt: DEFAULT_ALT,
    }
  }

  const dims = portrait.asset?.metadata?.dimensions
  const width = 800
  const height = dims?.aspectRatio
    ? Math.round(width / dims.aspectRatio)
    : dims?.width && dims?.height
      ? Math.round((width * dims.height) / dims.width)
      : FALLBACK_HEIGHT

  const src = urlForImage(
    {
      _type: 'image',
      asset: { _ref: assetId, _type: 'reference' },
      hotspot: portrait.hotspot,
      crop: portrait.crop,
    },
    { width },
  ).url()

  return {
    src,
    width,
    height,
    alt: portrait.alt?.trim() || DEFAULT_ALT,
  }
}

export default async function AboutPage() {
  const page = await sanityFetch<PageDoc | null>(pageBySlugQuery, {
    slug: 'about',
  })

  const paras = paragraphs(page?.body)
  const bioParas = paras.filter(
    (p) =>
      !p.startsWith('Training:') &&
      !p.startsWith('Practice:') &&
      !p.startsWith('Discipline:'),
  )
  const facts = paras.filter(
    (p) =>
      p.startsWith('Training:') ||
      p.startsWith('Practice:') ||
      p.startsWith('Discipline:'),
  )
  const portrait = portraitImage(page?.portrait)

  return (
    <div className="about-grid">
      {/* Sticky on the grid item itself (align-self: start). Caption stays inside. */}
      <aside className="about-sticky">
        <div className="about-portrait">
          <Image
            src={portrait.src}
            alt={portrait.alt}
            width={portrait.width}
            height={portrait.height}
            sizes="(max-width: 860px) 100vw, 380px"
            priority
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
        <p className="about-caption">
          Stefanie Schumacher — MS, LPC, EMDR.
          <br />
          Private practice since 2015.
        </p>
      </aside>
      <div className="about-bio">
        <span className="kicker">{page?.eyebrow || 'About Stefanie'}</span>
        <h1>
          {page?.headline ||
            'Steadiness, learned the hard way — and taught deliberately.'}
        </h1>
        {page?.summary ? <p>{page.summary}</p> : null}
        {bioParas.map((p) => (
          <p key={p.slice(0, 48)}>{p}</p>
        ))}
        {facts.length ? (
          <dl className="about-facts">
            {facts.map((line) => {
              const [label, ...rest] = line.split(':')
              return (
                <div key={line}>
                  <dt>{label}</dt>
                  <dd>{rest.join(':').trim()}</dd>
                </div>
              )
            })}
          </dl>
        ) : null}
      </div>
    </div>
  )
}
