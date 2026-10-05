import type { Deps } from './telegram/bot'
import { submitLead, type LeadInput } from './telegram/leads'
import { sendLeadEmail, type LeadMail, type MailConfig } from './email'

/** Каждый канал ограничен по времени: медленный Telegram не должен держать форму дольше этого. */
const CHANNEL_TIMEOUT_MS = 12_000

const withTimeout = <T,>(p: Promise<T>) =>
  Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error('timeout')), CHANNEL_TIMEOUT_MS))])

export type DeliveryResult = { delivered: boolean; botLink?: string; channels: { telegram?: boolean; email?: boolean } }

/**
 * Доставка заявки по всем настроенным каналам одновременно: Telegram (тема в группе + ссылка на переписку) и email.
 * Заявка считается принятой, если дошла хотя бы по одному каналу. Если не настроен ни один — это dev-режим, пишем в лог.
 */
export async function deliverLead(
  input: LeadInput,
  opts: { bot: Deps | null; mail: MailConfig | null; sendMail?: typeof sendLeadEmail; plainTelegram?: (text: string) => Promise<void> },
): Promise<DeliveryResult> {
  const { bot, mail, plainTelegram } = opts
  const sendMail = opts.sendMail ?? sendLeadEmail
  const channels: DeliveryResult['channels'] = {}
  let botLink: string | undefined

  const tasks: Promise<void>[] = []

  if (bot) {
    tasks.push(
      withTimeout(submitLead(bot, input)).then(
        (r) => {
          channels.telegram = true
          botLink = r.botLink
        },
        (e) => {
          channels.telegram = false
          console.error('[lead] telegram недоступен:', e instanceof Error ? e.message : e)
        },
      ),
    )
  } else if (plainTelegram) {
    const text = `Новая заявка KOVAGOR\nИмя: ${input.name}\nКонтакт: ${input.contact}\nТариф: ${input.project}\n${input.message ? `Сообщение: ${input.message}` : ''}`
    tasks.push(
      withTimeout(plainTelegram(text)).then(
        () => void (channels.telegram = true),
        (e) => {
          channels.telegram = false
          console.error('[lead] telegram недоступен:', e instanceof Error ? e.message : e)
        },
      ),
    )
  }

  if (mail) {
    const mailInput: LeadMail = { ...input }
    tasks.push(
      withTimeout(sendMail(mail, mailInput)).then(
        () => void (channels.email = true),
        (e) => {
          channels.email = false
          console.error('[lead] email не отправлен:', e instanceof Error ? e.message : e)
        },
      ),
    )
  }

  await Promise.all(tasks)

  const configured = Object.keys(channels).length > 0
  if (!configured) {
    console.info('[lead] каналы доставки не настроены, заявка только в логе:', JSON.stringify(input))
    return { delivered: true, channels }
  }
  return { delivered: Object.values(channels).some(Boolean), botLink, channels }
}
