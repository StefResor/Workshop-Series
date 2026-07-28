/** Whether this request host may be indexed by search engines. */
export function allowSearchIndexing(host: string | null | undefined): boolean {
  const h = (host || '').toLowerCase().split(':')[0]
  if (!h) return false
  if (h === 'localhost' || h.endsWith('.localhost')) return false
  if (h.endsWith('.vercel.app')) return false
  return true
}
