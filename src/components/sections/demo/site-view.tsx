'use client'

import type { RefObject } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { SLOTS, fmt, type Form, type Preset } from './data'

export type SitePage = 'home' | 'services' | 'book'
const field = 'w-full rounded-xl border border-ink/20 bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-ink'

/** Макет сайта салона: три кликабельные страницы внутри окна и форма записи, которая отправляет заявку в «CRM». */
export function SiteView(props: {
  preset: Preset
  page: SitePage
  setPage: (p: SitePage) => void
  form: Form
  setForm: (f: Form) => void
  onSubmit: () => void
  error: string
  sentId: number | null
  goCrm: () => void
  goTg: () => void
  submitRef: RefObject<HTMLButtonElement | null>
}) {
  const { preset, page, setPage, form, setForm, onSubmit, error, sentId, goCrm, goTg, submitRef } = props
  const PAGES: [SitePage, string][] = [['home', 'Главная'], ['services', preset.catalog], ['book', preset.book]]
  const SERVICES = preset.services
  const glow = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--gx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--gy', `${e.clientY - r.top}px`)
  }
  const set = (patch: Partial<Form>) => setForm({ ...form, ...patch })

  return (
    <div className="flex h-full flex-col bg-paper-2">
      <div className="flex items-center justify-between gap-3 border-b border-ink/10 px-5 py-3 sm:px-7">
        <span className="font-display text-2xl">{preset.brand}</span>
        <nav aria-label="Страницы макета" className="flex gap-1">
          {PAGES.map(([id, label]) => (
            <button key={id} onClick={() => setPage(id)} aria-current={page === id ? 'page' : undefined} className="relative rounded-full px-3 py-1.5 text-sm text-ink-2 transition-colors hover:text-ink aria-[current=page]:text-ink">
              {page === id && <motion.span layoutId="site-nav" className="absolute inset-0 -z-0 rounded-full bg-ink/10" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
              <span className="relative">{label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="relative min-h-0 flex-1 overflow-y-auto">
        <AnimatePresence mode="wait" initial={false}>
          {page === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.3 }} onPointerMove={glow} className="relative min-h-full overflow-hidden p-6 sm:p-8">
              <span aria-hidden className="art-float absolute -right-10 -top-10 h-56 w-56 rounded-full opacity-80 blur-3xl" style={{ background: preset.blobs[0] }} />
              <span aria-hidden className="art-float absolute bottom-0 left-1/3 h-40 w-40 rounded-full opacity-70 blur-3xl [animation-delay:-2s]" style={{ background: preset.blobs[1] }} />
              <span aria-hidden className="pointer-events-none absolute inset-0 opacity-70" style={{ background: 'radial-gradient(280px circle at var(--gx, 70%) var(--gy, 30%), rgba(255,255,255,.55), transparent 70%)' }} />
              <div className="relative">
                <p className="text-[11px] uppercase tracking-[0.3em] text-mute">{preset.kicker}</p>
                <h3 className="mt-3 max-w-md font-display text-4xl leading-[1.05] sm:text-5xl">{preset.title}</h3>
                <p className="mt-4 max-w-sm text-ink-2">{preset.text}</p>
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setPage('book')} className="mt-7 rounded-full bg-ink px-8 py-3.5 text-xs uppercase tracking-[0.2em] text-paper">
                  {preset.action}
                </motion.button>
                <div className="mt-8 flex flex-wrap gap-2 text-xs">
                  {preset.tags.map((t) => (
                    <span key={t} className="rounded-full border border-ink/20 px-3 py-1.5 text-ink-2">{t}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {page === 'services' && (
            <motion.div key="services" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.3 }} className="p-6 sm:p-8">
              <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-mute">{preset.catalog}</p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {SERVICES.map((s) => {
                  const on = form.service === s.id
                  return (
                    <li key={s.id}>
                      <motion.button
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => set({ service: s.id })}
                        aria-pressed={on}
                        className={`relative w-full rounded-2xl border p-4 text-left transition-colors ${on ? 'border-ink bg-ink text-paper' : 'border-ink/15 bg-paper hover:border-ink/40'}`}
                      >
                        <span className="flex items-baseline justify-between gap-3">
                          <span className="font-display text-xl">{s.name}</span>
                          <span className="text-sm">{fmt(s.price)} ₽</span>
                        </span>
                        <span className={`mt-1 block text-sm ${on ? 'text-paper/70' : 'text-ink-2'}`}>{s.text}</span>
                        {on && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-paper text-xs text-ink ring-2 ring-ink">✓</motion.span>}
                      </motion.button>
                    </li>
                  )
                })}
              </ul>
              <button onClick={() => setPage('book')} className="mt-6 rounded-full border border-ink px-6 py-3 text-xs uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-paper">{preset.action} на выбранное →</button>
            </motion.div>
          )}

          {page === 'book' && (
            <motion.div key="book" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.3 }} className="p-6 sm:p-8">
              {sentId !== null ? (
                <div className="flex flex-col items-start gap-5 py-4">
                  <svg viewBox="0 0 80 80" className="h-16 w-16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <motion.circle cx="40" cy="40" r="34" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7 }} />
                    <motion.path d="M24 41l11 11 21-23" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.5 }} />
                  </svg>
                  <div>
                    <p className="font-display text-3xl">Заявка №{sentId} отправлена</p>
                    <p className="mt-2 max-w-sm text-ink-2">Менеджер уже получил её в CRM и в Telegram. Посмотрите, как это выглядит с их стороны.</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={goCrm} className="rounded-full bg-ink px-6 py-3 text-xs uppercase tracking-[0.2em] text-paper">Смотреть в CRM →</button>
                    <button onClick={goTg} className="rounded-full border border-ink px-6 py-3 text-xs uppercase tracking-[0.2em]">Telegram менеджера</button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    onSubmit()
                  }}
                  className="space-y-5"
                  noValidate
                >
                  <fieldset>
                    <legend className="mb-2 text-[11px] uppercase tracking-[0.3em] text-mute">{preset.catalog}</legend>
                    <div className="flex flex-wrap gap-2">
                      {SERVICES.map((s) => (
                        <button key={s.id} type="button" aria-pressed={form.service === s.id} onClick={() => set({ service: s.id })} className={`rounded-full border px-4 py-2 text-sm transition-colors ${form.service === s.id ? 'border-ink bg-ink text-paper' : 'border-ink/20 hover:border-ink/50'}`}>
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <fieldset>
                    <legend className="mb-2 text-[11px] uppercase tracking-[0.3em] text-mute">{preset.slotsTitle}</legend>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                      {SLOTS.map((s) => (
                        <button key={s.t} type="button" disabled={s.busy} aria-pressed={form.slot === s.t} onClick={() => set({ slot: s.t })} className={`rounded-xl border py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 ${form.slot === s.t ? 'border-ink bg-ink text-paper' : 'border-ink/20 hover:border-ink/50'}`}>
                          {s.t}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label>
                      <span className="sr-only">Имя</span>
                      <input value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Имя" autoComplete="off" className={field} />
                    </label>
                    <label>
                      <span className="sr-only">Телефон или Telegram</span>
                      <input value={form.contact} onChange={(e) => set({ contact: e.target.value })} placeholder="Телефон или Telegram" autoComplete="off" className={field} />
                    </label>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <motion.button ref={submitRef} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="rounded-full bg-ink px-8 py-3.5 text-xs uppercase tracking-[0.2em] text-paper">
                      {preset.action}
                    </motion.button>
                    <p role="status" className={`text-sm ${error ? 'text-red-700' : 'text-ink-2'}`}>{error || 'Макет: данные остаются в этом окне.'}</p>
                  </div>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
