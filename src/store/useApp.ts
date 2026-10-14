import { create } from 'zustand'
import { SECRETS, SECRET_COUNT, type SecretId } from '../data/secrets'
import { initialMode, saveMode, type Mode } from '../mode'

/**
 * room     — overview of the arcade
 * cabinet  — close-up on EMIR-1, SELECT GAME menu on the CRT
 * loading  — title card on the CRT, camera diving into the glass
 * project  — full-screen HTML project page
 */
export type View = 'room' | 'cabinet' | 'loading' | 'project'
export type Panel = 'cv' | 'contact' | null
export type Toast = { id: number; text: string }

const SECRETS_KEY = 'emir-arcade:secrets'
function loadSecrets(): SecretId[] {
  try {
    const raw = JSON.parse(localStorage.getItem(SECRETS_KEY) ?? '[]')
    return Array.isArray(raw) ? raw.filter((s): s is SecretId => s in SECRETS) : []
  } catch {
    return []
  }
}

/** Boot sequence stages, in order; the bar shows real progress through them. */
export type BootStage = 'rom' | 'assets' | 'gpu' | 'done'

type AppState = {
  mode: Mode
  /** true when the mode was picked automatically (small/weak device) */
  modeAuto: boolean
  bootStage: BootStage
  /** 0..1 within the current boot stage */
  bootProgress: number
  setMode: (m: Mode) => void
  setBoot: (stage: BootStage, progress?: number) => void
  view: View
  lightsOn: boolean
  soundOn: boolean
  musicOn: boolean
  menuIndex: number
  selectedProject: string | null
  ready: boolean
  /** name shown in the cursor tooltip */
  hovered: string | null
  /** object id focused via keyboard (Tab) — gets the same outline as hover */
  focused: string | null
  /** BYTE's current line in the dialog box */
  dialog: { text: string; key: number } | null
  panel: Panel
  secrets: SecretId[]
  toasts: Toast[]
  /** bumps each time an object is activated; components animate on change */
  pulses: Record<string, number>
  cheat: boolean
  /** tape under the cursor / keyboard focus, announced on EMIR-1's screen */
  tapeHover: number | null
  setTapeHover: (i: number | null) => void

  setHovered: (n: string | null) => void
  setFocused: (id: string | null) => void
  setView: (v: View) => void
  setMenuIndex: (i: number) => void
  selectProject: (id: string | null) => void
  toggleLights: () => void
  toggleSound: () => void
  setMusic: (on: boolean) => void
  say: (text: string) => void
  closeDialog: () => void
  setPanel: (p: Panel) => void
  discover: (id: SecretId) => void
  dropToast: (id: number) => void
  activate: (id: string) => void
  setCheat: (on: boolean) => void
}

let toastId = 0

const start = initialMode()

export const useApp = create<AppState>((set, get) => ({
  mode: start.mode,
  modeAuto: start.auto,
  bootStage: 'rom',
  bootProgress: 0,
  setMode: (mode) => {
    saveMode(mode)
    // leaving the arcade resets it, so coming back starts in the room
    set({ mode, modeAuto: false, view: 'room', musicOn: false, panel: null, dialog: null, ready: false, bootStage: 'rom', bootProgress: 0 })
  },
  setBoot: (bootStage, bootProgress = 0) => set({ bootStage, bootProgress, ready: bootStage === 'done' }),
  view: 'room',
  lightsOn: true,
  soundOn: false, // sound is OFF by default
  musicOn: false,
  menuIndex: 0,
  selectedProject: null,
  ready: false,
  hovered: null,
  focused: null,
  dialog: null,
  panel: null,
  secrets: loadSecrets(),
  toasts: [],
  pulses: {},
  cheat: false,
  tapeHover: null,
  setTapeHover: (tapeHover) => set({ tapeHover }),

  setHovered: (hovered) => set({ hovered }),
  setFocused: (focused) => set({ focused }),
  setView: (view) => set({ view }),
  setMenuIndex: (menuIndex) => set({ menuIndex }),
  selectProject: (selectedProject) => set({ selectedProject }),
  toggleLights: () => set((s) => ({ lightsOn: !s.lightsOn })),
  toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
  setMusic: (musicOn) => set({ musicOn }),
  say: (text) => set((s) => ({ dialog: { text, key: (s.dialog?.key ?? 0) + 1 } })),
  closeDialog: () => set({ dialog: null }),
  setPanel: (panel) => set({ panel }),
  discover: (id) => {
    const { secrets } = get()
    if (secrets.includes(id)) return
    const next = [...secrets, id]
    try {
      localStorage.setItem(SECRETS_KEY, JSON.stringify(next))
    } catch {
      /* private mode — the counter still works for this visit */
    }
    const toast = { id: ++toastId, text: `${SECRETS[id]} · ${next.length}/${SECRET_COUNT}` }
    set((s) => ({ secrets: next, toasts: [...s.toasts, toast] }))
  },
  dropToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  activate: (id) => {
    set((s) => ({ pulses: { ...s.pulses, [id]: (s.pulses[id] ?? 0) + 1 } }))
    if (id in SECRETS) get().discover(id as SecretId)
  },
  setCheat: (cheat) => set({ cheat }),
}))

// handy for poking at state from the console while developing
if (import.meta.env.DEV) (window as unknown as { __app: typeof useApp }).__app = useApp
