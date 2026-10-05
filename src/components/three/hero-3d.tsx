'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { heroScene } from './state'

const Scene = dynamic(() => import('./monogram-scene'), { ssr: false })

function canUse3D() {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  if (!window.matchMedia('(min-width: 900px)').matches) return false
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/** Объёмная монограмма KVG. Рендерится только на десктопе с WebGL; пока видна в hero. */
export function Hero3D({ onReady }: { onReady?: () => void }) {
  const [enabled, setEnabled] = useState(false)
  const [visible, setVisible] = useState(true)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- проверка возможностей браузера доступна только на клиенте
    setEnabled(canUse3D())
  }, [])

  useEffect(() => {
    if (!enabled || !box.current) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 })
    io.observe(box.current)
    const move = (e: PointerEvent) => {
      heroScene.px = (e.clientX / window.innerWidth) * 2 - 1
      heroScene.py = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('pointermove', move)
    }
  }, [enabled])

  return (
    <div ref={box} aria-hidden className="absolute inset-0">
      {enabled && <Scene active={visible} onReady={() => onReady?.()} />}
    </div>
  )
}
