'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { tariffs } from '@/content/tariffs'
import { SectionHead } from '@/components/motion/section-head'
import { goal } from '@/lib/analytics'

const EASE = [0.16, 1, 0.3, 1] as const

type Q = { id: string; title: string; options: { label: string; hint: string; score: number }[] }

const questions: Q[] = [
  { id: 'size', title: 'Какой сайт нужен?', options: [
    { label: 'Одна страница', hint: 'Лендинг: кто мы, что делаем, как связаться', score: 0 },
    { label: 'Несколько страниц', hint: 'Услуги, о компании, портфолио, контакты', score: 1 },
    { label: 'Сложный проект', hint: 'Много разделов, нестандартная логика, личный кабинет', score: 2 },
  ] },
  { id: 'motion', title: 'Сколько движения?', options: [
    { label: 'Минимум', hint: 'Аккуратно и быстро, без лишнего', score: 0 },
    { label: 'Заметные анимации', hint: 'Появления, скролл-эффекты, hover', score: 1 },
    { label: 'Чтобы «вау»', hint: '3D, сцены по скроллу, фирменные приёмы', score: 2 },
  ] },
  { id: 'features', title: 'Что должен уметь сайт?', options: [
    { label: 'Показывать информацию', hint: 'Без форм и интеграций', score: 0 },
    { label: 'Принимать заявки', hint: 'Форма, уведомления в Telegram или на почту', score: 1 },
    { label: 'Больше', hint: 'CRM, личный кабинет, админка, свои сервисы', score: 2 },
  ] },
]

function recommend(score: number) {
  return tariffs[score >= 5 ? 2 : score >= 2 ? 1 : 0]
}

/** Подбор тарифа: три вопроса → рекомендация и переход к форме с подставленным тарифом и описанием выбора. */
export function TariffQuiz() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [labels, setLabels] = useState<string[]>([])
  const done = step >= questions.length
  const score = answers.reduce((a, b) => a + b, 0)
  const tariff = recommend(score)

  const pick = (opt: Q['options'][number]) => {
    const nextAnswers = [...answers, opt.score]
    setAnswers(nextAnswers)
    setLabels([...labels, `${questions[step].title} ${opt.label}`])
    setStep(step + 1)
    if (step + 1 === questions.length) goal('quiz_done', { tariff: recommend(nextAnswers.reduce((a, b) => a + b, 0)).id })
  }
  const reset = () => {
    setStep(0)
    setAnswers([])
    setLabels([])
  }
  const toForm = () => {
    window.dispatchEvent(new CustomEvent('pick-tariff', { detail: tariff.id }))
    window.dispatchEvent(new CustomEvent('prefill-message', { detail: `Подбор тарифа на сайте: ${labels.join('; ')}.` }))
  }

  return (
    <section id="quiz" className="container-x border-t border-line py-[14vh]">
      <SectionHead index="05" label="Подбор" title="Какой тариф вам подойдёт" />
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-3" aria-hidden>
          {questions.map((_, i) => (
            <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-line">
              <motion.span className="block h-full bg-ink" initial={false} animate={{ width: i < Math.min(step, questions.length) ? '100%' : '0%' }} transition={{ duration: 0.5, ease: EASE }} />
            </span>
          ))}
        </div>
        <div className="relative min-h-[420px]" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            {!done ? (
              <motion.div key={step} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.45, ease: EASE }}>
                <p className="mb-6 text-xs uppercase tracking-[0.3em] text-mute">Вопрос {step + 1} из {questions.length}</p>
                <h3 className="font-display text-4xl md:text-5xl">{questions[step].title}</h3>
                <div className="mt-8 grid gap-3">
                  {questions[step].options.map((o, i) => (
                    <motion.button
                      key={o.label}
                      onClick={() => pick(o)}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 * i, duration: 0.5, ease: EASE }}
                      whileHover={{ x: 8 }}
                      whileTap={{ scale: 0.99 }}
                      className="group flex items-center justify-between gap-4 rounded-2xl border border-line bg-paper-2 px-6 py-5 text-left transition-colors hover:border-ink"
                    >
                      <span>
                        <span className="block font-display text-2xl">{o.label}</span>
                        <span className="mt-1 block text-sm text-ink-2">{o.hint}</span>
                      </span>
                      <span aria-hidden className="text-xl transition-transform duration-500 group-hover:translate-x-1">→</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="result" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="rounded-3xl bg-ink p-8 text-paper md:p-12">
                <p className="text-xs uppercase tracking-[0.3em] opacity-60">Подойдёт</p>
                <h3 className="mt-3 font-display text-5xl md:text-6xl">{tariff.name}</h3>
                <p className="mt-4 text-lg opacity-80">от {tariff.from.toLocaleString('ru-RU').replace(/ /g, ' ')} ₽ · срок {tariff.term}</p>
                <ul className="mt-6 space-y-2 text-[15px] opacity-80">
                  {tariff.items.map((it) => (
                    <li key={it} className="flex gap-3"><span aria-hidden>—</span>{it}</li>
                  ))}
                </ul>
                <p className="mt-6 text-sm opacity-60">Это ориентир по вашим ответам, а не оферта: точный состав и цену зафиксируем письменно после обсуждения задачи.</p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a href="#contact" onClick={toForm} data-goal="quiz_to_form" className="rounded-full bg-paper px-8 py-4 text-xs uppercase tracking-[0.2em] text-ink">
                    Оставить заявку с этим выбором
                  </a>
                  <button onClick={reset} className="text-sm underline underline-offset-4 opacity-70 hover:opacity-100">Пройти заново</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
