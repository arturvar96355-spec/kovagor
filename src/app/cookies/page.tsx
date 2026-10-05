import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal/legal-page'

export const metadata: Metadata = { title: 'Политика cookie — KOVAGOR' }

export default function Page() {
  return (
    <LegalPage title="Политика использования cookie" updated="TODO(legal)">
      <h2>Что такое cookie</h2>
      <p>Небольшие файлы, которые сайт сохраняет в вашем браузере, чтобы работать корректно и анализировать посещаемость.</p>
      <h2>Какие cookie мы используем</h2>
      <ul><li>необходимые — для работы сайта и формы;</li><li>аналитические (TODO(legal): подтвердить, подключается ли Яндекс.Метрика) — обезличенная статистика посещений.</li></ul>
      <h2>Как отключить</h2>
      <p>Вы можете запретить cookie в настройках браузера; часть функций сайта при этом может работать некорректно.</p>
    </LegalPage>
  )
}
