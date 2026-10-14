import { PALETTE } from '../theme/palette'
import { ROOM } from '../config/camera'
import Cabinet, { type CabinetPaint } from './parts/Cabinet'
import Interactive from './Interactive'
import { useApp } from '../store/useApp'
import { pressStart } from '../flow'

const BACK = -ROOM.d / 2 + 0.55

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
        <Interactive name="EMIR-1" onActivate={pressStart} enabled={view === 'room'}>
          <Cabinet paint={MAIN} title="EMIR-1" program={view === 'room' ? 'attract' : 'ready'} width={1.08} twoPlayer />
        </Interactive>
      </group>
      {/* side cabinets get their own interactions in Phase 4 */}
      <group position={[-1.62, 0, BACK - 0.04]} rotation={[0, 0.14, 0]} scale={0.94}>
        <Cabinet paint={LEFT} title="RALLY" program="rally" width={0.92} screenFps={15} />
      </group>
      <group position={[1.62, 0, BACK - 0.04]} rotation={[0, -0.14, 0]} scale={0.94}>
        <Cabinet paint={RIGHT} title="PATROL" program="patrol" width={0.92} screenFps={15} />
      </group>
    </group>
  )
}
