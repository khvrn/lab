import type { ComponentType } from 'react'

export interface AppMeta {
  id: string
  title: string
  description: string
  emoji: string
  component: ComponentType
}
