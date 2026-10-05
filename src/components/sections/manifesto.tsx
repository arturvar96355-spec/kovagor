'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, SplitText, registerGsap, NO_REDUCED_MOTION } from '@/lib/animation'

const TEXT =
  'Мы не рисуем «красиво». Мы строим сайт как инструмент: быстрый, понятный, запоминающийся — и с анимацией, которая работает на смысл, а не на эффект ради эффекта.'

export function Manifesto() {
  const root = useRef<HTMLElement>(null)
  const text = useRef<HTMLParagraphElement>(null)

  useGSAP(
    () => {
      registerGsap()
      const mm = gsap.matchMedia()
      mm.add(NO_REDUCED_MOTION, () => {
        let split: SplitText | undefined
        document.fonts.ready.then(() => {
          if (!text.current) return
          split = new SplitText(text.current, { type: 'words', autoSplit: true })
          gsap.set(split.words, { opacity: 0.15 })
          gsap.to(split.words, {
            opacity: 1,
            stagger: 0.1,
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top 70%', end: 'bottom 55%', scrub: true },
          })
        })
        return () => split?.revert()
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="manifest" className="container-x border-t border-line py-[18vh]">
      <p ref={text} className="mx-auto max-w-6xl font-display text-[clamp(1.9rem,4.6vw,4.4rem)] leading-[1.12]">
        {TEXT}
      </p>
    </section>
  )
}
