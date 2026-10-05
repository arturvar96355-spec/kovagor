'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, registerGsap } from '@/lib/animation'

/** Плавный скролл Lenis, синхронизированный с ScrollTrigger. Выключается при prefers-reduced-motion. */
export function SmoothScroll() {
  const pathname = usePathname()
  const ref = useRef<Lenis | null>(null)
  const first = useRef(true)

  // при смене страницы Lenis сбрасываем в нужную точку сразу, без «подъезда» старой позиции
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const l = ref.current
    if (!l) return
    const hash = window.location.hash
    if (hash) l.scrollTo(hash, { immediate: true, force: true })
    else l.scrollTo(0, { immediate: true, force: true })
    l.resize()
    ScrollTrigger.refresh()
  }, [pathname])

  useEffect(() => {
    registerGsap()
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({ anchors: true, duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4) })
    ref.current = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      ref.current = null
    }
  }, [])

  return null
}
