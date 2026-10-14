import { create } from 'zustand'
import type { PoseName } from '../config/camera'

export type View = 'room' | 'cabinet' | 'menu' | 'screen'

type AppState = {
  view: View
  pose: PoseName
  lightsOn: boolean
  soundOn: boolean
  selectedProject: string | null
  ready: boolean
  setReady: () => void
  setView: (v: View) => void
  toggleLights: () => void
  toggleSound: () => void
  selectProject: (id: string | null) => void
}

export const useApp = create<AppState>((set) => ({
  view: 'room',
  pose: 'room',
  lightsOn: true,
  soundOn: false, // sound is OFF by default
  selectedProject: null,
  ready: false,
  setReady: () => set({ ready: true }),
  setView: (view) => set({ view }),
  toggleLights: () => set((s) => ({ lightsOn: !s.lightsOn })),
  toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
  selectProject: (selectedProject) => set({ selectedProject }),
}))
