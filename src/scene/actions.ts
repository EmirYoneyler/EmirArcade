import { byteLines, projects, skillProjects, type Skill } from '../data/content'
import { SECRET_COUNT } from '../data/secrets'
import { useApp } from '../store/useApp'
import { sfx } from '../audio/sfx'
import { pressStart } from '../flow'

/** Every interactive object, in Tab order. Name doubles as the tooltip. */
export const OBJECTS = [
  { id: 'emir1', name: 'EMIR-1 · press start' },
  { id: 'rally', name: 'RALLY' },
  { id: 'patrol', name: 'PATROL' },
  { id: 'claw', name: 'Claw machine' },
  { id: 'jukebox', name: 'Jukebox' },
  { id: 'cat', name: 'Kernel the cat' },
  { id: 'clock', name: 'Wall clock' },
  { id: 'window', name: 'Window' },
  { id: 'cork', name: 'Cork board · CV' },
  { id: 'sign', name: 'Open for work · contact' },
  { id: 'plant', name: 'Potted plant' },
  { id: 'switch', name: 'Light switch' },
] as const
export type ObjectId = (typeof OBJECTS)[number]['id']
export const objectName = (id: ObjectId) => OBJECTS.find((o) => o.id === id)!.name

const fill = (s: string, vars: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '')
const pick = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)]
const get = useApp.getState

export const say = (text: string) => get().say(text)

/** Activate an object: animation (via pulse), sound, BYTE's line, secret. */
export function activate(id: ObjectId) {
  if (id === 'emir1') return void pressStart()
  const before = get().secrets.length
  get().activate(id)
  if (get().secrets.length > before) {
    sfx('secret')
    if (get().secrets.length === SECRET_COUNT) setTimeout(() => say(byteLines.allSecrets), 3500)
  } else sfx('blip')

  const s = get()
  switch (id) {
    case 'rally':
      return say(byteLines.rally)
    case 'patrol':
      return say(byteLines.patrol)
    case 'cat':
      sfx('meow')
      return say(pick(byteLines.cat))
    case 'clock':
      return say(fill(byteLines.clock, { time: istanbulTime().label }))
    case 'window':
      sfx('star')
      return say(byteLines.window)
    case 'cork':
      s.setPanel('cv')
      return say(byteLines.cork)
    case 'sign':
      s.setPanel('contact')
      return say(byteLines.sign)
    case 'plant':
      return say(pick(byteLines.plant))
    case 'switch':
      sfx('thunk')
      s.toggleLights()
      return say(get().lightsOn ? byteLines.switchOn : byteLines.switchOff)
    case 'jukebox': {
      const on = !s.musicOn
      s.setMusic(on)
      return say(on ? (s.soundOn ? byteLines.jukeboxOn : byteLines.jukeboxMuted) : byteLines.jukeboxOff)
    }
    case 'claw':
      // the claw component picks the plush and calls clawResult() when it lands
      sfx('whirr')
      return
  }
}

/** Called by the claw machine once a plush is grabbed. */
export function clawResult(skill: Skill) {
  sfx('coin')
  const used = skillProjects[skill].map((id) => projects.find((p) => p.id === id)?.title).filter(Boolean)
  say(used.length ? fill(byteLines.claw, { skill, projects: used.join(', ') }) : fill(byteLines.clawNone, { skill }))
}

const istFmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Istanbul',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

/** Current wall-clock time in Istanbul, regardless of the visitor's timezone. */
export function istanbulTime() {
  const parts = Object.fromEntries(istFmt.formatToParts(new Date()).map((p) => [p.type, p.value]))
  const h = Number(parts.hour) % 24
  const m = Number(parts.minute)
  const s = Number(parts.second)
  return { h, m, s, label: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` }
}
