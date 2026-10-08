/**
 * Данные оператора персональных данных и исполнителя — единый источник для политики, согласия, оферты и футера.
 * Заполняются владельцем (формулировки должен вычитать юрист). Пустые поля показываются как TODO(legal) на юридических страницах.
 */
export const legal = {
  /** Форма: «ИП Иванов Иван Иванович», «ООО «…»», «самозанятый Иванов И. И.» */
  operatorName: '',
  inn: '',
  /** ОГРН (для ООО) или ОГРНИП (для ИП); у самозанятого пусто */
  ogrn: '',
  address: '',
  /** Контакт для обращений по персональным данным (почты у студии нет) */
  phone: '+7 999 782-65-14',
  telegram: 'https://t.me/kovagor',
} as const

/** Версии документов: меняйте при каждой правке текста; версия пишется в журнал согласий. */
export const POLICY_VERSION = '2026-10-draft'
export const CONSENT_VERSION = '2026-10-draft'
export const POLICY_EFFECTIVE = '8 октября 2026 г.'
export const POLICY_UPDATED = '8 октября 2026 г.'

const todo = (v: string, label: string) => v || `TODO(legal): ${label}`

export function operatorLines() {
  return {
    name: todo(legal.operatorName, 'наименование оператора'),
    inn: todo(legal.inn, 'ИНН'),
    ogrn: legal.ogrn,
    address: todo(legal.address, 'адрес'),
    contact: `телефон ${legal.phone}, Telegram ${legal.telegram}`,
  }
}

/** Реквизиты для футера: показываются, только когда заполнены (чтобы на сайте не висели TODO). */
export function footerRequisites(): string | null {
  if (!legal.operatorName) return null
  return [legal.operatorName, legal.inn && `ИНН ${legal.inn}`, legal.ogrn && `ОГРН(ИП) ${legal.ogrn}`, legal.address].filter(Boolean).join(' · ')
}
