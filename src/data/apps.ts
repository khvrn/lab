import { lazy } from 'react'
import type { AppMeta } from '../types/app'

export const apps: AppMeta[] = [
  {
    id: 'place-in-time',
    title: 'Place in Time',
    description: 'Browse public photos taken at the same place and time as you.',
    emoji: '📍',
    component: lazy(() =>
      import('../apps/place-in-time/PlaceInTimeApp').then((m) => ({ default: m.PlaceInTimeApp }))
    ),
  },
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
