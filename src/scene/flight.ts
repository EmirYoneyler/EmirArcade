import gsap from 'gsap'
import { POSES, type PoseName } from '../config/camera'
import { livePose } from './CameraRig'

const reduceMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** How much mouse parallax each pose allows. */
const PARALLAX: Record<PoseName, number> = { room: 1, cabinet: 0.2, screen: 0 }

let tl: gsap.core.Timeline | null = null

/**
 * Fly the camera to a named pose. With prefers-reduced-motion the camera
 * cuts instead of flying. Resolves when the camera has arrived.
 */
export function flyTo(name: PoseName, duration = 1.2, ease = 'power3.inOut'): Promise<void> {
  const p = POSES[name]
  tl?.kill()
  if (reduceMotion()) {
    livePose.position.copy(p.position)
    livePose.target.copy(p.target)
    livePose.fov = p.fov
    livePose.parallax = PARALLAX[name]
    return Promise.resolve()
  }
  return new Promise((resolve) => {
    tl = gsap.timeline({ defaults: { duration, ease }, onComplete: () => resolve() })
    tl.to(livePose.position, { x: p.position.x, y: p.position.y, z: p.position.z }, 0)
      .to(livePose.target, { x: p.target.x, y: p.target.y, z: p.target.z }, 0)
      .to(livePose, { fov: p.fov, parallax: PARALLAX[name] }, 0)
  })
}
