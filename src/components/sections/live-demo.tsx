'use client'

import { useId, useState, type FormEvent } from 'react'
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from 'motion/react'
import { SectionHead } from '@/components/motion/section-head'
import { Reveal } from '@/components/motion/reveal'

type Stage = 'new' | 'work' | 'paid'
type Source = 'Сайт' | 'Telegram' | 'Звонок'
type Lead = { id: number; name: string; source: Source; sum: number; stage: Stage }

const STAGES: { id: Stage; title: string; next: Stage }[] = [
  { id: 'new', title: 'Новые', next: 'work' },
  { id: 'work', title: 'В работе', next: 'paid' },
  { id: 'paid', title: 'Оплачено', next: 'new' },
]
const SOURCES: Source[] = ['Сайт', 'Telegram', 'Звонок']
// Все данные ниже вымышленные: это макет, а не чья-то реальная система
const START: Lead[] = [
  { id: 1, name: 'Ирина К.', source: 'Telegram', sum: 4200, stage: 'new' },
  { id: 2, name: 'Максим', source: 'Звонок', sum: 1800, stage: 'work' },
  { id: 3, name: 'Ольга П.', source: 'Сайт', sum: 6500, stage: 'work' },
  { id: 4, name: 'Дмитрий', source: 'Telegram', sum: 3100, stage: 'paid' },
  { id: 5, name: 'Анна С.', source: 'Сайт', sum: 2400, stage: 'paid' },
]
const fmt = (n: number) => n.toLocaleString('ru-RU')
const SPRING = { type: 'spring', stiffness: 380, damping: 34 } as const

