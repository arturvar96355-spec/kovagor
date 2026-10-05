import type { Metadata } from 'next'
import { LegalPage, OPERATOR } from '@/components/legal/legal-page'

export const metadata: Metadata = { title: 'Публичная оферта — KOVAGOR' }

export default function Page() {
  return (
    <LegalPage title="Публичная оферта" updated="TODO(legal)">
      <p>Исполнитель: {OPERATOR}.</p>
      <p>TODO(legal): текст оферты формируется по шаблону договора студии (предмет, этапы, порядок приёмки, оплата, права на результат, ответственность). Не публиковать без проверки юристом.</p>
    </LegalPage>
  )
}
