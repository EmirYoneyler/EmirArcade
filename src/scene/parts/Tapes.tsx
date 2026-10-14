import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import gsap from 'gsap'
import { Object3D, Quaternion, Vector3, type Group } from 'three'
import { PALETTE, mix } from '../../theme/palette'
import { projects } from '../../data/content'
import { TAPE_DECK } from '../../config/camera'
import { useApp } from '../../store/useApp'
import { chooseProject } from '../../flow'
import { Toon } from '../materials/toon'
import { useCanvasTexture, pixelFont } from '../materials/canvasTexture'
import Interactive from '../Interactive'
import { tapeState } from '../tapeState'
import { sfx } from '../../audio/sfx'

/** Cassette size in metres (a little chunkier than real life). */
const TW = 0.15
const TH = 0.095
const TD = 0.022

/**
 * Tapes are deliberately oversized on the rack so their labels read from the
 * cabinet close-up; they shrink on the way into the deck so they fit the slot.
 */
const TAPE_SCALE = 1.9
const DECK_TAPE_SCALE = 1.25

/** Shell colours, in project order. */
const SHELLS = [PALETTE.rust, PALETTE.teal, PALETTE.mustard, PALETTE.woodLight, PALETTE.wall]

/** Where the rack stands: on a little table to the right of EMIR-1. */
const TABLE = { x: 1.45, z: -2.2, top: 1.0, rotY: -0.24, w: 1.06, d: 0.52 }

/** Slots on the stepped stand, table-local: three on the high back step, two in front. */
const TH_S = TH * TAPE_SCALE
/** stepped stand: the front row's tops line up with the back step so nothing hides */
const STAND = { w: 1.0, back: 0.25, front: 0.07 }
const SLOTS: [number, number, number][] = [
  [-0.31, TABLE.top + STAND.back + TH_S / 2, -0.07],
  [0, TABLE.top + STAND.back + TH_S / 2, -0.07],
  [0.31, TABLE.top + STAND.back + TH_S / 2, -0.07],
  [-0.155, TABLE.top + STAND.front + TH_S / 2, 0.11],
  [0.155, TABLE.top + STAND.front + TH_S / 2, 0.11],
]
const LEAN = -0.22 // tapes lean back against the step

const smooth = (x: number) => {
  const t = Math.min(1, Math.max(0, x))
  return t * t * (3 - 2 * t)
}

