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

  text(ctx, 'INSERT A TAPE', 16, 22, 16, 'left', INK, true)
  text(ctx, `${projects.length} TAPES ON THE RACK  >>`, 17, 38, 8, 'left', DIM)
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
  text(ctx, 'CLICK A TAPE / ENTER', w / 2 + 14, 225, 8, 'center', DIM)
  text(ctx, 'ESC BACK', w - 16, 225, 8, 'right', DIM)
}

/** Spinning cassette reel, drawn in pixels. */
function reel(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, angle: number) {
  ctx.fillStyle = INK
  for (let k = 0; k < 48; k++) {
    const a = (k / 48) * Math.PI * 2
    ctx.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), 2, 2)
  }
  for (let s = 0; s < 3; s++) {
    const a = angle + (s / 3) * Math.PI * 2
    for (let d = 3; d < r - 2; d += 2) ctx.fillRect(Math.round(cx + Math.cos(a) * d), Math.round(cy + Math.sin(a) * d), 2, 2)
  }
  ctx.fillRect(cx - 2, cy - 2, 4, 4)
}

/** Seconds the tape takes to travel from the rack into the deck. */
const INSERT_SECONDS = 1.1
const READ_SECONDS = 1.1

/** The tape going in, then being read: title card + spinning reels + progress. */
export const loading: Program = (ctx, w, h, { t }) => {
  const id = useApp.getState().selectedProject
  const i = Math.max(0, projects.findIndex((p) => p.id === id))
  const p = projects[i]
  ctx.fillStyle = BLACK
  ctx.fillRect(0, 0, w, h)

  if (t < INSERT_SECONDS) {
    // waiting for the tape to land in the deck
    text(ctx, 'INSERTING TAPE', w / 2, 70, 16, 'center', INK, true)
    text(ctx, `TAPE ${String(i + 1).padStart(2, '0')}  ·  ${p.cartridge}`, w / 2, 96, 8, 'center', DIM)
    drawByte(ctx, { x: w / 2 - 32, y: 124, s: 4, look: { x: 0.8, y: -0.8 }, blink: false, step: 0, antenna: true, ink: INK, paper: BLACK })
    return
  }
  const k = Math.min(1, (t - INSERT_SECONDS) / READ_SECONDS)

  text(ctx, `TAPE ${String(i + 1).padStart(2, '0')}  ·  SIDE A`, w / 2, 26, 8, 'center', DIM)
  // big title, shrinks to fit
  let size = 32
  ctx.font = `bold ${size}px Silkscreen`
  while (ctx.measureText(p.cartridge).width > w - 40 && size > 16) {
    size -= 8
    ctx.font = `bold ${size}px Silkscreen`
  }
  text(ctx, p.cartridge, w / 2 + 2, 62, size, 'center', DIM, true)
  text(ctx, p.cartridge, w / 2, 60, size, 'center', INK, true)
  wrap(ctx, p.pitch.toUpperCase(), w - 60)
    .slice(0, 2)
    .forEach((line, n) => text(ctx, line, w / 2, 90 + n * 11, 8, 'center', DIM))

  // cassette window: two reels, tape running between them
  const spin = t * 7
  ctx.fillStyle = FAINT
  ctx.fillRect(w / 2 - 70, 122, 140, 42)
  ctx.fillStyle = DIM
  ctx.fillRect(w / 2 - 34, 142, 68, 2)
  reel(ctx, w / 2 - 44, 143, 15, spin)
  reel(ctx, w / 2 + 44, 143, 15, spin * 0.85)

  // progress bar, chunky segments
  const bx = 60
  const bw = w - 120
  ctx.fillStyle = DIM
  ctx.fillRect(bx - 2, 178, bw + 4, 1)
  ctx.fillRect(bx - 2, 189, bw + 4, 1)
  const segs = 20
  for (let s = 0; s < Math.floor(k * segs); s++) {
    ctx.fillStyle = INK
    ctx.fillRect(bx + (s * bw) / segs + 1, 181, bw / segs - 2, 6)
  }
  text(ctx, k < 1 ? 'READING TAPE' + '.'.repeat(Math.floor(t * 4) % 4) : 'PLAY', w / 2, 206, 8, 'center', INK)
  text(ctx, p.status, w / 2, h - 14, 8, 'center', DIM)
}
