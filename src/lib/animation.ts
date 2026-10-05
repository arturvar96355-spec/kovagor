import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

let registered = false

/** Один раз регистрирует плагины GSAP (только в браузере). */
export function registerGsap() {
  if (registered || typeof window === 'undefined') return
  gsap.registerPlugin(ScrollTrigger, SplitText)
  registered = true
}

/** Единые easing/длительности — анимации выглядят как одна система. */
export const ease = {
  out: 'expo.out',
  inOut: 'power3.inOut',
  soft: 'power2.out',
} as const

export const dur = { fast: 0.4, base: 0.9, slow: 1.4 } as const

export const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
export const NO_REDUCED_MOTION = '(prefers-reduced-motion: no-preference)'

export { gsap, ScrollTrigger, SplitText }
