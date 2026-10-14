import { Shape } from 'three'

/**
 * Side silhouette of an upright cabinet, [forward(z), up(y)] in metres,
 * counter-clockwise. Matches the classic shape: marquee overhang, sloped
 * screen, protruding control panel, straight lower body.
 */
export const PROFILE: [number, number][] = [
  [-0.45, 0],
  [0.36, 0],
  [0.36, 0.86],
  [0.52, 0.92], // control panel front lip
  [0.52, 1.0],
  [0.3, 1.08], // screen bottom
  [0.18, 1.62], // screen top
  [0.34, 1.72], // marquee underside
  [0.36, 2.02], // marquee top
  [-0.45, 2.02],
]

/** Miter-offset a CCW polygon outward by d (used for T-molding trim). */
export function offsetPolygon(pts: [number, number][], d: number): [number, number][] {
  const n = pts.length
  return pts.map((p, i) => {
    const a = pts[(i - 1 + n) % n]
    const b = pts[(i + 1) % n]
    const n1 = norm(p[1] - a[1], -(p[0] - a[0]))
    const n2 = norm(b[1] - p[1], -(b[0] - p[0]))
    const m = norm(n1[0] + n2[0], n1[1] + n2[1])
    const k = d / Math.max(0.3, m[0] * n1[0] + m[1] * n1[1])
    return [p[0] + m[0] * k, p[1] + m[1] * k]
  })
}

function norm(x: number, y: number): [number, number] {
  const l = Math.hypot(x, y) || 1
  return [x / l, y / l]
}

export function toShape(pts: [number, number][]) {
  const s = new Shape()
  pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)))
  s.closePath()
  return s
}

/** Front faces of the body sit this far behind the side panels. */
export const RECESS = 0.035

/** Derived anchor points (cabinet-local, after recess) for screen, marquee, etc. */
const seg = (a: [number, number], b: [number, number]) => {
  const mid: [number, number] = [(a[0] + b[0]) / 2 - RECESS, (a[1] + b[1]) / 2]
  // tilt of the face away from vertical; positive = top leans back
  const tilt = Math.atan2(a[0] - b[0], b[1] - a[1])
  return { z: mid[0], y: mid[1], tilt, len: Math.hypot(b[0] - a[0], b[1] - a[1]) }
}

export const ANCHORS = {
  screen: seg(PROFILE[5], PROFILE[6]),
  marquee: seg(PROFILE[7], PROFILE[8]),
  lights: seg(PROFILE[6], PROFILE[7]),
  panel: seg(PROFILE[4], PROFILE[5]),
  front: { z: PROFILE[1][0] - RECESS },
}
