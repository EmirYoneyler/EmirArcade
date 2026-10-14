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
  rally: 'RALLY cabinet',
  patrol: 'PATROL cabinet',
  konami: 'Konami code',
} as const

export type SecretId = keyof typeof SECRETS
export const SECRET_COUNT = Object.keys(SECRETS).length
