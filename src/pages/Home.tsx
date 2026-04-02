import { apps } from '../data/apps'
import { AppCard } from '../components/AppCard'

export function Home() {
  return (
    <main className="min-h-screen bg-zinc-900 px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-4xl font-bold text-white">🧪 The Lab</h1>
        <p className="mb-12 text-zinc-400">
          A collection of fun web app prototypes. Pick one and explore.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      </div>
    </main>
  )
}
