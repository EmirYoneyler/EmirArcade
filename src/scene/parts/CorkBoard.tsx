import { useRef } from 'react'
import gsap from 'gsap'
import type { Group } from 'three'
import { PALETTE, mix } from '../../theme/palette'
import { about, cv } from '../../data/content'
import { Toon } from '../materials/toon'
import { useCanvasTexture, pixelFont } from '../materials/canvasTexture'
import { usePulse } from '../usePulse'

const W = 1.15
const H = 0.8

type PaperDraw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void

const ink = (ctx: CanvasRenderingContext2D, size: number, bold = false) => {
  ctx.fillStyle = PALETTE.bg
  ctx.font = pixelFont(size, bold)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
}
/** scribbled "text" lines so papers read as documents from afar */
const lines = (ctx: CanvasRenderingContext2D, y: number, n: number, w: number) => {
  ctx.fillStyle = mix(PALETTE.cream, PALETTE.bg, 0.45)
  for (let i = 0; i < n; i++) ctx.fillRect(14, y + i * 14, (w - 28) * (0.55 + ((i * 37) % 40) / 100), 4)
}

const PAPERS: { at: [number, number]; size: [number, number]; rot: number; pin: string; color: string; draw: PaperDraw }[] = [
  {
    at: [-0.3, 0.06], size: [0.36, 0.48], rot: 0.05, pin: PALETTE.rust, color: PALETTE.cream,
    draw: (ctx, w) => {
      ink(ctx, 20, true)
      ctx.fillText('EMIR', 14, 14)
      ctx.fillText('YÖNEYLER', 14, 38)
      ink(ctx, 10)
      ctx.fillText(about.title.toUpperCase(), 14, 66)
      ctx.fillRect(14, 84, w - 28, 2)
      lines(ctx, 96, 10, w)
    },
  },
  {
    at: [0.12, 0.12], size: [0.32, 0.36], rot: -0.07, pin: PALETTE.teal, color: PALETTE.cream,
    draw: (ctx, w) => {
      ink(ctx, 14, true)
      ctx.fillText('EXPERIENCE', 14, 14)
      lines(ctx, 40, 4, w)
      ink(ctx, 14, true)
      ctx.fillText('EDUCATION', 14, 104)
      lines(ctx, 130, 3, w)
    },
  },
  {
    at: [0.42, -0.12], size: [0.22, 0.22], rot: 0.12, pin: PALETTE.rust, color: PALETTE.mustard,
    draw: (ctx) => {
      ink(ctx, 20, true)
      ctx.fillText('HIRE', 14, 20)
      ctx.fillText('ME?', 14, 48)
      ink(ctx, 12)
      ctx.fillText('→ SIGN', 14, 84)
    },
  },
  {
    at: [0.06, -0.24], size: [0.3, 0.2], rot: 0.03, pin: PALETTE.mustard, color: PALETTE.cream,
    draw: (ctx, w) => {
      ink(ctx, 12, true)
      ctx.fillText('STACK', 14, 12)
      ink(ctx, 10)
      cv.focus.slice(0, 3).forEach((f, i) => ctx.fillText(f.split(':')[1]?.trim().slice(0, 22) ?? f, 14, 34 + i * 16))
      void w
    },
  },
]

function Paper({ p, refFn }: { p: (typeof PAPERS)[number]; refFn: (g: Group | null) => void }) {
  const px = 256
  const tex = useCanvasTexture(px, Math.round((px * p.size[1]) / p.size[0]), (ctx, w, h) => {
    ctx.fillStyle = p.color
    ctx.fillRect(0, 0, w, h)
    p.draw(ctx, w, h)
  })
  return (
    // pivot at the pin so a flutter swings from the top
    <group position={[p.at[0], p.at[1] + p.size[1] / 2 - 0.03, 0.035]} rotation={[0, 0, p.rot]} ref={refFn}>
      <mesh position={[0, -p.size[1] / 2 + 0.03, 0]}>
        <planeGeometry args={p.size} />
        <meshToonMaterial map={tex} />
      </mesh>
      <mesh position={[0, 0, 0.012]}>
        <sphereGeometry args={[0.016, 10, 8]} />
        <Toon color={p.pin} />
      </mesh>
    </group>
  )
}

/** Cork board with pinned papers — Emir's CV. Faces +z. */
export default function CorkBoard() {
  const papers = useRef<(Group | null)[]>([])
  usePulse('cork', () => {
    papers.current.forEach((g, i) => {
      if (!g) return
      const r = g.rotation.z
      gsap.fromTo(g.rotation, { z: r + (i % 2 ? 0.25 : -0.25) }, { z: r, duration: 1.2, ease: 'elastic.out(1, 0.3)', delay: i * 0.05 })
    })
  })
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[W + 0.08, H + 0.08, 0.05]} />
        <Toon color={PALETTE.woodDark} />
      </mesh>
      <mesh position={[0, 0, 0.026]}>
        <planeGeometry args={[W, H]} />
        <Toon color={mix(PALETTE.woodLight, PALETTE.mustard, 0.35)} />
      </mesh>
      {PAPERS.map((p, i) => (
        <Paper key={i} p={p} refFn={(g) => void (papers.current[i] = g)} />
      ))}
    </group>
  )
}
