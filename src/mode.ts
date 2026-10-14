/**
 * Arcade (3D) vs classic (plain page). The choice is made before first
 * paint by the inline script in index.html — which mirrors `detectMode`
 * below — and stored on <html data-mode>. An explicit choice is saved.
 */
export type Mode = 'arcade' | 'classic'

export const MODE_KEY = 'emir-arcade:view'

/** Small screens, weak devices, data-saver and no-WebGL start in classic. */
export function detectMode(): { mode: Mode; auto: boolean } {
  try {
    const saved = localStorage.getItem(MODE_KEY)
    if (saved === 'arcade' || saved === 'classic') return { mode: saved, auto: false }
  } catch {
    /* storage blocked — fall through to detection */
  }
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
  const weak =
    window.innerWidth < 768 ||
    !!nav.connection?.saveData ||
    (nav.hardwareConcurrency || 8) <= 2 ||
    (nav.deviceMemory || 8) <= 2
  let webgl = false
  try {
    webgl = !!document.createElement('canvas').getContext('webgl2')
  } catch {
    /* no WebGL */
  }
  return { mode: weak || !webgl ? 'classic' : 'arcade', auto: true }
}

export function initialMode(): { mode: Mode; auto: boolean } {
  if (typeof document === 'undefined') return { mode: 'classic', auto: false }
  const d = document.documentElement.dataset
  if (d.mode === 'arcade' || d.mode === 'classic') return { mode: d.mode, auto: d.auto === '1' }
  return detectMode()
}

export function saveMode(mode: Mode) {
  document.documentElement.dataset.mode = mode
  delete document.documentElement.dataset.auto
  try {
    localStorage.setItem(MODE_KEY, mode)
  } catch {
    /* fine — it just won't be remembered */
  }
}
