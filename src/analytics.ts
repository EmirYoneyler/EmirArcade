import { inject, track as vercelTrack } from '@vercel/analytics'

/**
 * Vercel Web Analytics: cookie-free page views plus a few named events.
 * Turn it on in the Vercel dashboard (Project → Analytics); until then the
 * script is simply not served and these calls do nothing.
 */
export function initAnalytics() {
  inject()
}

export function track(event: string, props?: Record<string, string>) {
  try {
    vercelTrack(event, props)
  } catch {
    /* analytics must never break the page */
  }
}
