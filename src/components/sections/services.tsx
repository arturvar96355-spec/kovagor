'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, registerGsap, NO_REDUCED_MOTION } from '@/lib/animation'
import { services } from '@/content/services'
import { SectionHead } from '@/components/motion/section-head'

/** Карточки «залипают» стопкой; предыдущая уменьшается и тускнеет, когда на неё наезжает следующая. */
export function Services() {
  const root = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      registerGsap()
      const mm = gsap.matchMedia()
      mm.add(NO_REDUCED_MOTION, () => {
        const cards = gsap.utils.toArray<HTMLElement>('[data-card]')
        cards.forEach((card, i) => {
          if (i === cards.length - 1) return
          gsap.fromTo(card.firstElementChild, { scale: 1, filter: 'brightness(1)' }, {
            scale: 0.92,
            filter: 'brightness(0.92)',
            ease: 'none',
            scrollTrigger: { trigger: cards[i + 1], start: 'top 85%', end: 'top 15%', scrub: true },
          })
        })
      })
    },
    { scope: root },
  )
  return (
    <section ref={root} id="services" className="container-x border-t border-line py-[14vh]">
      <SectionHead index="01" label="Услуги" title="Что мы делаем" />
      {services.map((s, i) => (
        <div key={s.n} data-card className="sticky" style={{ top: `${12 + i * 2}vh`, paddingBottom: '4vh' }}>
          <div className="grid gap-6 rounded-3xl border border-line bg-paper-2 shadow-[0_-20px_40px_-30px_rgba(0,0,0,0.25)] p-8 md:grid-cols-[120px_1fr_1fr] md:p-14">
            <span className="font-display text-5xl text-mute">{s.n}</span>
            <h3 className="font-display text-4xl leading-tight md:text-6xl">{s.title}</h3>
            <p className="self-end text-lg leading-relaxed text-ink-2">{s.text}</p>
          </div>
        </div>
      ))}
    </section>
  )
}
