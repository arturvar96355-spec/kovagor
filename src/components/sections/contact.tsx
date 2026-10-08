'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion, useAnimate, useReducedMotion } from 'motion/react'
import { leadSchema, type LeadInput } from '@/lib/schemas'
import { site } from '@/content/site'
import { tariffs } from '@/content/tariffs'
import { SplitReveal } from '@/components/motion/split-reveal'
import { Reveal } from '@/components/motion/reveal'
import { goal } from '@/lib/analytics'

const input = 'peer w-full bg-transparent py-4 text-lg text-paper outline-none placeholder:text-paper/60'
const EASE = [0.16, 1, 0.3, 1] as const
type Choice = 'landing' | 'studio' | 'flagship' | 'other'
const fmt = (n: number) => n.toLocaleString('ru-RU')
const options: { id: Choice; name: string; hint: string }[] = [
  ...tariffs.map((t) => ({ id: t.id as Choice, name: t.name, hint: `от ${fmt(t.from)} ₽` })),
  { id: 'other', name: 'Пока не знаю', hint: 'подскажем' },
]

/** Поле с «прорисовывающейся» линией: при фокусе светлая линия заполняет подчёркивание слева направо; ошибка трясёт поле. */
function Field({ error, shakeKey, children }: { error?: string; shakeKey: number; children: ReactNode }) {
  const reduced = useReducedMotion()
  const [scope, animate] = useAnimate<HTMLDivElement>()
  const hasError = !!error
  // встряхиваем только при отправке формы (shakeKey растёт), а не на каждый символ при перепроверке
  useEffect(() => {
    if (hasError && !reduced && shakeKey > 0) animate(scope.current, { x: [0, -8, 8, -5, 5, 0] }, { duration: 0.45, ease: 'easeInOut' })
  }, [shakeKey, hasError, reduced, animate, scope])
  return (
    <div ref={scope} data-stagger>
      <div className="relative">
        {children}
        <span aria-hidden className={`absolute bottom-0 left-0 h-px w-full ${error ? 'bg-red-300/70' : 'bg-paper/25'}`} />
        <span aria-hidden className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-paper transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] peer-focus:scale-x-100" />
      </div>
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pt-2 text-sm text-red-300">
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

function Dots() {
  return (
    <span className="inline-flex items-center gap-1.5" aria-label="Отправляем">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-ink" animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }} />
      ))}
    </span>
  )
}

function Success({ botLink }: { botLink?: string }) {
  // сразу ведём в Telegram, а кнопка остаётся на случай, если браузер не открыл приложение
  useEffect(() => {
    if (!botLink) return
    const t = setTimeout(() => window.location.assign(botLink), 1600)
    return () => clearTimeout(t)
  }, [botLink])
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }} className="flex flex-col items-start justify-center gap-8 self-center">
      <svg viewBox="0 0 80 80" className="h-20 w-20 text-paper" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <motion.circle cx="40" cy="40" r="36" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: 'easeInOut' }} />
        <motion.path d="M24 41l11 11 21-23" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.7, ease: 'easeOut' }} />
      </svg>
      <div>
        <p className="font-display text-5xl md:text-6xl">Заявка принята</p>
        <p className="mt-4 max-w-sm text-lg opacity-70">{botLink ? 'Открываем Telegram: нажмите «Старт», и мы продолжим переписку там.' : 'Спасибо! Мы свяжемся с вами в течение рабочего дня.'}</p>
      </div>
      {botLink && (
        <a href={botLink} target="_blank" rel="noopener noreferrer" data-goal="tg_bot_open" className="inline-flex items-center gap-3 rounded-full bg-paper px-8 py-4 text-xs uppercase tracking-[0.2em] text-ink">
          Открыть Telegram <span aria-hidden>↗</span>
        </a>
      )}
    </motion.div>
  )
}

