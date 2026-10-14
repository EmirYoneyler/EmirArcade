import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { PointLight, SpotLight } from 'three'
import { PALETTE, LIGHT } from '../../theme/palette'
import { Toon, Glow } from '../materials/toon'
import { useApp } from '../../store/useApp'

/** Cheap deterministic flicker: slow breathing + rare sharp dips. */
function flicker(t: number) {
  const breathe = 0.96 + Math.sin(t * 1.3) * 0.025 + Math.sin(t * 7.1) * 0.012
  const dip = Math.sin(t * 0.9) > 0.985 ? 0.55 : 1
  return breathe * dip
}

/** Hanging bulb + shade. Owns the room's one shadow-casting light. */
export default function PendantLamp({ position = [0.2, 3.4, 0.4] as [number, number, number] }) {
  const spot = useRef<SpotLight>(null)
  const fill = useRef<PointLight>(null)
  const lightsOn = useApp((s) => s.lightsOn)

  useFrame(({ clock }, dt) => {
    const f = flicker(clock.elapsedTime)
    const target = lightsOn ? 1 : 0
    const cur = (spot.current?.userData.k ?? 1) as number
    const k = cur + (target - cur) * Math.min(1, dt * 5)
    if (spot.current) {
      spot.current.userData.k = k
      spot.current.intensity = 38 * f * k
    }
    if (fill.current) fill.current.intensity = 3 * f * k
  })

  return (
    <group position={position}>
      {/* cord up and out of frame */}
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 3.2, 6]} />
        <Toon color={PALETTE.bg} />
      </mesh>
      {/* shade */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.1, 0.42, 0.34, 20, 1, true]} />
        <meshToonMaterial color={PALETTE.mustard} side={2} emissive={PALETTE.mustard} emissiveIntensity={lightsOn ? 0.25 : 0.02} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.06, 12]} />
        <Toon color={PALETTE.bg} />
      </mesh>
      {/* bulb */}
      <mesh position={[0, -0.12, 0]}>
        <sphereGeometry args={[0.1, 14, 10]} />
        <Glow color={LIGHT.tungsten} strength={lightsOn ? 3 : 0.35} />
      </mesh>
      <spotLight
        ref={spot}
        position={[0, -0.3, 0]}
        angle={1.0}
        penumbra={0.9}
        decay={1.6}
        distance={14}
        color={LIGHT.tungsten}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-radius={5}
      />
      <pointLight ref={fill} position={[0, -0.35, 0]} color={LIGHT.tungsten} distance={9} decay={1.8} />
    </group>
  )
}
