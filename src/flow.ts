import { useApp } from './store/useApp'
import { flyTo } from './scene/flight'

/** High-level navigation. UI and 3D both call these, never flyTo directly. */
export async function pressStart() {
  const { view, setView } = useApp.getState()
  if (view !== 'room') return
  setView('cabinet')
  await flyTo('cabinet')
}

export async function goBack() {
  const { view, setView } = useApp.getState()
  if (view === 'cabinet') {
    setView('room')
    await flyTo('room')
  }
}
