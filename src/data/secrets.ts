/** Every discoverable interaction. The counter reads "SECRETS n/12". */
export const SECRETS = {
  claw: 'Claw machine',
  jukebox: 'Jukebox',
  cat: 'The cat',
  clock: 'Wall clock',
  window: 'Shooting star',
  cork: 'Cork board',
  sign: 'Open sign',
  plant: 'Potted plant',
  switch: 'Light switch',
  rally: 'Scored in RALLY',
  patrol: 'Hit in PATROL',
  konami: 'Konami code',
} as const

/** Shown in the secrets list for ones not found yet — a nudge, not the answer. */
export const SECRET_HINTS: Record<keyof typeof SECRETS, string> = {
  claw: 'Try your luck for a plush',
  jukebox: 'Put some music on',
  cat: 'Someone furry wants attention',
  clock: 'What time is it?',
  window: 'Look out at the night sky',
  cork: 'Read what is pinned up',
  sign: 'Something by the door is glowing',
  plant: 'A green thing needs care',
  switch: 'Lights out?',
  rally: 'Score a point in RALLY on EMIR-1',
  patrol: 'Shoot an alien in PATROL on EMIR-1',
  konami: 'An old cheat code, typed on the keyboard',
}

export type SecretId = keyof typeof SECRETS
export const SECRET_COUNT = Object.keys(SECRETS).length
