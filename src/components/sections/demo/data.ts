// Данные демо «сайт → Telegram → CRM». Всё вымышленное: это макеты, а не чьи-то реальные системы.
export type Stage = 'new' | 'work' | 'paid'
export type Source = 'Сайт' | 'Telegram' | 'Звонок'
export type Lead = { id: number; name: string; contact: string; service: string; slot: string; source: Source; sum: number; stage: Stage; at: string; note: string }
export type Form = { name: string; contact: string; service: string; slot: string }
export type Service = { id: string; name: string; price: number; text: string }
export type PresetId = 'salon' | 'clinic' | 'shop'

export type Preset = {
  id: PresetId
  label: string
  brand: string
  domain: string
  kicker: string
  title: string
  text: string
  tags: string[]
  action: string
  catalog: string
  book: string
  slotsTitle: string
  blobs: [string, string]
  services: Service[]
  seed: Lead[]
  incoming: { name: string; contact: string; service: string; source: Source }[]
  playName: string
  playService: string
}

const L = (id: number, name: string, contact: string, service: string, price: number, slot: string, source: Source, stage: Stage, at: string, note = ''): Lead => ({ id, name, contact, service, slot, source, sum: price, stage, at, note })

export const PRESETS: Record<PresetId, Preset> = {
  salon: {
    id: 'salon', label: 'Салон красоты', brand: 'Лён', domain: 'len.example', kicker: 'Студия красоты · макет',
    title: 'Стрижка, которую хочется показывать', text: 'Выберите услугу, время и запишитесь за минуту. Напомним за день.',
    tags: ['Ежедневно 10–21', 'Онлайн-запись', 'Напоминания в Telegram'], action: 'Записаться', catalog: 'Услуги', book: 'Запись', slotsTitle: 'Время сегодня',
    blobs: ['#e8d9c1', '#d9e2d6'], playName: 'Алина', playService: 'color',
    services: [
      { id: 'cut', name: 'Стрижка', price: 1800, text: 'Подбор формы и укладка' },
      { id: 'color', name: 'Окрашивание', price: 4500, text: 'Цвет под ваш тон' },
      { id: 'style', name: 'Укладка', price: 1200, text: 'К событию или на каждый день' },
      { id: 'care', name: 'Уход за волосами', price: 2600, text: 'Восстановление и блеск' },
    ],
    seed: [
      L(1, 'Ирина К.', '@irina_k', 'Окрашивание', 4500, 'сегодня 11:30', 'Telegram', 'new', '12 мин назад'),
      L(2, 'Максим', '+7 000 000-00-02', 'Стрижка', 1800, 'завтра 10:00', 'Звонок', 'work', '1 ч назад', 'Просил перезвонить после 18:00'),
      L(3, 'Ольга П.', '@olga_p', 'Уход за волосами', 2600, 'завтра 16:00', 'Сайт', 'work', '2 ч назад'),
      L(4, 'Дмитрий', '@dmitry_x', 'Укладка', 1200, 'вчера 13:00', 'Telegram', 'paid', 'вчера'),
      L(5, 'Анна С.', '@anna_s', 'Окрашивание', 4500, 'вчера 17:30', 'Сайт', 'paid', 'вчера', 'Постоянный клиент'),
    ],
    incoming: [
      { name: 'Мария В.', contact: '+7 000 000-00-11', service: 'Стрижка', source: 'Звонок' },
      { name: 'Олег', contact: '@oleg_r', service: 'Укладка', source: 'Telegram' },
      { name: 'Светлана', contact: '@sveta_m', service: 'Уход за волосами', source: 'Telegram' },
    ],
  },
  clinic: {
    id: 'clinic', label: 'Клиника', brand: 'Ясный приём', domain: 'yasny.example', kicker: 'Частная клиника · макет',
    title: 'Запись к врачу за минуту', text: 'Выберите услугу и время, администратор подтвердит запись и напомнит о приёме.',
    tags: ['Ежедневно 8–20', 'Онлайн-запись', 'Напоминание о приёме'], action: 'Записаться', catalog: 'Услуги', book: 'Запись', slotsTitle: 'Приём сегодня',
    blobs: ['#d6e4f0', '#dff0e6'], playName: 'Елена', playService: 'ultra',
    services: [
      { id: 'ther', name: 'Консультация терапевта', price: 1500, text: 'Осмотр и план обследования' },
      { id: 'ultra', name: 'УЗИ', price: 2200, text: 'Без долгого ожидания' },
      { id: 'tests', name: 'Анализы', price: 900, text: 'Результаты придут онлайн' },
      { id: 'dent', name: 'Стоматолог', price: 3000, text: 'Осмотр и чистка' },
    ],
    seed: [
      L(1, 'Наталья Р.', '@natalya_r', 'УЗИ', 2200, 'сегодня 11:30', 'Telegram', 'new', '8 мин назад'),
      L(2, 'Сергей', '+7 000 000-00-21', 'Консультация терапевта', 1500, 'завтра 10:00', 'Звонок', 'work', '1 ч назад', 'Нужна справка'),
      L(3, 'Ольга П.', '@olga_p', 'Анализы', 900, 'завтра 8:30', 'Сайт', 'work', '3 ч назад'),
      L(4, 'Виктор', '@viktor_m', 'Стоматолог', 3000, 'вчера 14:30', 'Сайт', 'paid', 'вчера'),
      L(5, 'Анна С.', '@anna_s', 'УЗИ', 2200, 'вчера 17:30', 'Telegram', 'paid', 'вчера'),
    ],
    incoming: [
      { name: 'Павел', contact: '+7 000 000-00-31', service: 'Консультация терапевта', source: 'Звонок' },
      { name: 'Марина', contact: '@marina_k', service: 'Анализы', source: 'Telegram' },
      { name: 'Игорь', contact: '@igor_v', service: 'Стоматолог', source: 'Telegram' },
    ],
  },
  shop: {
    id: 'shop', label: 'Магазин цветов', brand: 'Лепесток', domain: 'lepestok.example', kicker: 'Цветочная мастерская · макет',
    title: 'Цветы с доставкой к нужному часу', text: 'Соберите букет и выберите время доставки. Подтвердим заказ в Telegram.',
    tags: ['Доставка по городу', 'Свежие поставки', 'Открытка в подарок'], action: 'Заказать', catalog: 'Каталог', book: 'Заказ', slotsTitle: 'Доставка сегодня',
    blobs: ['#f1d9de', '#e2ead3'], playName: 'Дарья', playService: 'mix',
    services: [
      { id: 'mono', name: 'Монобукет', price: 2200, text: 'Один сорт, много характера' },
      { id: 'mix', name: 'Букет-микс', price: 3200, text: 'Сезонные цветы и зелень' },
      { id: 'box', name: 'Композиция в коробке', price: 4100, text: 'Готовый подарок' },
      { id: 'sub', name: 'Подписка на цветы', price: 5600, text: 'Свежий букет каждую неделю' },
    ],
    seed: [
      L(1, 'Ксения', '@ksenia_f', 'Букет-микс', 3200, 'сегодня 16:00', 'Telegram', 'new', '5 мин назад'),
      L(2, 'Антон', '+7 000 000-00-41', 'Монобукет', 2200, 'завтра 10:00', 'Звонок', 'work', '1 ч назад', 'Нужна открытка'),
      L(3, 'Ольга П.', '@olga_p', 'Композиция в коробке', 4100, 'завтра 13:00', 'Сайт', 'work', '2 ч назад'),
      L(4, 'Роман', '@roman_d', 'Подписка на цветы', 5600, 'вчера 17:30', 'Сайт', 'paid', 'вчера'),
      L(5, 'Анна С.', '@anna_s', 'Монобукет', 2200, 'вчера 13:00', 'Telegram', 'paid', 'вчера'),
    ],
    incoming: [
      { name: 'Юлия', contact: '+7 000 000-00-51', service: 'Букет-микс', source: 'Звонок' },
      { name: 'Денис', contact: '@denis_o', service: 'Монобукет', source: 'Telegram' },
      { name: 'Вера', contact: '@vera_l', service: 'Композиция в коробке', source: 'Telegram' },
    ],
  },
}

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

export const SOURCES_LIST: Source[] = ['Сайт', 'Telegram', 'Звонок']
export const fmt = (n: number) => n.toLocaleString('ru-RU')
export const serviceOf = (p: Preset, idOrName: string) => p.services.find((s) => s.id === idOrName || s.name === idOrName)

// недельная выручка для графика дашборда (условные единицы, тысячи ₽)
export const WEEK = [8, 11, 9, 14, 12, 17, 15]
