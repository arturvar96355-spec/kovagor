'use client'

import { useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { Counter } from './counter'
import { SOURCES_LIST, WEEK, STAGES, fmt, type Lead, type Stage } from './data'

export type CrmTab = 'deals' | 'clients' | 'stats'
const NAV: [CrmTab, string][] = [['deals', 'Сделки'], ['clients', 'Клиенты'], ['stats', 'Дашборд']]
const SPRING = { type: 'spring', stiffness: 380, damping: 34 } as const

/** CRM-макет: канбан с перетаскиванием, карточка сделки, клиенты с поиском и дашборд с анимированными цифрами. */
export function CrmView(props: {
  brand: string
  leads: Lead[]
  fresh: number | null
  tab: CrmTab
  setTab: (t: CrmTab) => void
  setStage: (id: number, s: Stage) => void
  setNote: (id: number, note: string) => void
  addIncoming: () => void
  openId: number | null
  setOpenId: (id: number | null) => void
  uid: string
}) {
  const { brand, leads, fresh, tab, setTab, setStage, setNote, addIncoming, openId, setOpenId, uid } = props
  const [dragId, setDragId] = useState<number | null>(null)
  const [over, setOver] = useState<Stage | null>(null)
  const [q, setQ] = useState('')
  const open = leads.find((l) => l.id === openId) ?? null

  const paid = leads.filter((l) => l.stage === 'paid').reduce((s, l) => s + l.sum, 0)
  const conv = leads.length ? Math.round((leads.filter((l) => l.stage === 'paid').length / leads.length) * 100) : 0
  const bySource = SOURCES_LIST.map((s) => ({ s, n: leads.filter((l) => l.source === s).length }))
  const max = Math.max(1, ...bySource.map((b) => b.n))
  const spark = WEEK.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i / (WEEK.length - 1)) * 600},${80 - (v / 18) * 70}`).join(' ')
  const clients = leads.filter((l) => (l.name + l.contact + l.service).toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="relative flex h-full bg-ink text-paper">
      <aside className="hidden w-40 shrink-0 flex-col gap-1 border-r border-paper/10 p-4 text-sm sm:flex">
        <span className="mb-4 font-display text-lg">{brand} · CRM</span>
        {NAV.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} aria-current={tab === id ? 'page' : undefined} className="rounded-lg px-3 py-2 text-left text-paper/60 transition-colors hover:text-paper aria-[current=page]:bg-paper/10 aria-[current=page]:text-paper">
            {label}
          </button>
        ))}
        <button onClick={addIncoming} className="mt-auto rounded-lg border border-paper/25 px-3 py-2 text-left text-xs text-paper/80 transition-colors hover:border-paper/60 hover:text-paper">
          + Входящий звонок
        </button>
      </aside>

      <div className="min-w-0 flex-1 overflow-y-auto p-2.5 sm:p-5">
        <div role="tablist" aria-label="Раздел CRM" className="mb-3 flex items-center gap-1 sm:hidden">
          {NAV.map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`rounded-full px-3 py-1.5 text-xs ${tab === id ? 'bg-paper text-ink' : 'bg-paper/10 text-paper/70'}`}>
              {label}
            </button>
          ))}
          <button onClick={addIncoming} className="ml-auto rounded-full border border-paper/25 px-3 py-1.5 text-xs">+ Звонок</button>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {tab === 'deals' && (
            <motion.div key="deals" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
              <LayoutGroup id={uid}>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {STAGES.map((st) => (
                    <div
                      key={st.id}
                      onDragOver={(e) => {
                        e.preventDefault()
                        setOver(st.id)
                      }}
                      onDragLeave={() => setOver((o) => (o === st.id ? null : o))}
                      onDrop={() => {
                        if (dragId !== null) setStage(dragId, st.id)
                        setDragId(null)
                        setOver(null)
                      }}
                      className={`min-w-0 rounded-2xl p-2 transition-colors sm:p-3 ${over === st.id ? 'bg-paper/[0.14]' : 'bg-paper/[0.06]'}`}
                    >
                      <p className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.15em] text-paper/60">
                        <span className="truncate">{st.title}</span>
                        <span>{leads.filter((l) => l.stage === st.id).length}</span>
                      </p>
                      <ul className="min-h-24 space-y-2">
                        {leads.filter((l) => l.stage === st.id).map((l) => (
                          <motion.li key={l.id} layout layoutId={`${uid}-${l.id}`} transition={SPRING}>
                            <div draggable onDragStart={() => setDragId(l.id)} onDragEnd={() => setDragId(null)}>
                              <button
                                onClick={() => setOpenId(l.id)}
                                aria-label={`Открыть сделку: ${l.name}, ${l.service}, ${fmt(l.sum)} ₽`}
                                className={`relative w-full cursor-grab rounded-xl bg-paper p-2.5 text-left text-ink transition-transform hover:-translate-y-0.5 sm:p-3 ${fresh === l.id ? 'ring-2 ring-[#9be3b4]' : ''}`}
                              >
                                {fresh === l.id && <span className="absolute -right-1 -top-1 rounded-full bg-[#2b7a4b] px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-white">новая</span>}
                                <span className="block truncate text-sm font-medium">{l.name}</span>
                                <span className="block truncate text-[11px] text-mute">{l.service}</span>
                                <span className="mt-1 flex flex-col text-xs sm:flex-row sm:items-center sm:justify-between">
                                  <span className="whitespace-nowrap">{fmt(l.sum)} ₽</span>
                                  <span className="text-[10px] text-mute">{l.source}</span>
                                </span>
                              </button>
                            </div>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </LayoutGroup>
              <p className="mt-3 hidden text-xs text-paper/60 sm:block">Перетащите карточку на другой этап или нажмите на неё, чтобы открыть сделку.</p>
            </motion.div>
          )}

          {tab === 'clients' && (
            <motion.div key="clients" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
              <label className="block">
                <span className="sr-only">Поиск по клиентам</span>
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск: имя, контакт, услуга" className="mb-3 w-full rounded-xl border border-paper/20 bg-transparent px-4 py-2.5 text-sm outline-none placeholder:text-paper/50 focus:border-paper/60" />
              </label>
              <ul className="divide-y divide-paper/10 rounded-2xl bg-paper/[0.06]">
                <AnimatePresence initial={false}>
                  {clients.map((l) => (
                    <motion.li key={l.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <button onClick={() => setOpenId(l.id)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-paper/10">
                        <span className="min-w-0">
                          <span className="block truncate">{l.name}</span>
                          <span className="block truncate text-xs text-paper/60">{l.contact} · {l.service}</span>
                        </span>
                        <span className="shrink-0 text-right text-xs text-paper/70">
                          {fmt(l.sum)} ₽
                          <span className="block text-paper/50">{l.at}</span>
                        </span>
                      </button>
                    </motion.li>
                  ))}
                </AnimatePresence>
                {clients.length === 0 && <li className="px-4 py-6 text-center text-sm text-paper/60">Никого не нашли</li>}
              </ul>
            </motion.div>
          )}

          {tab === 'stats' && (
            <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="space-y-3">
              <dl className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  ['Заявок', <Counter key="a" value={leads.length} />],
                  ['Оплачено', <Counter key="b" value={paid} suffix=" ₽" spaced />],
                  ['Конверсия', <Counter key="c" value={conv} suffix="%" />],
                ].map(([k, v]) => (
                  <div key={String(k)} className="rounded-2xl bg-paper/[0.06] p-3">
                    <dt className="text-[11px] uppercase tracking-[0.15em] text-paper/60">{k}</dt>
                    <dd className="mt-1 font-display text-2xl sm:text-3xl">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="rounded-2xl bg-paper/[0.06] p-3 sm:p-4">
                <p className="mb-2 text-[11px] uppercase tracking-[0.15em] text-paper/60">Выручка за неделю, тыс. ₽</p>
                <svg viewBox="0 0 600 90" className="h-14 w-full sm:h-24" fill="none" aria-hidden>
                  <motion.path d={spark} stroke="#f4f1ea" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.3, ease: 'easeInOut' }} />
                  {WEEK.map((v, i) => (
                    <motion.circle key={i} cx={(i / (WEEK.length - 1)) * 600} cy={80 - (v / 18) * 70} r="5" fill="#f4f1ea" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15 * i + 0.3 }} />
                  ))}
                </svg>
              </div>
              <div className="rounded-2xl bg-paper/[0.06] p-3 sm:p-4">
                <p className="mb-2 sm:mb-3 text-[11px] uppercase tracking-[0.15em] text-paper/60">Заявки по каналам</p>
                <ul className="space-y-2 sm:space-y-3">
                  {bySource.map((b) => (
                    <li key={b.s} className="flex items-center gap-3 text-sm">
                      <span className="w-20 shrink-0 text-paper/80">{b.s}</span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-paper/10">
                        <motion.span className="block h-full origin-left rounded-full bg-paper" initial={{ scaleX: 0 }} animate={{ scaleX: b.n / max }} transition={SPRING} />
                      </span>
                      <span className="w-5 text-right">{b.n}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {open && (
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            aria-label={`Сделка: ${open.name}`}
            className="absolute inset-y-0 right-0 z-10 flex w-full flex-col gap-3 sm:max-w-[300px] sm:gap-4 overflow-y-auto border-l border-paper/15 bg-[#26262a] p-4 shadow-2xl sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-2xl leading-tight">{open.name}</p>
                <p className="text-sm text-paper/60">{open.contact}</p>
              </div>
              <button onClick={() => setOpenId(null)} aria-label="Закрыть" className="rounded-full border border-paper/25 px-2.5 py-1 text-sm hover:border-paper/60">✕</button>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {[['Услуга', open.service], ['Время', open.slot], ['Сумма', `${fmt(open.sum)} ₽`], ['Канал', open.source]].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11px] uppercase tracking-[0.15em] text-paper/50">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.15em] text-paper/50">Этап</p>
              <div className="grid grid-cols-3 gap-1 rounded-full bg-paper/10 p-1 text-xs">
                {STAGES.map((st) => (
                  <button key={st.id} onClick={() => setStage(open.id, st.id)} aria-pressed={open.stage === st.id} className="relative rounded-full px-2 py-1.5 transition-colors aria-pressed:text-ink">
                    {open.stage === st.id && <motion.span layoutId={`${uid}-stage`} className="absolute inset-0 rounded-full bg-paper" transition={SPRING} />}
                    <span className="relative">{st.title}</span>
                  </button>
                ))}
              </div>
            </div>
            <label className="block">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.15em] text-paper/50">Заметка</span>
              <textarea value={open.note} onChange={(e) => setNote(open.id, e.target.value)} rows={2} placeholder="Например: просила перезвонить" className="w-full rounded-xl border border-paper/20 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-paper/40 focus:border-paper/60" />
            </label>
            <p className="mt-auto text-xs text-paper/50">Поступила: {open.at}</p>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  )
}
