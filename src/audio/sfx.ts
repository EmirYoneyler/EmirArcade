import { Howl, Howler } from 'howler'
import { useApp } from '../store/useApp'

/**
 * All sound effects are synthesized at runtime into tiny WAV clips and
 * played through Howler — no audio files to download, nothing licensed.
 */
const RATE = 22050

type Voice = (t: number, dur: number) => number

const square = (f: number) => (Math.sin(2 * Math.PI * f) >= 0 ? 1 : -1)
const env = (t: number, dur: number, attack = 0.005) => Math.min(1, t / attack) * Math.max(0, 1 - t / dur)
let seed = 1
const noise = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1

function phaseVoice(freq: (t: number) => number, wave: (p: number) => number, gain = 0.35, attack?: number): Voice {
  let phase = 0
  let last = 0
  return (t, dur) => {
    phase += freq(t) * (t - last)
    last = t
    return wave(phase) * env(t, dur, attack) * gain
  }
}

const SQ = (p: number) => (p % 1 < 0.5 ? 1 : -1)
const TRI = (p: number) => 1 - 4 * Math.abs((p % 1) - 0.5)
const SIN = (p: number) => Math.sin(2 * Math.PI * p)
void square

const RECIPES: Record<string, { dur: number; voice: () => Voice }> = {
  blip: { dur: 0.08, voice: () => phaseVoice((t) => (t < 0.04 ? 880 : 1320), SQ, 0.18) },
  coin: { dur: 0.35, voice: () => phaseVoice((t) => (t < 0.07 ? 988 : 1319), SQ, 0.16) },
  click: { dur: 0.03, voice: () => (t, d) => noise() * env(t, d, 0.001) * 0.3 },
  thunk: { dur: 0.09, voice: () => phaseVoice((t) => 180 - t * 900, TRI, 0.5, 0.001) },
  whirr: { dur: 0.6, voice: () => phaseVoice((t) => 110 + Math.sin(t * 40) * 8, (p) => (p % 1) * 2 - 1, 0.12, 0.05) },
  drop: { dur: 0.35, voice: () => phaseVoice((t) => 700 - t * 1600, SQ, 0.14) },
  meow: {
    dur: 0.45,
    voice: () => phaseVoice((t) => 520 + Math.sin(Math.min(1, t / 0.45) * Math.PI) * 380 + Math.sin(t * 60) * 12, SIN, 0.3, 0.04),
  },
  pop: { dur: 0.12, voice: () => phaseVoice((t) => 420 - t * 2800, SIN, 0.45, 0.002) },
  star: { dur: 0.9, voice: () => phaseVoice((t) => 1800 + t * 900 + Math.sin(t * 90) * 60, TRI, 0.09, 0.02) },
  secret: {
    dur: 0.5,
    voice: () => phaseVoice((t) => [523, 659, 784, 1047][Math.min(3, Math.floor(t / 0.09))], SQ, 0.14),
  },
}
export type SfxName = keyof typeof RECIPES

function wavDataUri(dur: number, voice: Voice) {
  const n = Math.floor(dur * RATE)
  const buf = new ArrayBuffer(44 + n * 2)
  const v = new DataView(buf)
  const str = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)))
  str(0, 'RIFF')
  v.setUint32(4, 36 + n * 2, true)
  str(8, 'WAVEfmt ')
  v.setUint32(16, 16, true)
  v.setUint16(20, 1, true)
  v.setUint16(22, 1, true)
  v.setUint32(24, RATE, true)
  v.setUint32(28, RATE * 2, true)
  v.setUint16(32, 2, true)
  v.setUint16(34, 16, true)
  str(36, 'data')
  v.setUint32(40, n * 2, true)
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, voice(i / RATE, dur)))
    v.setInt16(44 + i * 2, s * 0x7fff, true)
  }
  let bin = ''
  const bytes = new Uint8Array(buf)
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return `data:audio/wav;base64,${btoa(bin)}`
}

const cache = new Map<string, Howl>()

/** Play a synthesized effect. Silent (and free) while sound is off. */
export function sfx(name: SfxName) {
  if (!useApp.getState().soundOn) return
  let h = cache.get(name)
  if (!h) {
    const r = RECIPES[name]
    h = new Howl({ src: [wavDataUri(r.dur, r.voice())], format: ['wav'], volume: 0.7 })
    cache.set(name, h)
  }
  h.play()
}

// Global mute follows the store; sound starts OFF.
Howler.mute(!useApp.getState().soundOn)
useApp.subscribe((s, prev) => {
  if (s.soundOn !== prev.soundOn) Howler.mute(!s.soundOn)
})
