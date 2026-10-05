'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'motion/react'
import { leadSchema, type LeadInput } from '@/lib/schemas'
import { site } from '@/content/site'

const field = 'w-full border-b border-line bg-transparent py-4 text-lg outline-none transition-colors placeholder:text-mute focus:border-ink'

export function Contact() {
  const [state, setState] = useState<'idle' | 'sent' | 'error'>('idle')
  const [err, setErr] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: { project: 'other', website: '' },
  })

  useEffect(() => {
    const on = (e: Event) => setValue('project', (e as CustomEvent<LeadInput['project']>).detail)
    window.addEventListener('pick-tariff', on)
    return () => window.removeEventListener('pick-tariff', on)
  }, [setValue])

  async function onSubmit(data: LeadInput) {
    setState('idle')
    const r = await fetch('/api/lead', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) })
    const j = await r.json().catch(() => ({}))
    if (r.ok && j.ok) { setState('sent'); reset() } else { setState('error'); setErr(j.error ?? 'Ошибка отправки') }
  }

  return (
    <section id="contact" className="bg-ink px-[clamp(20px,4vw,64px)] py-[16vh] text-paper">
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2">
        <div>
          <p className="mb-8 text-xs uppercase tracking-[0.35em] opacity-60">Заявка</p>
          <h2 className="font-display text-[clamp(3rem,7vw,7rem)] leading-[0.95]">Расскажите о проекте</h2>
          <p className="mt-8 max-w-md text-lg opacity-70">Ответим в течение рабочего дня и предложим формат Discovery-спринта.</p>
          <div className="mt-10 space-y-2 text-lg">
            <a href={site.telegram} className="block underline-offset-4 hover:underline">Telegram</a>
            <a href={`mailto:${site.email}`} className="block underline-offset-4 hover:underline">{site.email}</a>
          </div>
        </div>

        {state === 'sent' ? (
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="self-center font-display text-5xl">
            Спасибо! Мы скоро свяжемся.
          </motion.p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 [&_input]:text-paper [&_select]:text-paper [&_textarea]:text-paper [&_input]:border-paper/25 [&_select]:border-paper/25 [&_textarea]:border-paper/25 [&_input:focus]:border-paper [&_select:focus]:border-paper [&_textarea:focus]:border-paper" noValidate>
            <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden {...register('website')} />
            <div>
              <input className={field} placeholder="Ваше имя" {...register('name')} />
              {errors.name && <p className="mt-2 text-sm text-red-300">{errors.name.message}</p>}
            </div>
            <div>
              <input className={field} placeholder="Telegram, телефон или email" {...register('contact')} />
              {errors.contact && <p className="mt-2 text-sm text-red-300">{errors.contact.message}</p>}
            </div>
            <select className={`${field} [&>option]:text-ink`} {...register('project')}>
              <option value="other">Тариф пока не выбран</option>
              <option value="landing">Лендинг</option>
              <option value="studio">Сайт-студия</option>
              <option value="flagship">Эталон</option>
            </select>
            <textarea className={field} rows={3} placeholder="Коротко о задаче" {...register('message')} />
            <label className="flex items-start gap-3 text-sm opacity-70">
              <input type="checkbox" className="mt-1" {...register('consent')} />
              <span>Согласен на обработку персональных данных (152-ФЗ)</span>
            </label>
            {errors.consent && <p className="text-sm text-red-300">{errors.consent.message}</p>}
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} disabled={isSubmitting} className="rounded-full bg-paper px-10 py-5 text-xs uppercase tracking-[0.2em] text-ink disabled:opacity-50">
              {isSubmitting ? 'Отправляем…' : 'Отправить заявку'}
            </motion.button>
            {state === 'error' && <p className="text-sm text-red-300">{err}</p>}
          </form>
        )}
      </div>
      <p className="mx-auto mt-24 max-w-7xl border-t border-paper/15 pt-8 text-sm opacity-50">© {new Date().getFullYear()} KOVAGOR</p>
    </section>
  )
}
