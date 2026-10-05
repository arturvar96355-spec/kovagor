/** Минимальный клиент Bot API на fetch (без зависимостей). Нужные нам методы вызываются через call(). */
export class TelegramError extends Error {
  constructor(
    public method: string,
    public code: number,
    public description: string,
  ) {
    super(`Telegram ${method}: ${code} ${description}`)
  }
  /** Пользователь заблокировал бота / удалил чат — писать ему больше нельзя. */
  get isBlocked() {
    return this.code === 403
  }
}

export type TgApi = {
  call<T = unknown>(method: string, params?: Record<string, unknown>): Promise<T>
}

export function createApi(token: string, fetchImpl: typeof fetch = fetch, base = (process.env.TELEGRAM_API_BASE ?? 'https://api.telegram.org').replace(/\/$/, '')): TgApi {
  return {
    async call<T>(method: string, params: Record<string, unknown> = {}) {
      // без таймаута недоступный Telegram (блокировки) подвешивал бы отправку формы
      const res = await fetchImpl(`${base}/bot${token}/${method}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(params),
        signal: AbortSignal.timeout(8000),
      }).catch((e: unknown) => {
        throw new TelegramError(method, 0, e instanceof Error ? e.message : 'network error')
      })
      const json = (await res.json().catch(() => null)) as { ok: boolean; result?: T; error_code?: number; description?: string } | null
      if (!json?.ok) throw new TelegramError(method, json?.error_code ?? res.status, json?.description ?? 'unknown error')
      return json.result as T
    },
  }
}

/** Экранирование для parse_mode=HTML. */
export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
