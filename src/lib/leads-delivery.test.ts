import { SMTPServer } from 'smtp-server'
import { describe, expect, it, vi } from 'vitest'
import { getMailConfig, sendLeadEmail } from './email'
import { deliverLead } from './leads-delivery'
import { TelegramError } from './telegram/api'
import type { Deps } from './telegram/bot'
import { Store } from './telegram/store'

const lead = { name: 'Иван', contact: 'ivan@example.com', project: 'studio', message: 'Нужен сайт' }
const mail = { host: 'h', port: 465, secure: true, user: 'u', pass: 'p', from: 'u', to: ['a@b.c'] }

const botWith = (call: Deps['api']['call']): Deps => ({
  api: { call },
  store: new Store(':memory:'),
  config: { groupId: -1, botUsername: 'b', secret: 's'.repeat(20), siteUrl: 'https://x.ru' },
})
const tgDown = botWith(async (m) => {
  throw new TelegramError(m, 0, 'fetch failed')
})
const tgUp = botWith(async <T,>(m: string) => (m === 'createForumTopic' ? { message_thread_id: 1 } : true) as T)

describe('доставка заявки', () => {
  it('Telegram недоступен, email работает — заявка принята, без ссылки на бота', async () => {
    const sendMail = vi.fn().mockResolvedValue(undefined)
    const r = await deliverLead(lead, { bot: tgDown, mail, sendMail })
    expect(r).toMatchObject({ delivered: true, channels: { telegram: false, email: true } })
    expect(r.botLink).toBeUndefined()
    expect(sendMail).toHaveBeenCalledOnce()
  })

  it('всё работает — есть ссылка на бота и письмо', async () => {
    const r = await deliverLead(lead, { bot: tgUp, mail, sendMail: vi.fn().mockResolvedValue(undefined) })
    expect(r.delivered).toBe(true)
    expect(r.botLink).toMatch(/t\.me\/b\?start=lead_/)
  })

  it('оба канала упали — заявка не принята (форма покажет ошибку)', async () => {
    const r = await deliverLead(lead, { bot: tgDown, mail, sendMail: vi.fn().mockRejectedValue(new Error('smtp')) })
    expect(r.delivered).toBe(false)
  })

  it('только email настроен', async () => {
    const r = await deliverLead(lead, { bot: null, mail, sendMail: vi.fn().mockResolvedValue(undefined) })
    expect(r).toMatchObject({ delivered: true, channels: { email: true } })
  })

  it('ничего не настроено (dev) — принимаем, пишем в лог', async () => {
    const r = await deliverLead(lead, { bot: null, mail: null })
    expect(r.delivered).toBe(true)
  })
})

describe('email', () => {
  it('конфиг читается из окружения, без обязательных переменных — null', () => {
    expect(getMailConfig({} as NodeJS.ProcessEnv)).toBeNull()
    const c = getMailConfig({ SMTP_HOST: 'smtp.yandex.ru', SMTP_USER: 'a@b.ru', SMTP_PASS: 'x', LEAD_EMAIL_TO: 'm1@b.ru, m2@b.ru' } as unknown as NodeJS.ProcessEnv)
    expect(c).toMatchObject({ port: 465, secure: true, from: 'a@b.ru', to: ['m1@b.ru', 'm2@b.ru'] })
  })

  it('письмо реально уходит на SMTP-сервер с данными заявки', async () => {
    let raw = ''
    const server = new SMTPServer({
      authOptional: true,
      allowInsecureAuth: true,
      disabledCommands: ['STARTTLS'],
      onAuth: (_a, _s, cb) => cb(null, { user: 'u' }),
      onData(stream, _s, cb) {
        stream.on('data', (d) => (raw += d.toString()))
        stream.on('end', cb)
      },
    })
    await new Promise<void>((r) => server.listen(0, '127.0.0.1', r))
    const port = (server.server.address() as { port: number }).port
    await sendLeadEmail({ ...mail, host: '127.0.0.1', port, secure: false }, { id: 7, ...lead })
    server.close()
    const decoded = Buffer.from(raw.split('\r\n\r\n').slice(1).join('\r\n\r\n'), 'base64').toString('utf8')
    expect(raw).toContain('Subject:')
    expect(raw + decoded).toContain('Иван')
    expect(raw + decoded).toContain('ivan@example.com')
  })
})
