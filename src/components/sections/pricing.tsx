'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, registerGsap, NO_REDUCED_MOTION } from '@/lib/animation'
import { tariffs } from '@/content/tariffs'

const fmt = (n: number) => `${Math.round(n)} 000 ₽`

export function Pricing() {
  const root = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      registerGsap()
      const mm = gsap.matchMedia()
      mm.add(NO_REDUCED_MOTION, () => {
        gsap.from('[data-tariff]', {
          opacity: 0, y: 60, duration: 1, ease: 'expo.out', stagger: 0.15,
          scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
        })
        gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
          const to = Number(el.dataset.count)
          const o = { v: 0 }
          gsap.to(o, {
            v: to, duration: 1.6, ease: 'power3.out', onUpdate: () => (el.textContent = fmt(o.v)),
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          })
        })
      })
    },
    { scope: root },
  )
  return (
    <section ref={root} id="pricing" className="container-x border-t border-line py-[14vh]">
      <p className="mb-14 text-xs uppercase tracking-[0.35em] text-mute">Тарифы</p>
      <div className="grid gap-5 lg:grid-cols-3">
        {tariffs.map((t) => (
          <div key={t.id} data-tariff className={`flex flex-col rounded-3xl p-8 transition-transform duration-500 hover:-translate-y-2 md:p-10 ${t.featured ? 'bg-ink text-paper' : 'border border-line bg-paper-2'}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-4xl">{t.name}</h3>
              {t.featured && <span className="rounded-full border border-paper/40 px-3 py-1 text-[10px] uppercase tracking-[0.2em]">Выбор клиентов</span>}
            </div>
            <p className="mt-8 text-sm opacity-60">от</p>
            <p data-count={t.from} className="font-display text-5xl">{fmt(t.from)}</p>
            <p className="mt-2 text-sm opacity-60">до {fmt(t.to)} · {t.term}</p>
            <ul className="mt-8 flex-1 space-y-3 border-t border-current/15 pt-8 text-[15px]">
              {t.items.map((i) => (
                <li key={i} className="flex gap-3"><span aria-hidden>—</span>{i}</li>
              ))}
            </ul>
            <a href="#contact" onClick={() => window.dispatchEvent(new CustomEvent("pick-tariff", { detail: t.id }))} className={`mt-10 rounded-full px-6 py-4 text-center text-xs uppercase tracking-[0.2em] transition-colors ${t.featured ? 'bg-paper text-ink hover:bg-paper-2' : 'bg-ink text-paper hover:bg-ink-2'}`}>
              Выбрать
            </a>
          </div>
        ))}
      </div>
    </section>
  )
}
