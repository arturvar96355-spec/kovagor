import nodemailer from 'nodemailer'

export type LeadMail = { id?: number; name: string; contact: string; project: string; message: string }

export type MailConfig = { host: string; port: number; user: string; pass: string; from: string; to: string[]; secure: boolean }

/** Настройки SMTP из окружения; null — почта не настроена. SMTP_PASS — пароль приложения почтового сервиса. */
export function getMailConfig(env = process.env): MailConfig | null {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS, LEAD_EMAIL_TO } = env
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !LEAD_EMAIL_TO) return null
  const port = Number(env.SMTP_PORT ?? 465)
  return {
    host: SMTP_HOST,
    port,
    secure: port === 465,
    user: SMTP_USER,
    pass: SMTP_PASS,
    from: env.SMTP_FROM || SMTP_USER,
    to: LEAD_EMAIL_TO.split(',').map((s) => s.trim()).filter(Boolean),
  }
}

/** Письмо о заявке. Это резервный канал: работает, даже когда Telegram недоступен. */
export async function sendLeadEmail(cfg: MailConfig, lead: LeadMail) {
  const transport = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  })
  const text = [
    `Новая заявка${lead.id ? ` №${lead.id}` : ''} с сайта KOVAGOR`,
    '',
    `Имя: ${lead.name}`,
    `Контакт: ${lead.contact}`,
    `Тариф: ${lead.project}`,
    lead.message ? `\nСообщение:\n${lead.message}` : '',
  ].join('\n')
  await transport.sendMail({
    from: cfg.from,
    to: cfg.to,
    subject: `Заявка с сайта: ${lead.name}`,
    text,
    replyTo: lead.contact.includes('@') && !lead.contact.startsWith('@') ? lead.contact : undefined,
  })
}
