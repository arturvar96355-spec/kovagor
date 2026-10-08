import { NextResponse, type NextRequest } from 'next/server'
import { leadSchema } from '@/lib/schemas'
import { rateLimit } from '@/lib/rate-limit'
import { getStore } from '@/lib/telegram'
import { makeStartParam } from '@/lib/telegram/link'
import { logConsent } from '@/lib/consent-log'
import { getMailConfig } from '@/lib/email'
import { deliverLead } from '@/lib/leads-delivery'

/**
 * Приём заявки. Данные сохраняются на нашем сервере; в Telegram-бота они попадают так: клиент переходит по ссылке
 * t.me/<бот>?start=lead_<id>_<подпись>, бот (Cloudflare Worker) забирает карточку заявки из /api/lead/pull.
 * Email — резервный канал (если настроен).
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!rateLimit(ip)) return NextResponse.json({ ok: false, error: 'Слишком много заявок, попробуйте позже' }, { status: 429 })

  const parsed = leadSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Проверьте поля формы' }, { status: 400 })
  // honeypot: бот заполнил скрытое поле — делаем вид, что всё хорошо
  if (parsed.data.website) return NextResponse.json({ ok: true })

  const { name, contact, project, message, quiz } = parsed.data
  const store = getStore()
  logConsent(store, { name, contact, ip })

  // ссылка в бота: с подписанным номером заявки, а если хранилища/секрета нет — только с тарифом
  const secret = process.env.LEAD_PULL_SECRET
  let start = project === 'other' ? '' : project
  if (store && secret) start = makeStartParam(secret, store.createLead({ name, contact, project, message, quiz }).id)
  const bot = (process.env.TELEGRAM_BOT_USERNAME ?? 'kovagor_bot').replace(/^@/, '')
  const botLink = `https://t.me/${bot}${start ? `?start=${start}` : ''}`

  const mailMessage = [message, quiz && `Подбор тарифа на сайте: ${quiz}`].filter(Boolean).join('\n\n')
  const result = await deliverLead({ name, contact, project, message: mailMessage }, { bot: null, mail: getMailConfig() })
  if (!result.delivered) {
    return NextResponse.json({ ok: false, error: 'Не удалось отправить заявку. Напишите нам напрямую — контакты рядом.' }, { status: 502 })
  }
  return NextResponse.json({ ok: true, botLink })
}
