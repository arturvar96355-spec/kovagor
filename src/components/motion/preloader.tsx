'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ease, registerGsap, WIPE_EVENT } from '@/lib/animation'
import { Monogram } from '@/components/brand'
import { canUse3D, SCENE_READY_EVENT } from '@/components/three/capability'
import { POSES } from '@/components/three/poses'
import { pose, sceneInput, type Pose } from '@/components/three/state'

export const PRELOAD_KEY = 'kv-preloaded'
/** Через сколько секунд после старта заставка «разъезжается» и монограмма летит на своё место в hero. */
const WIPE_AT = 1.5
/** Поза монограммы на заставке: по центру, крупно, цвета слоновой кости на тёмном фоне. */
const PRELOAD_POSE: Pose = { x: 0, y: 0, s: 1.2, ry: 0, rx: 0, tone: 1 }

/** Сколько секунд сцены главной ждут окончания заставки (0, если она уже показывалась). */
export function preloadDelay(): number {
  try {
    return sessionStorage.getItem(PRELOAD_KEY) === '1' ? 0 : WIPE_AT
  } catch {
    return 0
  }
}

/**
 * Заставка: раз за сессию, пропускается при reduced-motion.
 * На главной с WebGL в ней участвует сама 3D-монограмма: она появляется на тёмном фоне, затем фон уезжает вверх,
 * а монограмма перелетает в hero и «чернеет» — без разрыва между заставкой и сайтом.
 * Иначе (мобильные, нет WebGL, внутренние страницы) — плоская версия.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      registerGsap()
      const el = root.current!
      const html = document.documentElement
      const hide = () => gsap.set(el, { display: 'none' })
      let seen = false
      try { seen = sessionStorage.getItem(PRELOAD_KEY) === '1' } catch {}
      if (seen || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return hide()

      const use3d = location.pathname === '/' && canUse3D()
      html.style.overflow = 'hidden' // не скроллим под заставкой
      html.setAttribute('data-preloading', '')

      const announceWipe = () => {
        window.dispatchEvent(new Event(WIPE_EVENT)) // hero начинает вступление
        html.removeAttribute('data-preloading')
      }
      const finish = () => {
        hide()
        html.style.overflow = ''
        html.removeAttribute('data-preloading')
        sceneInput.preloading = false
        try { sessionStorage.setItem(PRELOAD_KEY, '1') } catch {}
      }

      if (!use3d) {
        gsap
          .timeline({ onComplete: finish })
          .from('[data-pre-mono] path', { yPercent: 40, opacity: 0, duration: 1, ease: ease.out, stagger: 0.12 })
          .to('[data-pre-mono]', { opacity: 0, duration: 0.3 }, '+=0.2')
          .call(announceWipe)
          .to(el, { yPercent: -100, duration: 0.9, ease: ease.inOut })
        return
      }

      // --- режим 3D: фон заставки лежит под WebGL-канвасом, монограмму рисует сцена ---
      void import('@/components/three/monogram-scene') // тяжёлый чанк начинает грузиться сразу, а не после гидратации сцены
      sceneInput.preloading = true
      Object.assign(pose, PRELOAD_POSE)
      gsap.set(el, { zIndex: 15 })
      gsap.set('[data-pre-mono]', { display: 'none' })

      let started = false
      const wipe = () => {
        if (started) return
        started = true
        const tl = gsap.timeline({ onComplete: finish })
        tl.call(announceWipe)
          .to(el, { yPercent: -100, duration: 1.1, ease: ease.inOut }, 0)
          .to(pose, { ...POSES.hero, duration: 1.7, ease: 'expo.inOut' }, 0)
      }
      // ждём, пока сцена готова (но не дольше 4 с), и выдерживаем минимальную паузу, чтобы монограмму успели увидеть
      const t0 = performance.now()
      const go = () => gsap.delayedCall(Math.max(0, WIPE_AT - (performance.now() - t0) / 1000), wipe)
      window.addEventListener(SCENE_READY_EVENT, go, { once: true })
      const failsafe = gsap.delayedCall(4, wipe)
      return () => {
        window.removeEventListener(SCENE_READY_EVENT, go)
        failsafe.kill()
      }
    },
    { scope: root },
  )

  return (
    <div ref={root} aria-hidden className="fixed inset-0 z-[100] grid place-items-center bg-ink text-paper">
      <div data-pre-mono className="w-40 md:w-56">
        <Monogram className="w-full" />
      </div>
    </div>
  )
}
