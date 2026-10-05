// TODO(content): заменить своими кейсами; pcstrela — первый реальный кейс (нужно согласие клиента на показ)
export type Project = {
  slug: string
  title: string
  kind: string
  year: string
  tone: string
  task: string
  solution: string
  stack: string[]
  url?: string
  results: { value: string; label: string }[]
}

export const projects: Project[] = [
  {
    slug: 'pk-strela',
    title: 'ПК «Стрела»',
    kind: 'Корпоративный сайт и каталог',
    year: '2026',
    tone: '#1f1f1d',
    task: 'У производителя металлоконструкций, МАФ и инженерных систем не было сайта: закупщик не мог проверить компанию, проектировщик — найти изделия и характеристики.',
    solution: 'Сайт с каталогом по семи направлениям, карточками изделий с характеристиками, портфолио объектов, документами и формой запроса КП. Админка для самостоятельного наполнения без разработчика.',
    stack: ['Next.js', 'Payload CMS', 'PostgreSQL', 'Docker'],
    results: [
      { value: '7', label: 'направлений в каталоге' },
      { value: '1 день', label: 'на запуск контента из презентации' },
      { value: '0', label: 'правок кода для наполнения' },
    ],
  },
  {
    slug: 'keystone',
    title: 'Keystone',
    kind: 'Сайт', // TODO(content): тип проекта
    year: '2026',
    tone: '#3a3a36',
    url: 'https://keystone-kv7e209bj-varde.vercel.app',
    task: 'TODO(content): задача клиента.',
    solution: 'TODO(content): что сделали.',
    stack: ['Next.js'], // TODO(content)
    results: [{ value: '—', label: 'метрика' }],
  },
  {
    slug: 'demo-2', title: 'Кейс №2', kind: 'Лендинг', year: '2026', tone: '#6b6558',
    task: 'TODO(content): задача клиента.', solution: 'TODO(content): что сделали.', stack: ['Next.js', 'GSAP'],
    results: [{ value: '—', label: 'метрика' }],
  },
  {
    slug: 'demo-3', title: 'Кейс №3', kind: 'Сайт-визитка', year: '2026', tone: '#b8b09c',
    task: 'TODO(content): задача клиента.', solution: 'TODO(content): что сделали.', stack: ['Next.js', 'Motion'],
    results: [{ value: '—', label: 'метрика' }],
  },
]

export const getProject = (slug: string) => projects.find((p) => p.slug === slug)
