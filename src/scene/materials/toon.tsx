import { useMemo } from 'react'
import { Color, DataTexture, NearestFilter, RedFormat } from 'three'
import { GLOW } from '../../theme/palette'

/** 3-step ramp gives the flat, chunky cel look. Shared by every toon material. */
let ramp: DataTexture | null = null
export function getToonRamp() {
  if (!ramp) {
    ramp = new DataTexture(new Uint8Array([90, 170, 255]), 3, 1, RedFormat)
    ramp.minFilter = ramp.magFilter = NearestFilter
    ramp.generateMipmaps = false
    ramp.needsUpdate = true
  }
  return ramp
}

/** Standard lit toon surface. Use as a child of any mesh. */
export function Toon({ color }: { color: string }) {
  return <meshToonMaterial color={color} gradientMap={getToonRamp()} />
}

/**
 * Self-lit surface for bulbs & CRT glass. The color is pushed past 1.0 and
 * toneMapped=false, so ONLY these cross the bloom threshold.
 */
export function Glow({ color, strength = GLOW }: { color: string; strength?: number }) {
  const c = useMemo(() => new Color(color).multiplyScalar(strength), [color, strength])
  return <meshBasicMaterial color={c} toneMapped={false} />
}
