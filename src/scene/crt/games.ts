import { projects } from '../../data/content'
import { useApp } from '../../store/useApp'
import { BLACK, DIM, FAINT, INK, text, type Program } from './programs'

/**
 * The two games that live inside EMIR-1. Opening the cabinet starts one at
 * random; each plays itself as a demo until the visitor touches a control.
 *   RALLY  — paddle game: Up/Down (or W/S) or move the mouse over the screen
 *   PATROL — shooter: Left/Right (or A/D) to move, Space to fire
 */
export type GameId = 'rally' | 'patrol'

const W = 320
const H = 240
const TOP = 30 // play area starts below the header

/* ---------------- input ---------------- */

export const input = {
  up: false,
  down: false,
  left: false,
  right: false,
  fire: false,
  /** logical CRT y of the mouse while it's over the screen */
  pointerY: null as number | null,
  /** the visitor has taken over from the demo */
  active: false,
}

const KEYS: Record<string, keyof typeof input> = {
  ArrowUp: 'up', w: 'up', W: 'up',
  ArrowDown: 'down', s: 'down', S: 'down',
  ArrowLeft: 'left', a: 'left', A: 'left',
  ArrowRight: 'right', d: 'right', D: 'right',
  ' ': 'fire',
}

const playing = () => {
  const s = useApp.getState()
  return s.view === 'cabinet' && !s.panel
}

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    const k = KEYS[e.key]
    if (!k || !playing()) return
    e.preventDefault()
    ;(input[k] as boolean) = true
    input.active = true
  })
  window.addEventListener('keyup', (e) => {
    const k = KEYS[e.key]
    if (k) (input[k] as boolean) = false
  })
  window.addEventListener('blur', () => Object.assign(input, { up: false, down: false, left: false, right: false, fire: false }))
}

/** Mouse over EMIR-1's screen (logical CRT pixels). */
export function screenPointer(type: 'move' | 'click' | 'leave', _x: number, y: number) {
  if (!playing()) return
  if (type === 'leave') input.pointerY = null
  else {
    input.pointerY = y
    if (current === 'rally') input.active = true
    if (type === 'click' && current === 'patrol') {
      input.active = true
      patrol.fireQueued = true
    }
  }
}

/* ---------------- shared ---------------- */

let current: GameId = 'rally'
let lastT = 0

export const currentGame = () => current

