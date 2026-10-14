import { useRef, useState, type ReactNode } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Select } from '@react-three/postprocessing'
import type { Group } from 'three'
import { useApp } from '../store/useApp'
import { activate, objectName, type ObjectId } from './actions'

type Props = {
  id: ObjectId
  enabled?: boolean
  lift?: number
  children: ReactNode
}

/**
 * Makes any prop interactive: soft outline + small lift on hover (or on
 * keyboard focus via the Tab mirror), cursor tooltip, click to activate.
 */
export default function Interactive({ id, enabled = true, lift = 0.03, children }: Props) {
  const ref = useRef<Group>(null)
  const [hover, setHover] = useState(false)
  const focused = useApp((s) => s.focused === id)
  const setHovered = useApp((s) => s.setHovered)
  const active = (hover || focused) && enabled

  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    const goal = active ? lift : 0
    g.position.y += (goal - g.position.y) * Math.min(1, dt * 12)
  })

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHover(true)
    if (enabled) {
      setHovered(objectName(id))
      document.body.style.cursor = 'pointer'
    }
  }
  const out = () => {
    setHover(false)
    setHovered(null)
    document.body.style.cursor = ''
  }

  return (
    <Select enabled={active}>
      <group
        ref={ref}
        onPointerOver={over}
        onPointerOut={out}
        onClick={(e) => {
          if (!enabled) return
          e.stopPropagation()
          activate(id)
        }}
      >
        {children}
      </group>
    </Select>
  )
}
