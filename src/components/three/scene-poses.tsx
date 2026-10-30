'use client'

import { useEffect } from 'react'
import { registerGsap, ScrollTrigger } from '@/lib/animation'
import { bindScenePoses } from './bind-poses'
import { canUse3D } from './capability'

/** На главной привязывает позы монограммы к секциям; при уходе со страницы отвязывает. Сама сцена живёт в layout (GlobalScene). */
export function ScenePoses() {
  useEffect(() => {
    if (!canUse3D()) return
    registerGsap()
    const cleanup = bindScenePoses()
    ScrollTrigger.refresh()
    return cleanup
  }, [])
  return null
}
