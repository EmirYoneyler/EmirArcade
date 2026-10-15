import * as en from '../data/content'
import { SECRETS, SECRET_HINTS, type SecretId } from '../data/secrets'
import { useApp, type Lang } from '../store/useApp'
import { ui, type UI } from './ui'
import * as tr from './tr'

export type { Lang }

/** Everything that changes with the language, already merged with the English source. */
export type Localized = {
  lang: Lang
  t: UI
  about: typeof en.about
  projects: typeof en.projects
  cv: typeof en.cv
  contact: typeof en.contact
  byteLines: typeof en.byteLines
  secretNames: Record<SecretId, string>
  secretHints: Record<SecretId, string>
  objectNames: Record<string, string>
  cvPdf: string
}

const english: Localized = {
  lang: 'en',
  t: ui.en,
  about: en.about,
  projects: en.projects,
  cv: en.cv,
  contact: en.contact,
  byteLines: en.byteLines,
  secretNames: SECRETS,
  secretHints: SECRET_HINTS,
  objectNames: {},
  cvPdf: en.site.cvPdf,
}

const turkish: Localized = {
  lang: 'tr',
  t: ui.tr,
  about: { ...en.about, ...tr.about },
  projects: en.projects.map((p) => {
    const x = tr.projects[p.id]
    if (!x) return p
    const { linkLabels, ...text } = x
    return { ...p, ...text, links: p.links.map((l) => ({ ...l, label: linkLabels?.[l.href] ?? l.label })) }
  }),
  cv: tr.cv,
  contact: { ...en.contact, pitch: tr.contactPitch },
  byteLines: tr.byteLines,
  secretNames: tr.secretNames,
  secretHints: tr.secretHints,
  objectNames: tr.objectNames,
  cvPdf: en.site.cvPdfTr,
}

export const localized = (lang: Lang): Localized => (lang === 'tr' ? turkish : english)

/** Current language's content inside React components. */
export const useL = () => localized(useApp((s) => s.lang))

/** Current language's content outside React (3D actions, flow). */
export const L = () => localized(useApp.getState().lang)
