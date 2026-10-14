import { attract } from './programs'
import { loading } from './loading'
import { game } from './games'

/** Every CRT program by name. The cabinet picks one via the `program` prop. */
export const PROGRAMS = { attract, game, loading } as const
export type ProgramName = keyof typeof PROGRAMS
