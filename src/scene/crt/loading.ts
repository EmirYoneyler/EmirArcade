import { projects } from '../../data/content'
import { useApp } from '../../store/useApp'
import { drawByte } from './byte'
import { BLACK, DIM, FAINT, INK, text, type Program } from './programs'

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