/** Start a game (random if none given) from a clean slate, in demo mode. */
export function startGame(id?: GameId) {
  current = id ?? (Math.random() < 0.5 ? 'rally' : 'patrol')
  Object.assign(input, { up: false, down: false, left: false, right: false, fire: false, pointerY: null, active: false })
  resetRally()
  resetPatrol()
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

/* ---------------- RALLY ---------------- */

const PADDLE_H = 34
const rally = {
  bx: W / 2, by: H / 2, vx: 0, vy: 0,
  p: H / 2, c: H / 2,
  you: 0, cpu: 0,
  serve: 1, // seconds until the next serve
  over: 0, // seconds the game-over banner has left
  scored: false,
}

function resetRally() {
  Object.assign(rally, { bx: W / 2, by: (H + TOP) / 2, vx: 0, vy: 0, p: (H + TOP) / 2, c: (H + TOP) / 2, you: 0, cpu: 0, serve: 1, over: 0 })
}

function serve(towardYou: boolean) {
  rally.bx = W / 2
  rally.by = (H + TOP) / 2
  const a = (Math.random() - 0.5) * 0.9
  const sp = 150
  rally.vx = Math.cos(a) * sp * (towardYou ? -1 : 1)
  rally.vy = Math.sin(a) * sp
}

function updateRally(dt: number) {
  const r = rally
  if (r.over > 0) {
    r.over -= dt
    if (r.over <= 0) resetRally()
    return
  }
  // your paddle: mouse, keys, or the demo AI
  if (input.pointerY !== null) r.p += (input.pointerY - r.p) * Math.min(1, dt * 14)
  else if (input.up || input.down) r.p += (input.down ? 1 : -1) * 170 * dt
  else if (!input.active) r.p += clamp(r.by - r.p, -120 * dt, 120 * dt)
  // CPU paddle: good, not perfect
  const target = r.vx > 0 ? r.by : (H + TOP) / 2
  r.c += clamp(target - r.c, -105 * dt, 105 * dt)
  r.p = clamp(r.p, TOP + PADDLE_H / 2, H - 4 - PADDLE_H / 2)
  r.c = clamp(r.c, TOP + PADDLE_H / 2, H - 4 - PADDLE_H / 2)

  if (r.serve > 0) {
    r.serve -= dt
    if (r.serve <= 0) serve(Math.random() < 0.5)
    return
  }
  r.bx += r.vx * dt
  r.by += r.vy * dt
  if (r.by < TOP + 2 || r.by > H - 6) {
    r.vy = -r.vy
    r.by = clamp(r.by, TOP + 2, H - 6)
  }
  const hit = (px: number, py: number, dir: 1 | -1) => {
    if (Math.abs(r.bx - px) < 5 && Math.abs(r.by - py) < PADDLE_H / 2 + 2 && Math.sign(r.vx) === -dir) {
      const off = (r.by - py) / (PADDLE_H / 2)
      const sp = Math.min(320, Math.hypot(r.vx, r.vy) * 1.06)
      r.vx = Math.cos(off * 0.9) * sp * dir
      r.vy = Math.sin(off * 0.9) * sp
    }
  }
  hit(14, r.p, 1)
  hit(W - 14, r.c, -1)
  if (r.bx < -6 || r.bx > W + 6) {
    const youScored = r.bx > W
    if (youScored) {
      r.you++
      if (input.active) useApp.getState().discover('rally')
    } else r.cpu++
    r.serve = 0.9
    r.vx = r.vy = 0
    r.bx = -100
    if (r.you >= 7 || r.cpu >= 7) r.over = 2.6
  }
}

function drawRally(ctx: CanvasRenderingContext2D, t: number) {
  const r = rally
  for (let y = TOP + 2; y < H; y += 10) {
    ctx.fillStyle = FAINT
    ctx.fillRect(W / 2 - 1, y, 2, 5)
  }
  text(ctx, String(r.you), W / 2 - 28, TOP + 18, 24, 'center', DIM, true)
  text(ctx, String(r.cpu), W / 2 + 28, TOP + 18, 24, 'center', DIM, true)
  ctx.fillStyle = INK
  ctx.fillRect(10, r.p - PADDLE_H / 2, 5, PADDLE_H)
  ctx.fillRect(W - 15, r.c - PADDLE_H / 2, 5, PADDLE_H)
  if (r.serve <= 0) ctx.fillRect(Math.round(r.bx) - 2, Math.round(r.by) - 2, 5, 5)
  text(ctx, 'YOU', 22, TOP + 8, 8, 'left', DIM)
  text(ctx, 'CPU', W - 22, TOP + 8, 8, 'right', DIM)
  if (r.over > 0 && t % 0.6 < 0.4) {
    ctx.fillStyle = BLACK
    ctx.fillRect(W / 2 - 70, H / 2 - 14, 140, 28)
    text(ctx, r.you > r.cpu ? 'YOU WIN!' : 'CPU WINS', W / 2, H / 2, 16, 'center', INK, true)
  }
}

/* ---------------- PATROL ---------------- */

const COLS = 8
const ROWS = 4
const SHIP_Y = H - 18

const patrol = {
  alive: [] as boolean[],
  fx: 40, fy: TOP + 14, dir: 1,
  ship: W / 2,
  shots: [] as { x: number; y: number }[],
  bombs: [] as { x: number; y: number }[],
  cooldown: 0,
  bombTimer: 1,
  score: 0,
  lives: 3,
  wave: 1,
  hurt: 0,
  over: 0,
  fireQueued: false,
}

function newWave() {
  patrol.alive = Array.from({ length: COLS * ROWS }, () => true)
  patrol.fx = 40
  patrol.fy = TOP + 14
  patrol.dir = 1
  patrol.shots = []
  patrol.bombs = []
}

function resetPatrol() {
  Object.assign(patrol, { ship: W / 2, cooldown: 0, bombTimer: 1, score: 0, lives: 3, wave: 1, hurt: 0, over: 0, fireQueued: false })
  newWave()
}

const alienX = (c: number) => patrol.fx + c * 26
const alienY = (r: number) => patrol.fy + r * 16

function updatePatrol(dt: number) {
  const g = patrol
  if (g.over > 0) {
    g.over -= dt
    if (g.over <= 0) resetPatrol()
    return
  }
  g.hurt = Math.max(0, g.hurt - dt)
  const left = g.alive.filter(Boolean).length

  // formation marches, speeding up as it thins out; drops a row at each edge
  const speed = 14 + g.wave * 4 + (1 - left / (COLS * ROWS)) * 40
  g.fx += g.dir * speed * dt
  const cols = [...Array(COLS).keys()].filter((c) => [...Array(ROWS).keys()].some((r) => g.alive[r * COLS + c]))
  const minX = alienX(Math.min(...cols))
  const maxX = alienX(Math.max(...cols)) + 12
  if ((g.dir > 0 && maxX > W - 8) || (g.dir < 0 && minX < 8)) {
    g.dir = -g.dir
    g.fy += 8
  }

  // ship: keys, or the demo AI hunting the nearest column
  let move = (input.right ? 1 : 0) - (input.left ? 1 : 0)
  let fire = input.fire || g.fireQueued
  g.fireQueued = false
  if (!input.active && cols.length) {
    const aim = alienX(cols[Math.floor((Date.now() / 2500) % cols.length)]) + 6
    move = Math.sign(aim - g.ship) * (Math.abs(aim - g.ship) > 3 ? 1 : 0)
    fire = Math.abs(aim - g.ship) < 10
  }
  g.ship = clamp(g.ship + move * 150 * dt, 10, W - 10)
  g.cooldown -= dt
  if (fire && g.cooldown <= 0) {
    g.shots.push({ x: g.ship, y: SHIP_Y - 6 })
    g.cooldown = 0.38
  }

  // shots vs aliens
  g.shots.forEach((s) => (s.y -= 240 * dt))
  g.shots = g.shots.filter((s) => {
    if (s.y < TOP) return false
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        const i = r * COLS + c
        if (g.alive[i] && s.x > alienX(c) - 1 && s.x < alienX(c) + 13 && s.y > alienY(r) && s.y < alienY(r) + 9) {
          g.alive[i] = false
          g.score += 10 * (ROWS - r)
          if (input.active) useApp.getState().discover('patrol')
          return false
        }
      }
    return true
  })

  // bombs from the lowest alien in a random column
  g.bombTimer -= dt
  if (g.bombTimer <= 0 && cols.length) {
    const c = cols[Math.floor(Math.random() * cols.length)]
    const r = [...Array(ROWS).keys()].reverse().find((rr) => g.alive[rr * COLS + c])!
    g.bombs.push({ x: alienX(c) + 6, y: alienY(r) + 10 })
    g.bombTimer = Math.max(0.45, 1.3 - g.wave * 0.1)
  }
  g.bombs.forEach((b) => (b.y += 95 * dt))
  g.bombs = g.bombs.filter((b) => {
    if (b.y > H) return false
    if (g.hurt <= 0 && Math.abs(b.x - g.ship) < 8 && b.y > SHIP_Y - 4 && b.y < SHIP_Y + 6) {
      g.lives--
      g.hurt = 1.2
      if (g.lives <= 0) g.over = 2.6
      return false
    }
    return true
  })

  if (!left) {
    g.wave++
    newWave()
  } else if (alienY(Math.max(...[...Array(ROWS).keys()].filter((r) => g.alive.slice(r * COLS, r * COLS + COLS).some(Boolean)))) + 10 > SHIP_Y - 8) {
    g.over = 2.6
  }
}

