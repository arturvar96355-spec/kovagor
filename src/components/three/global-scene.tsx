'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { gsap, registerGsap, ScrollTrigger } from '@/lib/animation'
import { preloadDelay } from '@/components/motion/preloader'
import { bindScenePoses } from './bind-poses'
import { sceneInput } from './state'
import { canUse3D, SCENE_READY_EVENT } from './capability'

const Scene = dynamic(() => import('./monogram-scene'), { ssr: false })

/**
 * Одна фиксированная WebGL-сцена на всю главную: объёмная монограмма KVG «путешествует» вдоль страницы,
 * на каждой секции занимая свою позу (poses.ts). Только десктоп с WebGL; иначе остаётся плоская графика.
 */
export function GlobalScene() {
  const [enabled, setEnabled] = useState(false)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- проверка возможностей браузера доступна только на клиенте
    setEnabled(canUse3D())
  }, [])

  useEffect(() => {
    if (!enabled) return
    registerGsap()
    // во время заставки монограмма появляется сразу (на тёмном фоне), иначе — после паузы под заставку
    sceneInput.startAt = performance.now() / 1000 + (sceneInput.preloading ? 0.15 : preloadDelay())
    const cleanup = bindScenePoses()
    const move = (e: PointerEvent) => {
      sceneInput.px = (e.clientX / window.innerWidth) * 2 - 1
      sceneInput.py = (e.clientY / window.innerHeight) * 2 - 1
    }
    const vis = () => setVisible(!document.hidden)
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('visibilitychange', vis)
    ScrollTrigger.refresh()
    return () => {
      cleanup()
      window.removeEventListener('pointermove', move)
      document.removeEventListener('visibilitychange', vis)
      gsap.killTweensOf(sceneInput)
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-20">
      <Scene active={visible} onReady={() => {
        document.documentElement.setAttribute('data-3d', '')
        window.dispatchEvent(new Event(SCENE_READY_EVENT))
      }} />
    </div>
  )
}
