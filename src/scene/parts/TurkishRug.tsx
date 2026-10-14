import { NearestFilter } from 'three'
import { PALETTE, mix } from '../../theme/palette'
import { useCanvasTexture } from '../materials/canvasTexture'

/** Rug size in metres (without the fringe). */
const RW = 3.2
const RH = 2.1
const FRINGE = 0.12

/** Canvas pixels: one "knot" = 8px, so motifs stay stepped like a hand-knotted rug. */
const K = 8
const PX_PER_M = 360
const CW = Math.round((RW + FRINGE * 2) * PX_PER_M)
const CH = Math.round(RH * PX_PER_M)
const FX = Math.round(FRINGE * PX_PER_M) // fringe width in px

const RED = mix(PALETTE.rust, PALETTE.bg, 0.16) // madder red, a shade deeper than the rust paint
const DEEP_RED = mix(PALETTE.rust, PALETTE.bg, 0.36)
const NAVY = PALETTE.bg // the dark ground of borders and medallion
const BLUE = PALETTE.teal
const GOLD = PALETTE.mustard
const IVORY = PALETTE.cream

const snap = (v: number) => Math.round(v / K) * K

/** Stepped diamond (the basic göl / medallion shape). */
function diamond(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, color: string) {
  ctx.fillStyle = color
  for (let y = -ry; y < ry; y += K) {
    const w = snap(rx * (1 - Math.abs(y + K / 2) / ry))
    if (w > 0) ctx.fillRect(snap(cx - w), snap(cy + y), w * 2, K)
  }
}

/** Little eight-pointed star scattered across the field. */
function star(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string) {
  ctx.fillStyle = color
  ctx.fillRect(cx - K, cy - 3 * K, 2 * K, 6 * K)
  ctx.fillRect(cx - 3 * K, cy - K, 6 * K, 2 * K)
  ctx.fillRect(cx - 2 * K, cy - 2 * K, 4 * K, 4 * K)
}

/** Hooks ("koç boynuzu") sprouting from a medallion's outline. */
function hooks(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, color: string) {
  ctx.fillStyle = color
  for (const s of [-1, 1]) {
    for (let i = 1; i < 4; i++) {
      const y = cy + s * snap((ry * i) / 4)
      const x = rx * (1 - i / 4)
      ctx.fillRect(snap(cx - x) - 2 * K, y, K, K)
      ctx.fillRect(snap(cx - x) - 2 * K, y - s * K, K, K)
      ctx.fillRect(snap(cx + x) + K, y, K, K)
      ctx.fillRect(snap(cx + x) + K, y - s * K, K, K)
    }
  }
}

