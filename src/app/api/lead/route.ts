import { NextResponse, type NextRequest } from 'next/server'
import { leadSchema } from '@/lib/schemas'
import { rateLimit } from '@/lib/rate-limit'
import { getBot } from '@/lib/telegram'
import { getMailConfig } from '@/lib/email'
import { deliverLead } from '@/lib/leads-delivery'

const API_BASE = () => (process.env.TELEGRAM_API_BASE ?? 'https://api.telegram.org').replace(/\/$/, '')

/** Упрощённый режим Telegram (без хранилища и переписки): просто сообщение в чат/группу. */
async function plainTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chat = process.env.TELEGRAM_CHAT_ID ?? process.env.TELEGRAM_GROUP_ID
  if (!token || !chat) throw new Error('not configured')
  const r = await fetch(`${API_BASE()}/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chat, text }),
    signal: AbortSignal.timeout(8000),
  })
  if (!r.ok) throw new Error(`telegram ${r.status}`)
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!rateLimit(ip)) return NextResponse.json({ ok: false, error: 'Слишком много заявок, попробуйте позже' }, { status: 429 })

  const parsed = leadSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Проверьте поля формы' }, { status: 400 })
  // honeypot: бот заполнил скрытое поле — делаем вид, что всё хорошо
  if (parsed.data.website) return NextResponse.json({ ok: true })

  const { name, contact, project, message } = parsed.data
  const hasPlainTelegram = !!process.env.TELEGRAM_BOT_TOKEN && !!(process.env.TELEGRAM_CHAT_ID ?? process.env.TELEGRAM_GROUP_ID)

  const result = await deliverLead(
    { name, contact, project, message },
    { bot: getBot(), mail: getMailConfig(), plainTelegram: hasPlainTelegram ? plainTelegram : undefined },
  )
  if (!result.delivered) {
    return NextResponse.json({ ok: false, error: 'Не удалось отправить заявку. Напишите нам напрямую — контакты ниже.' }, { status: 502 })
  }
  return NextResponse.json({ ok: true, botLink: result.botLink })
}
