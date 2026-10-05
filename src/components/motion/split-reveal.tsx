'use client'

import { useRef, type ElementType, type ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger, SplitText, ease, dur, registerGsap, afterPreload, NO_REDUCED_MOTION } from '@/lib/animation'

type Props = {
  as?: ElementType
  className?: string
  children: ReactNode
  delay?: number
  /** 'lines' — строки выезжают из-под маски; 'words' — слова. */
  by?: 'lines' | 'words'
  /** true — анимация стартует сразу (после заставки), без ожидания скролла. Для заголовка hero. */
  immediate?: boolean
}

/** Заголовок: строки/слова выезжают из-под маски при появлении. Без JS и при reduced-motion текст просто виден. */
export function SplitReveal({ as = 'div', className, children, delay = 0, by = 'lines', immediate = false }: Props) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      registerGsap()
      const el = ref.current
      if (!el) return
      const mm = gsap.matchMedia()
      mm.add(NO_REDUCED_MOTION, () => {
        let split: SplitText | undefined
        document.fonts.ready.then(() => {
          if (!ref.current) return
          split = new SplitText(ref.current, {
            type: by,
            mask: by,
            autoSplit: true,
            onSplit: (self) => {
              gsap.set(self[by], { yPercent: 110 })
              const play = (trigger?: ScrollTrigger.Vars) =>
                gsap.to(self[by], { yPercent: 0, duration: dur.base, ease: ease.out, stagger: 0.09, delay, scrollTrigger: trigger })
              // hero: сразу, но после заставки; остальные заголовки — когда доскроллили до них
              if (immediate) afterPreload(() => play())
              else play({ trigger: ref.current, start: 'top 88%', once: true })
            },
          })
        })
        return () => split?.revert()
      })
    },
    { scope: ref },
  )

  const Tag = as as 'div' // полиморфный тег; ref всегда HTMLElement
  return (
    <Tag ref={ref as React.RefObject<HTMLDivElement>} className={className}>
      {children}
    </Tag>
  )
}
