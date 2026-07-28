/** Whether this request host may be indexed by search engines. */
export function allowSearchIndexing(host: string | null | undefined): boolean {
  const h = (host || '').toLowerCase().split(':')[0]
  // #region agent log
  const decision =
    !h
      ? false
      : h === 'localhost' || h.endsWith('.localhost')
        ? false
        : h.endsWith('.vercel.app')
          ? false
          : true
  fetch('http://127.0.0.1:7791/ingest/3984b71e-361f-4c15-8aeb-0a947c8b7d82', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': '37fee7',
    },
    body: JSON.stringify({
      sessionId: '37fee7',
      runId: 'indexing-check',
      hypothesisId: 'A',
      location: 'lib/indexing.ts:allowSearchIndexing',
      message: 'indexing decision',
      data: { host: h || null, allow: decision },
      timestamp: Date.now(),
    }),
  }).catch(() => {})
  // #endregion
  if (!h) return false
  if (h === 'localhost' || h.endsWith('.localhost')) return false
  if (h.endsWith('.vercel.app')) return false
  return true
}
