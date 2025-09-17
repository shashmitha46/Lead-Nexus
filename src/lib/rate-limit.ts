type WindowRecord = { count: number; resetAt: number }

const WINDOW_MS = 60_000 // 1 minute
const MAX_REQUESTS = 10 // per window per key

const globalStore = globalThis as unknown as {
  __rateLimitStore?: Map<string, WindowRecord>
}

if (!globalStore.__rateLimitStore) {
  globalStore.__rateLimitStore = new Map()
}

export function enforceRateLimit(action: string, key: string) {
  const store = globalStore.__rateLimitStore!
  const compositeKey = `${action}:${key}`
  const now = Date.now()
  const record = store.get(compositeKey)
  if (!record || record.resetAt <= now) {
    store.set(compositeKey, { count: 1, resetAt: now + WINDOW_MS })
    return
  }
  if (record.count >= MAX_REQUESTS) {
    const secondsLeft = Math.ceil((record.resetAt - now) / 1000)
    throw new Error(`Rate limit exceeded. Try again in ${secondsLeft}s`)
  }
  record.count += 1
  store.set(compositeKey, record)
}

export function getClientKey(headersMap: Headers): string {
  const fwd = headersMap.get('x-forwarded-for') || ''
  const ip = fwd.split(',')[0]?.trim() || 'unknown'
  return ip
}


