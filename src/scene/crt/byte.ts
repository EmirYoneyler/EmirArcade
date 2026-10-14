/**
 * BYTE — the house mascot. A little chip creature: 16×14 pixels,
 * '#' body, 'o' eye socket, 'm' mouth. Pupils are drawn on top so they
 * can follow the cursor.
 */
const BODY = [
  '.........##.....',
  '.........#......',
  '....########....',
  '..############..',
  '.##############.',
  '.##oooo##oooo##.',
  '.##oooo##oooo##.',
  '.##oooo##oooo##.',
  '.##############.',
  '.#####m##m#####.',
  '.######mm######.',
  '..############..',
  '....########....',
]
const LEGS = [
  ['....##....##....', '...###....###...'],
  ['.....##..##.....', '....###..###....'],
]

export const BYTE_W = 16
export const BYTE_H = 15

type DrawOpts = {
  x: number
  y: number
  s: number // pixel size
  look: { x: number; y: number } // -1..1
  blink: boolean
  step: 0 | 1
  antenna: boolean
  ink: string
  paper: string
}

export function drawByte(ctx: CanvasRenderingContext2D, o: DrawOpts) {
  const rows = [...BODY, ...LEGS[o.step]]
  rows.forEach((row, ry) => {
    for (let rx = 0; rx < row.length; rx++) {
      const c = row[rx]
      if (c === '.') continue
      if (ry === 0 && !o.antenna) continue
      ctx.fillStyle = c === '#' ? o.ink : o.paper
      ctx.fillRect(o.x + rx * o.s, o.y + ry * o.s, o.s, o.s)
    }
  })
  const px = Math.max(-1, Math.min(1, Math.round(o.look.x * 1.6)))
  const py = o.look.y > 0.05 ? 0 : 1
  for (const ex of [3, 9]) {
    if (o.blink) {
      ctx.fillStyle = o.ink
      ctx.fillRect(o.x + ex * o.s, o.y + 5 * o.s, 4 * o.s, 3 * o.s)
      ctx.fillStyle = o.paper
      ctx.fillRect(o.x + ex * o.s, o.y + 6 * o.s, 4 * o.s, o.s)
    } else {
      ctx.fillStyle = o.ink
      ctx.fillRect(o.x + (ex + 1 + px) * o.s, o.y + (5 + py) * o.s, 2 * o.s, 2 * o.s)
    }
  }
}
