import { RoundedBox } from '@react-three/drei'
import { PALETTE } from '../../theme/palette'
import { Toon } from '../materials/toon'
import { useApp } from '../../store/useApp'

/** Wall light switch. Faces +z. The toggle flips with the room lights. */
export default function LightSwitch() {
  const on = useApp((s) => s.lightsOn)
  return (
    <group>
      {/* the switch is realistically tiny — give the cursor a bigger target */}
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[0.32, 0.42]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <RoundedBox args={[0.11, 0.17, 0.02]} radius={0.008} smoothness={2} castShadow>
        <Toon color={PALETTE.cream} />
      </RoundedBox>
      <mesh position={[0, 0, 0.018]} rotation={[on ? -0.35 : 0.35, 0, 0]}>
        <boxGeometry args={[0.035, 0.06, 0.03]} />
        <Toon color={PALETTE.trim} />
      </mesh>
    </group>
  )
}
