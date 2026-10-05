import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal/legal-page'
import { POLICY_VERSION } from '@/content/legal'

export const metadata: Metadata = { title: 'Политика cookie — KOVAGOR' }

const rows: [string, string, string, string][] = [
  ['kv-cookie-consent', 'Запоминает ваш выбор в баннере cookie', 'Необходимый (localStorage)', 'пока вы не очистите данные браузера'],
  ['kv-preloaded', 'Не показывать заставку повторно в рамках сессии', 'Необходимый (sessionStorage)', 'до закрытия вкладки'],
  ['_ym_uid, _ym_d, _ym_isad, _ym_metrika_enabled', 'Яндекс.Метрика: идентификатор посетителя, дата первого визита, проверка блокировщиков', 'Аналитический', 'до 1 года'],
]

export default function Page() {
  return (
    <LegalPage title="Политика использования cookie" updated={`версия ${POLICY_VERSION}`}>
      <h2>Что это</h2>
      <p>Cookie и похожие технологии (localStorage) — небольшие данные, которые сайт сохраняет в вашем браузере. Так сайт запоминает ваш выбор, а аналитика — понимает, как работает страница.</p>

      <h2>Что мы используем</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-[15px]">
          <thead>
            <tr className="border-b border-line text-ink">
              <th className="py-3 pr-4 font-medium">Название</th>
              <th className="py-3 pr-4 font-medium">Зачем</th>
              <th className="py-3 pr-4 font-medium">Тип</th>
              <th className="py-3 font-medium">Срок</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[0]} className="border-b border-line align-top">
                {r.map((c, i) => (
                  <td key={i} className="py-3 pr-4">{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>Необходимые данные нужны, чтобы сайт работал, и не требуют согласия. Аналитические — подключаются <strong>только после вашего согласия</strong> в баннере. Рекламные cookie и пиксели не используются. Вебвизор (запись действий на странице) не используется.</p>

      <h2>Кому передаются данные аналитики</h2>
      <p>ООО «ЯНДЕКС» — в соответствии с <a className="underline" href="https://yandex.ru/legal/confidential/" target="_blank" rel="noopener noreferrer">политикой конфиденциальности Яндекса</a>. TODO(legal): подтвердить формулировки с юристом.</p>

      <h2>Как изменить выбор</h2>
      <p>Нажмите «Настройки cookie» внизу страницы — баннер появится снова, и вы сможете принять или отклонить аналитику в любой момент; отказ так же прост, как согласие. Cookie можно также запретить в настройках браузера — часть функций тогда может работать иначе.</p>
    </LegalPage>
  )
}
