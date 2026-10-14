import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, SRGBColorSpace } from 'three'
import { PALETTE, mix } from '../../theme/palette'
import { Toon } from '../materials/toon'
import { usePulse } from '../usePulse'

const CW = 512
const CH = 300

/** Deterministic RNG so the skyline is identical on every visit. */
function rng(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
}

/**
 * Istanbul at night, painted once: Galata Tower and the hill of houses on
 * the left, a mosque with minarets across the Golden Horn on the right.
 */
function paintSkyline(ctx: CanvasRenderingContext2D) {
  const r = rng(42)
  const sky = ctx.createLinearGradient(0, 0, 0, CH)
  sky.addColorStop(0, PALETTE.bg)
  sky.addColorStop(0.75, mix(PALETTE.bg, PALETTE.teal, 0.35)) // teal haze at the horizon
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, CW, CH)

  for (let i = 0; i < 70; i++) {
    ctx.globalAlpha = 0.3 + r() * 0.6
    ctx.fillStyle = PALETTE.cream
    const s = r() > 0.92 ? 2 : 1
    ctx.fillRect(Math.floor(r() * CW), Math.floor(r() * 170), s, s)
  }
  ctx.globalAlpha = 1

  // moon with a soft halo
  const halo = ctx.createRadialGradient(420, 58, 8, 420, 58, 60)
  halo.addColorStop(0, 'rgba(239,227,200,0.35)')
  halo.addColorStop(1, 'rgba(239,227,200,0)')
  ctx.fillStyle = halo
  ctx.fillRect(340, 0, 160, 130)
  ctx.fillStyle = PALETTE.cream
  ctx.beginPath()
  ctx.arc(420, 58, 15, 0, Math.PI * 2)
  ctx.fill()

  const WATER = 250
  // far shore: the historic peninsula, with a mosque
  ctx.fillStyle = PALETTE.wall
  ctx.fillRect(250, 222, 262, WATER - 222)
  const mx = 390
  ctx.beginPath()
  ctx.arc(mx, 214, 26, Math.PI, 0)
  ctx.fill()
  ctx.fillRect(mx - 34, 212, 68, 12)
  for (const dx of [-38, 38]) {
    ctx.beginPath()
    ctx.arc(mx + dx, 216, 11, Math.PI, 0)
    ctx.fill()
  }
  ctx.fillRect(mx - 1.5, 176, 3, 12) // finial
  for (const dx of [-56, -48, 48, 56]) {
    ctx.fillRect(mx + dx - 2, 150, 4, 74)
    ctx.beginPath()
    ctx.moveTo(mx + dx - 3, 152)
    ctx.lineTo(mx + dx, 132)
    ctx.lineTo(mx + dx + 3, 152)
    ctx.fill()
    ctx.fillRect(mx + dx - 3.5, 176, 7, 2)
  }

  // near shore: Galata hill, houses climbing toward the tower
  const T = 168
  ctx.fillStyle = PALETTE.bg
  for (let x = -4; x < 300; x += 12 + r() * 10) {
    const hill = 236 - Math.max(0, 70 - Math.abs(x - T) * 0.45)
    const h = 14 + r() * 22
    const w = 14 + r() * 12
    ctx.fillRect(x, hill - h, w, CH)
    ctx.beginPath() // pitched roof
    ctx.moveTo(x - 1, hill - h)
    ctx.lineTo(x + w / 2, hill - h - 6)
    ctx.lineTo(x + w + 1, hill - h)
    ctx.fill()
    for (let k = 0; k < 3; k++) {
      if (r() > 0.55) {
        ctx.fillStyle = PALETTE.amber
        ctx.globalAlpha = 0.55 + r() * 0.45
        ctx.fillRect(x + 3 + r() * (w - 6), hill - h + 4 + r() * (h - 6), 2, 3)
        ctx.globalAlpha = 1
        ctx.fillStyle = PALETTE.bg
      }
    }
  }
  // Galata Tower: tapered stone body, lit gallery, conical cap
  ctx.beginPath()
  ctx.moveTo(T - 15, 200)
  ctx.lineTo(T - 12, 104)
  ctx.lineTo(T + 12, 104)
  ctx.lineTo(T + 15, 200)
  ctx.fill()
  ctx.fillRect(T - 16, 96, 32, 9) // gallery
  ctx.beginPath()
  ctx.moveTo(T - 15, 97)
  ctx.lineTo(T, 50)
  ctx.lineTo(T + 15, 97)
  ctx.fill()
  ctx.fillRect(T - 1, 42, 2, 10)
  ctx.fillStyle = PALETTE.amber
  for (let k = -12; k <= 10; k += 5.5) ctx.fillRect(T + k, 99, 2, 4)
  ctx.globalAlpha = 0.7
  ctx.fillRect(T - 2, 140, 3, 5)
  ctx.fillRect(T - 2, 170, 3, 5)
  ctx.globalAlpha = 1

  // Golden Horn with shimmering reflections
  ctx.fillStyle = mix(PALETTE.bg, PALETTE.teal, 0.18)
  ctx.fillRect(0, WATER, CW, CH - WATER)
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = r() > 0.35 ? PALETTE.amber : PALETTE.cream
    ctx.globalAlpha = 0.15 + r() * 0.35
    ctx.fillRect(Math.floor(r() * CW), WATER + 4 + Math.floor(r() * 40), 4 + r() * 10, 1)
  }
  ctx.globalAlpha = 1
}

