'use client'

import type { CSSProperties, RefObject } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { SLOTS, fmt, type Form, type Preset } from './data'

export type SitePage = 'home' | 'services' | 'book'

const SWATCH = ['#e58aa5', '#f4b942', '#9bc47a', '#b79ae0']

/** Цветок из лепестков: рисуется SVG, медленно вращается. */
function Flower({ petal, center = '#f4d35e', className = '' }: { petal: string; center?: string; className?: string }) {
  return (
    <svg viewBox="-50 -50 100 100" aria-hidden className={className}>
      {Array.from({ length: 8 }).map((_, i) => (
        <ellipse key={i} cx="0" cy="-22" rx="11" ry="22" fill={petal} opacity="0.92" transform={`rotate(${i * 45})`} />
      ))}
      <circle r="9" fill={center} />
    </svg>
  )
}

function Cross({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" />
    </svg>
  )
}

function Ecg() {
  return (
    <svg viewBox="0 0 240 100" aria-hidden className="h-full w-full" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M0 55 H55 L68 25 L84 85 L98 10 L112 55 H150 L160 42 L170 62 L180 55 H240" opacity="0.18" />
      <motion.path d="M0 55 H55 L68 25 L84 85 L98 10 L112 55 H150 L160 42 L170 62 L180 55 H240" initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1], opacity: [1, 1, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }} />
    </svg>
  )
}

