import { projects } from './data/content'
import { useApp } from './store/useApp'
import { flyTo } from './scene/flight'

/**
 * High-level navigation. UI, keyboard and 3D all call these — never flyTo
 * directly — so every path through the site stays in sync.
 */

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
const get = useApp.getState

export async function pressStart() {
  if (get().view !== 'room') return
  get().setView('cabinet')
  await flyTo('cabinet')
}

export function moveMenu(delta: number) {
  if (get().view !== 'cabinet') return
  const n = projects.length
  get().setMenuIndex((get().menuIndex + delta + n) % n)
}

/** Pick a cartridge: title card on the CRT, then dive into the glass. */
export async function chooseProject(index = get().menuIndex) {
  if (get().view !== 'cabinet') return
  const s = get()
  s.setMenuIndex(index)
  s.selectProject(projects[index].id)
  s.setView('loading')

  await wait(reduceMotion() ? 500 : 1500)
  if (get().view !== 'loading') return // user backed out

  const dive = flyTo('screen', 1.0, 'power2.in')
  // cross-fade the HTML page in while the glass fills the view
  await wait(reduceMotion() ? 0 : 750)
  if (get().view === 'loading') get().setView('project')
  await dive
}

/** prev / next without leaving the screen */
export function stepProject(delta: number) {
  const s = get()
  if (s.view !== 'project') return
  const n = projects.length
  const i = (projects.findIndex((p) => p.id === s.selectedProject) + delta + n) % n
  s.setMenuIndex(i)
  s.selectProject(projects[i].id)
}

/** Esc / BACK: project → menu → room. */
export async function goBack() {
  const { view, setView } = get()
  if (view === 'project' || view === 'loading') {
    setView('cabinet')
    await flyTo('cabinet', 1.0, 'power2.out')
  } else if (view === 'cabinet') {
    setView('room')
    await flyTo('room')
  }
}
