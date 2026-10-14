import { PALETTE } from '../theme/palette'
import { CABINET_SCALE, MAIN_CABINET, STAGE_HEIGHT } from '../config/camera'
import { Toon } from './materials/toon'
import Cabinet, { type CabinetPaint } from './parts/Cabinet'
import Tapes from './parts/Tapes'
import Interactive from './Interactive'
import { useApp, type View } from '../store/useApp'
import { screenPointer } from './crt/games'
import type { ProgramName } from './crt/registry'

/** What EMIR-1's screen shows in each view. */
const MAIN_PROGRAM: Record<View, ProgramName> = {
  room: 'attract',
  cabinet: 'game',
  loading: 'loading',
  project: 'loading',
}

const MAIN: CabinetPaint = {
  side: PALETTE.rust,
  molding: PALETTE.cream,
  body: PALETTE.woodDark,
  stripes: [PALETTE.mustard, PALETTE.cream, PALETTE.teal],
}

/** EMIR-1 — the one machine in the room — and the tape rack beside it. */
export default function Arcade() {
  const view = useApp((s) => s.view)
  return (
    <group>
      {/* octagonal stage: says "this is the one" from across the room */}
      <group position={[MAIN_CABINET.x, 0, MAIN_CABINET.z + 0.15]}>
        <mesh position={[0, STAGE_HEIGHT / 2, 0]} rotation={[0, Math.PI / 8, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[1.0, 1.04, STAGE_HEIGHT, 8]} />
          <Toon color={PALETTE.woodDark} />
        </mesh>
        <mesh position={[0, STAGE_HEIGHT + 0.004, 0]} rotation={[0, Math.PI / 8, 0]} receiveShadow>
          <cylinderGeometry args={[0.98, 0.98, 0.008, 8]} />
          <Toon color={PALETTE.woodLight} />
        </mesh>
        <mesh position={[0, STAGE_HEIGHT - 0.012, 0]} rotation={[0, Math.PI / 8, 0]}>
          <cylinderGeometry args={[1.045, 1.045, 0.016, 8]} />
          <Toon color={PALETTE.trim} />
        </mesh>
      </group>
      <group position={MAIN_CABINET.toArray()} scale={CABINET_SCALE}>
        <Interactive id="emir1" enabled={view === 'room'}>
          <Cabinet
            paint={MAIN}
            title="EMIR-1"
            program={MAIN_PROGRAM[view]}
            width={1.08}
            deck
            screenRes={[640, 480]}
            screenPixelScale={2}
            screenFps={view === 'cabinet' ? 60 : view === 'room' ? 20 : 30}
            onScreen={screenPointer}
          />
        </Interactive>
      </group>
      <Tapes />
    </group>
  )
}
