import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import gsap from 'gsap'
import type { Group, Mesh } from 'three'
import { PALETTE, LIGHT } from '../../theme/palette'
import type { Skill } from '../../data/content'
import { Toon } from '../materials/toon'
import { useCanvasTexture, pixelFont } from '../materials/canvasTexture'
import { usePulse } from '../usePulse'
import { clawResult } from '../actions'
import { sfx } from '../../audio/sfx'

const W = 0.86
const D = 0.8
const FLOOR = 0.81 // inside floor height
const RAIL = 1.58 // carriage height
const CHUTE = { x: 0.27, z: 0.24 }

/** One plush per skill. Colors from the palette; tags carry the name. */
const PLUSH: { skill: Skill; color: string; ear: string; tag: string; at: [number, number] }[] = [
  { skill: 'Go', color: PALETTE.teal, ear: PALETTE.cream, tag: 'GO', at: [-0.26, -0.22] },
  { skill: 'Java', color: PALETTE.rust, ear: PALETTE.woodDark, tag: 'JAVA', at: [0.0, -0.24] },
  { skill: 'Python', color: PALETTE.mustard, ear: PALETTE.teal, tag: 'PY', at: [0.25, -0.2] },
  { skill: 'React', color: PALETTE.cream, ear: PALETTE.teal, tag: 'REACT', at: [-0.24, 0.04] },
  { skill: 'PostgreSQL', color: PALETTE.woodLight, ear: PALETTE.cream, tag: 'SQL', at: [-0.01, 0.06] },
  { skill: 'Docker', color: PALETTE.wall, ear: PALETTE.mustard, tag: 'DOCKER', at: [-0.22, 0.28] },
]

function Tag({ text }: { text: string }) {
  const tex = useCanvasTexture(128, 64, (ctx, w, h) => {
    ctx.fillStyle = PALETTE.cream
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = PALETTE.bg
    ctx.font = pixelFont(text.length > 4 ? 22 : 30, true)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, w / 2, h / 2 + 2)
  }, [text])
  return (
    <mesh position={[0, -0.02, 0.078]}>
      <planeGeometry args={[0.07, 0.035]} />
      <meshBasicMaterial map={tex} />
    </mesh>
  )
}

function Plush({ color, ear, tag }: { color: string; ear: string; tag: string }) {
  return (
    <group>
      <mesh scale={[1, 0.92, 0.85]}>
        <sphereGeometry args={[0.085, 16, 12]} />
        <Toon color={color} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.055, 0.07, 0]}>
          <sphereGeometry args={[0.028, 10, 8]} />
          <Toon color={ear} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={`e${s}`} position={[s * 0.026, 0.022, 0.07]}>
          <sphereGeometry args={[0.009, 8, 6]} />
          <Toon color={PALETTE.bg} />
        </mesh>
      ))}
      <Tag text={tag} />
    </group>
  )
}

