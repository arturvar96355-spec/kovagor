'use client'

import { useRef, type ElementType, type ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, SplitText, ease, dur, registerGsap, NO_REDUCED_MOTION } from '@/lib/animation'

type Props = {
  as?: ElementType
  className?: string
  children: ReactNode
  delay?: number
  /** 'lines' — строки выезжают из-под маски; 'words' — слова. */
  by?: 'lines' | 'words'
}

/** Заголовок: строки/слова выезжают из-под маски при появлении. Без JS и при reduced-motion текст просто виден. */
export function SplitReveal({ as: Tag = 'div', className, children, delay = 0, by = 'lines' }: Props) {
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
            onSplit: (self) =>
              gsap.from(self[by], {
                yPercent: 110,
                duration: dur.base,
                ease: ease.out,
                stagger: 0.09,
                delay,
              }),
          })
        })
        return () => split?.revert()
      })
    },
    { scope: ref },
  )

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}
