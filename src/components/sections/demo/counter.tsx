'use client'

import { useEffect, useRef } from 'react'
import { animate } from 'motion/react'

/** Число, которое «докручивается» до нового значения. Пишет текст напрямую в DOM, без лишних перерисовок. */
export function Counter({ value, suffix = '', spaced = false }: { value: number; suffix?: string; spaced?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  const prev = useRef(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const show = (v: number) => {
      el.textContent = (spaced ? Math.round(v).toLocaleString('ru-RU') : String(Math.round(v))) + suffix
    }
    const c = animate(prev.current, value, { duration: 0.9, ease: [0.16, 1, 0.3, 1], onUpdate: show })
    prev.current = value
    return () => c.stop()
  }, [value, suffix, spaced])
  return <span ref={ref}>{spaced ? value.toLocaleString('ru-RU') : value}{suffix}</span>
}
