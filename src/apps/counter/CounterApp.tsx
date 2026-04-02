import { useState } from 'react'
import { Link } from 'react-router-dom'

export function CounterApp() {
  const [count, setCount] = useState(0)

  return (
    <main data-testid="counter-app" className="min-h-screen bg-zinc-900 px-6 py-16">
      <div className="mx-auto max-w-sm text-center">
        <Link to="/" className="mb-8 inline-block text-sm text-zinc-400 hover:text-white">
          ← Back to Lab
        </Link>
        <h1 className="mb-8 text-4xl font-bold text-white">🔢 Counter</h1>
        <div className="mb-8 text-8xl font-bold text-white">{count}</div>
        <div className="flex justify-center gap-4">
          <button
            data-testid="decrement"
            onClick={() => setCount((c) => c - 1)}
            className="rounded-xl bg-zinc-700 px-6 py-3 text-xl font-bold text-white transition hover:bg-zinc-600"
          >
            −
          </button>
          <button
            data-testid="increment"
            onClick={() => setCount((c) => c + 1)}
            className="rounded-xl bg-zinc-700 px-6 py-3 text-xl font-bold text-white transition hover:bg-zinc-600"
          >
            +
          </button>
        </div>
        <button
          data-testid="reset"
          onClick={() => setCount(0)}
          className="mt-4 text-sm text-zinc-500 hover:text-zinc-300"
        >
          reset
        </button>
      </div>
    </main>
  )
}
