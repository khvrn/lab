import { lazy } from 'react'
import type { AppMeta } from '../types/app'

export const apps: AppMeta[] = [
  {
    id: 'counter',
    title: 'Counter',
    description: 'A simple counter app. The "hello world" of the lab.',
    emoji: '🔢',
    component: lazy(() =>
      import('../apps/counter/CounterApp').then((m) => ({ default: m.CounterApp }))
    ),
  },
]