/** Макет сайта: у каждой отрасли свой дизайн и своя раскладка (салон: журнальный, клиника: строгий медицинский, цветы: яркий и округлый). */
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
  const t = preset.theme
  const id = preset.id
  const set = (patch: Partial<Form>) => setForm({ ...form, ...patch })
  const PAGES: [SitePage, string][] = [['home', 'Главная'], ['services', preset.catalog], ['book', preset.book]]
  const vars = { '--bg': t.bg, '--surface': t.surface, '--ink': t.ink, '--soft': t.soft, '--line': t.line, '--accent': t.accent, '--on': t.on, '--r': t.radius, '--pill': t.pill } as CSSProperties
  const glow = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--gx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--gy', `${e.clientY - r.top}px`)
  }
  const btn = 'bg-[var(--accent)] text-[var(--on)] rounded-[var(--pill)]'
  const sel = 'border-[var(--accent)] bg-[var(--accent)] text-[var(--on)]'
  const idle = 'border-[var(--line)] hover:border-[var(--soft)]'
  const field = 'w-full rounded-[var(--r)] border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--accent)] sm:py-3'
  const fade = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -14 }, transition: { duration: 0.3 } }

  return (
    <div style={vars} className="flex h-full flex-col bg-[var(--bg)] text-[var(--ink)]">
      {/* шапка: у каждой отрасли своя */}
      <div className={`flex items-center justify-between gap-3 px-4 py-2.5 sm:px-7 sm:py-3 ${id === 'clinic' ? 'border-b-2 border-[var(--line)] bg-[var(--surface)]' : id === 'shop' ? '' : 'border-b border-[var(--line)]'}`}>
        <span className={`flex items-center gap-2 ${t.head} ${id === 'clinic' ? 'text-lg sm:text-xl' : 'text-2xl'}`}>
          {id === 'clinic' && <span className="grid h-7 w-7 place-items-center rounded-lg bg-[var(--accent)] text-[var(--on)]"><Cross className="h-4 w-4" /></span>}
          {id === 'shop' && <Flower petal="#e58aa5" className="h-7 w-7" />}
          {preset.brand}
        </span>
        <nav aria-label="Страницы макета" className="flex gap-0.5 sm:gap-1">
          {PAGES.map(([pid, label]) => (
            <button key={pid} onClick={() => setPage(pid)} aria-current={page === pid ? 'page' : undefined} className={`relative px-2.5 py-1.5 text-sm text-[var(--soft)] transition-colors hover:text-[var(--ink)] aria-[current=page]:text-[var(--ink)] sm:px-3 ${id === 'clinic' ? '' : 'rounded-full'}`}>
              {page === pid && id === 'salon' && <motion.span layoutId="site-nav" className="absolute inset-0 rounded-full bg-[var(--ink)]/10" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
              {page === pid && id === 'shop' && <motion.span layoutId="site-nav" className="absolute inset-0 rounded-full bg-[var(--accent)]/15" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
              {page === pid && id === 'clinic' && <motion.span layoutId="site-nav" className="absolute inset-x-2 -bottom-[11px] h-0.5 bg-[var(--accent)] sm:-bottom-[13px]" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
              <span className="relative">{label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-auto">
        <AnimatePresence mode="wait" initial={false}>
          {page === 'home' && id === 'salon' && (
            <motion.div key="home-salon" {...fade} onPointerMove={glow} className="relative min-h-full overflow-hidden p-4 sm:p-8">
              <span aria-hidden className="art-float absolute -right-10 -top-10 h-56 w-56 rounded-full opacity-80 blur-3xl" style={{ background: preset.blobs[0] }} />
              <span aria-hidden className="art-float absolute bottom-0 left-1/3 h-40 w-40 rounded-full opacity-70 blur-3xl [animation-delay:-2s]" style={{ background: preset.blobs[1] }} />
              <span aria-hidden className="pointer-events-none absolute inset-0 opacity-70" style={{ background: 'radial-gradient(280px circle at var(--gx, 70%) var(--gy, 30%), rgba(255,255,255,.55), transparent 70%)' }} />
              <div className="relative">
                <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--soft)]">{preset.kicker}</p>
                <h3 className={`mt-2 max-w-md text-3xl leading-[1.05] sm:mt-3 sm:text-5xl ${t.head}`}>{preset.title}</h3>
                <p className="mt-3 max-w-sm text-sm text-[var(--soft)] sm:mt-4 sm:text-base">{preset.text}</p>
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setPage('book')} className={`mt-5 px-8 py-3 text-xs uppercase tracking-[0.2em] sm:mt-7 sm:py-3.5 ${btn}`}>{preset.action}</motion.button>
                <div className="mt-5 flex flex-wrap gap-1.5 text-xs sm:mt-8 sm:gap-2">
                  {preset.tags.map((x) => <span key={x} className="rounded-full border border-[var(--line)] px-2.5 py-1 text-[var(--soft)] sm:px-3 sm:py-1.5">{x}</span>)}
                </div>
              </div>
            </motion.div>
          )}

          {page === 'home' && id === 'clinic' && (
            <motion.div key="home-clinic" {...fade} className="grid min-h-full gap-4 p-4 sm:grid-cols-[1.2fr_1fr] sm:gap-6 sm:p-8">
              <div className="flex flex-col justify-center">
                <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-md bg-[var(--accent)]/10 px-3 py-1 text-xs font-medium text-[var(--accent)]"><Cross className="h-3 w-3" />{preset.kicker}</span>
                <h3 className={`max-w-md text-3xl leading-[1.1] sm:text-4xl ${t.head}`}>{preset.title}</h3>
                <p className="mt-3 max-w-sm text-sm text-[var(--soft)] sm:text-base">{preset.text}</p>
                <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} onClick={() => setPage('book')} className={`mt-5 w-fit px-6 py-3 text-sm font-medium ${btn}`}>{preset.action} на приём</motion.button>
                <ul className="mt-5 grid grid-cols-3 gap-2 text-[11px] leading-tight text-[var(--soft)] sm:mt-7 sm:text-xs">
                  {preset.tags.map((x, i) => (
                    <li key={x} className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-2">
                      <span className="mb-1 grid h-6 w-6 place-items-center rounded-md bg-[var(--accent)]/10 text-[var(--accent)]">{i === 0 ? '◷' : i === 1 ? '✎' : '✓'}</span>
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative hidden overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] sm:block">
                <span aria-hidden className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-[var(--accent)]/10" />
                <Cross className="absolute right-6 top-6 h-10 w-10 text-[var(--accent)]/30" />
                <div className="absolute inset-x-4 top-1/2 h-24 -translate-y-1/2"><Ecg /></div>
                <p className="absolute inset-x-4 bottom-4 text-xs text-[var(--soft)]">Запись онлайн, подтверждение администратором</p>
              </div>
            </motion.div>
          )}

          {page === 'home' && id === 'shop' && (
            <motion.div key="home-shop" {...fade} className="relative min-h-full overflow-hidden p-4 sm:p-8">
              <Flower petal="#e58aa5" className="art-spin absolute -right-16 -top-10 h-64 w-64 opacity-90 sm:-right-10 sm:h-80 sm:w-80" />
              <Flower petal="#f4b942" center="#c2476a" className="art-spin-rev absolute -bottom-10 right-24 h-32 w-32 opacity-80 sm:right-40" />
              <span aria-hidden className="art-float absolute bottom-10 left-1/2 h-4 w-4 rounded-full bg-[#9bc47a]" />
              <div className="relative max-w-[17rem] sm:max-w-sm">
                <span className="inline-block rounded-full bg-[var(--accent)]/15 px-3 py-1 text-xs text-[var(--accent)]">{preset.kicker}</span>
                <h3 className={`mt-3 text-4xl leading-[1.02] sm:text-5xl ${t.head}`}>{preset.title}</h3>
                <p className="mt-3 text-sm text-[var(--soft)] sm:text-base">{preset.text}</p>
                <motion.button whileHover={{ scale: 1.06, rotate: -1 }} whileTap={{ scale: 0.95 }} onClick={() => setPage('book')} className={`mt-5 px-8 py-3.5 text-sm font-medium shadow-lg shadow-[var(--accent)]/30 ${btn}`}>{preset.action}</motion.button>
                <div className="mt-5 flex flex-wrap gap-2 text-xs">
                  {preset.tags.map((x, i) => <span key={x} className="rounded-full px-3 py-1.5" style={{ background: ['#f9d4dc', '#fbe7b0', '#d9e8c9'][i] }}>{x}</span>)}
                </div>
              </div>
            </motion.div>
          )}

          {page === 'services' && (
            <motion.div key={`services-${id}`} {...fade} className="p-4 sm:p-8">
              <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-[var(--soft)] sm:mb-4">{preset.catalog}</p>
              {id === 'clinic' ? (
                <ul className="space-y-2">
                  {preset.services.map((s) => {
                    const on = form.service === s.id
                    return (
                      <li key={s.id}>
                        <motion.button whileHover={{ x: 3 }} onClick={() => set({ service: s.id })} aria-pressed={on} className={`flex w-full items-center gap-3 rounded-[var(--r)] border px-3 py-2.5 text-left transition-colors sm:py-3 ${on ? 'border-[var(--accent)] bg-[var(--accent)]/10' : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--soft)]'}`}>
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]"><Cross className="h-4 w-4" /></span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">{s.name}</span>
                            <span className="hidden text-xs text-[var(--soft)] sm:block">{s.text}</span>
                          </span>
                          <span className="shrink-0 text-sm font-semibold">{fmt(s.price)} ₽</span>
                          <span aria-hidden className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] ${on ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--on)]' : 'border-[var(--line)]'}`}>{on ? '✓' : ''}</span>
                        </motion.button>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <ul className="grid grid-cols-2 gap-2 sm:gap-3">
                  {preset.services.map((s, i) => {
                    const on = form.service === s.id
                    const shop = id === 'shop'
                    return (
                      <li key={s.id}>
                        <motion.button whileHover={{ y: -4, rotate: shop ? (i % 2 ? 1 : -1) : 0 }} whileTap={{ scale: 0.97 }} onClick={() => set({ service: s.id })} aria-pressed={on} className={`relative h-full w-full border p-3 text-left transition-colors sm:p-4 ${shop ? 'rounded-3xl' : 'rounded-[var(--r)]'} ${on ? sel : `bg-[var(--surface)] ${idle}`}`}>
                          {shop && <Flower petal={SWATCH[i % 4]} className="mb-1 h-10 w-10 sm:h-14 sm:w-14" />}
                          <span className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
                            <span className={`text-base leading-tight sm:text-xl ${t.head}`}>{s.name}</span>
                            <span className="shrink-0 text-xs sm:text-sm">{fmt(s.price)} ₽</span>
                          </span>
                          <span className={`mt-1 hidden text-sm sm:block ${on ? 'opacity-75' : 'text-[var(--soft)]'}`}>{s.text}</span>
                          {on && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-[var(--surface)] text-xs text-[var(--ink)] ring-2 ring-[var(--accent)]">✓</motion.span>}
                        </motion.button>
                      </li>
                    )
                  })}
                </ul>
              )}
              <button onClick={() => setPage('book')} className={`mt-4 border border-[var(--ink)] px-5 py-2.5 text-xs uppercase tracking-[0.2em] transition-colors hover:bg-[var(--ink)] hover:text-[var(--bg)] sm:mt-6 sm:px-6 sm:py-3 rounded-[var(--pill)]`}>{preset.action} на выбранное →</button>
            </motion.div>
          )}

          {page === 'book' && (
            <motion.div key={`book-${id}`} {...fade} className="p-4 sm:p-8">
              {sentId !== null ? (
                <div className="flex flex-col items-start gap-5 py-4">
                  <svg viewBox="0 0 80 80" className="h-16 w-16 text-[var(--accent)]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <motion.circle cx="40" cy="40" r="34" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7 }} />
                    <motion.path d="M24 41l11 11 21-23" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.5 }} />
                  </svg>
                  <div>
                    <p className={`text-3xl ${t.head}`}>Заявка №{sentId} отправлена</p>
                    <p className="mt-2 max-w-sm text-[var(--soft)]">Менеджер уже получил её в CRM и в Telegram. Посмотрите, как это выглядит с их стороны.</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={goCrm} className={`px-6 py-3 text-xs uppercase tracking-[0.2em] ${btn}`}>Смотреть в CRM →</button>
                    <button onClick={goTg} className="rounded-[var(--pill)] border border-[var(--ink)] px-6 py-3 text-xs uppercase tracking-[0.2em]">Telegram менеджера</button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    onSubmit()
                  }}
                  className="space-y-3 sm:space-y-5"
                  noValidate
                >
                  <fieldset>
                    <legend className="mb-2 text-[11px] uppercase tracking-[0.3em] text-[var(--soft)]">{preset.catalog}</legend>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {preset.services.map((s) => (
                        <button key={s.id} type="button" aria-pressed={form.service === s.id} onClick={() => set({ service: s.id })} className={`max-w-[62%] truncate border px-3 py-1.5 text-xs transition-colors sm:max-w-none sm:px-4 sm:py-2 sm:text-sm rounded-[var(--pill)] ${form.service === s.id ? sel : idle}`}>
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <fieldset>
                    <legend className="mb-2 text-[11px] uppercase tracking-[0.3em] text-[var(--soft)]">{preset.slotsTitle}</legend>
                    <div className="grid grid-cols-6 gap-1 sm:gap-2">
                      {SLOTS.map((s) => (
                        <button key={s.t} type="button" disabled={s.busy} aria-pressed={form.slot === s.t} onClick={() => set({ slot: s.t })} className={`border py-1.5 text-[11px] transition-colors sm:py-2 sm:text-sm rounded-[var(--r)] disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 ${form.slot === s.t ? sel : idle}`}>
                          {s.t}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
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
                    <motion.button ref={submitRef} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className={`px-7 py-3 text-xs uppercase tracking-[0.2em] sm:px-8 sm:py-3.5 ${btn}`}>
                      {preset.action}
                    </motion.button>
                    <p role="status" className={`text-sm ${error ? 'text-red-700' : 'text-[var(--soft)]'}`}>{error || 'Макет: данные остаются в этом окне.'}</p>
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
