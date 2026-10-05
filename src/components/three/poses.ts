import type { Pose } from './state'

/**
 * Куда «переезжает» монограмма на каждой секции главной.
 * Всё в одном месте, чтобы настраивать композицию на глаз. x/y ∈ [-1, 1] от центра экрана.
 */
export const SECTION_ORDER = ['hero', 'manifest', 'services', 'process', 'pricing', 'work', 'faq', 'contact'] as const

const TAU = Math.PI * 2

// ry кратен 2π (± небольшой наклон): монограмма всегда смотрит лицом, а между секциями делает полный оборот
export const POSES: Record<(typeof SECTION_ORDER)[number], Pose> = {
  hero: { x: 0.52, y: 0.02, s: 1, ry: 0, rx: 0, tone: 0 },
  manifest: { x: 0.84, y: -0.78, s: 0.42, ry: TAU + 0.35, rx: 0.08, tone: 0 }, // правый нижний угол: текст по центру свободен
  services: { x: 0.84, y: -0.8, s: 0.4, ry: 2 * TAU - 0.3, rx: -0.08, tone: 0 }, // карточки в верхней части экрана
  process: { x: 0.33, y: 0, s: 0.42, ry: 3 * TAU + 0.35, rx: 0, tone: 0 }, // между текстом шага (слева) и иллюстрацией (справа)
  pricing: { x: 0.84, y: 0.8, s: 0.32, ry: 4 * TAU - 0.3, rx: 0.08, tone: 0 },
  work: { x: 0.84, y: -0.8, s: 0.34, ry: 5 * TAU + 0.3, rx: -0.08, tone: 0 }, // список проектов ограничен по ширине — справа свободно
  faq: { x: 0.84, y: -0.8, s: 0.4, ry: 6 * TAU - 0.3, rx: 0.08, tone: 0 },
  contact: { x: 0.8, y: -0.85, s: 0.4, ry: 7 * TAU, rx: 0, tone: 1 }, // на тёмном фоне «чернеет» в слоновую кость
}
