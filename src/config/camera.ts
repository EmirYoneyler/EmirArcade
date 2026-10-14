import { Euler, Quaternion, Vector3 } from 'three'
import { ANCHORS } from '../scene/geometry/cabinetProfile'

export type CameraPose = { position: Vector3; target: Vector3; fov: number }

const pose = (p: [number, number, number], t: [number, number, number], fov = 32): CameraPose => ({
  position: new Vector3(...p),
  target: new Vector3(...t),
  fov,
})

/** Room dimensions (world units ≈ metres). Back wall at -z, left wall at -x. */
export const ROOM = { w: 8, d: 6, h: 3.6, wallT: 0.22 } as const

/** Where EMIR-1 stands (cabinet origin, on the floor). */
export const MAIN_CABINET = new Vector3(0, 0, -ROOM.d / 2 + 0.55)

/** World-space centre and facing of EMIR-1's CRT, derived from the cabinet profile. */
const S = ANCHORS.screen
const screenNormal = new Vector3(0, Math.sin(S.tilt), Math.cos(S.tilt))
export const SCREEN_CENTER = MAIN_CABINET.clone().add(new Vector3(0, S.y, S.z)).addScaledVector(screenNormal, 0.008)

/** Named camera poses. GSAP tweens the live pose between these. */
export const POSES = {
  room: pose([7.4, 5.2, 8.4], [0.15, 1.1, -0.2]),
  // frames the screen, the control-panel tape deck and the tape rack beside it
  cabinet: pose([0.36, 1.7, 0.5], [0.36, 1.32, -2.3], 30),
  // straight down the screen normal, close enough that the glass overfills the view
  screen: {
    position: SCREEN_CENTER.clone().addScaledVector(screenNormal, 0.45),
    target: SCREEN_CENTER.clone(),
    fov: 28,
  } as CameraPose,
} as const

export type PoseName = keyof typeof POSES

/**
 * Tape deck built into EMIR-1's control panel. `position` is the bottom of
 * the well (where an inserted tape rests), `quaternion` lays a tape flat in
 * it with the label readable from the player's side, `normal` points up out
 * of the deck.
 */
const P = ANCHORS.panel
const panelQuat = new Quaternion().setFromEuler(new Euler(Math.PI / 2 - P.tilt, 0, 0))
export const DECK_LOCAL_X = 0.22
export const TAPE_DECK = {
  position: MAIN_CABINET.clone()
    .add(new Vector3(0, P.y + 0.004, P.z))
    .add(new Vector3(DECK_LOCAL_X, 0.03, 0).applyQuaternion(panelQuat)),
  quaternion: panelQuat.clone().multiply(new Quaternion().setFromEuler(new Euler(-Math.PI / 2, 0, 0))),
  normal: new Vector3(0, 1, 0).applyQuaternion(panelQuat),
}
