import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App'
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

// The classic view is pre-rendered into index.html; hydrate it in place.
if (document.documentElement.dataset.mode === 'classic' && root.firstElementChild?.classList.contains('classic')) {
  hydrateRoot(root, app)
} else {
  createRoot(root).render(app)
}
