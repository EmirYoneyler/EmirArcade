import { useEffect, useMemo } from 'react'
import { CanvasTexture, ExtrudeGeometry, SRGBColorSpace } from 'three'
import { RoundedBox } from '@react-three/drei'
import { PALETTE, LIGHT } from '../../theme/palette'
import { Toon, Glow } from '../materials/toon'
import CrtScreen from '../crt/CrtScreen'
import type { ProgramName } from '../crt/registry'
import { PROFILE, ANCHORS, RECESS, offsetPolygon, toShape } from '../geometry/cabinetProfile'

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
      <mesh position={[0.007, 0.1, 0]} castShadow>
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
 * Upright arcade cabinet built from primitives. Origin = floor, centered,
 * facing +z. Swap this component for a .glb later; keep the same props.
 */
export default function Cabinet({ paint, title, program, width = 1.04, twoPlayer = false, screenRes, screenFps, screenPixelScale, onScreen }: Props) {
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
        {twoPlayer ? (
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
