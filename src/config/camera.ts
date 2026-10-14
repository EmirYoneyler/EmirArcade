import { Vector3 } from 'three'

export type CameraPose = { position: Vector3; target: Vector3; fov: number }

const pose = (p: [number, number, number], t: [number, number, number], fov = 32): CameraPose => ({
  position: new Vector3(...p),
  target: new Vector3(...t),
  fov,
})

/** Named camera poses. GSAP (Phase 2+) tweens the live pose between these. */
export const POSES = {
  room: pose([7.4, 5.2, 8.4], [0.15, 1.1, -0.2]),
  // filled in Phase 2:
  cabinet: pose([0, 1.9, 3.4], [0, 1.8, -2.2], 30),
  screen: pose([0, 2.05, -0.4], [0, 2.05, -2.2], 28),
} as const

export type PoseName = keyof typeof POSES

/** Room dimensions (world units ≈ metres). Back wall at -z, left wall at -x. */
export const ROOM = { w: 8, d: 6, h: 3.6, wallT: 0.22 } as const
