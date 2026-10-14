import { useMemo } from 'react'
import gsap from 'gsap'
import { Color } from 'three'
import { RoundedBox } from '@react-three/drei'
import { PALETTE, LIGHT } from '../../theme/palette'
import { Toon } from '../materials/toon'
import { useCanvasTexture, pixelFont } from '../materials/canvasTexture'
import { usePulse } from '../usePulse'

/** Back-lit "OPEN — FOR WORK" light box. Faces +z. Click: flicker + contact card. */
export default function OpenSign() {
  const tex = useCanvasTexture(512, 240, (ctx, w, h) => {
    ctx.fillStyle = PALETTE.cream
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = PALETTE.rust
    ctx.lineWidth = 8
    ctx.strokeRect(14, 14, w - 28, h - 28)
    ctx.fillStyle = PALETTE.rust
    ctx.font = pixelFont(96, true)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('OPEN', w / 2, 100)
    ctx.fillStyle = PALETTE.teal
    ctx.font = pixelFont(30, true)
    ctx.fillText('— FOR WORK —', w / 2, 178)
  })
  const glow = useMemo(() => ({ k: 1.12, color: new Color(1.12, 1.12, 1.12) }), [])

  usePulse('sign', () => {
    gsap.timeline({ onUpdate: () => void glow.color.setScalar(glow.k) })
      .to(glow, { k: 0.35, duration: 0.05 })
      .to(glow, { k: 1.2, duration: 0.05 })
      .to(glow, { k: 0.3, duration: 0.08, delay: 0.08 })
      .to(glow, { k: 1.12, duration: 0.25 })
  })

  return (
    <group>
      <RoundedBox args={[0.98, 0.5, 0.1]} radius={0.025} smoothness={2} castShadow>
        <Toon color={PALETTE.woodDark} />
      </RoundedBox>
      <mesh position={[0, 0, 0.051]}>
        <planeGeometry args={[0.9, 0.42]} />
        <meshBasicMaterial map={tex} color={glow.color} toneMapped={false} />
      </mesh>
      {/* the box throws a little warm light onto the wall around it */}
      <pointLight position={[0, 0, 0.35]} color={LIGHT.tungsten} intensity={0.6} distance={1.8} decay={2} />
    </group>
  )
}
