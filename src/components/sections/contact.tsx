'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion, useAnimate, useReducedMotion } from 'motion/react'
import { leadSchema, type LeadInput } from '@/lib/schemas'
import { site } from '@/content/site'
import { SplitReveal } from '@/components/motion/split-reveal'
import { Reveal } from '@/components/motion/reveal'
import { goal } from '@/lib/analytics'

const input = 'peer w-full bg-transparent py-4 text-lg text-paper outline-none placeholder:text-paper/45'
const EASE = [0.16, 1, 0.3, 1] as const

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

function Success() {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }} className="flex flex-col items-start justify-center gap-8 self-center">
      <svg viewBox="0 0 80 80" className="h-20 w-20 text-paper" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <motion.circle cx="40" cy="40" r="36" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: 'easeInOut' }} />
        <motion.path d="M24 41l11 11 21-23" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.7, ease: 'easeOut' }} />
      </svg>
      <div>
        <p className="font-display text-5xl md:text-6xl">Заявка отправлена</p>
        <p className="mt-4 max-w-sm text-lg opacity-70">Спасибо! Мы свяжемся с вами в течение рабочего дня.</p>
      </div>
    </motion.div>
  )
}

export function Contact() {
  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, submitCount },
    reset,
    setValue,
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: { project: 'other', website: '' },
  })

  useEffect(() => {
    const on = (e: Event) => setValue('project', (e as CustomEvent<LeadInput['project']>).detail)
    window.addEventListener('pick-tariff', on)
    return () => window.removeEventListener('pick-tariff', on)
  }, [setValue])

  async function onSubmit(data: LeadInput) {
    setServerError('')
    try {
      const r = await fetch('/api/lead', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) })
      const j = await r.json().catch(() => ({}))
      if (r.ok && j.ok) {
        goal('form_submit', { tariff: data.project ?? 'other' })
        setSent(true)
        reset()
      } else setServerError(j.error ?? 'Ошибка отправки. Напишите нам в Telegram.')
    } catch {
      setServerError('Нет соединения. Попробуйте ещё раз или напишите нам в Telegram.')
    }
  }

  return (
    <section id="contact" className="bg-ink px-[clamp(20px,4vw,64px)] py-[16vh] text-paper">
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2">
        <div>
          <p className="mb-8 text-xs uppercase tracking-[0.35em] opacity-60">06 · Заявка</p>
          <SplitReveal as="h2" className="font-display text-[clamp(3rem,7vw,7rem)] leading-[0.95]">
            Расскажите о проекте
          </SplitReveal>
          <p className="mt-8 max-w-md text-lg opacity-70">Ответим в течение рабочего дня и предложим формат Discovery-спринта.</p>
          <div className="mt-10 space-y-2 text-lg">
            <a href={site.telegram} data-goal="contact_telegram" className="block underline-offset-4 hover:underline">Telegram</a>
            <a href={`mailto:${site.email}`} data-goal="contact_email" className="block underline-offset-4 hover:underline">{site.email}</a>
          </div>
        </div>

        <div className="flex lg:min-h-[600px] lg:items-start">
        <AnimatePresence mode="wait" initial={false}>
          {sent ? (
            <Success key="ok" />
          ) : (
            <motion.div key="form" className="w-full" exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <Reveal>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                  <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden {...register('website')} />
                  <Field error={errors.name?.message} shakeKey={submitCount}>
                    <input className={input} placeholder="Ваше имя" {...register('name')} />
                  </Field>
                  <Field error={errors.contact?.message} shakeKey={submitCount}>
                    <input className={input} placeholder="Telegram, телефон или email" {...register('contact')} />
                  </Field>
                  <Field shakeKey={submitCount}>
                    <select className={`${input} [&>option]:text-ink`} {...register('project')}>
                      <option value="other">Тариф пока не выбран</option>
                      <option value="landing">Лендинг</option>
                      <option value="studio">Сайт-студия</option>
                      <option value="flagship">Эталон</option>
                    </select>
                  </Field>
                  <Field shakeKey={submitCount}>
                    <textarea className={input} rows={3} placeholder="Коротко о задаче" {...register('message')} />
                  </Field>
                  <div data-stagger>
                    <label className="flex items-start gap-3 text-sm opacity-70">
                      <input type="checkbox" className="mt-1 accent-paper" {...register('consent')} />
                      <span>Согласен на обработку персональных данных (152-ФЗ)</span>
                    </label>
                    {errors.consent && <p className="pt-2 text-sm text-red-300">{errors.consent.message}</p>}
                  </div>
                  <div data-stagger className="flex flex-wrap items-center gap-5">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
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