/** The printed face of a cassette: shell, label with the project name, reel window. */
function useTapeFace(index: number) {
  const p = projects[index]
  const shell = SHELLS[index % SHELLS.length]
  return useCanvasTexture(256, 162, (ctx, w, h) => {
    ctx.fillStyle = shell
    ctx.fillRect(0, 0, w, h)
    // label
    ctx.fillStyle = PALETTE.cream
    ctx.fillRect(12, 10, w - 24, 92)
    ctx.fillStyle = shell
    ctx.fillRect(12, 74, w - 24, 8)
    ctx.fillStyle = PALETTE.bg
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'
    ctx.font = pixelFont(13, true)
    ctx.fillText(`A  ${String(index + 1).padStart(2, '0')}`, 22, 24)
    ctx.textAlign = 'right'
    ctx.fillText(p.status === 'IN DEV' ? 'DEV' : p.status, w - 22, 24)
    let size = 30
    ctx.font = pixelFont(size, true)
    while (ctx.measureText(p.cartridge).width > w - 48 && size > 14) ctx.font = pixelFont((size -= 2), true)
    ctx.textAlign = 'center'
    ctx.fillText(p.cartridge, w / 2, 52)
    ctx.font = pixelFont(10)
    ctx.fillText('EMIR-1 · C60', w / 2, 92)
    // reel window
    ctx.fillStyle = PALETTE.bg
    ctx.beginPath()
    ctx.roundRect(60, 108, w - 120, 36, 8)
    ctx.fill()
    for (const x of [96, w - 96]) {
      ctx.strokeStyle = PALETTE.cream
      ctx.lineWidth = 5
      ctx.beginPath()
      ctx.arc(x, 126, 11, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fillStyle = PALETTE.cream
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2
        ctx.fillRect(x + Math.cos(a) * 6 - 1, 126 + Math.sin(a) * 6 - 1, 3, 3)
      }
    }
    ctx.fillStyle = mix(PALETTE.bg, PALETTE.woodDark, 0.4)
    ctx.fillRect(108, 120, w - 216, 12) // tape between the reels
    // screws + bottom ridge
    ctx.fillStyle = mix(shell, PALETTE.bg, 0.45)
    for (const [x, y] of [[8, 8], [w - 8, 8], [8, h - 8], [w - 8, h - 8], [w / 2, h - 8]]) {
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.beginPath()
    ctx.moveTo(48, h)
    ctx.lineTo(62, h - 14)
    ctx.lineTo(w - 62, h - 14)
    ctx.lineTo(w - 48, h)
    ctx.fill()
  }, [index])
}

function Tape({ index }: { index: number }) {
  const face = useTapeFace(index)
  return (
    <group>
      <RoundedBox args={[TW, TH, TD]} radius={0.006} smoothness={2} castShadow>
        <Toon color={SHELLS[index % SHELLS.length]} />
      </RoundedBox>
      <mesh position={[0, 0, TD / 2 + 0.0005]}>
        <planeGeometry args={[TW - 0.004, TH - 0.004]} />
        <meshToonMaterial map={face} />
      </mesh>
    </group>
  )
}

/** Little side table with a stepped wooden stand. Table-local coordinates. */
function RackTable() {
  const { top, w, d } = TABLE
  return (
    <group>
      <RoundedBox args={[w, 0.04, d]} radius={0.01} smoothness={2} position={[0, top - 0.02, 0]} castShadow receiveShadow>
        <Toon color={PALETTE.woodLight} />
      </RoundedBox>
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[sx * (w / 2 - 0.05), (top - 0.04) / 2, sz * (d / 2 - 0.05)]} castShadow>
            <boxGeometry args={[0.045, top - 0.04, 0.045]} />
            <Toon color={PALETTE.woodDark} />
          </mesh>
        )),
      )}
      {/* stepped stand: high back step, low front step, each with a lip */}
      <mesh position={[0, top + STAND.back / 2, -0.15]} castShadow>
        <boxGeometry args={[STAND.w, STAND.back, 0.12]} />
        <Toon color={PALETTE.woodDark} />
      </mesh>
      <mesh position={[0, top + STAND.front / 2, 0.06]} castShadow>
        <boxGeometry args={[STAND.w, STAND.front, 0.24]} />
        <Toon color={PALETTE.woodDark} />
      </mesh>
      {[
        [top + STAND.back, -0.04],
        [top + STAND.front, 0.15],
      ].map(([y, z]) => (
        <mesh key={z} position={[0, y + 0.012, z]}>
          <boxGeometry args={[STAND.w, 0.024, 0.014]} />
          <Toon color={PALETTE.trim} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * Project tapes. One cassette per project sits on the rack; choosing one
 * flies it to EMIR-1's deck, which plays it. Going back ejects it again.
 */
export default function Tapes() {
  const view = useApp((s) => s.view)
  const tapeHover = useApp((s) => s.tapeHover)
  const selected = useApp((s) => s.selectedProject)
  const setTapeHover = useApp((s) => s.setTapeHover)

  const anchors = useRef<(Object3D | null)[]>([])
  const tapes = useRef<(Group | null)[]>([])
  const prog = useMemo(() => projects.map(() => ({ t: 0 })), [])
  const rack = useMemo(() => projects.map(() => ({ p: new Vector3(), q: new Quaternion(), ready: false })), [])
  const tmp = useMemo(() => ({ a: new Vector3(), b: new Vector3(), q: new Quaternion() }), [])

  // which tape belongs in the deck right now
  const playing = view === 'loading' || view === 'project'
  const deckIndex = playing ? projects.findIndex((p) => p.id === selected) : -1
  const prevDeck = useRef(-1)

  useEffect(() => {
    const prev = prevDeck.current
    if (prev === deckIndex) return
    prevDeck.current = deckIndex
    if (prev >= 0) {
      gsap.killTweensOf(prog[prev])
      if (view === 'cabinet' || view === 'room') {
        sfx('click')
        gsap.to(prog[prev], { t: 0, duration: 1.0, ease: 'none' })
      } else prog[prev].t = 0 // swapped via prev/next while the page covers the scene
    }
    if (deckIndex >= 0) {
      gsap.killTweensOf(prog[deckIndex])
      if (view === 'loading') gsap.to(prog[deckIndex], { t: 1, duration: 1.1, ease: 'none', onComplete: () => sfx('thunk') })
      else prog[deckIndex].t = 1
    }
  }, [deckIndex, view, prog])

  useFrame(() => {
    let lid = 0
    let loaded = false
    projects.forEach((_, i) => {
      const g = tapes.current[i]
      const r = rack[i]
      const a = anchors.current[i]
      if (!g || !a) return
      if (!r.ready) {
        a.updateWorldMatrix(true, false)
        a.matrixWorld.decompose(r.p, r.q, tmp.a)
        r.ready = true
      }
      const t = prog[i].t
      const { a: from, b: to, q } = tmp
      // big on the rack, deck-sized by the time it reaches the slot
      g.scale.setScalar(TAPE_SCALE + (DECK_TAPE_SCALE - TAPE_SCALE) * smooth((t - 0.22) / 0.56))
      if (t <= 0) {
        g.position.copy(r.p)
        g.quaternion.copy(r.q)
      } else if (t < 0.22) {
        // lift straight up out of the rack
        g.position.copy(r.p).addScaledVector(Object3D.DEFAULT_UP, 0.2 * smooth(t / 0.22))
        g.quaternion.copy(r.q)
      } else if (t < 0.78) {
        // arc over to just above the deck, turning flat on the way
        const u = smooth((t - 0.22) / 0.56)
        from.copy(r.p).addScaledVector(Object3D.DEFAULT_UP, 0.2)
        to.copy(TAPE_DECK.position).addScaledVector(TAPE_DECK.normal, 0.18)
        g.position.lerpVectors(from, to, u).addScaledVector(Object3D.DEFAULT_UP, Math.sin(Math.PI * u) * 0.12)
        g.quaternion.copy(q.copy(r.q).slerp(TAPE_DECK.quaternion, u))
      } else {
        // drop into the deck
        const u = smooth((t - 0.78) / 0.22)
        from.copy(TAPE_DECK.position).addScaledVector(TAPE_DECK.normal, 0.18)
        g.position.lerpVectors(from, TAPE_DECK.position, u)
        g.quaternion.copy(TAPE_DECK.quaternion)
      }
      // lid is open while a tape is between "above the deck" and "seated"
      lid = Math.max(lid, smooth((t - 0.5) / 0.12) * smooth((1 - t) / 0.05))
      if (t >= 0.999) loaded = true
    })
    tapeState.lid = lid
    tapeState.playing = loaded
  })

  const canPick = view === 'room' || view === 'cabinet'

  return (
    <>
      <group position={[TABLE.x, 0, TABLE.z]} rotation={[0, TABLE.rotY, 0]}>
        <RackTable />
        {SLOTS.map((s, i) => (
          <object3D key={i} position={s} rotation={[LEAN, 0, 0]} ref={(o) => void (anchors.current[i] = o)} />
        ))}
      </group>
      {projects.map((p, i) => (
        <group key={p.id} ref={(g) => void (tapes.current[i] = g)}>
          <Interactive
            name={`${p.title} · tape ${i + 1}`}
            enabled={canPick && deckIndex !== i}
            highlight={view === 'cabinet' && tapeHover === i}
            lift={0.03}
            onHover={(over) => setTapeHover(over ? i : null)}
            onActivate={() => chooseProject(i)}
          >
            <Tape index={i} />
          </Interactive>
        </group>
      ))}
    </>
  )
}
