import { PALETTE } from '../../theme/palette'
import { drawByte, BYTE_W } from './byte'
import { useApp } from '../../store/useApp'

/** Everything on a CRT is amber phosphor on black. */
export const INK = PALETTE.amber
export const DIM = 'rgba(255,176,0,0.35)'
export const FAINT = 'rgba(255,176,0,0.14)'
export const BLACK = '#000'

export type CrtInput = {
  /** seconds since the program started */
  t: number
  /** cursor direction relative to this screen, roughly -1..1 */
  look: { x: number; y: number }
}

export type Program = (ctx: CanvasRenderingContext2D, w: number, h: number, input: CrtInput) => void

export const PIXEL_FONT = 'Silkscreen'
if (typeof document !== 'undefined') {
  document.fonts?.load(`16px ${PIXEL_FONT}`)
  document.fonts?.load(`bold 16px ${PIXEL_FONT}`)
}

export function text(
  ctx: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  size = 8,
  align: CanvasTextAlign = 'center',
  color: string = INK,
  bold = false,
) {
  ctx.font = `${bold ? 'bold ' : ''}${size}px ${PIXEL_FONT}, monospace`
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  ctx.fillStyle = color
  ctx.fillText(s, Math.round(x), Math.round(y))
}

/** Deterministic star field so every visit looks the same. */
const STARS = Array.from({ length: 46 }, (_, i) => ({
  x: (i * 97.3) % 320,
  y: 18 + ((i * 53.7) % 150),
  v: 6 + (i % 4) * 5,
  big: i % 7 === 0,
}))

function stars(ctx: CanvasRenderingContext2D, w: number, t: number) {
  for (const s of STARS) {
    const x = (((s.x - t * s.v) % w) + w) % w
    ctx.fillStyle = s.big ? DIM : FAINT
    ctx.fillRect(Math.floor(x), s.y, s.big ? 2 : 1, s.big ? 2 : 1)
  }
}

const blinkAt = (t: number) => t % 4.2 < 0.13 || (t % 11 > 5 && t % 11 < 5.12)

/** EMIR-1 idle loop: title, star field, BYTE patrolling, PRESS START. */
export const attract: Program = (ctx, w, h, { t, look }) => {
  ctx.fillStyle = BLACK
  ctx.fillRect(0, 0, w, h)
  stars(ctx, w, t)

  text(ctx, 'HI-SCORE', 70, 12, 8, 'center', DIM)
  text(ctx, '990000', 70, 22, 8)
  text(ctx, '1UP', 250, 12, 8, 'center', DIM)
  text(ctx, '000000', 250, 22, 8)

  text(ctx, 'EMIR-1', w / 2 + 2, 64, 32, 'center', DIM, true) // drop shadow
  text(ctx, 'EMIR-1', w / 2, 62, 32, 'center', INK, true)
  text(ctx, 'SOFTWARE ENGINEER', w / 2, 90, 8, 'center', DIM)

  // ground
  ctx.fillStyle = FAINT
  for (let x = 0; x < w; x += 6) ctx.fillRect(x, 186, 3, 1)

  // BYTE paces back and forth, pausing in the middle to look at you
  const cycle = t % 14
  const walk = cycle < 5 ? cycle / 5 : cycle < 9 ? 1 : 1 - (cycle - 9) / 5
  const moving = cycle < 5 || cycle >= 9
  const s = 4
  const x = 40 + walk * (w - 80 - BYTE_W * s)
  const hop = cycle > 6 && cycle < 6.5 ? Math.sin(((cycle - 6) / 0.5) * Math.PI) * 14 : 0
  const bob = moving ? (Math.floor(t * 6) % 2) : 0
  drawByte(ctx, {
    x: Math.round(x),
    y: Math.round(130 - hop - bob),
    s,
    look,
    blink: blinkAt(t),
    step: moving ? ((Math.floor(t * 6) % 2) as 0 | 1) : 0,
    antenna: Math.floor(t * 2) % 3 !== 0,
    ink: INK,
    paper: BLACK,
  })

  if (useApp.getState().cheat) {
    ctx.fillStyle = INK
    ctx.fillRect(0, 100, w, 14)
    text(ctx, 'CHEAT ON  ·  +30 LIVES', w / 2, 107, 8, 'center', BLACK)
  }
  if (t % 1 < 0.62) text(ctx, 'PRESS START', w / 2, 212, 16)
  text(ctx, 'CREDIT 00', w - 8, h - 8, 8, 'right', DIM)
  text(ctx, '© EMIR', 8, h - 8, 8, 'left', DIM)
}

/** Side cabinet A: a two-paddle rally demo. */
export const rally: Program = (ctx, w, h, { t }) => {
  ctx.fillStyle = BLACK
  ctx.fillRect(0, 0, w, h)
  for (let y = 4; y < h; y += 10) {
    ctx.fillStyle = FAINT
    ctx.fillRect(w / 2 - 1, y, 2, 5)
  }
  const period = 2.4
  const p = (t % period) / period
  const dir = Math.floor(t / period) % 2
  const bx = 14 + (dir ? 1 - p : p) * (w - 28)
  const by = h / 2 + Math.sin(t * 1.7) * (h / 2 - 16)
  ctx.fillStyle = INK
  ctx.fillRect(bx - 2, by - 2, 4, 4)
  const lag = (k: number) => h / 2 + Math.sin((t - k) * 1.7) * (h / 2 - 22)
  ctx.fillRect(6, lag(0.12) - 12, 4, 24)
  ctx.fillRect(w - 10, lag(0.2) - 12, 4, 24)
  text(ctx, String(Math.floor(t / 4.8) % 10), w / 2 - 20, 14, 16, 'center', DIM)
  text(ctx, String(Math.floor(t / 7.1) % 10), w / 2 + 20, 14, 16, 'center', DIM)
}

/** Side cabinet B: a little marching-formation demo. */
export const patrol: Program = (ctx, w, h, { t }) => {
  ctx.fillStyle = BLACK
  ctx.fillRect(0, 0, w, h)
  const shift = Math.sin(t * 0.8) * 18
  const frame = Math.floor(t * 2) % 2
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 7; c++) {
      const x = 26 + c * 16 + shift
      const y = 22 + r * 14 + ((t * 2) % 40) * 0.2
      ctx.fillStyle = r === 0 ? INK : DIM
      ctx.fillRect(x, y, 8, 5)
      ctx.fillRect(x + (frame ? -1 : 1), y + 5, 2, 2)
      ctx.fillRect(x + (frame ? 7 : 5), y + 5, 2, 2)
    }
  const sx = w / 2 + Math.sin(t * 1.3) * 50
  ctx.fillStyle = INK
  ctx.fillRect(sx - 6, h - 16, 12, 4)
  ctx.fillRect(sx - 1, h - 20, 2, 4)
  const shot = (t * 90) % (h - 20)
  ctx.fillRect(sx - 0.5, h - 22 - shot, 1, 4)
}

