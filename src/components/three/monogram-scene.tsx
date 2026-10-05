'use client'

import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { MONOGRAM_PATHS } from '@/components/brand-paths'
import { pose, sceneInput } from './state'

const WIDTH = 2.5 // ширина монограммы в единицах сцены при s = 1
const INK = new THREE.Color('#1b1b19')
const IVORY = new THREE.Color('#e9e4d8')

/** Экструзия контуров KVG из SVG в объёмную геометрию с фаской. */
function buildGeometry() {
  const loader = new SVGLoader()
  const shapes: THREE.Shape[] = []
  for (const p of MONOGRAM_PATHS) {
    const data = loader.parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${p.d}"/></svg>`)
    for (const path of data.paths) shapes.push(...path.toShapes())
  }
  const geo = new THREE.ExtrudeGeometry(shapes, {
    depth: 70,
    curveSegments: 20,
    bevelEnabled: true,
    bevelThickness: 7,
    bevelSize: 4,
    bevelSegments: 4,
  })
  geo.computeBoundingBox()
  const box = geo.boundingBox!
  const c = box.getCenter(new THREE.Vector3())
  const s = WIDTH / (box.max.x - box.min.x)
  geo.translate(-c.x, -c.y, -c.z)
  geo.scale(s, -s, s) // SVG-ось Y направлена вниз
  // отражение по Y переворачивает порядок обхода — возвращаем, иначе грани «вывернуты»
  for (const name of ['position', 'normal', 'uv'] as const) {
    const a = geo.getAttribute(name)
    if (!a) continue
    const size = a.itemSize
    for (let i = 0; i < a.count; i += 3) {
      for (let k = 0; k < size; k++) {
        const v1 = a.array[(i + 1) * size + k]
        a.array[(i + 1) * size + k] = a.array[(i + 2) * size + k]
        a.array[(i + 2) * size + k] = v1
      }
    }
    a.needsUpdate = true
  }
  return geo
}

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

function Monogram() {
  const group = useRef<THREE.Group>(null)
  const mat = useRef<THREE.MeshPhysicalMaterial>(null)
  const spin = useRef(0) // инерционный довесок вращения от скорости скролла
  const geometry = useMemo(() => buildGeometry(), [])

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const t = state.clock.elapsedTime
    const now = performance.now() / 1000
    const intro = easeOutExpo(clamp((now - sceneInput.startAt) / 2.2, 0, 1))
    const k = 1 - Math.pow(0.001, dt) // коэффициент сглаживания, не зависящий от FPS

    // скролл «раскручивает» монограмму, трение возвращает её обратно
    spin.current += (clamp(sceneInput.vel / 4000, -1.2, 1.2) - spin.current) * (1 - Math.pow(0.02, dt))

    const sway = Math.sin(t * 0.55) * 0.22 // постоянный дрейф: блики скользят по граням
    const targetY = pose.ry + sceneInput.px * 0.4 + sway + (1 - intro) * -1.1 + spin.current * 0.9
    const targetX = pose.rx - sceneInput.py * 0.25 + spin.current * 0.25
    g.rotation.y += (targetY - g.rotation.y) * k
    g.rotation.x += (targetX - g.rotation.x) * k

    // позиция: поза задаёт долю половины видимой области на плоскости z=0
    const v = state.viewport
    const tx = pose.x * (v.width / 2) * 0.92
    const ty = pose.y * (v.height / 2) * 0.92 + Math.sin(t * 0.8) * 0.06
    g.position.x += (tx - g.position.x) * k
    g.position.y += (ty - g.position.y) * k

    // масштаб привязан к высоте экрана, чтобы композиция не «плыла» при ресайзе
    const base = clamp(v.height / 4.01, 0.7, 1.4)
    const sc = pose.s * base * (0.72 + 0.28 * intro)
    g.scale.setScalar(g.scale.x + (sc - g.scale.x) * k)

    if (mat.current) mat.current.color.lerpColors(INK, IVORY, pose.tone)
  })

  return (
    <group ref={group}>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial ref={mat} color="#1b1b19" roughness={0.26} metalness={0.7} clearcoat={1} clearcoatRoughness={0.08} envMapIntensity={1.7} />
      </mesh>
    </group>
  )
}

export default function MonogramScene({ active, onReady }: { active: boolean; onReady: () => void }) {
  const [dpr, setDpr] = useState(1.5)
  return (
    <Canvas
      dpr={dpr}
      style={{ pointerEvents: 'none' }} // иначе канвас на весь экран перехватывает клики по странице
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 7], fov: 32 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={onReady}
    >
      {/* слабое устройство → снижаем разрешение рендера, мощное → поднимаем */}
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(2)} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} />
      <Environment resolution={256}>
        {/* студийный свет без внешних HDRI. Крупный софтбокс спереди-сверху даёт на лицевой грани чёткий переход
            «светлая верхняя часть → тёмная нижняя»: так плоскость читается объёмной даже в покое */}
        <Lightformer form="rect" intensity={2.2} position={[0, 3.6, 8]} scale={[16, 6, 1]} color="#f4f1ea" />
        <Lightformer form="rect" intensity={1.1} position={[0, -4.5, 8]} scale={[16, 2, 1]} color="#cfc7b6" />
        <Lightformer form="rect" intensity={4} position={[0, 5, 3]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={3} position={[-5, 1, 2]} scale={[2, 6, 1]} />
        <Lightformer form="rect" intensity={2.2} position={[5, -1, 3]} scale={[1.5, 6, 1]} color="#ffe9cf" />
        <Lightformer form="ring" intensity={1.5} position={[0, 0, -5]} scale={8} />
      </Environment>
      <Monogram />
    </Canvas>
  )
}
