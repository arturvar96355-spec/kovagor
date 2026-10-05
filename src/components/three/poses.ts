import type { Pose } from './state'

/**
 * Куда «переезжает» монограмма на каждой секции главной.
 * Всё в одном месте, чтобы настраивать композицию на глаз. x/y ∈ [-1, 1] от центра экрана.
 * ry кратен 2π (± небольшой наклон): монограмма всегда смотрит лицом, а между секциями делает полный оборот.
 */
export const SECTION_ORDER = ['hero', 'manifest', 'services', 'principles', 'process', 'inside', 'quiz', 'pricing', 'work', 'faq', 'contact'] as const

const TAU = Math.PI * 2
const turn = (k: number, tilt: number) => k * TAU + tilt

export const POSES: Record<(typeof SECTION_ORDER)[number], Pose> = {
  hero: { x: 0.52, y: 0.02, s: 1, ry: 0, rx: 0, tone: 0 },
  manifest: { x: 0.84, y: -0.78, s: 0.42, ry: turn(1, 0.35), rx: 0.08, tone: 0 }, // правый нижний угол: текст по центру свободен
  services: { x: 0.84, y: -0.8, s: 0.4, ry: turn(2, -0.3), rx: -0.08, tone: 0 }, // карточки в верхней части экрана
  principles: { x: 0.84, y: -0.78, s: 0.4, ry: turn(3, 0.3), rx: 0.06, tone: 1 }, // тёмная секция: слоновая кость, правый нижний угол
  process: { x: 0.33, y: 0, s: 0.42, ry: turn(4, -0.35), rx: 0, tone: 0 }, // между текстом шага (слева) и иллюстрацией (справа)
  inside: { x: 0.84, y: 0.42, s: 0.28, ry: turn(5, 0.3), rx: 0.06, tone: 0 }, // справа от заголовка, над едущими карточками
  quiz: { x: 0.8, y: -0.25, s: 0.38, ry: turn(6, -0.3), rx: -0.05, tone: 0 }, // справа от карточки подбора
  pricing: { x: 0.84, y: 0.8, s: 0.32, ry: turn(7, 0.3), rx: 0.08, tone: 0 },
  work: { x: 0.84, y: -0.8, s: 0.34, ry: turn(8, -0.3), rx: -0.08, tone: 0 }, // список проектов ограничен по ширине — справа свободно
  faq: { x: 0.84, y: -0.8, s: 0.4, ry: turn(9, 0.3), rx: 0.08, tone: 0 },
  contact: { x: 0.8, y: -0.85, s: 0.4, ry: turn(10, 0), rx: 0, tone: 1 }, // на тёмном фоне «чернеет» в слоновую кость
}
