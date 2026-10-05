'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, registerGsap, NO_REDUCED_MOTION } from '@/lib/animation'
import { services } from '@/content/services'
import { ServiceArt } from './service-art'
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

        // иллюстрации: контуры прорисовываются, когда карточка встаёт на место; затем живёт собственная петля
        cards.forEach((card) => {
          const art = card.querySelector<SVGSVGElement>('[data-art] svg')
          if (!art) return
          const draws = Array.from(art.querySelectorAll<SVGGeometryElement>('[data-draw]'))
          const bars = Array.from(art.querySelectorAll<SVGRectElement>('[data-bar]'))
          const dot = art.querySelector<SVGCircleElement>('[data-dot]')
          const curve = art.querySelector<SVGPathElement>('[data-curve]')
          draws.forEach((el) => {
            const len = el.getTotalLength()
            gsap.set(el, { strokeDasharray: len, strokeDashoffset: len })
          })
          if (bars.length) gsap.set(bars, { transformOrigin: '50% 100%', scaleY: 0 })
          if (dot) gsap.set(dot, { opacity: 0 })

          const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 75%', once: true } })
          if (draws.length) tl.to(draws, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', stagger: 0.12 })
          if (bars.length) tl.to(bars, { scaleY: 1, duration: 1, ease: 'expo.out', stagger: 0.12 }, 0.3)
          if (dot && curve) {
            const len = curve.getTotalLength()
            const prog = { p: 0 }
            const place = () => {
              const pt = curve.getPointAtLength(prog.p * len)
              gsap.set(dot, { attr: { cx: pt.x, cy: pt.y } })
            }
            tl.set(dot, { opacity: 1 }, 1)
            tl.to(prog, { p: 1, duration: 2.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 0.6, onUpdate: place }, 1)
          }
        })
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
          <div className="grid items-center gap-6 rounded-3xl border border-line bg-paper-2 shadow-[0_-20px_40px_-30px_rgba(0,0,0,0.25)] p-8 md:grid-cols-[100px_1.2fr_1fr] md:p-14 lg:grid-cols-[100px_1.2fr_1fr_170px]">
            <span className="font-display text-5xl text-mute">{s.n}</span>
            <h3 className="font-display text-4xl leading-tight md:text-6xl">{s.title}</h3>
            <p className="text-lg leading-relaxed text-ink-2">{s.text}</p>
            <div data-art className="hidden text-ink lg:block">
              <ServiceArt id={s.art} />
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}
