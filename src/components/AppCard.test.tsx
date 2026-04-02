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
    // Arrange + Act
    renderCard()

    // Assert
    expect(screen.getByText('Test App')).toBeInTheDocument()
  })

  it('renders the app description', () => {
    // Arrange + Act
    renderCard()

    // Assert
    expect(screen.getByText('A test app')).toBeInTheDocument()
  })

  it('renders the emoji', () => {
    // Arrange + Act
    renderCard()

    // Assert
    expect(screen.getByText('🧪')).toBeInTheDocument()
  })

  it('links to the app path', () => {
    // Arrange + Act
    renderCard()

    // Assert
    expect(screen.getByRole('link', { name: /test app/i })).toHaveAttribute('href', '/apps/test-app')
  })

  it('has the correct data-testid on the root element', () => {
    // Arrange + Act
    renderCard()

    // Assert
    expect(screen.getByTestId('app-card-test-app')).toBeInTheDocument()
  })
})
