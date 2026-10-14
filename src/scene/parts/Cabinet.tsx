import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, ExtrudeGeometry, SRGBColorSpace, type Group, type Mesh } from 'three'
import { RoundedBox } from '@react-three/drei'
import { PALETTE, LIGHT } from '../../theme/palette'
import { Toon, Glow } from '../materials/toon'
import CrtScreen from '../crt/CrtScreen'
import type { ProgramName } from '../crt/registry'
import { PROFILE, ANCHORS, RECESS, offsetPolygon, toShape } from '../geometry/cabinetProfile'
import { DECK_LOCAL_X } from '../../config/camera'
import { tapeState } from '../tapeState'

export type CabinetPaint = {
  side: string // side panels
  molding: string // T-molding edge trim
  body: string // recessed front faces
  stripes: [string, string, string]
}

type Props = {
  paint: CabinetPaint
  title: string
  program: ProgramName
  width?: number
  twoPlayer?: boolean
  /** built-in cassette deck on the right of the control panel (EMIR-1) */
  deck?: boolean
  screenRes?: [number, number]
  screenFps?: number
  screenPixelScale?: number
  onScreen?: (type: 'move' | 'click' | 'leave', x: number, y: number) => void
}

const PANEL_T = 0.05
const SCREEN_W = 0.58
const SCREEN_H = 0.435

/** Shared geometry: every cabinet uses the same silhouette. */
let geoCache: { panel: ExtrudeGeometry; molding: ExtrudeGeometry } | null = null
function sharedGeo() {
  if (!geoCache) {
    const bevel = { bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2 }
    geoCache = {
      panel: new ExtrudeGeometry(toShape(PROFILE), { depth: PANEL_T, ...bevel }),
      molding: new ExtrudeGeometry(toShape(offsetPolygon(PROFILE, 0.024)), { depth: 0.022, bevelEnabled: false }),
    }
  }
  return geoCache
}