export function Contact() {
  const [sent, setSent] = useState(false)
  const [botLink, setBotLink] = useState<string>()
  const [serverError, setServerError] = useState('')
  const reduced = useReducedMotion()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, submitCount },
    reset,
    setValue,
    control,
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: { project: 'other', website: '', quiz: '' },
  })
  const project = (useWatch({ control, name: 'project' }) ?? 'other') as Choice
  const quiz = useWatch({ control, name: 'quiz' })

  useEffect(() => {
    const onTariff = (e: Event) => setValue('project', (e as CustomEvent<Choice>).detail)
    // итог «Подбора тарифа» уходит в заявку отдельным полем и виден менеджеру в карточке
    const onQuiz = (e: Event) => setValue('quiz', String((e as CustomEvent<string>).detail).replace(/^Подбор тарифа на сайте:\s*/, ''))
    window.addEventListener('pick-tariff', onTariff)
    window.addEventListener('prefill-message', onQuiz)
    return () => {
      window.removeEventListener('pick-tariff', onTariff)
      window.removeEventListener('prefill-message', onQuiz)
    }
  }, [setValue])

  async function onSubmit(data: LeadInput) {
    setServerError('')
    try {
      const r = await fetch('/api/lead', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) })
      const j = await r.json().catch(() => ({}))
      if (r.ok && j.ok) {
        goal('form_submit', { tariff: data.project ?? 'other' })
        setBotLink(j.botLink)
        setSent(true)
        reset()
      } else setServerError(j.error ?? 'Ошибка отправки. Позвоните нам или напишите в Telegram.')
    } catch {
      setServerError('Нет соединения. Попробуйте ещё раз или позвоните нам.')
    }
  }

  return (
    <section id="contact" className="bg-ink px-[clamp(20px,4vw,64px)] py-[16vh] text-paper">
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2">
        <div>
          <p className="mb-8 text-xs uppercase tracking-[0.35em] opacity-60">09 · Заявка</p>
          <SplitReveal as="h2" className="font-display text-[clamp(3rem,7vw,7rem)] leading-[0.95]">
            Расскажите о проекте
          </SplitReveal>
          <p className="mt-8 max-w-md text-lg opacity-70">Выберите тариф и оставьте контакт: после отправки откроется наш Telegram-бот, и вся заявка уже будет у менеджера. Ответим в течение рабочего дня и назовём стоимость.</p>
          <div className="mt-10 space-y-2 text-lg">
            <p className="text-sm uppercase tracking-[0.25em] opacity-60">Или позвоните</p>
            <a href={`tel:${site.phone}`} data-goal="contact_phone" className="block underline-offset-4 hover:underline">{site.phoneLabel}</a>
          </div>
        </div>

        <div className="flex lg:min-h-[600px] lg:items-start">
          <AnimatePresence mode="wait" initial={false}>
            {sent ? (
              <Success key="ok" botLink={botLink} />
            ) : (
              <motion.div key="form" className="w-full" exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                <Reveal>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                    <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden {...register('website')} />
                    <fieldset data-stagger>
                      <legend className="mb-4 text-xs uppercase tracking-[0.3em] opacity-60">Тариф</legend>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {options.map((o) => {
                          const on = project === o.id
                          return (
                            <label key={o.id} className="relative cursor-pointer">
                              <input type="radio" value={o.id} className="peer sr-only" {...register('project')} />
                              <motion.span
                                whileHover={reduced ? undefined : { y: -3 }}
                                transition={{ duration: 0.25 }}
                                className={`block rounded-2xl border px-5 py-3 transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-paper ${on ? 'border-paper bg-paper text-ink' : 'border-paper/25 hover:border-paper/60'}`}
                              >
                                <span className="block font-display text-xl">{o.name}</span>
                                <span className="block text-sm opacity-60">{o.hint}</span>
                              </motion.span>
                            </label>
                          )
                        })}
                      </div>
                    </fieldset>
                    {quiz && (
                      <div data-stagger className="flex items-start justify-between gap-4 rounded-2xl border border-paper/25 px-5 py-3 text-sm">
                        <p><span className="opacity-60">Результат подбора: </span>{quiz}</p>
                        <button type="button" onClick={() => setValue('quiz', '')} className="shrink-0 underline underline-offset-4 opacity-70 hover:opacity-100">убрать</button>
                      </div>
                    )}
                    <Field error={errors.name?.message} shakeKey={submitCount}>
                      <input className={input} placeholder="Ваше имя" aria-label="Ваше имя" autoComplete="name" {...register('name')} />
                    </Field>
                    <Field error={errors.contact?.message} shakeKey={submitCount}>
                      <input className={input} placeholder="Telegram, телефон или email" aria-label="Telegram, телефон или email" autoComplete="email" {...register('contact')} />
                    </Field>
                    <Field shakeKey={submitCount}>
                      <textarea className={input} rows={3} placeholder="Коротко о задаче" aria-label="Коротко о задаче" {...register('message')} />
                    </Field>
                    <div data-stagger>
                      <label className="flex items-start gap-3 text-sm opacity-70">
                        <input type="checkbox" className="mt-1 accent-paper" {...register('consent')} />
                        <span>
                          Даю <a href="/consent" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">согласие на обработку персональных данных</a> и ознакомлен(а) с{' '}
                          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">политикой</a>
                        </span>
                      </label>
                      {errors.consent && <p className="pt-2 text-sm text-red-300">{errors.consent.message}</p>}
                    </div>
                    <div data-stagger className="flex flex-wrap items-center gap-5">
                      <motion.button
                        whileHover={reduced ? undefined : { scale: 1.04 }}
                        whileTap={reduced ? undefined : { scale: 0.96 }}
                        disabled={isSubmitting}
                        className="grid h-[58px] min-w-[240px] place-items-center rounded-full bg-paper px-10 text-xs uppercase tracking-[0.2em] text-ink disabled:opacity-80"
                      >
                        {isSubmitting ? <Dots /> : 'Отправить заявку'}
                      </motion.button>
                      <AnimatePresence>
                        {serverError && (
                          <motion.p initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-sm text-red-300">
                            {serverError}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </form>
                </Reveal>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
