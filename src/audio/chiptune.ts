import { useApp } from '../store/useApp'

/**
 * Two original chiptune loops, written for this site. Each time the music
 * starts one of them is picked at random (50/50). Square lead, triangle bass,
 * noise hats, scheduled with Web Audio.
 */
type Song = {
  title: string
  bpm: number
  /** 8 bars of eighths; '.' = rest, '-' = hold */
  lead: string[]
  /** one bass root per bar */
  bass: string[]
}

const bars = (...b: string[]) => b.join(' ').split(' ')

const SONGS: Song[] = [
  {
    title: 'Last Train to Karaköy',
    bpm: 112,
    lead: bars(
      'A4 . C5 E5 . D5 C5 .', 'A4 . C5 F5 . E5 C5 A4',
      'G4 . C5 E5 . G5 E5 .', 'D5 . B4 G4 . A4 B4 .',
      'A4 . C5 E5 . A5 G5 E5', 'F5 . E5 C5 . A4 C5 .',
      'E5 . D5 C5 . B4 G4 .', 'A4 - - . . . . .',
    ),
    bass: ['A2', 'F2', 'C3', 'G2', 'A2', 'F2', 'G2', 'A2'],
  },
  {
    title: 'Bosphorus Night Shift',
    bpm: 126,
    lead: bars(
      'D5 . F5 A5 . F5 D5 .', 'C5 . E5 G5 . E5 C5 .',
      'A#4 . D5 F5 . A5 G5 F5', 'E5 . C#5 A4 . C#5 E5 .',
      'D5 F5 A5 D6 . C6 A5 .', 'G5 . F5 E5 . D5 C5 .',
      'A#4 . A4 G4 . A4 C#5 E5', 'D5 - - . . . . .',
    ),
    bass: ['D3', 'C3', 'A#2', 'A2', 'D3', 'G2', 'A2', 'D3'],
  },
]

const N: Record<string, number> = {}
'C C# D D# E F F# G G# A A# B'.split(' ').forEach((name, i) => {
  for (let o = 1; o <= 6; o++) N[`${name}${o}`] = 440 * Math.pow(2, (i - 9) / 12 + (o - 4))
})

let song = SONGS[0]
let STEP = 60 / song.bpm / 2 // eighth notes

/** Title of the loop that is playing (or last played). */
export const songTitle = () => song.title

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
    const lead = song.lead
    const i = step % lead.length
    const n = lead[i]
    if (n !== '.' && n !== '-') {
      let len = 1
      while (lead[(i + len) % lead.length] === '-') len++
      note(N[n], nextTime, STEP * len * 0.95, 'square', 0.05)
    }
    const bar = Math.floor(i / 8)
    const root = N[song.bass[bar]]
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
  song = SONGS[Math.random() < 0.5 ? 0 : 1]
  STEP = 60 / song.bpm / 2
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
