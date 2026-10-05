import { createHmac, timingSafeEqual } from 'node:crypto'

const sig = (secret: string, leadId: number) => createHmac('sha256', secret).update(`lead:${leadId}`).digest('base64url').slice(0, 12)

/** Параметр deep-link (t.me/bot?start=…): lead_<id>_<подпись>. Подпись не даёт подобрать чужой номер заявки. */
export function makeStartParam(secret: string, leadId: number) {
  return `lead_${leadId}_${sig(secret, leadId)}`
}

export function parseStartParam(secret: string, param: string): number | null {
  const m = /^lead_(\d{1,9})_([A-Za-z0-9_-]{12})$/.exec(param)
  if (!m) return null
  const id = Number(m[1])
  const a = Buffer.from(m[2])
  const b = Buffer.from(sig(secret, id))
  return a.length === b.length && timingSafeEqual(a, b) ? id : null
}
