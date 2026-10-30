// Данные демо «сайт ↔ CRM ↔ Telegram». Всё вымышленное: это макет, а не чья-то реальная система.
export type Stage = 'new' | 'work' | 'paid'
export type Source = 'Сайт' | 'Telegram' | 'Звонок'
export type Lead = { id: number; name: string; contact: string; service: string; slot: string; source: Source; sum: number; stage: Stage; at: string; note: string }
export type Form = { name: string; contact: string; service: string; slot: string }

export const SERVICES = [
  { id: 'cut', name: 'Стрижка', price: 1800, text: 'Подбор формы и укладка' },
  { id: 'color', name: 'Окрашивание', price: 4500, text: 'Цвет под ваш тон' },
  { id: 'style', name: 'Укладка', price: 1200, text: 'К событию или на каждый день' },
  { id: 'care', name: 'Уход за волосами', price: 2600, text: 'Восстановление и блеск' },
] as const

export const SLOTS = [
  { t: '10:00', busy: false },
  { t: '11:30', busy: true },
  { t: '13:00', busy: false },
  { t: '14:30', busy: false },
  { t: '16:00', busy: true },
  { t: '17:30', busy: false },
] as const

export const STAGES = [
  { id: 'new', title: 'Новые' },
  { id: 'work', title: 'В работе' },
  { id: 'paid', title: 'Оплачено' },
] as const

export const priceOf = (service: string) => SERVICES.find((s) => s.name === service || s.id === service)?.price ?? 0
export const nameOf = (id: string) => SERVICES.find((s) => s.id === id)?.name ?? id
export const fmt = (n: number) => n.toLocaleString('ru-RU')

export const SEED: Lead[] = [
  { id: 1, name: 'Ирина К.', contact: '@irina_k', service: 'Окрашивание', slot: 'сегодня 11:30', source: 'Telegram', sum: 4500, stage: 'new', at: '12 мин назад', note: '' },
  { id: 2, name: 'Максим', contact: '+7 000 000-00-02', service: 'Стрижка', slot: 'завтра 10:00', source: 'Звонок', sum: 1800, stage: 'work', at: '1 ч назад', note: 'Просил перезвонить после 18:00' },
  { id: 3, name: 'Ольга П.', contact: '@olga_p', service: 'Уход за волосами', slot: 'завтра 16:00', source: 'Сайт', sum: 2600, stage: 'work', at: '2 ч назад', note: '' },
  { id: 4, name: 'Дмитрий', contact: '@dmitry_x', service: 'Укладка', slot: 'вчера 13:00', source: 'Telegram', sum: 1200, stage: 'paid', at: 'вчера', note: '' },
  { id: 5, name: 'Анна С.', contact: '@anna_s', service: 'Окрашивание', slot: 'вчера 17:30', source: 'Сайт', sum: 4500, stage: 'paid', at: 'вчера', note: 'Постоянный клиент' },
]

export const INCOMING = [
  { name: 'Мария В.', contact: '+7 000 000-00-11', service: 'Стрижка', source: 'Звонок' as Source },
  { name: 'Олег', contact: '@oleg_r', service: 'Укладка', source: 'Telegram' as Source },
  { name: 'Светлана', contact: '@sveta_m', service: 'Уход за волосами', source: 'Telegram' as Source },
  { name: 'Игорь', contact: '+7 000 000-00-14', service: 'Стрижка', source: 'Звонок' as Source },
]

// недельная выручка для графика дашборда (условные единицы, тысячи ₽)
export const WEEK = [8, 11, 9, 14, 12, 17, 15]

export const SOURCES_LIST: Source[] = ['Сайт', 'Telegram', 'Звонок']
