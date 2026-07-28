import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url'
import { dataset, projectId } from '@/sanity/env'

const builder = createImageUrlBuilder({
  projectId: projectId || 'placeholder',
  dataset: dataset || 'production',
})

type UrlForOptions = {
  width: number
  height?: number
  quality?: number
  /** Force a raster format for social cards (og/twitter). Never WebP for those. */
  format?: 'jpg' | 'png'
}

/**
 * All content image URLs go through this helper.
 * Uses Sanity CDN auto-format (negotiated per request) unless an explicit format is set.
 */
export function urlForImage(source: SanityImageSource, options: UrlForOptions) {
  const { width, height, quality = 80, format } = options

  let img = builder.image(source).width(width).quality(quality)

  if (height != null) {
    img = img.height(height)
  }

  if (format) {
    img = img.format(format)
  } else {
    img = img.auto('format')
  }

  return img
}

/** Convenience: build a responsive srcset string from explicit widths. */
export function imageSrcSet(
  source: SanityImageSource,
  widths: number[],
  options?: Omit<UrlForOptions, 'width'>,
): string {
  return widths
    .map((w) => `${urlForImage(source, { ...options, width: w }).url()} ${w}w`)
    .join(', ')
}
