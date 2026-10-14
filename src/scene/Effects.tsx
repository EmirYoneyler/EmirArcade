import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

/**
 * Bloom threshold sits at 1.0: lit/painted surfaces stay below it, only
 * `<Glow>` materials (screens, bulbs) exceed it. Grain + vignette are subtle.
 */
export default function Effects() {
  return (
    <EffectComposer multisampling={2}>
      <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.15} intensity={0.55} radius={0.7} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.18} />
      <Vignette eskil={false} offset={0.22} darkness={0.7} />
    </EffectComposer>
  )
}
