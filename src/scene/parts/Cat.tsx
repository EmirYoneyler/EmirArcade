import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import gsap from 'gsap'
import type { Group, Sprite, SpriteMaterial } from 'three'
import { PALETTE } from '../../theme/palette'
import { Toon } from '../materials/toon'
import { useCanvasTexture, pixelFont } from '../materials/canvasTexture'
import { usePulse } from '../usePulse'

/** Kernel — a ginger cat curled up asleep. Click: tail wag + ear twitch. */
export default function Cat() {
  const tail = useRef<Group>(null)
  const ear = useRef<Group>(null)
  const body = useRef<Group>(null)
  const zs = useRef<(Sprite | null)[]>([])
  const wag = useMemo(() => ({ amp: 0, t: 0 }), [])

  const zTex = useCanvasTexture(32, 32, (ctx) => {
    ctx.fillStyle = PALETTE.cream
    ctx.font = pixelFont(24, true)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('z', 16, 16)
  })

  usePulse('cat', () => {
    gsap.fromTo(wag, { amp: 0.9 }, { amp: 0, duration: 2.4, ease: 'power2.out' })
    gsap.fromTo(ear.current!.rotation, { z: 0.5 }, { z: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' })
  })

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    wag.t += dt
    // slow breathing; tail sways gently, wags hard after a click
    body.current!.scale.y = 1 + Math.sin(t * 1.6) * 0.035
    tail.current!.rotation.y = Math.sin(t * 0.7) * 0.12 + Math.sin(wag.t * 14) * wag.amp
    zs.current.forEach((z, i) => {
      if (!z) return
      const k = (t * 0.35 + i / 3) % 1
      z.position.set(0.14 + k * 0.1, 0.16 + k * 0.28, 0)
      z.scale.setScalar(0.04 + k * 0.05)
      ;(z.material as SpriteMaterial).opacity = Math.sin(k * Math.PI) * 0.85
    })
  })

  return (
    <group>
      <group ref={body}>
        {/* curled body */}
        <mesh scale={[1.25, 0.62, 0.95]} position={[0, 0.07, 0]} castShadow>
          <sphereGeometry args={[0.13, 18, 12]} />
          <Toon color={PALETTE.mustard} />
        </mesh>
        {/* head tucked on the front-right */}
        <group position={[0.13, 0.08, 0.06]}>
          <mesh>
            <sphereGeometry args={[0.072, 16, 12]} />
            <Toon color={PALETTE.mustard} />
          </mesh>
          {/* muzzle */}
          <mesh position={[0.03, -0.02, 0.05]} scale={[1, 0.7, 0.8]}>
            <sphereGeometry args={[0.03, 10, 8]} />
            <Toon color={PALETTE.cream} />
          </mesh>
          {/* closed eyes */}
          {[-0.022, 0.035].map((x) => (
            <mesh key={x} position={[x, 0.012, 0.066]} rotation={[0, 0, 0.1]}>
              <boxGeometry args={[0.022, 0.005, 0.005]} />
              <Toon color={PALETTE.bg} />
            </mesh>
          ))}
          <mesh position={[-0.03, 0.06, 0]} rotation={[0, 0, 0.35]}>
            <coneGeometry args={[0.026, 0.05, 4]} />
            <Toon color={PALETTE.woodLight} />
          </mesh>
          <group ref={ear} position={[0.035, 0.058, 0]}>
            <mesh rotation={[0, 0, -0.35]}>
              <coneGeometry args={[0.026, 0.05, 4]} />
              <Toon color={PALETTE.woodLight} />
            </mesh>
          </group>
        </group>
        {/* stripes */}
        {[-0.07, 0, 0.07].map((x) => (
          <mesh key={x} position={[x, 0.142, 0]} scale={[0.25, 0.06, 1]}>
            <sphereGeometry args={[0.1, 10, 6]} />
            <Toon color={PALETTE.woodLight} />
          </mesh>
        ))}
      </group>
      {/* tail wraps around the front, pivoting at the rump */}
      <group ref={tail} position={[-0.14, 0.04, 0.02]}>
        {Array.from({ length: 6 }, (_, i) => {
          const a = 0.3 + i * 0.32
          return (
            <mesh key={i} position={[Math.cos(a) * 0.12, 0, Math.sin(a) * 0.12]}>
              <sphereGeometry args={[0.032 - i * 0.002, 10, 8]} />
              <Toon color={i === 5 ? PALETTE.cream : PALETTE.mustard} />
            </mesh>
          )
        })}
      </group>
      {[0, 1, 2].map((i) => (
        <sprite key={i} ref={(s) => void (zs.current[i] = s)}>
          <spriteMaterial map={zTex} transparent depthWrite={false} />
        </sprite>
      ))}
    </group>
  )
}
