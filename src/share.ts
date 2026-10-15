import { projects, site } from './data/content'
import { useApp } from './store/useApp'

/**
 * Every project has its own address, /projects/<id>, with its own preview
 * card (written at build time by scripts/prerender.mjs). The address bar
 * follows the open tape, and opening such a link plays that tape.
 */
export const projectPath = (id: string) => `/projects/${id}`
export const projectUrl = (id: string) => site.url.replace(/\/$/, '') + projectPath(id)

/** Index of the project named in the current URL, or -1. */
export function linkedProjectIndex() {
  if (typeof location === 'undefined') return -1
  const m = location.pathname.match(/^\/projects\/([\w-]+)\/?$/)
  return m ? projects.findIndex((p) => p.id === m[1]) : -1
}

if (typeof window !== 'undefined') {
  useApp.subscribe((s, prev) => {
    if (s.view === 'project' && s.selectedProject) {
      const path = projectPath(s.selectedProject)
      if (location.pathname !== path) history.replaceState(null, '', path + location.hash)
    } else if (prev.view === 'project' && location.pathname !== '/') {
      history.replaceState(null, '', '/')
    }
  })
}
