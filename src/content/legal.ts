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
  email: '',
  phone: '',
} as const

/** Версии документов: меняйте при каждой правке текста; версия пишется в журнал согласий. */
export const POLICY_VERSION = '2026-10-draft'
export const CONSENT_VERSION = '2026-10-draft'
export const POLICY_EFFECTIVE = 'TODO(legal)'
export const POLICY_UPDATED = 'TODO(legal)'

const todo = (v: string, label: string) => v || `TODO(legal): ${label}`

export function operatorLines() {
  return {
    name: todo(legal.operatorName, 'наименование оператора'),
    inn: todo(legal.inn, 'ИНН'),
    ogrn: legal.ogrn,
    address: todo(legal.address, 'адрес'),
    email: todo(legal.email, 'email для обращений'),
  }
}

/** Реквизиты для футера: показываются, только когда заполнены (чтобы на сайте не висели TODO). */
export function footerRequisites(): string | null {
  if (!legal.operatorName) return null
  return [legal.operatorName, legal.inn && `ИНН ${legal.inn}`, legal.ogrn && `ОГРН(ИП) ${legal.ogrn}`, legal.address].filter(Boolean).join(' · ')
}
