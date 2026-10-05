'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { MONOGRAM_PATHS } from '@/components/brand-paths'
import { heroScene } from './state'

const WIDTH = 2.5 // ширина монограммы в единицах сцены

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
    curveSegments: 28,
    bevelEnabled: true,
    bevelThickness: 7,
    bevelSize: 4,
    bevelSegments: 5,
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

function Monogram() {
  const group = useRef<THREE.Group>(null)
  const geometry = useMemo(() => buildGeometry(), [])

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const now = performance.now() / 1000
    const intro = easeOutExpo(Math.min(Math.max((now - heroScene.startAt) / 2.2, 0), 1))
    const p = heroScene.progress

    // курсор → мягкий наклон с инерцией
    const k = 1 - Math.pow(0.001, dt)
    const sway = Math.sin(state.clock.elapsedTime * 0.55) * 0.22 // постоянный лёгкий дрейф: блики скользят по граням
    const ty = heroScene.px * 0.45 + sway + (1 - intro) * -1.1 + p * Math.PI * 0.9
    const tx = -heroScene.py * 0.28
    g.rotation.y += (ty - g.rotation.y) * k
    g.rotation.x += (tx - g.rotation.x) * k

    const t = state.clock.elapsedTime
    g.position.y = Math.sin(t * 0.8) * 0.06 + p * 1.4
    const sc = (0.72 + 0.28 * intro) * (1 - p * 0.35)
    g.scale.setScalar(sc)
  })

  return (
    <group ref={group}>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial color="#1b1b19" roughness={0.32} metalness={0.55} clearcoat={1} clearcoatRoughness={0.08} envMapIntensity={1.7} />
      </mesh>
    </group>
  )
}

export default function MonogramScene({ active, onReady }: { active: boolean; onReady: () => void }) {
  return (
    <Canvas
      dpr={[1, 2]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 7], fov: 32 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={onReady}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} />
      <Environment resolution={256}>
        {/* студийный свет без внешних HDRI: мягкие боксы-источники */}
        <Lightformer form="rect" intensity={4} position={[0, 5, 3]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={3} position={[-5, 1, 2]} scale={[2, 6, 1]} />
        <Lightformer form="rect" intensity={2.2} position={[5, -1, 3]} scale={[1.5, 6, 1]} color="#ffe9cf" />
        <Lightformer form="ring" intensity={1.5} position={[0, 0, -5]} scale={8} />
        <Lightformer form="rect" intensity={1.4} position={[2, 3, 6]} scale={[7, 3, 1]} color="#f4f1ea" />
        <Lightformer form="rect" intensity={0.9} position={[-3, -3, 5]} scale={[6, 1.2, 1]} />
      </Environment>
      <Monogram />
    </Canvas>
  )
}