function drawPatrol(ctx: CanvasRenderingContext2D, t: number) {
  const g = patrol
  const frame = Math.floor(t * 2) % 2
  text(ctx, `SCORE ${String(g.score).padStart(4, '0')}`, W / 2, TOP - 6, 8, 'center', DIM)
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      if (!g.alive[r * COLS + c]) continue
      const x = Math.round(alienX(c))
      const y = Math.round(alienY(r))
      ctx.fillStyle = r === 0 ? INK : DIM
      ctx.fillRect(x + 2, y, 8, 2)
      ctx.fillRect(x, y + 2, 12, 4)
      ctx.fillStyle = BLACK
      ctx.fillRect(x + 3, y + 3, 2, 2)
      ctx.fillRect(x + 7, y + 3, 2, 2)
      ctx.fillStyle = r === 0 ? INK : DIM
      ctx.fillRect(x + (frame ? 0 : 2), y + 6, 2, 2)
      ctx.fillRect(x + (frame ? 10 : 8), y + 6, 2, 2)
    }
  ctx.fillStyle = INK
  g.shots.forEach((s) => ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, 5))
  g.bombs.forEach((b) => ctx.fillRect(Math.round(b.x) - 1, Math.round(b.y), 2, 4))
  if (g.hurt <= 0 || t % 0.2 < 0.1) {
    const x = Math.round(g.ship)
    ctx.fillRect(x - 7, SHIP_Y, 14, 4)
    ctx.fillRect(x - 3, SHIP_Y - 3, 6, 3)
    ctx.fillRect(x - 1, SHIP_Y - 6, 2, 3)
  }
  ctx.fillStyle = FAINT
  ctx.fillRect(0, H - 9, W, 1)
  for (let i = 0; i < g.lives; i++) {
    ctx.fillStyle = DIM
    ctx.fillRect(W - 14 - i * 12, 6, 8, 3)
  }
  if (g.over > 0 && t % 0.6 < 0.4) {
    ctx.fillStyle = BLACK
    ctx.fillRect(W / 2 - 70, H / 2 - 14, 140, 28)
    text(ctx, 'GAME OVER', W / 2, H / 2, 16, 'center', INK, true)
  }
}

