'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { SectionHead } from '@/components/motion/section-head'
import { Reveal } from '@/components/motion/reveal'
import { PRESETS, serviceOf, type Form, type Lead, type PresetId, type Stage } from './demo/data'
import { SiteView, type SitePage } from './demo/site-view'
import { CrmView, type CrmTab } from './demo/crm-view'
import { TgView } from './demo/tg-view'

type View = 'site' | 'crm' | 'tg'
const TABS: [View, string][] = [['site', 'Сайт'], ['tg', 'Telegram'], ['crm', 'CRM']]
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const emptyForm = (id: PresetId): Form => ({ name: '', contact: '', service: PRESETS[id].services[0].id, slot: '13:00' })
// что «бот» пишет клиенту при смене этапа в CRM
const CLIENT_MSG: Partial<Record<Stage, string>> = { work: 'Ваша заявка принята, администратор скоро свяжется', paid: 'Оплата получена, ждём вас' }

type Fly = { from: DOMRect; to: DOMRect; label: string; key: number }

/**
 * Живое демо «сайт → Telegram → CRM»: заявка из формы макета сайта прилетает в чат менеджера и в CRM,
 * карточки переносятся перетаскиванием, а смена этапа «отправляет» клиенту сообщение. Три отрасли на выбор, автопоказ.
 * Вся логика на клиенте, данные вымышленные.
 */
