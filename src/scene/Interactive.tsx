import { useRef, useState, type ReactNode } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Select } from '@react-three/postprocessing'
import type { Group } from 'three'
import { useApp } from '../store/useApp'
import { activate, objectName, type ObjectId } from './actions'

type Props = {
  /** a room object from OBJECTS — or pass name + onActivate for anything else */
  id?: ObjectId
  name?: string
  onActivate?: () => void
  onHover?: (over: boolean) => void
  /** highlight as if hovered (keyboard focus, menu selection…) */
  highlight?: boolean
  enabled?: boolean
  lift?: number
  children: ReactNode
}

/**
 * Makes any prop interactive: soft outline + small lift on hover (or on
 * keyboard focus via the Tab mirror), cursor tooltip, click to activate.
 */
export default function Interactive({ id, name, onActivate, onHover, highlight = false, enabled = true, lift = 0.03, children }: Props) {
  const ref = useRef<Group>(null)
  const [hover, setHover] = useState(false)
  const focused = useApp((s) => (id ? s.focused === id : false))
  const setHovered = useApp((s) => s.setHovered)
  const active = (hover || focused || highlight) && enabled
  const label = name ?? (id ? objectName(id) : '')

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
      setHovered(label)
      document.body.style.cursor = 'pointer'
      onHover?.(true)
    }
  }
  const out = () => {
    setHover(false)
    setHovered(null)
    document.body.style.cursor = ''
    onHover?.(false)
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
          if (onActivate) onActivate()
          else if (id) activate(id)
        }}
      >
        {children}
      </group>
    </Select>
  )
}
