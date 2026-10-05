const hits = new Map<string, number[]>()

/** Простой in-memory лимит: max запросов за windowMs с одного ключа. */
export function rateLimit(key: string, max = 5, windowMs = 10 * 60_000): boolean {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  if (recent.length >= max) {
    hits.set(key, recent)
    return false
  }
  recent.push(now)
  hits.set(key, recent)
  return true
}