export function LiveDemo() {
  const uid = useId()
  const [presetId, setPresetId] = useState<PresetId>('salon')
  const preset = PRESETS[presetId]
  const [view, setView] = useState<View>('site')
  const [page, setPage] = useState<SitePage>('home')
  const [form, setForm] = useState<Form>(emptyForm('salon'))
  const [leads, setLeads] = useState<Lead[]>(PRESETS.salon.seed)
  const [crmTab, setCrmTab] = useState<CrmTab>('deals')
  const [openId, setOpenId] = useState<number | null>(null)
  const [sentId, setSentId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [fresh, setFresh] = useState<number | null>(null)
  const [unseen, setUnseen] = useState({ crm: 0, tg: 0 })
  const [fly, setFly] = useState<Fly | null>(null)
  const [toast, setToast] = useState<{ text: string; key: number } | null>(null)
  const [playing, setPlaying] = useState(false)
  const run = useRef(0)
  const seq = useRef(0)
  const submitRef = useRef<HTMLButtonElement | null>(null)
  const tabRefs = useRef<Partial<Record<View, HTMLButtonElement | null>>>({})
  const leadsRef = useRef(leads)
  useEffect(() => {
    leadsRef.current = leads
  }, [leads])

  const go = useCallback((v: View) => {
    setView(v)
    if (v === 'crm') setUnseen((u) => ({ ...u, crm: 0 }))
    if (v === 'tg') setUnseen((u) => ({ ...u, tg: 0 }))
  }, [])

  const showToast = useCallback((text: string) => {
    const key = ++seq.current
    setToast({ text, key })
    setTimeout(() => setToast((t) => (t?.key === key ? null : t)), 3200)
  }, [])

  const setStage = useCallback(
    (id: number, stage: Stage) => {
      const l = leadsRef.current.find((x) => x.id === id)
      if (!l || l.stage === stage) return
      setLeads((ls) => ls.map((x) => (x.id === id ? { ...x, stage } : x)))
      const msg = CLIENT_MSG[stage]
      if (msg) showToast(`Бот написал клиенту ${l.name}: «${msg}»`)
    },
    [showToast],
  )
  const setNote = useCallback((id: number, note: string) => setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, note } : l))), [])

  const addLead = useCallback((l: Omit<Lead, 'id' | 'stage' | 'at' | 'note'>) => {
    const id = 100 + ++seq.current
    setLeads((ls) => [...ls, { ...l, id, stage: 'new', at: 'только что', note: '' }])
    setFresh(id)
    setTimeout(() => setFresh((f) => (f === id ? null : f)), 4500)
    return id
  }, [])

  const addIncoming = () => {
    const n = preset.incoming[seq.current % preset.incoming.length]
    addLead({ name: n.name, contact: n.contact, service: n.service, slot: 'завтра 12:00', source: n.source, sum: serviceOf(preset, n.service)?.price ?? 0 })
    if (n.source === 'Telegram') setUnseen((u) => ({ ...u, tg: u.tg + 1 }))
  }

  const submit = useCallback(
    (f: Form, p = preset) => {
      if (f.name.trim().length < 2 || f.contact.trim().length < 3) {
        setError('Заполните имя и контакт: это макет, данные никуда не уходят')
        return false
      }
      setError('')
      const s = serviceOf(p, f.service)
      const id = addLead({ name: f.name.trim(), contact: f.contact.trim(), service: s?.name ?? f.service, slot: `сегодня ${f.slot}`, source: 'Сайт', sum: s?.price ?? 0 })
      setSentId(id)
      setUnseen((u) => ({ crm: u.crm + 1, tg: u.tg + 1 }))
      const from = submitRef.current?.getBoundingClientRect()
      const to = tabRefs.current.crm?.getBoundingClientRect()
      if (from && to) setFly({ from, to, label: `Заявка · ${f.name.trim()}`, key: id })
      setForm(emptyForm(p.id))
      return true
    },
    [addLead, preset],
  )

  const stop = useCallback(() => {
    run.current++
    setPlaying(false)
  }, [])

  const reset = useCallback((id: PresetId) => {
    run.current++
    setPlaying(false)
    setPresetId(id)
    setLeads(PRESETS[id].seed)
    setForm(emptyForm(id))
    setView('site')
    setPage('home')
    setCrmTab('deals')
    setOpenId(null)
    setSentId(null)
    setError('')
    setFresh(null)
    setToast(null)
    setUnseen({ crm: 0, tg: 0 })
  }, [])

  async function play() {
    const me = ++run.current
    const alive = () => run.current === me
    const p = preset
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
    let f: Form = { ...emptyForm(p.id), service: p.playService }
    setForm(f)
    await sleep(1000)
    if (!alive()) return
    setPage('book')
    await sleep(800)
    for (const ch of p.playName) {
      if (!alive()) return
      f = { ...f, name: f.name + ch }
      setForm(f)
      await sleep(110)
    }
    for (const ch of '@demo_client') {
      if (!alive()) return
      f = { ...f, contact: f.contact + ch }
      setForm(f)
      await sleep(70)
    }
    f = { ...f, slot: '14:30' }
    setForm(f)
    await sleep(700)
    if (!alive()) return
    submit(f, p)
    await sleep(1900)
    if (!alive()) return
    go('tg')
    await sleep(2300)
    if (!alive()) return
    const lead = leadsRef.current.find((l) => l.name === p.playName && l.stage === 'new')
    if (lead) setStage(lead.id, 'work')
    await sleep(2200)
    if (!alive()) return
    go('crm')
    setCrmTab('deals')
    await sleep(2800)
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
          <SectionHead index="02" label="Демо" title="Сайт и CRM в одной связке" />
          <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,9fr)] lg:gap-14">
            <Reveal className="max-w-md">
              <p data-stagger className="text-lg leading-relaxed text-ink-2">
                Заявка с сайта сразу попадает менеджеру в Telegram и в CRM. Выберите отрасль и запустите показ или пройдите путь заявки сами.
              </p>
              <div data-stagger role="group" aria-label="Отрасль макета" className="mt-7 flex flex-wrap gap-2">
                {Object.values(PRESETS).map((p) => (
                  <button
                    key={p.id}
                    aria-pressed={presetId === p.id}
                    data-goal="demo_preset"
                    data-goal-param={p.id}
                    onClick={() => reset(p.id)}
                    className={`rounded-full border px-4 py-2 text-sm transition-colors ${presetId === p.id ? 'border-ink bg-ink text-paper' : 'border-ink/25 hover:border-ink/60'}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <motion.button
                data-stagger
                data-goal="demo_autoplay"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={playing ? stop : play}
                className="mt-6 inline-flex items-center gap-3 rounded-full bg-ink px-8 py-4 text-xs uppercase tracking-[0.2em] text-paper"
              >
                <svg aria-hidden viewBox="0 0 12 12" className="h-3 w-3" fill="currentColor">{playing ? <rect x="1" y="1" width="10" height="10" rx="1.5" /> : <path d="M2 1l9 5-9 5z" />}</svg>
                {playing ? 'Остановить показ' : 'Показать за 20 секунд'}
              </motion.button>
              <p data-stagger className="mt-8 text-sm leading-relaxed text-mute">
                Макет с вымышленными данными. CRM входит в тариф «Эталон», состав подгоняем под вашу задачу.
              </p>
              <a href="#contact" data-stagger data-goal="demo_cta" onClick={() => window.dispatchEvent(new CustomEvent('pick-tariff', { detail: 'flagship' }))} className="mt-5 inline-block border-b border-ink pb-1 text-sm uppercase tracking-[0.2em]">
                Хочу так же →
              </a>
            </Reveal>

            <div onPointerDownCapture={() => playing && stop()}>
              <div className="overflow-hidden rounded-3xl border border-ink/20 bg-paper-2 shadow-[0_40px_100px_-40px_rgba(31,31,29,.55)] ring-1 ring-white/40">
                <div className="flex items-center gap-3 bg-ink px-4 py-3 text-paper">
                  <span aria-hidden className="flex gap-1.5">
                    <i className="h-2.5 w-2.5 rounded-full bg-[#ff6b5f]" />
                    <i className="h-2.5 w-2.5 rounded-full bg-[#ffbd44]" />
                    <i className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                  </span>
                  <span className="min-w-0 flex-1 truncate rounded-md bg-paper/10 px-3 py-1 text-center text-xs tracking-wider text-paper/70">
                    {view === 'site' ? preset.domain : view === 'tg' ? 'Telegram · группа менеджеров' : `crm.${preset.domain}`}
                  </span>
                  {playing && <span className="hidden items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#9be3b4] sm:flex"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#9be3b4]" />показ</span>}
                  <span className="hidden rounded-full border border-paper/30 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] text-paper/70 sm:inline">макет</span>
                </div>

                <div className="relative h-[560px] sm:h-[520px]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div key={`${presetId}-${view}`} initial={{ opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.985 }} transition={{ duration: 0.28 }} className="absolute inset-0">
                      {view === 'site' && (
                        <SiteView preset={preset} page={page} setPage={setPage} form={form} setForm={setForm} onSubmit={() => submit(form)} error={error} sentId={sentId} goCrm={() => go('crm')} goTg={() => go('tg')} submitRef={submitRef} />
                      )}
                      {view === 'tg' && <TgView leads={leads} take={(id) => setStage(id, 'work')} pay={(id) => setStage(id, 'paid')} />}
                      {view === 'crm' && <CrmView brand={preset.brand} leads={leads} fresh={fresh} tab={crmTab} setTab={setCrmTab} setStage={setStage} setNote={setNote} addIncoming={addIncoming} openId={openId} setOpenId={setOpenId} uid={uid} />}
                    </motion.div>
                  </AnimatePresence>
                  <AnimatePresence>
                    {toast && (
                      <motion.p
                        key={toast.key}
                        role="status"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute inset-x-4 bottom-4 z-20 mx-auto max-w-md rounded-2xl bg-[#2b5278] px-4 py-3 text-center text-sm text-white shadow-xl"
                      >
                        {toast.text}
                      </motion.p>
                    )}
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
