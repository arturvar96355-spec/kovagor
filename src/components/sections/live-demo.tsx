'use client'

import { useCallback, useId, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { SectionHead } from '@/components/motion/section-head'
import { Reveal } from '@/components/motion/reveal'
import { INCOMING, SEED, nameOf, priceOf, type Form, type Lead, type Stage } from './demo/data'
import { SiteView, type SitePage } from './demo/site-view'
import { CrmView, type CrmTab } from './demo/crm-view'
import { TgView } from './demo/tg-view'

type View = 'site' | 'crm' | 'tg'
const TABS: [View, string][] = [['site', 'Сайт'], ['tg', 'Telegram'], ['crm', 'CRM']]
const ADDR: Record<View, string> = { site: 'len.example', tg: 'Telegram · группа менеджеров', crm: 'crm.len.example' }
const EMPTY: Form = { name: '', contact: '', service: 'cut', slot: '13:00' }
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

type Fly = { from: DOMRect; to: DOMRect; label: string; key: number }

/**
 * Живое демо «сайт → Telegram → CRM»: заявка из формы макета сайта прилетает в CRM и чат менеджера,
 * карточки переносятся перетаскиванием, дашборд пересчитывается. Есть автопоказ «за 20 секунд». Вся логика на клиенте, данные вымышленные.
 */
export function LiveDemo() {
  const uid = useId()
  const [view, setView] = useState<View>('site')
  const [page, setPage] = useState<SitePage>('home')
  const [form, setForm] = useState<Form>(EMPTY)
  const [leads, setLeads] = useState<Lead[]>(SEED)
  const [crmTab, setCrmTab] = useState<CrmTab>('deals')
  const [openId, setOpenId] = useState<number | null>(null)
  const [sentId, setSentId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [fresh, setFresh] = useState<number | null>(null)
  const [unseen, setUnseen] = useState({ crm: 0, tg: 0 })
  const [fly, setFly] = useState<Fly | null>(null)
  const [playing, setPlaying] = useState(false)
  const run = useRef(0)
  const seq = useRef(0)
  const submitRef = useRef<HTMLButtonElement | null>(null)
  const tabRefs = useRef<Partial<Record<View, HTMLButtonElement | null>>>({})

  const go = useCallback((v: View) => {
    setView(v)
    if (v === 'crm') setUnseen((u) => ({ ...u, crm: 0 }))
    if (v === 'tg') setUnseen((u) => ({ ...u, tg: 0 }))
  }, [])

  const setStage = useCallback((id: number, stage: Stage) => setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, stage } : l))), [])
  const setNote = useCallback((id: number, note: string) => setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, note } : l))), [])

  const addLead = useCallback((l: Omit<Lead, 'id' | 'stage' | 'at' | 'note'>) => {
    const id = 100 + ++seq.current
    setLeads((ls) => [...ls, { ...l, id, stage: 'new', at: 'только что', note: '' }])
    setFresh(id)
    setTimeout(() => setFresh((f) => (f === id ? null : f)), 4500)
    return id
  }, [])

  const addIncoming = () => {
    const n = INCOMING[seq.current % INCOMING.length]
    addLead({ name: n.name, contact: n.contact, service: n.service, slot: 'завтра 12:00', source: n.source, sum: priceOf(n.service) })
    setUnseen((u) => ({ ...u, tg: n.source === 'Telegram' ? u.tg + 1 : u.tg }))
  }

  const submit = useCallback(
    (f: Form) => {
      if (f.name.trim().length < 2 || f.contact.trim().length < 3) {
        setError('Заполните имя и контакт: это макет, данные никуда не уходят')
        return false
      }
      setError('')
      const id = addLead({ name: f.name.trim(), contact: f.contact.trim(), service: nameOf(f.service), slot: `сегодня ${f.slot}`, source: 'Сайт', sum: priceOf(f.service) })
      setSentId(id)
      setUnseen((u) => ({ crm: u.crm + 1, tg: u.tg + 1 }))
      const from = submitRef.current?.getBoundingClientRect()
      const to = tabRefs.current.crm?.getBoundingClientRect()
      if (from && to) setFly({ from, to, label: `Заявка · ${f.name.trim()}`, key: id })
      setForm(EMPTY)
      return true
    },
    [addLead],
  )

  const stop = useCallback(() => {
    run.current++
    setPlaying(false)
  }, [])

  async function play() {
    const me = ++run.current
    const alive = () => run.current === me
    setPlaying(true)
    setSentId(null)
    setOpenId(null)
    go('site')
    setPage('home')
    await sleep(1200)
    if (!alive()) return
    setPage('services')
    await sleep(900)
    if (!alive()) return
    let f: Form = { ...EMPTY, service: 'color' }
    setForm(f)
    await sleep(1000)
    if (!alive()) return
    setPage('book')
    await sleep(800)
    for (const ch of 'Алина') {
      if (!alive()) return
      f = { ...f, name: f.name + ch }
      setForm(f)
      await sleep(110)
    }
    for (const ch of '@alina_demo') {
      if (!alive()) return
      f = { ...f, contact: f.contact + ch }
      setForm(f)
      await sleep(70)
    }
    f = { ...f, slot: '14:30' }
    setForm(f)
    await sleep(700)
    if (!alive()) return
    submit(f)
    await sleep(1900)
    if (!alive()) return
    go('tg')
    await sleep(2300)
    if (!alive()) return
    setLeads((ls) => ls.map((l) => (l.name === 'Алина' && l.stage === 'new' ? { ...l, stage: 'work' } : l)))
    await sleep(1800)
    if (!alive()) return
    go('crm')
    setCrmTab('deals')
    await sleep(2600)
    if (!alive()) return
    setCrmTab('stats')
    await sleep(3200)
    if (!alive()) return
    setPlaying(false)
    go('site')
  }

  return (
    <MotionConfig reducedMotion="user">
      <section id="demo" className="relative overflow-x-clip border-t border-line py-[14vh]">
        <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/3 h-[520px] w-[820px] -translate-x-1/3 rounded-full bg-[radial-gradient(closest-side,rgba(176,141,87,.22),transparent)]" />
        <div className="container-x relative">
          <SectionHead index="02" label="Демо" title="Сайт и CRM: потрогайте" />
          <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,9fr)] lg:gap-14">
            <Reveal className="max-w-md">
              <p data-stagger className="text-lg leading-relaxed text-ink-2">
                Макет сайта салона, его CRM и чат менеджера в Telegram. Всё связано: заявка с сайта попадает и в чат, и в CRM, а дашборд пересчитывается сразу.
              </p>
              <motion.button
                data-stagger
                data-keep-play
                data-goal="demo_autoplay"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={playing ? stop : play}
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-ink px-8 py-4 text-xs uppercase tracking-[0.2em] text-paper"
              >
                <svg aria-hidden viewBox="0 0 12 12" className="h-3 w-3" fill="currentColor">{playing ? <rect x="1" y="1" width="10" height="10" rx="1.5" /> : <path d="M2 1l9 5-9 5z" />}</svg> {playing ? 'Остановить показ' : 'Показать за 20 секунд'}
              </motion.button>
              <ol data-stagger className="mt-8 space-y-3 text-ink-2">
                {['Запишитесь на «сайте»: выберите услугу и время.', 'Загляните в «Telegram»: заявка пришла менеджеру, нажмите «Взять в работу».', 'Откройте «CRM»: перетащите карточку, откройте сделку, посмотрите «Дашборд».'].map((t, i) => (
                  <li key={t} className="flex gap-4">
                    <span className="font-display text-xl text-mute">0{i + 1}</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ol>
              <p data-stagger className="mt-8 text-sm leading-relaxed text-mute">
                Это макет с вымышленными данными, а не готовый продукт: на вашем проекте состав подгоняем под задачу. Подключение CRM входит в тариф «Эталон».
              </p>
              <a href="#contact" data-stagger data-goal="demo_cta" onClick={() => window.dispatchEvent(new CustomEvent('pick-tariff', { detail: 'flagship' }))} className="mt-6 inline-block border-b border-ink pb-1 text-sm uppercase tracking-[0.2em]">
                Хочу так же →
              </a>
            </Reveal>

            <div onPointerDownCapture={(e) => playing && !(e.target as HTMLElement).closest('[data-keep-play]') && stop()}>
              <div className="overflow-hidden rounded-3xl border border-ink/20 bg-paper-2 shadow-[0_40px_100px_-40px_rgba(31,31,29,.55)] ring-1 ring-white/40">
                <div className="flex items-center gap-3 bg-ink px-4 py-3 text-paper">
                  <span aria-hidden className="flex gap-1.5">
                    <i className="h-2.5 w-2.5 rounded-full bg-[#ff6b5f]" />
                    <i className="h-2.5 w-2.5 rounded-full bg-[#ffbd44]" />
                    <i className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                  </span>
                  <span className="min-w-0 flex-1 truncate rounded-md bg-paper/10 px-3 py-1 text-center text-xs tracking-wider text-paper/70">{ADDR[view]}</span>
                  {playing && <span className="hidden items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#9be3b4] sm:flex"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#9be3b4]" />показ</span>}
                  <span className="hidden rounded-full border border-paper/30 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] text-paper/70 sm:inline">макет</span>
                </div>

                <div className="relative h-[560px] sm:h-[520px]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div key={view} initial={{ opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.985 }} transition={{ duration: 0.28 }} className="absolute inset-0">
                      {view === 'site' && (
                        <SiteView page={page} setPage={setPage} form={form} setForm={setForm} onSubmit={() => submit(form)} error={error} sentId={sentId} goCrm={() => go('crm')} goTg={() => go('tg')} submitRef={submitRef} />
                      )}
                      {view === 'tg' && <TgView leads={leads} take={(id) => setStage(id, 'work')} pay={(id) => setStage(id, 'paid')} />}
                      {view === 'crm' && <CrmView leads={leads} fresh={fresh} tab={crmTab} setTab={setCrmTab} setStage={setStage} setNote={setNote} addIncoming={addIncoming} openId={openId} setOpenId={setOpenId} uid={uid} />}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              <div role="tablist" aria-label="Что показать" className="relative mx-auto mt-6 flex w-fit gap-1 rounded-full border border-ink/20 bg-paper p-1">
                {TABS.map(([id, label]) => (
                  <button
                    key={id}
                    ref={(el) => {
                      tabRefs.current[id] = el
                    }}
                    role="tab"
                    aria-selected={view === id}
                    data-goal="demo_tab"
                    data-goal-param={id}
                    onClick={() => go(id)}
                    className={`relative rounded-full px-6 py-2.5 text-xs uppercase tracking-[0.2em] transition-colors ${view === id ? 'text-paper' : 'text-ink-2 hover:text-ink'}`}
                  >
                    {view === id && <motion.span layoutId={`${uid}-tab`} className="absolute inset-0 rounded-full bg-ink" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                    <span className="relative">{label}</span>
                    {id !== 'site' && view !== id && unseen[id] > 0 && (
                      <motion.span key={unseen[id]} initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#2b7a4b] px-1 text-[10px] text-white ring-2 ring-paper">
                        {unseen[id]}
                      </motion.span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* «летящая» заявка: от кнопки формы к вкладке CRM */}
        <AnimatePresence>
          {fly && (
            <motion.div
              key={fly.key}
              aria-hidden
              initial={{ x: fly.from.x, y: fly.from.y, opacity: 0, scale: 0.8 }}
              animate={{ x: fly.to.x, y: fly.to.y, opacity: [0, 1, 1, 0], scale: [0.8, 1.05, 1, 0.6] }}
              transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }}
              onAnimationComplete={() => setFly(null)}
              className="pointer-events-none fixed left-0 top-0 z-[80] whitespace-nowrap rounded-full bg-ink px-4 py-2 text-xs text-paper shadow-xl"
            >
              {fly.label} →
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </MotionConfig>
  )
}
