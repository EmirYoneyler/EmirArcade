import type { PoseName } from './config/camera'

/**
 * The UI moves the camera through this tiny bridge instead of importing
 * the 3D code directly — that keeps three.js / GSAP out of the first-paint
 * bundle (and out of the classic view entirely). The scene registers the
 * real implementation when it mounts.
 */
type Fly = (name: PoseName, duration?: number, ease?: string) => Promise<void>

let impl: Fly | null = null

export function registerCamera(fly: Fly | null) {
  impl = fly
}

export const flyTo: Fly = (name, duration, ease) => (impl ? impl(name, duration, ease) : Promise.resolve())
