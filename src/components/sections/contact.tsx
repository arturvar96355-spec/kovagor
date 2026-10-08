'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { site } from '@/content/site'
import { tariffs } from '@/content/tariffs'
import { SplitReveal } from '@/components/motion/split-reveal'
import { Reveal } from '@/components/motion/reveal'

type Choice = 'landing' | 'studio' | 'flagship' | 'other'
const fmt = (n: number) => n.toLocaleString('ru-RU')
const options: { id: Choice; name: string; hint: string }[] = [
  ...tariffs.map((t) => ({ id: t.id as Choice, name: t.name, hint: `от ${fmt(t.from)} ₽` })),
  { id: 'other', name: 'Пока не знаю', hint: 'подскажем' },
]

/** Заявка = переход в Telegram-бота с выбранным тарифом (параметр start). Сайт ничего не собирает: согласие и данные — в боте. */
export function Contact() {
  const [choice, setChoice] = useState<Choice>('other')
  const reduced = useReducedMotion()

  useEffect(() => {
    const onTariff = (e: Event) => setChoice((e as CustomEvent<Choice>).detail)
    window.addEventListener('pick-tariff', onTariff)
    return () => window.removeEventListener('pick-tariff', onTariff)
  }, [])

  const href = choice === 'other' ? site.telegram : `${site.telegram}?start=${choice}`

  return (
    <section id="contact" className="bg-ink px-[clamp(20px,4vw,64px)] py-[16vh] text-paper">
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2">
        <div>
          <p className="mb-8 text-xs uppercase tracking-[0.35em] opacity-60">09 · Заявка</p>
          <SplitReveal as="h2" className="font-display text-[clamp(3rem,7vw,7rem)] leading-[0.95]">
            Расскажите о проекте
          </SplitReveal>
          <p className="mt-8 max-w-md text-lg opacity-70">Выберите тариф и нажмите кнопку: откроется наш Telegram-бот, тариф подставится сам. Ответим в течение рабочего дня и назовём стоимость.</p>
          <div className="mt-10 space-y-2 text-lg">
            <p className="text-sm uppercase tracking-[0.25em] opacity-60">Или позвоните</p>
            <a href={`tel:${site.phone}`} data-goal="contact_phone" className="block underline-offset-4 hover:underline">{site.phoneLabel}</a>
          </div>
        </div>

        <Reveal className="w-full self-center">
          <fieldset data-stagger>
            <legend className="mb-5 text-xs uppercase tracking-[0.3em] opacity-60">Тариф</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {options.map((o) => {
                const on = choice === o.id
                return (
                  <label key={o.id} className="relative cursor-pointer">
                    <input type="radio" name="tariff" value={o.id} checked={on} onChange={() => setChoice(o.id)} className="peer sr-only" />
                    <motion.span
                      whileHover={reduced ? undefined : { y: -3 }}
                      transition={{ duration: 0.25 }}
                      className={`block rounded-2xl border px-5 py-4 transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-paper ${on ? 'border-paper bg-paper text-ink' : 'border-paper/25 hover:border-paper/60'}`}
                    >
                      <span className="block font-display text-2xl">{o.name}</span>
                      <span className={`block text-sm ${on ? 'opacity-70' : 'opacity-60'}`}>{o.hint}</span>
                    </motion.span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          <div data-stagger className="mt-10">
            <motion.a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              data-goal="tg_start"
              data-goal-param={choice}
              whileHover={reduced ? undefined : { scale: 1.03 }}
              whileTap={reduced ? undefined : { scale: 0.97 }}
              className="inline-flex h-[58px] items-center gap-3 rounded-full bg-paper px-10 text-xs uppercase tracking-[0.2em] text-ink"
            >
              Отправить заявку в Telegram <span aria-hidden>↗</span>
            </motion.a>
            <p className="mt-5 max-w-md text-sm leading-relaxed opacity-60">
              В боте нужно будет нажать «Старт» и подтвердить <a href="/consent" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">согласие на обработку персональных данных</a>. Подробнее — в <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">политике</a>.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
