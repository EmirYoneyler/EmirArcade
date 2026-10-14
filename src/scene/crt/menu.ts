import { projects } from '../../data/content'
import { useApp } from '../../store/useApp'
import { drawByte, BYTE_W } from './byte'
import { BLACK, DIM, FAINT, INK, text, type Program } from './programs'

/** Menu layout in logical CRT pixels (320×240). Shared by drawing + hit testing. */
const ROW_Y0 = 58
const ROW_H = 24
const ROW_X0 = 14
const ROW_X1 = 306

/** Which menu row is at logical (x, y), or -1. */
export function menuRowAt(x: number, y: number) {
  if (x < ROW_X0 || x > ROW_X1) return -1
  const i = Math.floor((y - ROW_Y0 + ROW_H / 2) / ROW_H)
  return i >= 0 && i < projects.length ? i : -1
}

const STATUS_TAG = { LIVE: 'LIVE', 'IN DEV': 'DEV', DONE: 'DONE' } as const

/** Word-wrap for the pixel font. */
export function wrap(ctx: CanvasRenderingContext2D, s: string, max: number, size = 8) {
  ctx.font = `${size}px Silkscreen, monospace`
  const out: string[] = []
  let line = ''
  for (const word of s.split(' ')) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > max && line) {
      out.push(line)
      line = word
    } else line = next
  }
  if (line) out.push(line)
  return out
}

/** Pixel triangle, pointing up/down/right. */
function tri(ctx: CanvasRenderingContext2D, x: number, y: number, dir: 'up' | 'down' | 'right', color: string = INK) {
  ctx.fillStyle = color
  for (let i = 0; i < 4; i++) {
    if (dir === 'right') ctx.fillRect(x + i, y - 3 + i, 1, 7 - i * 2)
    if (dir === 'up') ctx.fillRect(x - 3 + i, y + i, 7 - i * 2, 1)
    if (dir === 'down') ctx.fillRect(x - 3 + i, y + 3 - i, 7 - i * 2, 1)
  }
}

export const menu: Program = (ctx, w, h, { t, look }) => {
  const sel = useApp.getState().menuIndex
  ctx.fillStyle = BLACK
  ctx.fillRect(0, 0, w, h)

  text(ctx, 'SELECT GAME', 16, 22, 16, 'left', INK, true)
  text(ctx, `${projects.length} CARTRIDGES`, 17, 38, 8, 'left', DIM)
  drawByte(ctx, {
    x: w - BYTE_W * 2 - 14,
    y: 8,
    s: 2,
    look,
    blink: t % 3.7 < 0.12,
    step: 0,
    antenna: Math.floor(t * 2) % 3 !== 0,
    ink: INK,
    paper: BLACK,
  })
  ctx.fillStyle = FAINT
  for (let x = 14; x < w - 14; x += 4) ctx.fillRect(x, 46, 2, 1)

  projects.forEach((p, i) => {
    const y = ROW_Y0 + i * ROW_H
    const on = i === sel
    if (on) {
      ctx.fillStyle = INK
      ctx.fillRect(ROW_X0 + 10, y - 9, ROW_X1 - ROW_X0 - 10, 18)
      if (t % 0.8 < 0.55) tri(ctx, ROW_X0, y, 'right')
    }
    const fg = on ? BLACK : INK
    text(ctx, String(i + 1).padStart(2, '0'), ROW_X0 + 16, y + 1, 8, 'left', on ? BLACK : DIM)
    text(ctx, p.cartridge, ROW_X0 + 38, y + 1, 16, 'left', fg)
    text(ctx, STATUS_TAG[p.status], ROW_X1 - 6, y + 1, 8, 'right', on ? BLACK : DIM)
  })

  // one-line pitch of the highlighted cartridge
  const pitch = wrap(ctx, projects[sel].pitch.toUpperCase(), w - 32)
  pitch.slice(0, 2).forEach((line, i) => text(ctx, line, 16, 186 + i * 11, 8, 'left', DIM))

  ctx.fillStyle = FAINT
  for (let x = 14; x < w - 14; x += 4) ctx.fillRect(x, 212, 2, 1)
  tri(ctx, 20, 222, 'up', DIM)
  tri(ctx, 28, 226, 'down', DIM)
  text(ctx, 'CHOOSE', 36, 225, 8, 'left', DIM)
  text(ctx, 'ENTER START', w / 2 + 8, 225, 8, 'center', DIM)
  text(ctx, 'ESC BACK', w - 16, 225, 8, 'right', DIM)
}

const LOAD_SECONDS = 1.4

/** Title card + progress bar while the camera dives in. */
export const loading: Program = (ctx, w, h, { t, look }) => {
  const id = useApp.getState().selectedProject
  const i = Math.max(0, projects.findIndex((p) => p.id === id))
  const p = projects[i]
  ctx.fillStyle = BLACK
  ctx.fillRect(0, 0, w, h)

  text(ctx, `STAGE ${String(i + 1).padStart(2, '0')}`, w / 2, 34, 8, 'center', DIM)
  // big title, shrinks to fit
  let size = 32
  ctx.font = `bold ${size}px Silkscreen`
  while (ctx.measureText(p.cartridge).width > w - 40 && size > 16) {
    size -= 8
    ctx.font = `bold ${size}px Silkscreen`
  }
  text(ctx, p.cartridge, w / 2 + 2, 82, size, 'center', DIM, true)
  text(ctx, p.cartridge, w / 2, 80, size, 'center', INK, true)
  wrap(ctx, p.pitch.toUpperCase(), w - 60)
    .slice(0, 2)
    .forEach((line, k) => text(ctx, line, w / 2, 112 + k * 11, 8, 'center', DIM))

  // progress bar, chunky segments
  const k = Math.min(1, t / LOAD_SECONDS)
  const bx = 60
  const bw = w - 120
  ctx.fillStyle = DIM
  ctx.fillRect(bx - 2, 168, bw + 4, 1)
  ctx.fillRect(bx - 2, 179, bw + 4, 1)
  const segs = 20
  for (let s = 0; s < Math.floor(k * segs); s++) {
    ctx.fillStyle = INK
    ctx.fillRect(bx + (s * bw) / segs + 1, 171, bw / segs - 2, 6)
  }
  drawByte(ctx, {
    x: bx + k * bw - BYTE_W,
    y: 136 + (Math.floor(t * 8) % 2),
    s: 2,
    look,
    blink: false,
    step: (Math.floor(t * 8) % 2) as 0 | 1,
    antenna: true,
    ink: INK,
    paper: BLACK,
  })
  text(ctx, k < 1 ? 'LOADING' + '.'.repeat(Math.floor(t * 4) % 4) : 'READY!', w / 2, 200, 8, 'center', INK)
  text(ctx, p.status, w / 2, h - 16, 8, 'center', DIM)
}
