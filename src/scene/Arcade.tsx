import { PALETTE } from '../theme/palette'
import { ROOM } from '../config/camera'
import Cabinet, { type CabinetPaint } from './parts/Cabinet'
import Tapes from './parts/Tapes'
import Interactive from './Interactive'
import { useApp } from '../store/useApp'
import { chooseProject } from '../flow'
import { menuRowAt } from './crt/menu'
import type { ProgramName } from './crt/registry'
import type { View } from '../store/useApp'

const BACK = -ROOM.d / 2 + 0.55

const MAIN_PROGRAM: Record<View, ProgramName> = {
  room: 'attract',
  cabinet: 'menu',
  loading: 'loading',
  project: 'loading',
}

/** Mouse on the EMIR-1 menu: hover moves the cursor, click starts. */
function onMainScreen(type: 'move' | 'click' | 'leave', x: number, y: number) {
  const s = useApp.getState()
  if (s.view !== 'cabinet') return
  const row = menuRowAt(x, y)
  document.body.style.cursor = row >= 0 ? 'pointer' : ''
  if (row < 0) return
  if (type === 'move' && row !== s.menuIndex) s.setMenuIndex(row)
  if (type === 'click') chooseProject(row)
}

const MAIN: CabinetPaint = {
  side: PALETTE.rust,
  molding: PALETTE.cream,
  body: PALETTE.woodDark,
  stripes: [PALETTE.mustard, PALETTE.cream, PALETTE.teal],
}
const LEFT: CabinetPaint = {
  side: PALETTE.mustard,
  molding: PALETTE.woodDark,
  body: PALETTE.teal,
  stripes: [PALETTE.rust, PALETTE.cream, PALETTE.teal],
}
const RIGHT: CabinetPaint = {
  side: PALETTE.teal,
  molding: PALETTE.mustard,
  body: PALETTE.woodDark,
  stripes: [PALETTE.mustard, PALETTE.rust, PALETTE.cream],
}

/** The three cabinets against the back wall. */
export default function Arcade() {
  const view = useApp((s) => s.view)
  return (
    <group>
      <group position={[0, 0, BACK]}>
        <Interactive id="emir1" enabled={view === 'room'}>
          <Cabinet
            paint={MAIN}
            title="EMIR-1"
            program={MAIN_PROGRAM[view]}
            width={1.08}
            deck
            screenRes={[640, 480]}
            screenPixelScale={2}
            screenFps={view === 'room' ? 20 : 30}
            onScreen={onMainScreen}
          />
        </Interactive>
      </group>
      <group position={[-1.62, 0, BACK - 0.04]} rotation={[0, 0.14, 0]} scale={0.94}>
        <Interactive id="rally" enabled={view === 'room'}>
          <Cabinet paint={LEFT} title="RALLY" program="rally" width={0.92} screenFps={15} />
        </Interactive>
      </group>
      <group position={[1.62, 0, BACK - 0.04]} rotation={[0, -0.14, 0]} scale={0.94}>
        <Interactive id="patrol" enabled={view === 'room'}>
          <Cabinet paint={RIGHT} title="PATROL" program="patrol" width={0.92} screenFps={15} />
        </Interactive>
      </group>
      <Tapes />
    </group>
  )
}
