import { timingSafeEqual } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { getStore } from '@/lib/telegram'
import { parseStartParam } from '@/lib/telegram/link'

const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b))

/** Бот (Cloudflare Worker) забирает карточку заявки по подписанному токену из ссылки t.me/<бот>?start=… */
export async function GET(req: NextRequest) {
  const secret = process.env.LEAD_PULL_SECRET
  if (!secret || !same(req.headers.get('x-pull-secret') ?? '', secret)) return NextResponse.json({ ok: false }, { status: 403 })

  const id = parseStartParam(secret, req.nextUrl.searchParams.get('token') ?? '')
  const lead = id ? getStore()?.getLead(id) : undefined
  if (!lead) return NextResponse.json({ ok: false }, { status: 404 })
  return NextResponse.json({ ok: true, name: lead.name, contact: lead.contact, project: lead.project, message: lead.message, quiz: lead.quiz })
}
