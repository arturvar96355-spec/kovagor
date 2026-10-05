/** Состояние, общее для DOM-анимаций (GSAP) и WebGL-сцены — мутабельное, без ререндеров React. */

/** Поза монограммы. x/y — доли половины видимой области (-1..1), s — масштаб, ry/rx — повороты (рад), tone: 0 — чёрная, 1 — слоновая кость. */
export type Pose = { x: number; y: number; s: number; ry: number; rx: number; tone: number }

export const pose: Pose = { x: 0.55, y: 0, s: 1, ry: 0, rx: 0, tone: 0 }

export const sceneInput = {
  px: 0, // курсор -1..1
  py: 0,
  vel: 0, // скорость скролла, px/s (со знаком)
  startAt: Infinity, // секунда (performance.now()/1000) старта вступительной анимации; пока сцена не прогрета — не начинается
  introDelay: 0, // пауза перед вступлением, если заставки нет (сек)
  preloading: false, // идёт заставка: поза монограммы задаётся заставкой, а не прокруткой
}
