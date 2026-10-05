import { NextResponse, type NextRequest } from 'next/server'
import { leadSchema } from '@/lib/schemas'
import { rateLimit } from '@/lib/rate-limit'
import { getBot } from '@/lib/telegram'
import { submitLead } from '@/lib/telegram/leads'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!rateLimit(ip)) return NextResponse.json({ ok: false, error: 'Слишком много заявок, попробуйте позже' }, { status: 429 })

  const parsed = leadSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Проверьте поля формы' }, { status: 400 })
  // honeypot: бот заполнил скрытое поле — делаем вид, что всё хорошо
  if (parsed.data.website) return NextResponse.json({ ok: true })

  const { name, contact, project, message } = parsed.data

  // Полный режим: тема в группе менеджеров + ссылка на двустороннюю переписку с клиентом в боте
  const bot = getBot()
  if (bot) {
    try {
      const { botLink } = await submitLead(bot, { name, contact, project, message })
      return NextResponse.json({ ok: true, botLink })
    } catch (e) {
      console.error('[lead] telegram', e)
      return NextResponse.json({ ok: false, error: 'Не удалось отправить, напишите нам в Telegram' }, { status: 502 })
    }
  }

  // Упрощённый режим (бот не настроен): просто сообщение в чат, без переписки
  const text = `Новая заявка KOVAGOR\nИмя: ${name}\nКонтакт: ${contact}\nТариф: ${project}\n${message ? `Сообщение: ${message}` : ''}`
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chat = process.env.TELEGRAM_CHAT_ID ?? process.env.TELEGRAM_GROUP_ID
  if (token && chat) {
    const r = await fetch(`${process.env.TELEGRAM_API_BASE ?? 'https://api.telegram.org'}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text }),
    })
    if (!r.ok) return NextResponse.json({ ok: false, error: 'Не удалось отправить, напишите нам в Telegram' }, { status: 502 })
  } else {
    console.info('[lead]', text) // dev: Telegram не настроен
  }
  return NextResponse.json({ ok: true })
}
