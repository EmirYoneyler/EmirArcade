import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { Color, type Group, type MeshBasicMaterial } from 'three'
import { PALETTE, GLOW } from '../../theme/palette'
import { Toon } from '../materials/toon'
import { useApp } from '../../store/useApp'
import { beat } from '../../audio/chiptune'
import { useCanvasTexture, pixelFont } from '../materials/canvasTexture'
import { useListening, currentTrack } from '../../data/nowPlaying'

/** Fit a line of pixel text into `max` px, shrinking then ellipsising. */
function fitText(ctx: CanvasRenderingContext2D, s: string, max: number, size: number, bold = false) {
  let px = size
  ctx.font = pixelFont(px, bold)
  while (ctx.measureText(s).width > max && px > size * 0.6) ctx.font = pixelFont((px -= 2), bold)
  let out = s
  while (ctx.measureText(out).width > max && out.length > 3) out = out.slice(0, -2) + '…'
  return out
}

/** Little amber screen on the jukebox: what Emir is listening to on YouTube Music (via Last.fm). */
function NowPlayingDisplay() {
  const listening = useListening()
  const track = currentTrack(listening)
  const live = !!listening?.nowPlaying
  const tex = useCanvasTexture(512, 132, (ctx, w, h) => {
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = PALETTE.amber
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    if (!track) {
      ctx.font = pixelFont(30, true)
      ctx.fillText('EMIR-1 JUKEBOX', w / 2, 46)
      ctx.font = pixelFont(18)
      ctx.fillText('SIDE A · CHIPTUNE', w / 2, 94)
      return
    }
    ctx.font = pixelFont(16, true)
    ctx.fillText(live ? '● NOW PLAYING' : 'LAST PLAYED', w / 2, 20)
    ctx.fillText(fitText(ctx, track.title.toUpperCase(), w - 30, 30, true), w / 2, 62)
    ctx.fillText(fitText(ctx, track.artist.toUpperCase(), w - 30, 20), w / 2, 106)
  }, [track?.title, track?.artist, live])
  return (
    <mesh position={[0, 0.735, 0.253]}>
      <planeGeometry args={[0.5, 0.13]} />
      <meshBasicMaterial map={tex} toneMapped={false} color={[1.1, 1.1, 1.1]} />
    </mesh>
  )
}

const AMBER = new Color(PALETTE.amber)
const RUST = new Color(PALETTE.rust)

/** Arched jukebox. Glowing tubes breathe when idle and pulse on the beat when playing. */
export default function Jukebox() {
  const outer = useRef<MeshBasicMaterial>(null)
  const inner = useRef<MeshBasicMaterial>(null)
  const record = useRef<Group>(null)
  const bounce = useRef<Group>(null)
  const playing = useApp((s) => s.musicOn)

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    const b = playing ? beat() : 0
    const k = playing ? 1 + b * 0.9 : 0.85 + Math.sin(t * 1.2) * 0.12
    outer.current!.color.copy(AMBER).multiplyScalar(GLOW * 0.6 * k)
    inner.current!.color.copy(RUST).multiplyScalar(GLOW * 0.75 * (playing ? 1 + (1 - b) * 0.6 : 0.9))
    if (playing) record.current!.rotation.z -= dt * 3.5
    bounce.current!.scale.y = 1 + (playing ? b * b * 0.012 : 0)
  })

  return (
    <group ref={bounce}>
      {/* plinth + body */}
      <RoundedBox args={[0.86, 0.08, 0.56]} radius={0.02} smoothness={2} position={[0, 0.04, 0]} receiveShadow>
        <Toon color={PALETTE.woodDark} />
      </RoundedBox>
      <RoundedBox args={[0.8, 0.94, 0.5]} radius={0.04} smoothness={3} position={[0, 0.55, 0]} castShadow receiveShadow>
        <Toon color={PALETTE.woodLight} />
      </RoundedBox>
      {/* arched top */}
      <mesh position={[0, 1.02, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.5, 32, 1, false, Math.PI / 2, Math.PI]} />
        <Toon color={PALETTE.woodLight} />
      </mesh>
      <mesh position={[0, 1.02, 0.251]}>
        <circleGeometry args={[0.4, 32, 0, Math.PI]} />
        <Toon color={PALETTE.woodDark} />
      </mesh>
      {/* glowing tubes following the arch */}
      <mesh position={[0, 1.02, 0.262]}>
        <torusGeometry args={[0.35, 0.026, 8, 40, Math.PI]} />
        <meshBasicMaterial ref={outer} toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.02, 0.262]}>
        <torusGeometry args={[0.26, 0.02, 8, 40, Math.PI]} />
        <meshBasicMaterial ref={inner} toneMapped={false} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.35, 0.62, 0.262]}>
          <cylinderGeometry args={[0.026, 0.026, 0.8, 8]} />
          <meshBasicMaterial color={new Color(PALETTE.amber).multiplyScalar(1.3)} toneMapped={false} />
        </mesh>
      ))}
      {/* record window with a spinning disc */}
      <mesh position={[0, 1.08, 0.255]}>
        <circleGeometry args={[0.2, 28, 0, Math.PI]} />
        <Toon color={PALETTE.bg} />
      </mesh>
      <group ref={record} position={[0, 1.1, 0.258]}>
        <mesh>
          <circleGeometry args={[0.13, 24]} />
          <Toon color={PALETTE.bg} />
        </mesh>
        <mesh position={[0, 0, 0.002]}>
          <circleGeometry args={[0.045, 16]} />
          <Toon color={PALETTE.rust} />
        </mesh>
        <mesh position={[0.02, 0.02, 0.003]}>
          <circleGeometry args={[0.01, 8]} />
          <Toon color={PALETTE.cream} />
        </mesh>
      </group>
      <NowPlayingDisplay />
      {/* selector buttons */}
      {[-0.15, -0.075, 0, 0.075, 0.15].map((x, i) => (
        <mesh key={x} position={[x, 0.86, 0.26]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.02, 10]} />
          <Toon color={i % 2 ? PALETTE.cream : PALETTE.mustard} />
        </mesh>
      ))}
      {/* speaker grille */}
      <mesh position={[0, 0.42, 0.252]}>
        <circleGeometry args={[0.2, 28]} />
        <Toon color={PALETTE.mustard} />
      </mesh>
      {[-0.12, -0.06, 0, 0.06, 0.12].map((x) => (
        <mesh key={x} position={[x, 0.42, 0.256]}>
          <planeGeometry args={[0.022, 0.36 - Math.abs(x) * 1.3]} />
          <Toon color={PALETTE.woodDark} />
        </mesh>
      ))}
    </group>
  )
}