function paintRug(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, CW, CH)
  const x0 = FX
  const x1 = CW - FX
  const w = x1 - x0

  // fringe: ivory warp threads at both short ends
  ctx.fillStyle = IVORY
  for (let y = K; y < CH - K; y += K * 1.5) {
    ctx.fillRect(4, Math.round(y), FX - 4, 3)
    ctx.fillRect(x1, Math.round(y), FX - 4, 3)
  }

  // field with "abrash" — slightly uneven red bands, like real wool dye lots
  for (let x = x0; x < x1; x += K * 6) {
    ctx.fillStyle = Math.sin(x * 0.013) > 0.6 ? DEEP_RED : RED
    ctx.fillRect(x, 0, K * 6, CH)
  }

  // borders: outer guard, main band with repeating diamonds, inner guard
  const B = K * 11
  const band = (inset: number, size: number, color: string) => {
    ctx.fillStyle = color
    ctx.fillRect(x0 + inset, inset, w - inset * 2, size)
    ctx.fillRect(x0 + inset, CH - inset - size, w - inset * 2, size)
    ctx.fillRect(x0 + inset, inset, size, CH - inset * 2)
    ctx.fillRect(x1 - inset - size, inset, size, CH - inset * 2)
  }
  band(0, K * 2, DEEP_RED)
  band(K * 2, B, NAVY)
  band(K * 2 + B, K * 2, IVORY)
  band(K * 4 + B, K, GOLD)
  const mid = K * 2 + B / 2
  for (let x = x0 + mid; x < x1 - mid + 1; x += K * 9) {
    diamond(ctx, x, mid, K * 4, K * 4, x % (K * 18) < K * 9 ? GOLD : RED)
    diamond(ctx, x, CH - mid, K * 4, K * 4, x % (K * 18) < K * 9 ? GOLD : RED)
    diamond(ctx, x, mid, K * 1.5, K * 1.5, IVORY)
    diamond(ctx, x, CH - mid, K * 1.5, K * 1.5, IVORY)
  }
  for (let y = mid + K * 9; y < CH - mid - K * 4; y += K * 9) {
    diamond(ctx, x0 + mid, y, K * 4, K * 4, BLUE)
    diamond(ctx, x1 - mid, y, K * 4, K * 4, BLUE)
    diamond(ctx, x0 + mid, y, K * 1.5, K * 1.5, IVORY)
    diamond(ctx, x1 - mid, y, K * 1.5, K * 1.5, IVORY)
  }

  // corner spandrels: quarter medallions tucked into the field corners
  const fx0 = x0 + K * 5 + B
  const fx1 = x1 - K * 5 - B
  const fy0 = K * 5 + B
  const fy1 = CH - K * 5 - B
  ctx.save()
  ctx.beginPath()
  ctx.rect(fx0, fy0, fx1 - fx0, fy1 - fy0)
  ctx.clip()
  for (const [cx, cy] of [[fx0, fy0], [fx1, fy0], [fx0, fy1], [fx1, fy1]]) {
    diamond(ctx, cx, cy, K * 22, K * 16, NAVY)
    diamond(ctx, cx, cy, K * 16, K * 11, BLUE)
    diamond(ctx, cx, cy, K * 8, K * 6, GOLD)
  }
  ctx.restore()

  // central medallion (göbek) with pendants top and bottom
  const cx = snap(CW / 2)
  const cy = snap(CH / 2)
  diamond(ctx, cx, cy - K * 25, K * 6, K * 6, NAVY) // pendants
  diamond(ctx, cx, cy + K * 25, K * 6, K * 6, NAVY)
  diamond(ctx, cx, cy - K * 25, K * 3, K * 3, GOLD)
  diamond(ctx, cx, cy + K * 25, K * 3, K * 3, GOLD)
  diamond(ctx, cx, cy, K * 30, K * 21, IVORY)
  diamond(ctx, cx, cy, K * 28, K * 19, NAVY)
  hooks(ctx, cx, cy, K * 28, K * 19, IVORY)
  diamond(ctx, cx, cy, K * 20, K * 13, RED)
  diamond(ctx, cx, cy, K * 12, K * 8, BLUE)
  diamond(ctx, cx, cy, K * 7, K * 5, GOLD)
  star(ctx, cx, cy, IVORY)
  for (const s of [-1, 1]) star(ctx, cx + s * K * 15, cy, GOLD)

  // scattered stars in the open field
  const spots: [number, number][] = [
    [0.27, 0.38], [0.27, 0.62], [0.73, 0.38], [0.73, 0.62],
    [0.36, 0.25], [0.64, 0.25], [0.36, 0.75], [0.64, 0.75],
  ]
  spots.forEach(([u, v], i) => star(ctx, snap(x0 + u * w), snap(v * CH), i % 2 ? IVORY : GOLD))
}

/** A red Turkish rug (göbekli halı) with a medallion, borders and fringe. */
export default function TurkishRug(props: JSX.IntrinsicElements['group']) {
  const tex = useCanvasTexture(CW, CH, (ctx) => paintRug(ctx))
  tex.magFilter = NearestFilter
  return (
    <group {...props}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[RW + FRINGE * 2, RH]} />
        <meshToonMaterial map={tex} transparent alphaTest={0.5} />
      </mesh>
    </group>
  )
}
