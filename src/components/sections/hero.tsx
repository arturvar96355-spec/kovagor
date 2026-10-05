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
          Сайты, которые запоминаются с первого экрана
        </SplitReveal>
      </div>

      <div className="relative z-10 flex flex-wrap items-end justify-between gap-8">
        <div aria-hidden data-hero-fade className="pointer-events-none absolute -top-24 left-0 hidden items-center gap-3 text-[10px] uppercase tracking-[0.35em] text-mute md:flex">
          <span className="relative block h-12 w-px overflow-hidden bg-line">
            <span className="scroll-cue absolute inset-x-0 top-0 h-1/2 bg-ink" />
          </span>
          Листайте
        </div>
        <p data-hero-fade className="max-w-md text-lg leading-relaxed text-ink-2">
          Дизайн, анимации и разработка в одной команде. От идеи до запуска — без посредников.
        </p>
        <div data-hero-fade>
          <Magnetic>
            <a href="#contact" data-goal="cta_hero" className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-ink px-9 py-5 text-sm uppercase tracking-[0.2em] text-paper">
              <span aria-hidden className="absolute inset-0 origin-left scale-x-0 bg-ink-2 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100" />
              <span className="relative">Обсудить проект</span>
              <span aria-hidden className="relative transition-transform duration-500 group-hover:translate-x-1.5">→</span>
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  )
}