/** Lit marquee art: cream backlight, rust lettering, painted stripes. */
function useMarqueeTexture(title: string, paint: CabinetPaint) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512
    c.height = 128
    const ctx = c.getContext('2d')!
    const draw = () => {
      ctx.fillStyle = PALETTE.cream
      ctx.fillRect(0, 0, 512, 128)
      paint.stripes.forEach((col, i) => {
        ctx.fillStyle = col
        ctx.fillRect(0, 92 + i * 10, 512, 6)
      })
      ctx.fillStyle = PALETTE.bg
      ctx.font = `bold 64px Silkscreen, monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(title, 256, 50)
      t.needsUpdate = true
    }
    const t = new CanvasTexture(c)
    t.colorSpace = SRGBColorSpace
    draw()
    document.fonts?.load('bold 64px Silkscreen').then(draw)
    return t
  }, [title, paint])
  useEffect(() => () => tex.dispose(), [tex])
  return tex
}

function Joystick({ x, ball }: { x: number; ball: string }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 0.006, 0]}>
        <cylinderGeometry args={[0.045, 0.05, 0.012, 16]} />
        <Toon color={PALETTE.bg} />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation={[0, 0, 0.12]}>
        <cylinderGeometry args={[0.009, 0.009, 0.09, 8]} />
        <Toon color={PALETTE.bg} />
      </mesh>
      <mesh position={[0.007, 0.1, 0]}>
        <sphereGeometry args={[0.03, 16, 12]} />
        <Toon color={ball} />
      </mesh>
    </group>
  )
}

function Buttons({ x, colors }: { x: number; colors: string[] }) {
  return (
    <group position={[x, 0, 0]}>
      {colors.map((c, i) => (
        <mesh key={i} position={[i * 0.06, 0.01, i === 1 ? -0.02 : 0]}>
          <cylinderGeometry args={[0.02, 0.022, 0.02, 14]} />
          <Toon color={c} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * Cassette deck set into the control panel (panel-local: +y up out of the
 * panel, +z toward the player). The lid opens while a tape goes in or out;
 * the PLAY key stays down and a lamp glows while a tape is running.
 */
function TapeDeck() {
  const lid = useRef<Group>(null)
  const play = useRef<Mesh>(null)
  const lamp = useRef<Mesh>(null)
  useFrame(() => {
    lid.current!.rotation.x = -tapeState.lid * 1.15
    play.current!.position.y = tapeState.playing ? 0.05 : 0.056
    lamp.current!.visible = tapeState.playing
  })
  const W = 0.25
  const D = 0.18
  return (
    <group>
      {/* well: floor + four walls, open on top */}
      <mesh position={[0, 0.006, 0]}>
        <boxGeometry args={[W, 0.012, D]} />
        <Toon color={PALETTE.bg} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={`z${s}`} position={[0, 0.025, s * (D / 2 - 0.015)]}>
          <boxGeometry args={[W, 0.05, 0.03]} />
          <Toon color={PALETTE.bg} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={`x${s}`} position={[s * (W / 2 - 0.0175), 0.025, 0]}>
          <boxGeometry args={[0.035, 0.05, D - 0.06]} />
          <Toon color={PALETTE.bg} />
        </mesh>
      ))}
      {/* label strip on the front edge */}
      <mesh position={[-0.05, 0.0505, D / 2 - 0.015]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.1, 0.016]} />
        <Toon color={PALETTE.mustard} />
      </mesh>
      {/* piano keys: REW · PLAY · EJECT */}
      {[0.035, 0.07, 0.105].map((x, i) => (
        <mesh key={x} ref={i === 1 ? play : undefined} position={[x - 0.02, 0.056, D / 2 - 0.015]}>
          <boxGeometry args={[0.028, 0.012, 0.024]} />
          <Toon color={i === 1 ? PALETTE.rust : PALETTE.cream} />
        </mesh>
      ))}
      <mesh ref={lamp} position={[0.105, 0.051, D / 2 - 0.035]}>
        <sphereGeometry args={[0.006, 8, 6]} />
        <Glow color={PALETTE.amber} strength={2.4} />
      </mesh>
      {/* lid hinged at the back edge, smoked window so the tape shows */}
      <group ref={lid} position={[0, 0.051, -(D / 2 - 0.03)]}>
        <group position={[0, 0.004, (D - 0.06) / 2]}>
          {[-1, 1].map((s) => (
            <mesh key={`lz${s}`} position={[0, 0, s * ((D - 0.06) / 2 - 0.008)]}>
              <boxGeometry args={[W - 0.07, 0.008, 0.016]} />
              <Toon color={PALETTE.trim} />
            </mesh>
          ))}
          {[-1, 1].map((s) => (
            <mesh key={`lx${s}`} position={[s * ((W - 0.07) / 2 - 0.008), 0, 0]}>
              <boxGeometry args={[0.016, 0.008, D - 0.06]} />
              <Toon color={PALETTE.trim} />
            </mesh>
          ))}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[W - 0.09, D - 0.08]} />
            <meshBasicMaterial color={PALETTE.bg} transparent opacity={0.35} depthWrite={false} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

/**
 * Upright arcade cabinet built from primitives. Origin = floor, centered,
 * facing +z. Swap this component for a .glb later; keep the same props.
 */
export default function Cabinet({ paint, title, program, width = 1.04, twoPlayer = false, deck = false, screenRes, screenFps, screenPixelScale, onScreen }: Props) {
  const geo = sharedGeo()
  const marquee = useMarqueeTexture(title, paint)
  const W = width
  const inner = W - PANEL_T * 2
  const body = useMemo(
    () => new ExtrudeGeometry(toShape(PROFILE), { depth: inner, bevelEnabled: false }),
    [inner],
  )
  useEffect(() => () => body.dispose(), [body])

  const { screen: S, marquee: M, lights: L, panel: P, front: F } = ANCHORS
  const buttonColors = [PALETTE.mustard, PALETTE.cream, PALETTE.teal]

  return (
    <group>
      {/* extrusions live in profile space: x=forward, z=across → rotate onto world */}
      <group rotation={[0, -Math.PI / 2, 0]}>
        <mesh geometry={geo.panel} position={[0, 0, W / 2 - PANEL_T]} castShadow receiveShadow>
          <Toon color={paint.side} />
        </mesh>
        <mesh geometry={geo.panel} position={[0, 0, -W / 2]} castShadow receiveShadow>
          <Toon color={paint.side} />
        </mesh>
        <mesh geometry={geo.molding} position={[0, 0, W / 2 - PANEL_T / 2 - 0.011]}>
          <Toon color={paint.molding} />
        </mesh>
        <mesh geometry={geo.molding} position={[0, 0, -W / 2 + PANEL_T / 2 - 0.011]}>
          <Toon color={paint.molding} />
        </mesh>
        <mesh geometry={body} position={[-RECESS, 0, -inner / 2]} castShadow receiveShadow>
          <Toon color={paint.body} />
        </mesh>
      </group>

      {/* side art: three painted stripes on each outer face */}
      {[-1, 1].map((side) =>
        paint.stripes.map((c, i) => (
          <mesh
            key={`${side}${i}`}
            position={[side * (W / 2 + 0.013), 0.42 + i * 0.09, -0.06]}
            rotation={[0.5, (side * Math.PI) / 2, 0]}
          >
            <planeGeometry args={[0.95, 0.05]} />
            <Toon color={c} />
          </mesh>
        )),
      )}

      {/* screen: dark bezel + CRT */}
      <group position={[0, S.y, S.z]} rotation={[-S.tilt, 0, 0]}>
        <mesh position={[0, 0, 0.002]}>
          <planeGeometry args={[inner - 0.02, S.len - 0.02]} />
          <Toon color={PALETTE.bg} />
        </mesh>
        <group position={[0, 0, 0.008]}>
          <CrtScreen
            program={program}
            width={SCREEN_W}
            height={SCREEN_H}
            res={screenRes}
            fps={screenFps}
            pixelScale={screenPixelScale}
            onPointer={onScreen}
          />
        </group>
      </group>

      {/* marquee */}
      <mesh position={[0, M.y, M.z + 0.004]} rotation={[-M.tilt, 0, 0]}>
        <planeGeometry args={[inner, M.len - 0.03]} />
        <meshBasicMaterial map={marquee} toneMapped={false} color={[1.08, 1.08, 1.08]} />
      </mesh>

      {/* three round lights under the marquee overhang */}
      <group position={[0, L.y, L.z]} rotation={[-L.tilt, 0, 0]}>
        {[-0.28, 0, 0.28].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.004]}>
              <cylinderGeometry args={[0.045, 0.045, 0.012, 18]} />
              <Toon color={paint.molding} />
            </mesh>
            <mesh position={[0, 0, 0.012]} scale={[1, 1, 0.45]}>
              <sphereGeometry args={[0.032, 14, 10]} />
              <Glow color={LIGHT.tungsten} strength={1.8} />
            </mesh>
          </group>
        ))}
      </group>

      {/* control panel */}
      <group position={[0, P.y + 0.004, P.z]} rotation={[Math.PI / 2 - P.tilt, 0, 0]}>
        {deck ? (
          <>
            <Joystick x={-0.3} ball={PALETTE.rust} />
            <Buttons x={-0.18} colors={buttonColors} />
            <group position={[DECK_LOCAL_X, 0, 0]}>
              <TapeDeck />
            </group>
          </>
        ) : twoPlayer ? (
          <>
            <Joystick x={-0.36} ball={PALETTE.rust} />
            <Buttons x={-0.24} colors={buttonColors} />
            <Joystick x={0.08} ball={PALETTE.teal} />
            <Buttons x={0.2} colors={buttonColors} />
          </>
        ) : (
          <>
            <Joystick x={-0.16} ball={paint.molding} />
            <Buttons x={-0.02} colors={buttonColors} />
          </>
        )}
      </group>

      {/* coin door */}
      <group position={[0, 0.5, F.z]}>
        <RoundedBox args={[0.34, 0.34, 0.03]} radius={0.012} smoothness={2} position={[0, 0, 0.01]}>
          <Toon color={PALETTE.bg} />
        </RoundedBox>
        {[-0.07, 0.07].map((x) => (
          <group key={x} position={[x, 0.06, 0.028]}>
            <mesh>
              <planeGeometry args={[0.06, 0.1]} />
              <Toon color={paint.molding} />
            </mesh>
            <mesh position={[0, 0, 0.002]}>
              <planeGeometry args={[0.012, 0.05]} />
              <Glow color={PALETTE.amber} strength={1.4} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, -0.09, 0.028]}>
          <planeGeometry args={[0.2, 0.04]} />
          <Toon color={paint.molding} />
        </mesh>
      </group>

      {/* kick plate */}
      <mesh position={[0, 0.05, F.z + 0.01]}>
        <boxGeometry args={[inner, 0.1, 0.02]} />
        <Toon color={PALETTE.bg} />
      </mesh>
    </group>
  )
}
