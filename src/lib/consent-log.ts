import { createHmac } from 'node:crypto'
import type { Store } from './telegram/store'

/** Версия текста политики, под которую получено согласие. Менять при каждой правке /privacy. */
export const POLICY_VERSION = '2026-10-draft'

/** IP не хранится открыто: храним только хэш (достаточно, чтобы подтвердить факт согласия). */
export const hashIp = (ip: string, secret = process.env.TELEGRAM_WEBHOOK_SECRET ?? 'kovagor') =>
  createHmac('sha256', secret).update(ip).digest('hex').slice(0, 24)

/** Записывает факт согласия на обработку ПД. Ошибки журнала не должны ломать приём заявки. */
export function logConsent(store: Store | null, c: { name: string; contact: string; ip: string }) {
  if (!store) return
  try {
    store.logConsent({ name: c.name, contact: c.contact, policy_version: POLICY_VERSION, ip_hash: hashIp(c.ip) })
  } catch (e) {
    console.error('[consent] не удалось записать согласие', e)
  }
}
