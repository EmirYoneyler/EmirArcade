import { useLayoutEffect, useMemo, useRef } from 'react'
import { Color, InstancedMesh, Object3D } from 'three'
import { RoundedBox } from '@react-three/drei'
import { PALETTE } from '../theme/palette'
import { ROOM } from '../config/camera'
import { Toon, Glow } from './materials/toon'

const { w: W, d: D, h: H, wallT: T } = ROOM

/** Window opening on the back wall (x range, y range). */
export const WINDOW = { x0: 1.5, x1: 3.5, y0: 2.1, y1: 3.2 }

/** Seeded RNG so the floor is "random" but identical every load. */
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
}

/** Planked floor as ONE instanced mesh (1 draw call). */
function Floor() {
  const ref = useRef<InstancedMesh>(null)
  const planks = useMemo(() => {
    const r = rng(7)
    const rows = 12
    const rowW = D / rows
    const out: { x: number; z: number; len: number; dark: boolean }[] = []
    for (let i = 0; i < rows; i++) {
      let x = -W / 2
      while (x < W / 2 - 0.01) {
        const len = Math.min(1.4 + r() * 1.8, W / 2 - x)
        out.push({ x: x + len / 2, z: -D / 2 + rowW * (i + 0.5), len: len - 0.03, dark: r() > 0.5 })
        x += len
      }
    }
    return { out, rowW }
  }, [])

  useLayoutEffect(() => {
    const m = ref.current!
    const o = new Object3D()
    const c = new Color()
    planks.out.forEach((p, i) => {
      o.position.set(p.x, 0, p.z)
      o.scale.set(p.len, 0.12, planks.rowW - 0.03)
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
      m.setColorAt(i, c.set(p.dark ? PALETTE.woodDark : PALETTE.woodLight))
    })
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [planks])

  return (
    <>
      <instancedMesh ref={ref} args={[undefined, undefined, planks.out.length]} receiveShadow position={[0, -0.06, 0]}>
        <boxGeometry />
        <meshToonMaterial />
      </instancedMesh>
      {/* base slab so the diorama has visible thickness */}
      <mesh position={[0, -0.4, 0]}>
        <boxGeometry args={[W + 0.4, 0.6, D + 0.4]} />
        <Toon color={PALETTE.bg} />
      </mesh>
    </>
  )
}

/** Axis-aligned box from min/max corners — used to frame the window hole. */
function Slab({ x0, x1, y0, y1, z, t = T, color = PALETTE.wall }: { x0: number; x1: number; y0: number; y1: number; z: number; t?: number; color?: string }) {
  return (
    <mesh position={[(x0 + x1) / 2, (y0 + y1) / 2, z]} receiveShadow castShadow>
      <boxGeometry args={[x1 - x0, y1 - y0, t]} />
      <Toon color={color} />
    </mesh>
  )
}

function BackWall() {
  const z = -D / 2 - T / 2
  const L = -W / 2 - T
  const R = W / 2
  const { x0, x1, y0, y1 } = WINDOW
  return (
    <group>
      <Slab x0={L} x1={x0} y0={0} y1={H} z={z} />
      <Slab x0={x1} x1={R} y0={0} y1={H} z={z} />
      <Slab x0={x0} x1={x1} y0={0} y1={y0} z={z} />
      <Slab x0={x0} x1={x1} y0={y1} y1={H} z={z} />
      {/* baseboard + picture rail, in two pieces around nothing (window is above) */}
      <mesh position={[0, 0.14, -D / 2 + 0.04]} receiveShadow>
        <boxGeometry args={[W, 0.28, 0.08]} />
        <Toon color={PALETTE.trim} />
      </mesh>
      <mesh position={[0, H - 0.1, -D / 2 + 0.03]}>
        <boxGeometry args={[W, 0.1, 0.06]} />
        <Toon color={PALETTE.trim} />
      </mesh>
    </group>
  )
}

function LeftWall() {
  const x = -W / 2 - T / 2
  return (
    <group>
      <mesh position={[x, H / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[T, H, D]} />
        <Toon color={PALETTE.wall} />
      </mesh>
      <mesh position={[-W / 2 + 0.04, 0.14, 0]} receiveShadow>
        <boxGeometry args={[0.08, 0.28, D]} />
        <Toon color={PALETTE.trim} />
      </mesh>
      <mesh position={[-W / 2 + 0.03, H - 0.1, 0]}>
        <boxGeometry args={[0.06, 0.1, D]} />
        <Toon color={PALETTE.trim} />
      </mesh>
    </group>
  )
}

/** Chunky window frame + night backdrop. Skyline arrives in Phase 4. */
function WindowFrame() {
  const { x0, x1, y0, y1 } = WINDOW
  const cx = (x0 + x1) / 2
  const cy = (y0 + y1) / 2
  const w = x1 - x0
  const h = y1 - y0
  const z = -D / 2 + 0.02
  const bar = 0.09
  return (
    <group position={[cx, cy, z]}>
      {/* night backdrop sits behind the wall plane */}
      <mesh position={[0, 0, -0.5]}>
        <planeGeometry args={[w + 0.2, h + 0.2]} />
        <meshBasicMaterial color={PALETTE.bg} />
      </mesh>
      <mesh position={[0, h / 2 + bar / 2, 0.02]}><boxGeometry args={[w + bar * 2, bar, 0.2]} /><Toon color={PALETTE.trim} /></mesh>
      <mesh position={[0, -h / 2 - bar / 2 - 0.03, 0.06]}><boxGeometry args={[w + bar * 3, bar * 1.4, 0.3]} /><Toon color={PALETTE.trim} /></mesh>
      <mesh position={[-w / 2 - bar / 2, 0, 0.02]}><boxGeometry args={[bar, h, 0.2]} /><Toon color={PALETTE.trim} /></mesh>
      <mesh position={[w / 2 + bar / 2, 0, 0.02]}><boxGeometry args={[bar, h, 0.2]} /><Toon color={PALETTE.trim} /></mesh>
      <mesh position={[0, 0, 0.02]}><boxGeometry args={[0.06, h, 0.1]} /><Toon color={PALETTE.trim} /></mesh>
      <mesh position={[0, 0, 0.02]}><boxGeometry args={[w, 0.06, 0.1]} /><Toon color={PALETTE.trim} /></mesh>
    </group>
  )
}

/** A round rug to anchor the room. */
function Rug() {
  return (
    <group position={[0.1, 0.012, 1.1]} rotation={[0, 0.0, 0]}>
      <mesh receiveShadow>
        <cylinderGeometry args={[1.5, 1.5, 0.02, 40]} />
        <Toon color={PALETTE.rust} />
      </mesh>
      <mesh position={[0, 0.012, 0]}>
        <cylinderGeometry args={[1.15, 1.15, 0.02, 40]} />
        <Toon color={PALETTE.mustard} />
      </mesh>
      <mesh position={[0, 0.024, 0]}>
        <cylinderGeometry args={[0.75, 0.75, 0.02, 40]} />
        <Toon color={PALETTE.teal} />
      </mesh>
    </group>
  )
}

export default function Room() {
  return (
    <group>
      <Floor />
      <BackWall />
      <LeftWall />
      <WindowFrame />
      <Rug />
    </group>
  )
}

/**
 * TEMPORARY blockout so we can judge scale, composition and light in Phase 1.
 * Replaced by real cabinet/prop components from Phase 2 onward.
 */
export function Blockout() {
  const z = -D / 2 + 0.55
  const cab = (x: number, color: string, wd: number, h: number, key: string) => (
    <group key={key} position={[x, 0, z]}>
      <RoundedBox args={[wd, h, 1.0]} radius={0.06} smoothness={3} position={[0, h / 2, 0]} castShadow receiveShadow>
        <Toon color={color} />
      </RoundedBox>
      <mesh position={[0, h * 0.68, 0.51]}>
        <planeGeometry args={[wd * 0.66, h * 0.3]} />
        <Glow color={PALETTE.amber} strength={1.3} />
      </mesh>
    </group>
  )
  return (
    <group>
      {cab(0, PALETTE.rust, 1.35, 2.3, 'main')}
      {cab(-1.9, PALETTE.mustard, 1.1, 2.1, 'left')}
      {cab(1.9 - 0.2, PALETTE.teal, 1.1, 2.1, 'right')}
    </group>
  )
}
