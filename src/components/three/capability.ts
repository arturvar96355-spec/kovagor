/** Можно ли показывать WebGL-сцену: десктоп, есть WebGL, нет prefers-reduced-motion. Только в браузере. */
export function canUse3D(): boolean {
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

export const SCENE_READY_EVENT = 'kv-scene-ready'
