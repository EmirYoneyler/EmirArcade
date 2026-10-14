import { useRecentRepos, ago } from '../data/github'

/** "Recently on GitHub" list, filled live from the public API. Renders nothing until loaded. */
export default function RecentRepos({ className }: { className?: string }) {
  const repos = useRecentRepos()
  if (!repos?.length) return null
  return (
    <ul className={className ?? 'recent-repos'}>
      {repos.map((r) => (
        <li key={`${r.owner}/${r.name}`}>
          <a href={r.url} target="_blank" rel="noreferrer">
            {r.name}
          </a>
          {r.language && <span className="recent-repos__lang">{r.language}</span>}
          <span className="recent-repos__when">{ago(r.pushedAt)}</span>
          {r.description && <div className="recent-repos__desc">{r.description}</div>}
        </li>
      ))}
    </ul>
  )
}
