import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppCard } from './AppCard'
import type { AppMeta } from '../types/app'

const app: AppMeta = {
  id: 'test-app',
  title: 'Test App',
  description: 'A test app',
  path: '/apps/test-app',
  emoji: '🧪',
}

function renderCard() {
  return render(
    <MemoryRouter>
      <AppCard app={app} />
    </MemoryRouter>
  )
}

describe('AppCard', () => {
  it('renders the app title', () => {
    renderCard()
    expect(screen.getByText('Test App')).toBeInTheDocument()
  })

  it('renders the app description', () => {
    renderCard()
    expect(screen.getByText('A test app')).toBeInTheDocument()
  })

  it('renders the emoji', () => {
    renderCard()
    expect(screen.getByText('🧪')).toBeInTheDocument()
  })

  it('links to the app path', () => {
    renderCard()
    expect(screen.getByTestId('app-card-test-app').closest('a')).toHaveAttribute('href', '/apps/test-app')
  })

  it('has the correct data-testid', () => {
    renderCard()
    expect(screen.getByTestId('app-card-test-app')).toBeInTheDocument()
  })
})
