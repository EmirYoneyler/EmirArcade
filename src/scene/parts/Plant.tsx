import { useRef } from 'react'
import gsap from 'gsap'
import type { Group } from 'three'
import { PALETTE } from '../../theme/palette'
import { Toon } from '../materials/toon'
import { usePulse } from '../usePulse'

const LEAVES = Array.from({ length: 9 }, (_, i) => ({
  a: (i / 9) * Math.PI * 2 + (i % 2) * 0.3,
  tilt: 0.35 + (i % 3) * 0.18,
  len: 0.3 + ((i * 7) % 5) * 0.03,
  color: i % 2 ? PALETTE.teal : PALETTE.wall,
}))

/** Potted plant. Click: the leaves shiver. */
export default function Plant() {
  const leaves = useRef<Group>(null)
  usePulse('plant', () => {
    gsap.fromTo(leaves.current!.rotation, { y: 0.35, z: 0.08 }, { y: 0, z: 0, duration: 1.3, ease: 'elastic.out(1.1, 0.25)' })
  })
  return (
    <group>
      <mesh position={[0, 0.17, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.17, 0.13, 0.34, 18]} />
        <Toon color={PALETTE.rust} />
      </mesh>
      <mesh position={[0, 0.34, 0]}>
        <cylinderGeometry args={[0.19, 0.19, 0.05, 18]} />
        <Toon color={PALETTE.rust} />
      </mesh>
      <mesh position={[0, 0.355, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.02, 16]} />
        <Toon color={PALETTE.bg} />
      </mesh>
      <group ref={leaves} position={[0, 0.36, 0]}>
        {LEAVES.map((l, i) => (
          <group key={i} rotation={[0, l.a, 0]}>
            <group rotation={[l.tilt, 0, 0]}>
              <mesh position={[0, l.len / 2, 0]} scale={[0.07, l.len / 2, 0.022]} castShadow>
                <sphereGeometry args={[1, 10, 8]} />
                <Toon color={l.color} />
              </mesh>
            </group>
          </group>
        ))}
      </group>
    </group>
  )
}
