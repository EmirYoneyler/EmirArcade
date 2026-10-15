import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App'
import { useApp } from './store/useApp'
import './styles/global.css'
import './share'
import { initAnalytics } from './analytics'

initAnalytics()

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

const lang = useApp.getState().lang
document.documentElement.lang = lang

// The classic view is pre-rendered (in English) into index.html; hydrate it in
// place, then switch to the visitor's language so hydration matches.
if (document.documentElement.dataset.mode === 'classic' && root.firstElementChild?.classList.contains('classic')) {
  useApp.setState({ lang: 'en' })
  hydrateRoot(root, app)
  if (lang !== 'en') requestAnimationFrame(() => useApp.setState({ lang }))
} else {
  createRoot(root).render(app)
}