/** Glass-box claw machine. Every pull grabs a random skill plush. */
export default function ClawMachine() {
  const carriage = useRef<Group>(null)
  const bar = useRef<Group>(null)
  const cable = useRef<Mesh>(null)
  const head = useRef<Group>(null)
  const prongs = useRef<(Group | null)[]>([])
  const plushRefs = useRef<(Group | null)[]>([])
  const st = useMemo(() => ({ x: 0, z: -0.05, drop: 0, open: 1, grabbed: -1, busy: false }), [])
  const plushState = useMemo(() => PLUSH.map(() => ({ y: 0, s: 1 })), [])

  const marquee = useCanvasTexture(256, 64, (ctx, w, h) => {
    ctx.fillStyle = PALETTE.cream
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = PALETTE.rust
    ctx.font = pixelFont(36, true)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('CLAW', w / 2, h / 2 - 2)
    ctx.fillStyle = PALETTE.teal
    ctx.fillRect(0, h - 8, w, 4)
  })

  usePulse('claw', () => {
    if (st.busy) return
    st.busy = true
    const i = Math.floor(Math.random() * PLUSH.length)
    const [px, pz] = PLUSH[i].at
    const grabDrop = RAIL - 0.13 - (FLOOR + 0.16)
    gsap
      .timeline({ onComplete: () => void (st.busy = false) })
      .to(st, { x: px, z: pz, duration: 0.7, ease: 'power2.inOut' })
      .to(st, { open: 1, duration: 0.1 }, '<')
      .to(st, { drop: grabDrop, duration: 0.55, ease: 'power1.in' })
      .to(st, { open: 0, duration: 0.18, onComplete: () => void (st.grabbed = i) })
      .to(st, { drop: 0, duration: 0.55, ease: 'power1.out' })
      .to(st, { x: CHUTE.x, z: CHUTE.z, duration: 0.7, ease: 'power2.inOut' })
      .to(st, {
        open: 1,
        duration: 0.12,
        onComplete: () => {
          st.grabbed = -1
          sfx('drop')
          clawResult(PLUSH[i].skill)
          const p = plushState[i]
          // falls through the chute, then pops back on its spot
          gsap.timeline()
            .set(p, { y: RAIL - 0.2 - FLOOR - 0.09 })
            .to(p, { y: -0.4, s: 0.6, duration: 0.35, ease: 'power2.in' })
            .set(p, { s: 0, y: 0 })
            .to(p, { s: 1, duration: 0.35, ease: 'back.out(3)', delay: 1.2, onStart: () => sfx('pop') })
        },
      })
      .to(st, { x: 0, z: -0.05, duration: 0.6, ease: 'power2.inOut' })
  })

  useFrame(() => {
    bar.current!.position.z = st.z
    carriage.current!.position.set(st.x, RAIL, st.z)
    cable.current!.scale.y = 0.04 + st.drop
    cable.current!.position.y = -(0.04 + st.drop) / 2
    head.current!.position.y = -0.05 - st.drop
    // positive tilt closes the prongs inward, negative splays them out
    prongs.current.forEach((p) => p && (p.rotation.x = 0.2 - st.open * 0.65))
    PLUSH.forEach((pl, i) => {
      const g = plushRefs.current[i]
      if (!g) return
      if (st.grabbed === i) {
        g.position.set(st.x, RAIL - 0.2 - st.drop, st.z)
        g.scale.setScalar(1)
      } else {
        const p = plushState[i]
        const inChute = p.y !== 0
        g.position.set(inChute ? CHUTE.x : pl.at[0], FLOOR + 0.075 + p.y, inChute ? CHUTE.z : pl.at[1])
        g.scale.setScalar(p.s)
      }
    })
  })

  const glass = <meshBasicMaterial color={PALETTE.cream} transparent opacity={0.07} depthWrite={false} />

  return (
    <group>
      {/* base */}
      <RoundedBox args={[W, 0.8, D]} radius={0.03} smoothness={2} position={[0, 0.4, 0]} castShadow receiveShadow>
        <Toon color={PALETTE.teal} />
      </RoundedBox>
      <mesh position={[0, 0.66, D / 2 + 0.002]}>
        <planeGeometry args={[W - 0.06, 0.05]} />
        <Toon color={PALETTE.mustard} />
      </mesh>
      {/* prize door */}
      <mesh position={[CHUTE.x, 0.3, D / 2 + 0.003]}>
        <planeGeometry args={[0.22, 0.2]} />
        <Toon color={PALETTE.bg} />
      </mesh>
      <mesh position={[CHUTE.x, 0.39, D / 2 + 0.006]}>
        <planeGeometry args={[0.22, 0.025]} />
        <Toon color={PALETTE.cream} />
      </mesh>
      {/* coin slot */}
      <mesh position={[-0.24, 0.42, D / 2 + 0.004]}>
        <planeGeometry args={[0.08, 0.12]} />
        <Toon color={PALETTE.mustard} />
      </mesh>

      {/* inside floor + chute walls */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR, 0]} receiveShadow>
        <planeGeometry args={[W - 0.04, D - 0.04]} />
        <Toon color={PALETTE.bg} />
      </mesh>
      <mesh position={[CHUTE.x - 0.11, FLOOR + 0.07, CHUTE.z]}>
        <boxGeometry args={[0.012, 0.14, 0.24]} />
        <Toon color={PALETTE.cream} />
      </mesh>
      <mesh position={[CHUTE.x, FLOOR + 0.07, CHUTE.z - 0.12]}>
        <boxGeometry args={[0.22, 0.14, 0.012]} />
        <Toon color={PALETTE.cream} />
      </mesh>

      {/* corner posts + glass */}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[sx * (W / 2 - 0.022), 1.235, sz * (D / 2 - 0.022)]}>
            <boxGeometry args={[0.044, 0.85, 0.044]} />
            <Toon color={PALETTE.mustard} />
          </mesh>
        )),
      )}
      <mesh position={[0, 1.235, D / 2 - 0.01]}>
        <planeGeometry args={[W, 0.85]} />
        {glass}
      </mesh>
      <mesh position={[W / 2 - 0.01, 1.235, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[D, 0.85]} />
        {glass}
      </mesh>
      <mesh position={[-W / 2 + 0.01, 1.235, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[D, 0.85]} />
        {glass}
      </mesh>

      {/* lit display case, like the real thing */}
      <pointLight position={[0, 1.55, 0.1]} color={LIGHT.tungsten} intensity={0.7} distance={1.3} decay={2} />

      {/* top box + marquee */}
      <RoundedBox args={[W, 0.24, D]} radius={0.03} smoothness={2} position={[0, 1.78, 0]} castShadow>
        <Toon color={PALETTE.teal} />
      </RoundedBox>
      <mesh position={[0, 1.78, D / 2 + 0.004]}>
        <planeGeometry args={[W - 0.12, 0.16]} />
        <meshBasicMaterial map={marquee} toneMapped={false} color={[1.08, 1.08, 1.08]} />
      </mesh>

      {/* gantry: bar moves in z, carriage moves in x along it */}
      <group ref={bar} position={[0, RAIL + 0.03, 0]}>
        <mesh>
          <boxGeometry args={[W - 0.06, 0.025, 0.03]} />
          <Toon color={PALETTE.woodDark} />
        </mesh>
      </group>
      <group ref={carriage}>
        <mesh>
          <boxGeometry args={[0.07, 0.04, 0.07]} />
          <Toon color={PALETTE.woodDark} />
        </mesh>
        <mesh ref={cable}>
          <cylinderGeometry args={[0.004, 0.004, 1, 6]} />
          <Toon color={PALETTE.bg} />
        </mesh>
        <group ref={head}>
          <mesh>
            <cylinderGeometry args={[0.03, 0.035, 0.05, 12]} />
            <Toon color={PALETTE.cream} />
          </mesh>
          {[0, 1, 2].map((k) => (
            <group key={k} rotation={[0, (k * Math.PI * 2) / 3, 0]}>
              <group position={[0, -0.02, 0.028]} ref={(g) => void (prongs.current[k] = g)}>
                <mesh position={[0, -0.05, 0]}>
                  <boxGeometry args={[0.012, 0.1, 0.012]} />
                  <Toon color={PALETTE.cream} />
                </mesh>
              </group>
            </group>
          ))}
        </group>
      </group>

      {PLUSH.map((p, i) => (
        <group key={p.skill} ref={(g) => void (plushRefs.current[i] = g)} rotation={[0, (i - 2.5) * 0.25, 0]}>
          <Plush color={p.color} ear={p.ear} tag={p.tag} />
        </group>
      ))}
    </group>
  )
}
