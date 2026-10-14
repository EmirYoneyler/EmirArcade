import { useApp } from '../store/useApp'

/**
 * "Last Train to Karaköy" — an original 4-bar chiptune loop, written for
 * this site. Square lead, triangle bass, noise hats, scheduled with Web Audio.
 */
const BPM = 112
const STEP = 60 / BPM / 2 // eighth notes

const N: Record<string, number> = {}
'C C# D D# E F F# G G# A A# B'.split(' ').forEach((name, i) => {
  for (let o = 1; o <= 6; o++) N[`${name}${o}`] = 440 * Math.pow(2, (i - 9) / 12 + (o - 4))
})

// 8 bars of eighths; '.' = rest, '-' = hold
const LEAD = [
  'A4 . C5 E5 . D5 C5 .', 'A4 . C5 F5 . E5 C5 A4',
  'G4 . C5 E5 . G5 E5 .', 'D5 . B4 G4 . A4 B4 .',
  'A4 . C5 E5 . A5 G5 E5', 'F5 . E5 C5 . A4 C5 .',
  'E5 . D5 C5 . B4 G4 .', 'A4 - - . . . . .',
].join(' ').split(' ')
const BASS_ROOTS = ['A2', 'F2', 'C3', 'G2', 'A2', 'F2', 'G2', 'A2']

let ctx: AudioContext | null = null
let master: GainNode | null = null
let timer: number | null = null
let step = 0
let nextTime = 0
let noiseBuf: AudioBuffer | null = null

function note(freq: number, t: number, dur: number, type: OscillatorType, gain: number) {
  const o = ctx!.createOscillator()
  const g = ctx!.createGain()
  o.type = type
  o.frequency.value = freq
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(gain, t + 0.005)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(master!)
  o.start(t)
  o.stop(t + dur + 0.02)
}

function hat(t: number, gain: number) {
  const src = ctx!.createBufferSource()
  src.buffer = noiseBuf
  const g = ctx!.createGain()
  const hp = ctx!.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 6000
  g.gain.setValueAtTime(gain, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
  src.connect(hp).connect(g).connect(master!)
  src.start(t)
  src.stop(t + 0.06)
}

function schedule() {
  while (nextTime < ctx!.currentTime + 0.12) {
    const i = step % LEAD.length
    const n = LEAD[i]
    if (n !== '.' && n !== '-') {
      let len = 1
      while (LEAD[(i + len) % LEAD.length] === '-') len++
      note(N[n], nextTime, STEP * len * 0.95, 'square', 0.05)
    }
    const bar = Math.floor(i / 8)
    const root = N[BASS_ROOTS[bar]]
    note(i % 2 ? root * 2 : root, nextTime, STEP * 0.9, 'triangle', 0.12)
    hat(nextTime, i % 2 ? 0.025 : 0.05)
    nextTime += STEP
    step++
  }
}

/** Beat phase 0..1 for visuals (jukebox pulse). */
export function beat() {
  if (!ctx || timer === null) return 0
  return 1 - ((ctx.currentTime % (STEP * 2)) / (STEP * 2))
}

/*
 * Browsers only allow audio after the visitor interacts with the page, so the
 * music waits for the first click, key press or tap, then starts right away.
 */
let unlocked = false
let pendingStart = false
if (typeof window !== 'undefined') {
  const unlock = () => {
    unlocked = true
    ;['pointerdown', 'keydown', 'touchstart'].forEach((e) => window.removeEventListener(e, unlock, true))
    if (pendingStart) startMusic()
  }
  ;['pointerdown', 'keydown', 'touchstart'].forEach((e) => window.addEventListener(e, unlock, true))
}

export function startMusic() {
  if (!unlocked) {
    pendingStart = true
    return
  }
  pendingStart = false
  if (!ctx) {
    ctx = new AudioContext()
    master = ctx.createGain()
    master.connect(ctx.destination)
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  ctx.resume()
  master!.gain.value = useApp.getState().soundOn ? 0.8 : 0
  if (timer !== null) return
  step = 0
  nextTime = ctx.currentTime + 0.05
  timer = window.setInterval(schedule, 25)
}

export function stopMusic() {
  pendingStart = false
  if (timer !== null) window.clearInterval(timer)
  timer = null
}

useApp.subscribe((s, prev) => {
  if (master && s.soundOn !== prev.soundOn) master.gain.value = s.soundOn ? 0.8 : 0
  if (s.musicOn !== prev.musicOn) (s.musicOn ? startMusic() : stopMusic())
})
