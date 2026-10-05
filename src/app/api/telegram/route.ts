import { NextResponse, type NextRequest } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { getBot } from '@/lib/telegram'
import { handleUpdate } from '@/lib/telegram/bot'
import type { TgUpdate } from '@/lib/telegram/types'

export const dynamic = 'force-dynamic'

/** Вебхук Telegram. Подлинность — по секретному заголовку, который мы задали в setWebhook. */
export async function POST(req: NextRequest) {
  const bot = getBot()
  if (!bot) return NextResponse.json({ ok: false }, { status: 503 })

  const got = Buffer.from(req.headers.get('x-telegram-bot-api-secret-token') ?? '')
  const want = Buffer.from(bot.config.secret)
  if (got.length !== want.length || !timingSafeEqual(got, want)) return NextResponse.json({ ok: false }, { status: 401 })

  const update = (await req.json().catch(() => null)) as TgUpdate | null
  if (update) {
    try {
      await handleUpdate(bot, update)
    } catch (e) {
      console.error('[telegram] ошибка обработки обновления', e)
    }
  }
  return NextResponse.json({ ok: true }) // всегда 200, чтобы Telegram не повторял доставку
}
