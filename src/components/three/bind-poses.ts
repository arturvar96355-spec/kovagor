import { gsap, ScrollTrigger } from '@/lib/animation'
import { POSES, SECTION_ORDER } from './poses'
import { pose, sceneInput } from './state'

/** Привязывает позу монограммы к прокрутке: между соседними секциями она плавно переезжает (scrub). Возвращает cleanup. */
export function bindScenePoses() {
  Object.assign(pose, POSES.hero)
  const tweens: gsap.core.Tween[] = []

  for (let i = 1; i < SECTION_ORDER.length; i++) {
    const el = document.getElementById(SECTION_ORDER[i])
    if (!el) continue
    tweens.push(
      gsap.fromTo(
        pose,
        { ...POSES[SECTION_ORDER[i - 1]] },
        {
          ...POSES[SECTION_ORDER[i]],
          ease: 'power2.inOut',
          immediateRender: false,
          scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 28%', scrub: 1.2 },
        },
      ),
    )
  }

  const vel = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => (sceneInput.vel = self.getVelocity()),
  })

  return () => {
    vel.kill()
    tweens.forEach((t) => {
      t.scrollTrigger?.kill()
      t.kill()
    })
  }
}
