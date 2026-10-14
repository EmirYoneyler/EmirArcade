/**
 * Arcade (3D) vs classic (plain page). The site always opens in the arcade;
 * only a browser without WebGL starts in classic. The inline script in
 * index.html mirrors `detectMode` so the right view shows on first paint.
 */
export type Mode = 'arcade' | 'classic'

export function detectMode(): { mode: Mode; auto: boolean } {
  let webgl = false
  try {
    webgl = !!document.createElement('canvas').getContext('webgl2')
  } catch {
    /* no WebGL */
  }
  return webgl ? { mode: 'arcade', auto: false } : { mode: 'classic', auto: true }
}

export function initialMode(): { mode: Mode; auto: boolean } {
  if (typeof document === 'undefined') return { mode: 'classic', auto: false }
  const d = document.documentElement.dataset
  if (d.mode === 'arcade' || d.mode === 'classic') return { mode: d.mode, auto: d.auto === '1' }
  return detectMode()
}

/** Switch for this visit; the next visit opens in the arcade again. */
export function saveMode(mode: Mode) {
  document.documentElement.dataset.mode = mode
  delete document.documentElement.dataset.auto
}
