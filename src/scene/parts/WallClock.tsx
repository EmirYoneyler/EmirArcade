import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import gsap from 'gsap'
import type { Group } from 'three'
import { PALETTE } from '../../theme/palette'
import { Toon } from '../materials/toon'
import { istanbulTime } from '../actions'
import { usePulse } from '../usePulse'

/** Wall clock showing live Istanbul time. Faces +z, centre at origin. */
export default function WallClock() {
  const hour = useRef<Group>(null)
  const minute = useRef<Group>(null)
  const second = useRef<Group>(null)
  const wobble = useRef<Group>(null)
  const last = useRef(-1)

  usePulse('clock', () => {
    gsap.fromTo(wobble.current!.rotation, { z: 0.18 }, { z: 0, duration: 1.1, ease: 'elastic.out(1.2, 0.25)' })
  })

  useFrame(() => {
    const { h, m, s } = istanbulTime()
    if (s === last.current) return
    last.current = s
    // clockwise = negative z rotation when facing +z
    hour.current!.rotation.z = -(((h % 12) + m / 60) / 12) * Math.PI * 2
    minute.current!.rotation.z = -((m + s / 60) / 60) * Math.PI * 2
    second.current!.rotation.z = -(s / 60) * Math.PI * 2
  })

  return (
    <group ref={wobble}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.27, 0.27, 0.06, 36]} />
        <Toon color={PALETTE.woodDark} />
      </mesh>
      <mesh position={[0, 0, 0.031]}>
        <circleGeometry args={[0.235, 36]} />
        <Toon color={PALETTE.cream} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2
        const big = i % 3 === 0
        return (
          <mesh key={i} position={[Math.sin(a) * 0.2, Math.cos(a) * 0.2, 0.034]} rotation={[0, 0, -a]}>
            <planeGeometry args={[big ? 0.018 : 0.01, big ? 0.04 : 0.025]} />
            <Toon color={PALETTE.bg} />
          </mesh>
        )
      })}
      <group ref={hour} position={[0, 0, 0.038]}>
        <mesh position={[0, 0.055, 0]}>
          <planeGeometry args={[0.022, 0.12]} />
          <Toon color={PALETTE.bg} />
        </mesh>
      </group>
      <group ref={minute} position={[0, 0, 0.041]}>
        <mesh position={[0, 0.08, 0]}>
          <planeGeometry args={[0.014, 0.17]} />
          <Toon color={PALETTE.bg} />
        </mesh>
      </group>
      <group ref={second} position={[0, 0, 0.044]}>
        <mesh position={[0, 0.07, 0]}>
          <planeGeometry args={[0.005, 0.18]} />
          <Toon color={PALETTE.rust} />
        </mesh>
      </group>
      <mesh position={[0, 0, 0.047]}>
        <circleGeometry args={[0.014, 12]} />
        <Toon color={PALETTE.rust} />
      </mesh>
    </group>
  )
}
