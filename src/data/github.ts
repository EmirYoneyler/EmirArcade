import { useEffect, useState } from 'react'
import { about } from './content'

/**
 * Live "recently on GitHub" feed. Uses GitHub's public REST API (no key;
 * 60 requests/hour per visitor IP), cached in sessionStorage for 15 min.
 * Accounts come from `about.github` in content.ts.
 */
export type RecentRepo = {
  name: string
  owner: string
  url: string
  description: string | null
  language: string | null
  pushedAt: string
}

const CACHE_KEY = 'emir-arcade:github'
const TTL = 15 * 60 * 1000
let inflight: Promise<RecentRepo[]> | null = null

async function load(): Promise<RecentRepo[]> {
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) ?? 'null')
    if (cached && Date.now() - cached.at < TTL) return cached.repos
  } catch {
    /* no cache */
  }
  const users = about.github.map((g) => g.label)
  const lists = await Promise.all(
    users.map((u) =>
      fetch(`https://api.github.com/users/${u}/repos?sort=pushed&per_page=8`, { headers: { Accept: 'application/vnd.github+json' } })
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
    ),
  )
  type ApiRepo = { name: string; owner: { login: string }; html_url: string; description: string | null; language: string | null; pushed_at: string; fork: boolean; private: boolean }
  const repos = (lists.flat() as ApiRepo[])
    .filter((r) => !r.fork && !r.private)
    .sort((a, b) => b.pushed_at.localeCompare(a.pushed_at))
    .slice(0, 5)
    .map((r) => ({ name: r.name, owner: r.owner.login, url: r.html_url, description: r.description, language: r.language, pushedAt: r.pushed_at }))
  try {
    if (repos.length) sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), repos }))
  } catch {
    /* fine */
  }
  return repos
}

/**
 * Recently pushed public repos across all accounts.
 * `null` while loading; `[]` if GitHub is unreachable (or rate-limited).
 */
export function useRecentRepos() {
  const [repos, setRepos] = useState<RecentRepo[] | null>(null)
  useEffect(() => {
    let alive = true
    inflight ??= load()
    inflight.then((r) => alive && setRepos(r))
    return () => void (alive = false)
  }, [])
  return repos
}

/** "today", "3d ago", "2w ago", "5mo ago" */
export function ago(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (days < 1) return 'today'
  if (days < 7) return `${days}d ago`
  if (days < 45) return `${Math.floor(days / 7)}w ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}
