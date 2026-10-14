/**
 * The ONLY paint colors allowed in this project.
 * Everything in the scene and UI must come from here.
 */
export const PALETTE = {
  bg: '#1F2421', // charcoal green — background / deep shadow
  wall: '#34463C', // bottle green
  trim: '#C9B79C', // old plaster
  woodDark: '#7A4E32', // floor & furniture
  woodLight: '#A0694A',
  rust: '#B4532A', // cabinet paints
  mustard: '#D9A441',
  teal: '#2F6F6A',
  cream: '#EFE3C8', // paper / UI text
  amber: '#FFB000', // CRT phosphor
} as const

export type PaletteKey = keyof typeof PALETTE

/**
 * Light colors are NOT paint — they tint what the palette colors look like
 * under tungsten and phosphor light. Kept separate so paint stays strict.
 */
export const LIGHT = {
  tungsten: '#FFD9A6',
  phosphor: PALETTE.amber,
  moon: PALETTE.cream,
} as const

/** Boost applied to emissive colors so only they cross the bloom threshold. */
export const GLOW = 2.4
