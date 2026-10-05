'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ease, registerGsap, afterPreload, NO_REDUCED_MOTION } from '@/lib/animation'
import { Monogram } from '@/components/brand'
import { SplitReveal } from '@/components/motion/split-reveal'
import { Magnetic } from '@/components/motion/magnetic'

export function Hero() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      registerGsap()
      const mm = gsap.matchMedia()
      mm.add(NO_REDUCED_MOTION, () => {
        // фолбэк-монограмма (плоская) и подписи ждут, пока заставка начнёт уезжать.
        // Элементы берём внутри секции заранее: в отложенном колбэке строковые селекторы потеряли бы scope
        const paths = gsap.utils.toArray<SVGPathElement>('[data-mono-path]', root.current)
        const fades = gsap.utils.toArray<HTMLElement>('[data-hero-fade]', root.current)
        gsap.set(paths, { opacity: 0, yPercent: 8 })
        gsap.set(fades, { opacity: 0, y: 16 })
        afterPreload(() => {
          gsap.to(paths, { opacity: 1, yPercent: 0, duration: 1.4, ease: ease.out, stagger: 0.12, delay: 0.3 })
          gsap.to(fades, { opacity: 1, y: 0, duration: 1, ease: ease.soft, delay: 1, stagger: 0.12 })
        })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="hero" className="container-x relative flex min-h-svh flex-col justify-between overflow-hidden pb-10 pt-28">
      {/* плоская монограмма — фолбэк, пока нет 3D (мобильные, reduced-motion, нет WebGL) */}
      <div data-mono-wrap className="pointer-events-none absolute right-[-4vw] top-1/2 w-[62vw] max-w-[900px] -translate-y-1/2 text-ink/[0.07] transition-opacity duration-700 [html[data-3d]_&]:opacity-0">
        <Monogram />
      </div>

      <div className="relative z-10 mt-[10vh] max-w-5xl lg:max-w-[58vw]">
        <p data-hero-fade className="mb-8 text-xs uppercase tracking-[0.35em] text-mute">Студия сайтов под ключ</p>
        <SplitReveal as="h1" immediate className="font-display text-[clamp(3rem,7.6vw,8.5rem)] font-medium leading-[0.95] tracking-tight">
          Сайты, которые продают ещё до первого звонка
        </SplitReveal>
      </div>

      <div className="relative z-10 flex flex-wrap items-end justify-between gap-8">
        <p data-hero-fade className="max-w-md text-lg leading-relaxed text-ink-2">
          Дизайн, анимации и разработка в одной команде. От идеи до запуска — без посредников.
        </p>
        <div data-hero-fade>
          <Magnetic>
            <a href="#contact" className="inline-flex items-center gap-3 rounded-full bg-ink px-9 py-5 text-sm uppercase tracking-[0.2em] text-paper transition-colors hover:bg-ink-2">
              Обсудить проект <span aria-hidden>→</span>
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  )
}