export const WINDOW = { x0: 1.5, x1: 3.5, y0: 2.1, y1: 3.2 }

/** Window frame + skyline. Click: a shooting star crosses the sky. */
export default function NightWindow({ wallZ }: { wallZ: number }) {
  const { x0, x1, y0, y1 } = WINDOW
  const w = x1 - x0
  const h = y1 - y0
  const bar = 0.09

  const { tex, ctx, base } = useMemo(() => {
    const base = document.createElement('canvas')
    base.width = CW
    base.height = CH
    paintSkyline(base.getContext('2d')!)
    const c = document.createElement('canvas')
    c.width = CW
    c.height = CH
    const ctx = c.getContext('2d')!
    ctx.drawImage(base, 0, 0)
    const tex = new CanvasTexture(c)
    tex.colorSpace = SRGBColorSpace
    return { tex, ctx, base }
  }, [])
  useEffect(() => () => tex.dispose(), [tex])

  const star = useRef<{ t: number; x: number; y: number } | null>(null)
  usePulse('window', () => {
    star.current = { t: 0, x: 120 + Math.random() * 300, y: 10 + Math.random() * 40 }
  })

  useFrame((_, dt) => {
    const s = star.current
    if (!s) return
    s.t += dt
    const k = s.t / 0.9
    ctx.drawImage(base, 0, 0)
    if (k < 1) {
      const hx = s.x - k * 200
      const hy = s.y + k * 90
      const g = ctx.createLinearGradient(hx, hy, hx + 70, hy - 32)
      g.addColorStop(0, `rgba(239,227,200,${1 - k * 0.6})`)
      g.addColorStop(1, 'rgba(239,227,200,0)')
      ctx.strokeStyle = g
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(hx, hy)
      ctx.lineTo(hx + 70, hy - 32)
      ctx.stroke()
      ctx.fillStyle = PALETTE.cream
      ctx.fillRect(hx - 1, hy - 1, 3, 3)
    } else star.current = null
    tex.needsUpdate = true
  })

  return (
    <group position={[(x0 + x1) / 2, (y0 + y1) / 2, wallZ + 0.02]}>
      <mesh position={[0, 0, -0.3]}>
        <planeGeometry args={[w + 0.2, h + 0.2]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      {/* a hint of glass */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial color={PALETTE.cream} transparent opacity={0.04} depthWrite={false} />
      </mesh>
      <mesh position={[0, h / 2 + bar / 2, 0.02]}><boxGeometry args={[w + bar * 2, bar, 0.2]} /><Toon color={PALETTE.trim} /></mesh>
      <mesh position={[0, -h / 2 - bar / 2 - 0.03, 0.06]} castShadow><boxGeometry args={[w + bar * 3, bar * 1.4, 0.3]} /><Toon color={PALETTE.trim} /></mesh>
      <mesh position={[-w / 2 - bar / 2, 0, 0.02]}><boxGeometry args={[bar, h, 0.2]} /><Toon color={PALETTE.trim} /></mesh>
      <mesh position={[w / 2 + bar / 2, 0, 0.02]}><boxGeometry args={[bar, h, 0.2]} /><Toon color={PALETTE.trim} /></mesh>
      <mesh position={[0, 0, 0.02]}><boxGeometry args={[0.06, h, 0.1]} /><Toon color={PALETTE.trim} /></mesh>
      <mesh position={[0, 0, 0.02]}><boxGeometry args={[w, 0.06, 0.1]} /><Toon color={PALETTE.trim} /></mesh>
    </group>
  )
}
