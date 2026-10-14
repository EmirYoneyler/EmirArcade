import { attract, rally, patrol } from './programs'
import { menu, loading } from './menu'

/** Every CRT program by name. Cabinets pick one via the `program` prop. */
export const PROGRAMS = { attract, menu, loading, rally, patrol } as const
export type ProgramName = keyof typeof PROGRAMS
