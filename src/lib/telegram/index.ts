import { join } from 'node:path'
import { createApi } from './api'
import type { Deps } from './bot'
import { Store } from './store'

let cached: Deps | null | undefined

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
  if (!token || !Number.isFinite(groupId) || !groupId || !botUsername || !secret) {
    cached = null
    return cached
  }
  try {
    cached = {
      api: createApi(token),
      store: new Store(join(process.env.DATA_DIR ?? './data', 'bot.sqlite')),
      config: { groupId, botUsername, secret, siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kovagor.ru').replace(/\/$/, '') },
    }
  } catch (e) {
    // нет постоянного диска (serverless): переписка невозможна, заявки уходят простым сообщением в группу
    console.error('[telegram] хранилище недоступно, бот работает в упрощённом режиме', e)
    cached = null
  }
  return cached
}
