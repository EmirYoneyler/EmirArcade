import { create } from 'zustand'

/**
 * room     — overview of the arcade
 * cabinet  — close-up on EMIR-1, SELECT GAME menu on the CRT
 * loading  — title card on the CRT, camera diving into the glass
 * project  — full-screen HTML project page
 */
export type View = 'room' | 'cabinet' | 'loading' | 'project'

type AppState = {
  view: View
  lightsOn: boolean
  soundOn: boolean
  /** cursor position in the SELECT GAME menu */
  menuIndex: number
  /** project currently loaded / shown */
  selectedProject: string | null
  ready: boolean
  hovered: string | null
  setHovered: (n: string | null) => void
  setReady: () => void
  setView: (v: View) => void
  setMenuIndex: (i: number) => void
  toggleLights: () => void
  toggleSound: () => void
  selectProject: (id: string | null) => void
}

export const useApp = create<AppState>((set) => ({
  view: 'room',
  lightsOn: true,
  soundOn: false, // sound is OFF by default
  menuIndex: 0,
  selectedProject: null,
  ready: false,
  hovered: null,
  setHovered: (hovered) => set({ hovered }),
  setReady: () => set({ ready: true }),
  setView: (view) => set({ view }),
  setMenuIndex: (menuIndex) => set({ menuIndex }),
  toggleLights: () => set((s) => ({ lightsOn: !s.lightsOn })),
  toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
  selectProject: (selectedProject) => set({ selectedProject }),
}))
