import { join } from 'node:path'
import { createApi } from './api'
import type { Deps } from './bot'
import { Store } from './store'

let store: Store | null | undefined
let cached: Deps | null | undefined

/** Общее хранилище (SQLite на постоянном диске). null — диск недоступен (например, serverless). */
export function getStore(): Store | null {
  if (store !== undefined) return store
  try {
    store = new Store(join(process.env.DATA_DIR ?? './data', 'bot.sqlite'))
  } catch (e) {
    console.error('[store] хранилище недоступно', e)
    store = null
  }
  return store
}

/**
 * Зависимости бота из окружения. null — бот не настроен (тогда заявки идут по упрощённому пути).
 * Нужны: TELEGRAM_BOT_TOKEN, TELEGRAM_GROUP_ID, TELEGRAM_BOT_USERNAME, TELEGRAM_WEBHOOK_SECRET.
 */
export function getBot(): Deps | null {
  if (cached !== undefined) return cached
  const token = process.env.TELEGRAM_BOT_TOKEN
  const groupId = Number(process.env.TELEGRAM_GROUP_ID)
  const botUsername = process.env.TELEGRAM_BOT_USERNAME?.replace(/^@/, '')
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET
  const st = getStore()
  if (!token || !Number.isFinite(groupId) || !groupId || !botUsername || !secret || !st) {
    cached = null
    return cached
  }
  cached = {
    api: createApi(token),
    store: st,
    config: { groupId, botUsername, secret, siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kovagor.ru').replace(/\/$/, '') },
  }
  return cached
}
