import { EffectComposer, Bloom, Noise, Vignette, Outline } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

/**
 * Bloom threshold sits at 1.0: lit/painted surfaces stay below it, only
 * `<Glow>` materials (screens, bulbs) exceed it. Grain + vignette are subtle.
 * `low` trims the expensive parts on slow GPUs.
 */
export default function Effects({ low = false }: { low?: boolean }) {
  return (
    <EffectComposer multisampling={low ? 0 : 2} autoClear={false}>
      {/* soft cream outline on whatever <Interactive> is hovered */}
      <Outline blur={!low} edgeStrength={3} visibleEdgeColor={0xefe3c8} hiddenEdgeColor={0x34463c} width={low ? 600 : 900} />
      <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.15} intensity={0.55} radius={0.7} levels={low ? 4 : 6} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.18} />
      <Vignette eskil={false} offset={0.22} darkness={0.7} />
    </EffectComposer>
  )
}
