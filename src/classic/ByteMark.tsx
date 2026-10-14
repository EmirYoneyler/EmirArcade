/** BYTE as a crisp inline SVG (same pixels as the CRT sprite). */
const PIXELS = [
  '.........##.....',
  '.........#......',
  '....########....',
  '..############..',
  '.##############.',
  '.##....##....##.',
  '.##.##.##.##.##.',
  '.##....##....##.',
  '.##############.',
  '.#####.##.#####.',
  '.######..######.',
  '..############..',
  '....########....',
  '....##....##....',
  '...###....###...',
]

const RECTS = PIXELS.flatMap((row, y) => [...row].map((c, x) => (c === '#' ? `M${x} ${y}h1v1h-1z` : ''))).join('')

export default function ByteMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="-1 -1 18 17" shapeRendering="crispEdges" aria-hidden className="byte-mark">
      <path d={RECTS} fill="currentColor" />
    </svg>
  )
}
