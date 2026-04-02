import type { AppMeta } from '../types/app'
import { Link } from 'react-router-dom'

interface AppCardProps {
  app: AppMeta
}

export function AppCard({ app }: AppCardProps) {
  return (
    <Link
      to={`/apps/${app.id}`}
      data-testid={`app-card-${app.id}`}
      className="group block rounded-2xl border border-zinc-700 bg-zinc-800 p-6 transition hover:border-zinc-500 hover:bg-zinc-700"
    >
      <div className="mb-3 text-4xl">{app.emoji}</div>
      <h2 className="mb-1 text-lg font-semibold text-white group-hover:text-zinc-100">
        {app.title}
      </h2>
      <p className="text-sm text-zinc-400">{app.description}</p>
    </Link>
  )
}
