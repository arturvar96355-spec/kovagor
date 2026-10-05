import type { Metadata } from 'next'
import { LegalPage, OPERATOR } from '@/components/legal/legal-page'

export const metadata: Metadata = { title: 'Публичная оферта — KOVAGOR' }

/** Каркас. TODO(legal): подготовить текст по шаблону договора из пакета (CONTRACT_TEMPLATE) и проверить юристом до публикации. */
export default function Page() {
  return (
    <LegalPage title="Публичная оферта" updated="TODO(legal)">
      <p>Исполнитель: {OPERATOR}.</p>
      <h2>Разделы, которые должен содержать текст</h2>
      <ul>
        <li>предмет договора и состав работ по тарифам;</li>
        <li>этапы, сроки и порядок приёмки;</li>
        <li>стоимость, порядок и график оплаты;</li>
        <li>обязанности заказчика (материалы, согласования в срок);</li>
        <li>права на результат и исходный код;</li>
        <li>правки: сколько кругов входит;</li>
        <li>ответственность, гарантии, поддержка после запуска;</li>
        <li>порядок расторжения и разрешения споров.</li>
      </ul>
      <p>TODO(legal): до заполнения этой страницы не публикуйте сайт для приёма платежей.</p>
    </LegalPage>
  )
}
