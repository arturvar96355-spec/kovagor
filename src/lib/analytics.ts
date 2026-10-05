/** Яндекс.Метрика. Счётчик подключается только после согласия на cookie (см. components/analytics.tsx). */
export const YM_ID = Number(process.env.NEXT_PUBLIC_YM_ID ?? 113435682)
export const CONSENT_KEY = 'kv-cookie-consent'
export const CONSENT_EVENT = 'kv-consent-changed'
export const COOKIE_SETTINGS_EVENT = 'kv-cookie-settings'

export type Consent = 'granted' | 'denied' | null

type Ym = (id: number, method: string, ...args: unknown[]) => void
declare global {
  interface Window {
    ym?: Ym
  }
}

export function readConsent(): Consent {
  try {
    const v = localStorage.getItem(CONSENT_KEY)
    return v === 'granted' || v === 'denied' ? v : null
  } catch {
    return null
  }
}

export function writeConsent(v: Exclude<Consent, null> | 'reset') {
  try {
    if (v === 'reset') localStorage.removeItem(CONSENT_KEY)
    else localStorage.setItem(CONSENT_KEY, v)
  } catch {}
  window.dispatchEvent(new Event(CONSENT_EVENT))
}

/** Достижение цели. Без согласия (счётчик не загружен) — тихо ничего не делает. */
export function goal(name: string, params?: Record<string, string | number>) {
  if (typeof window === 'undefined' || !window.ym) return
  window.ym(YM_ID, 'reachGoal', name, params)
}
