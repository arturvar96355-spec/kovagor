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

/** Событие «заставка начала уезжать — можно показывать содержимое». */
export const WIPE_EVENT = 'kv-wipe'

/** Выполнить cb, когда заставка уходит (сразу, если заставки нет). Используется для вступительных анимаций hero. */
export function afterPreload(cb: () => void) {
  if (typeof document === 'undefined') return
  if (!document.documentElement.hasAttribute('data-preloading')) return cb()
  window.addEventListener(WIPE_EVENT, cb, { once: true })
}

export { gsap, ScrollTrigger, SplitText }
