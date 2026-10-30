'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { gsap } from '@/lib/animation'
import { preloadDelay } from '@/components/motion/preloader'
import { sceneInput } from './state'
import { canUse3D, SCENE_READY_EVENT } from './capability'

const Scene = dynamic(() => import('./monogram-scene'), { ssr: false })

/**
 * Одна фиксированная WebGL-сцена, которая живёт в layout и переживает переходы между страницами:
 * контекст создаётся один раз (после первого захода на главную), а не пересоздаётся при каждой навигации.
 * Вне главной сцена скрыта и не рендерится. Только десктоп с WebGL; иначе остаётся плоская графика.
 */
export function GlobalScene() {
  const pathname = usePathname()
  const home = pathname === '/'
  const [enabled, setEnabled] = useState(false)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- проверка возможностей браузера доступна только на клиенте
    if (home && !enabled && canUse3D()) setEnabled(true)
  }, [home, enabled])

  useEffect(() => {
    if (!enabled) return
    // вступление запускается один раз при создании сцены: монограмма появляется после заставки (или паузы)
    sceneInput.startAt = Infinity
    sceneInput.introDelay = sceneInput.preloading ? 0 : preloadDelay()
    const move = (e: PointerEvent) => {
      sceneInput.px = (e.clientX / window.innerWidth) * 2 - 1
      sceneInput.py = (e.clientY / window.innerHeight) * 2 - 1
    }
    const vis = () => setVisible(!document.hidden)
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('visibilitychange', vis)
    return () => {
      window.removeEventListener('pointermove', move)
      document.removeEventListener('visibilitychange', vis)
      gsap.killTweensOf(sceneInput)
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <div aria-hidden className={`pointer-events-none fixed inset-0 z-20 transition-opacity duration-500 ${home ? 'opacity-100' : 'opacity-0'}`}>
      <Scene
        active={visible && home}
        onReady={() => {
          document.documentElement.setAttribute('data-3d', '')
          window.dispatchEvent(new Event(SCENE_READY_EVENT))
        }}
      />
    </div>
  )
}
