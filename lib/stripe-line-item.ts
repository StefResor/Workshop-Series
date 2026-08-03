import type Stripe from 'stripe'

export function productIdFromLineItem(
  item: Stripe.LineItem | undefined,
): string | null {
  const product = item?.price?.product
  if (!product) return null
  if (typeof product === 'string') return product
  if (typeof product === 'object' && 'deleted' in product && product.deleted) {
    return null
  }
  if (typeof product === 'object' && 'id' in product && product.id) {
    return product.id
  }
  return null
}
