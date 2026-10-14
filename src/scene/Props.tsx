import { Sparkles } from '@react-three/drei'
import { PALETTE, LIGHT } from '../theme/palette'
import { ROOM, SCREEN_CENTER } from '../config/camera'
import { useApp } from '../store/useApp'
import Interactive from './Interactive'
import ClawMachine from './parts/ClawMachine'
import Jukebox from './parts/Jukebox'
import Cat from './parts/Cat'
import WallClock from './parts/WallClock'
import NightWindow from './parts/NightWindow'
import CorkBoard from './parts/CorkBoard'
import OpenSign from './parts/OpenSign'
import Plant from './parts/Plant'
import LightSwitch from './parts/LightSwitch'

const BACK = -ROOM.d / 2 // back wall surface
const LEFT = -ROOM.w / 2 // left wall surface
const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const FACE_RIGHT: [number, number, number] = [0, Math.PI / 2, 0] // for things on the left wall

/** Every prop in the room besides the three cabinets. */
export default function Props() {
  const view = useApp((s) => s.view)
  const on = view === 'room'
  return (
    <group>
      {/* back wall */}
      <group position={[-1.8, 2.72, BACK + 0.035]}>
        <Interactive id="clock" enabled={on} lift={0}>
          <WallClock />
        </Interactive>
      </group>
      <Interactive id="window" enabled={on} lift={0}>
        <NightWindow wallZ={BACK} />
      </Interactive>
      <group position={[-2.95, 1.7, BACK + 0.03]}>
        <Interactive id="cork" enabled={on} lift={0.02}>
          <CorkBoard />
        </Interactive>
      </group>

      {/* back-right corner: jukebox with the cat asleep on top */}
      <group position={[3.12, 0, BACK + 0.4]} rotation={[0, -0.22, 0]}>
        <Interactive id="jukebox" enabled={on}>
          <Jukebox />
        </Interactive>
        <group position={[-0.02, 1.4, 0.02]} rotation={[0, 0.3, 0]}>
          <Interactive id="cat" enabled={on} lift={0.02}>
            <Cat />
          </Interactive>
        </group>
      </group>

      {/* back-left corner */}
      <group position={[-3.55, 0, BACK + 0.45]}>
        <Interactive id="plant" enabled={on}>
          <Plant />
        </Interactive>
      </group>

      {/* left wall */}
      <group position={[LEFT + 0.45, 0, 0.15]} rotation={FACE_RIGHT}>
        <Interactive id="claw" enabled={on}>
          <ClawMachine />
        </Interactive>
      </group>
      <group position={[LEFT + 0.06, 2.25, -1.45]} rotation={FACE_RIGHT}>
        <Interactive id="sign" enabled={on} lift={0}>
          <OpenSign />
        </Interactive>
      </group>
      <group position={[LEFT + 0.012, 1.25, 1.45]} rotation={FACE_RIGHT}>
        <Interactive id="switch" enabled={on} lift={0}>
          <LightSwitch />
        </Interactive>
      </group>

      {/* ambient life: dust drifting in the lamp light */}
      {!reduceMotion && <Sparkles count={70} scale={[2.6, 2.6, 2.6]} position={[0.2, 1.7, 0.4]} size={1.6} speed={0.18} opacity={0.5} color={PALETTE.cream} noise={0.6} />}
      {/* EMIR-1's screen spills a little amber onto the floor — most visible with the lights off */}
      <pointLight position={[SCREEN_CENTER.x, SCREEN_CENTER.y - 0.2, SCREEN_CENTER.z + 0.6]} color={LIGHT.phosphor} intensity={0.9} distance={3.2} decay={2} />
    </group>
  )
}