/** Живое демо «сайт ↔ CRM»: заявка, оставленная на макете сайта, появляется в CRM и «уходит» в Telegram-уведомление. Вся логика на клиенте, данные вымышленные. */
export function LiveDemo() {
  const uid = useId()
  const [view, setView] = useState<'site' | 'crm'>('site')
  const [crmTab, setCrmTab] = useState<'deals' | 'stats'>('deals')
  const [leads, setLeads] = useState<Lead[]>(START)
  const [unseen, setUnseen] = useState(0)
  const [notice, setNotice] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const move = (id: number) =>
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, stage: STAGES.find((s) => s.id === l.stage)!.next } : l)))

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const name = String(f.get('name') ?? '').trim()
    const contact = String(f.get('contact') ?? '').trim()
    if (name.length < 2 || contact.length < 3) return setError('Заполните имя и контакт: это макет, данные никуда не уходят')
    setError('')
    setLeads((ls) => [{ id: Date.now(), name, source: 'Сайт', sum: 2900, stage: 'new' }, ...ls])
    setUnseen((n) => n + 1)
    setNotice(`Telegram · новая заявка с сайта: ${name}`)
    setSent(true)
    e.currentTarget.reset()
  }

  const openView = (v: 'site' | 'crm') => {
    setView(v)
    if (v === 'crm') setUnseen(0)
  }

  const total = leads.length
  const paid = leads.filter((l) => l.stage === 'paid').reduce((s, l) => s + l.sum, 0)
  const inWork = leads.filter((l) => l.stage === 'work').length
  const bySource = SOURCES.map((s) => ({ s, n: leads.filter((l) => l.source === s).length }))
  const max = Math.max(1, ...bySource.map((b) => b.n))

  return (
    <MotionConfig reducedMotion="user">
      <section id="demo" className="relative border-t border-line py-[14vh]">
        <div className="container-x">
          <SectionHead index="02" label="Демо" title="Сайт и CRM: потрогайте" />
          <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)] lg:gap-16">
            <Reveal className="max-w-md">
              <p data-stagger className="text-lg leading-relaxed text-ink-2">
                Справа макет сайта и CRM с вымышленными данными. Оставьте заявку на «сайте» и посмотрите, как она оказывается в CRM, а в мессенджер уходит уведомление.
              </p>
              <ol data-stagger className="mt-8 space-y-4">
                {['Заполните форму на «сайте» и отправьте.', 'Переключитесь на «CRM»: заявка уже в колонке «Новые».', 'Нажимайте на карточки: они переезжают по этапам, а дашборд считает итоги.'].map((t, i) => (
                  <li key={t} className="flex gap-4">
                    <span className="font-display text-xl text-mute">0{i + 1}</span>
                    <span className="text-lg">{t}</span>
                  </li>
                ))}
              </ol>
              <p data-stagger className="mt-8 text-sm leading-relaxed text-mute">
                Это макет, а не готовый продукт: на вашем проекте состав подгоняем под задачу. Подключение CRM входит в тариф «Эталон».
              </p>
              <a
                href="#contact"
                data-stagger
                data-goal="demo_cta"
                onClick={() => window.dispatchEvent(new CustomEvent('pick-tariff', { detail: 'flagship' }))}
                className="mt-8 inline-block rounded-full bg-ink px-8 py-4 text-xs uppercase tracking-[0.2em] text-paper transition-colors hover:bg-ink-2"
              >
                Хочу так же
              </a>
            </Reveal>

            <div>
              {/* окно «браузера» */}
              <div className="overflow-hidden rounded-3xl border border-ink/15 bg-paper-2 shadow-[0_30px_80px_-40px_rgba(31,31,29,.45)]">
                <div className="flex items-center gap-3 border-b border-ink/10 bg-ink px-4 py-3 text-paper">
                  <span aria-hidden className="flex gap-1.5">
                    <i className="h-2.5 w-2.5 rounded-full bg-paper/30" />
                    <i className="h-2.5 w-2.5 rounded-full bg-paper/30" />
                    <i className="h-2.5 w-2.5 rounded-full bg-paper/30" />
                  </span>
                  <span className="min-w-0 flex-1 truncate rounded-md bg-paper/10 px-3 py-1 text-center text-xs tracking-wider text-paper/70">
                    {view === 'site' ? 'kofeinya.example' : 'crm.kofeinya.example'}
                  </span>
                  <span className="hidden rounded-full border border-paper/30 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] text-paper/70 sm:inline">макет</span>
                </div>

                <div className="relative min-h-[470px] sm:min-h-[430px]">
                  <AnimatePresence mode="wait" initial={false}>
                    {view === 'site' ? (
                      <motion.div key="site" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }} className="p-6 sm:p-8">
                        <div className="flex items-center justify-between">
                          <span className="font-display text-2xl">Зерно</span>
                          <span aria-hidden className="hidden gap-5 text-sm text-ink-2 sm:flex">
                            <span>Кофе</span>
                            <span>Меню</span>
                            <span>Контакты</span>
                          </span>
                        </div>
                        <p className="mt-10 text-[11px] uppercase tracking-[0.3em] text-mute">Кофейня · пример</p>
                        <h3 className="mt-3 font-display text-4xl leading-[1.05] sm:text-5xl">Свежая обжарка,<br />и всё про кофе</h3>
                        <p className="mt-4 max-w-sm text-ink-2">Запишитесь на дегустацию: расскажем про зёрна и подберём ваш вкус.</p>

                        <form onSubmit={submit} className="mt-8 max-w-sm space-y-3" noValidate>
                          <label className="block">
                            <span className="sr-only">Имя</span>
                            <input name="name" placeholder="Имя" autoComplete="off" className="w-full rounded-xl border border-ink/20 bg-paper px-4 py-3 outline-none focus:border-ink" />
                          </label>
                          <label className="block">
                            <span className="sr-only">Телефон или Telegram</span>
                            <input name="contact" placeholder="Телефон или Telegram" autoComplete="off" className="w-full rounded-xl border border-ink/20 bg-paper px-4 py-3 outline-none focus:border-ink" />
                          </label>
                          <button className="rounded-full bg-ink px-7 py-3 text-xs uppercase tracking-[0.2em] text-paper transition-colors hover:bg-ink-2">Записаться</button>
                          <p role="status" className={`min-h-5 text-sm ${error ? 'text-red-700' : 'text-ink-2'}`}>
                            {error || (sent ? 'Заявка отправлена. Откройте вкладку «CRM»: она уже там.' : 'Это макет: данные остаются в этом окне.')}
                          </p>
                        </form>
                      </motion.div>
                    ) : (
                      <motion.div key="crm" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }} className="flex min-h-[470px] bg-ink text-paper sm:min-h-[430px]">
                        <aside aria-hidden className="hidden w-36 shrink-0 flex-col gap-1 border-r border-paper/10 p-4 text-sm text-paper/60 sm:flex">
                          <span className="mb-4 font-display text-lg text-paper">Зерно CRM</span>
                          <span className="rounded-lg bg-paper/10 px-3 py-2 text-paper">Сделки</span>
                          <span className="px-3 py-2">Клиенты</span>
                          <span className="px-3 py-2">Задачи</span>
                          <span className="px-3 py-2">Настройки</span>
                        </aside>
                        <div className="min-w-0 flex-1 p-4 sm:p-5">
                          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <div role="tablist" aria-label="Раздел CRM" className="flex gap-1 rounded-full bg-paper/10 p-1 text-xs">
                              {([['deals', 'Сделки'], ['stats', 'Дашборд']] as const).map(([id, label]) => (
                                <button key={id} role="tab" aria-selected={crmTab === id} onClick={() => setCrmTab(id)} className={`rounded-full px-4 py-1.5 transition-colors ${crmTab === id ? 'bg-paper text-ink' : 'text-paper/70 hover:text-paper'}`}>
                                  {label}
                                </button>
                              ))}
                            </div>
                            <AnimatePresence>
                              {notice && (
                                <motion.p key={notice} role="status" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="max-w-full truncate rounded-full border border-paper/25 px-3 py-1 text-xs text-paper/80">
                                  {notice}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>

                          {crmTab === 'deals' ? (
                            <LayoutGroup id={uid}>
                              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                {STAGES.map((st) => (
                                  <div key={st.id} className="min-w-0 rounded-2xl bg-paper/[0.06] p-2 sm:p-3">
                                    <p className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.15em] text-paper/60">
                                      <span className="truncate">{st.title}</span>
                                      <span>{leads.filter((l) => l.stage === st.id).length}</span>
                                    </p>
                                    <ul className="space-y-2">
                                      {leads.filter((l) => l.stage === st.id).map((l) => (
                                        <motion.li key={l.id} layout layoutId={`${uid}-${l.id}`} transition={SPRING}>
                                          <button
                                            onClick={() => move(l.id)}
                                            aria-label={`${l.name}, ${l.source}, ${fmt(l.sum)} ₽. Перенести в «${STAGES.find((s) => s.id === st.next)!.title}»`}
                                            className="w-full rounded-xl bg-paper p-2.5 text-left text-ink transition-transform hover:-translate-y-0.5 sm:p-3"
                                          >
                                            <span className="block truncate text-sm font-medium">{l.name}</span>
                                            <span className="block truncate text-[11px] text-mute">{l.source}</span>
                                            <span className="mt-1 block text-xs">{fmt(l.sum)} ₽</span>
                                          </button>
                                        </motion.li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                              <p className="mt-3 text-xs text-paper/60">Нажмите на карточку, чтобы перенести её на следующий этап.</p>
                            </LayoutGroup>
                          ) : (
                            <div>
                              <dl className="grid grid-cols-3 gap-2 sm:gap-3">
                                {[['Заявок', String(total)], ['В работе', String(inWork)], ['Оплачено', `${fmt(paid)} ₽`]].map(([k, v]) => (
                                  <div key={k} className="rounded-2xl bg-paper/[0.06] p-3">
                                    <dt className="text-[11px] uppercase tracking-[0.15em] text-paper/60">{k}</dt>
                                    <dd className="mt-1 font-display text-2xl sm:text-3xl">{v}</dd>
                                  </div>
                                ))}
                              </dl>
                              <div className="mt-4 rounded-2xl bg-paper/[0.06] p-4">
                                <p className="mb-3 text-[11px] uppercase tracking-[0.15em] text-paper/60">Заявки по каналам</p>
                                <ul className="space-y-3">
                                  {bySource.map((b) => (
                                    <li key={b.s} className="flex items-center gap-3 text-sm">
                                      <span className="w-20 shrink-0 text-paper/80">{b.s}</span>
                                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-paper/10">
                                        <motion.span className="block h-full origin-left rounded-full bg-paper" initial={false} animate={{ scaleX: b.n / max }} transition={SPRING} />
                                      </span>
                                      <span className="w-5 text-right">{b.n}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* переключатель «Сайт / CRM» */}
              <div role="tablist" aria-label="Что показать" className="mx-auto mt-6 flex w-fit gap-1 rounded-full border border-ink/20 bg-paper p-1">
                {([['site', 'Сайт'], ['crm', 'CRM']] as const).map(([id, label]) => (
                  <button
                    key={id}
                    role="tab"
                    aria-selected={view === id}
                    data-goal="demo_tab"
                    data-goal-param={id}
                    onClick={() => openView(id)}
                    className={`relative rounded-full px-7 py-2.5 text-xs uppercase tracking-[0.2em] transition-colors ${view === id ? 'bg-ink text-paper' : 'text-ink-2 hover:text-ink'}`}
                  >
                    {label}
                    {id === 'crm' && unseen > 0 && view !== 'crm' && (
                      <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[10px] text-paper ring-2 ring-paper">{unseen}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  )
}
