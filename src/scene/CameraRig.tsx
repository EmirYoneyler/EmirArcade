import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, Vector3 } from 'three'
import { POSES } from '../config/camera'

/**
 * The live pose. GSAP (Phase 2) tweens THIS object between named POSES;
 * the rig below reads it every frame and adds mouse parallax on top.
 */
export const livePose = {
  position: POSES.room.position.clone(),
  target: POSES.room.target.clone(),
  fov: POSES.room.fov,
  /** 0..1 — parallax is damped to 0 when zoomed into the screen. */
  parallax: 1,
  /** 0..1 — how much the narrow-viewport back-off applies (none inside the screen). */
  fit: 1,
}

const reduceMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function CameraRig() {
  const { camera, size } = useThree()
  const cam = camera as PerspectiveCamera
  const offset = useMemo(() => new Vector3(), [])
  const look = useMemo(() => new Vector3(), [])
  const smooth = useMemo(() => ({ x: 0, y: 0 }), [])

  useEffect(() => {
    cam.fov = livePose.fov
    cam.updateProjectionMatrix()
  }, [cam])

  useFrame((state, dt) => {
    // ease the pointer so the sway feels weighty, not twitchy
    const k = 1 - Math.pow(0.001, dt)
    smooth.x += (state.pointer.x - smooth.x) * k
    smooth.y += (state.pointer.y - smooth.y) * k

    const amt = reduceMotion ? 0 : livePose.parallax
    // narrow viewports: back the camera off so the whole diorama fits
    const fit = 1 + (Math.max(1, 1.55 / (size.width / size.height)) - 1) * livePose.fit
    offset.set(smooth.x * 0.55 * amt, smooth.y * 0.3 * amt, -smooth.x * 0.15 * amt)

    look.copy(livePose.position).sub(livePose.target).multiplyScalar(fit).add(livePose.target)
    cam.position.copy(look).add(offset)
    look.copy(livePose.target).addScaledVector(offset, -0.35)
    cam.lookAt(look)

    if (cam.fov !== livePose.fov) {
      cam.fov = livePose.fov
      cam.updateProjectionMatrix()
    }
  })

  return null
}
