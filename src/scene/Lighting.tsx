import { PALETTE, LIGHT } from '../theme/palette'
import PendantLamp from './parts/PendantLamp'
import { useApp } from '../store/useApp'

/**
 * Warm tungsten pool from the pendant (shadow caster) + very low cool-green
 * ambient so shadows stay tinted charcoal-green instead of dead black.
 */
export default function Lighting() {
  const lightsOn = useApp((s) => s.lightsOn)
  return (
    <>
      <hemisphereLight args={[PALETTE.wall, PALETTE.bg, lightsOn ? 2.3 : 0.35]} />
      <ambientLight color={LIGHT.tungsten} intensity={lightsOn ? 0.7 : 0.1} />
      {/* soft shadowless wall wash from the viewer's side */}
      <directionalLight position={[5, 4, 7]} color={LIGHT.tungsten} intensity={lightsOn ? 0.9 : 0.05} />
      <PendantLamp />
    </>
  )
}