/* ---------------- the CRT program ---------------- */

const HINT = { rally: 'UP/DOWN OR MOUSE TO PLAY', patrol: 'LEFT/RIGHT + SPACE TO PLAY' }

/** EMIR-1 in close-up: whichever game is loaded, plus the tape banner. */
export const game: Program = (ctx, w, h, { t }) => {
  const dt = t < lastT ? 0 : Math.min(0.05, t - lastT)
  lastT = t
  if (current === 'rally') updateRally(dt)
  else updatePatrol(dt)

  ctx.fillStyle = BLACK
  ctx.fillRect(0, 0, w, h)
  text(ctx, current.toUpperCase(), 10, 12, 16, 'left', INK, true)
  if (!input.active && t % 1.2 < 0.8) text(ctx, HINT[current], w - 10, 12, 8, 'right', DIM)
  if (current === 'rally') drawRally(ctx, t)
  else drawPatrol(ctx, t)

  // a tape under the cursor (or keyboard focus) announces itself
  const hover = useApp.getState().tapeHover
  if (hover !== null) {
    const p = projects[hover]
    ctx.fillStyle = INK
    ctx.fillRect(0, h - 26, w, 26)
    text(ctx, `TAPE ${String(hover + 1).padStart(2, '0')} · ${p.cartridge}`, 8, h - 13, 8, 'left', BLACK, true)
    text(ctx, 'CLICK TO PLAY', w - 8, h - 13, 8, 'right', BLACK)
  } else if (!input.active && t % 6 > 3) {
    ctx.fillStyle = BLACK
    ctx.fillRect(0, h - 20, w, 20)
    text(ctx, 'PICK A TAPE FROM THE RACK TO SEE A PROJECT', w / 2, h - 10, 8, 'center', INK)
  }
}
