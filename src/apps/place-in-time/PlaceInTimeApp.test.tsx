import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { PlaceInTimeApp } from './PlaceInTimeApp'

vi.mock('./PhotoMap', () => ({
  PhotoMap: () => <div data-testid="photo-map-mock" />,
}))

vi.mock('exifr', () => ({
  default: {
    gps: vi.fn().mockResolvedValue(null),
    parse: vi.fn().mockResolvedValue(null),
  },
}))

const renderApp = () =>
  render(
    <MemoryRouter>
      <PlaceInTimeApp />
    </MemoryRouter>
  )

describe('PlaceInTimeApp', () => {
  it('renders without crashing', () => {
    renderApp()

    expect(screen.getByTestId('place-in-time-app')).toBeInTheDocument()
  })

  it('displays the back navigation link', () => {
    renderApp()

    expect(screen.getByRole('link', { name: /back to lab/i })).toBeInTheDocument()
  })

  it('shows the photo dropzone', () => {
    renderApp()

    expect(screen.getByTestId('photo-dropzone')).toBeInTheDocument()
  })

  it('shows the idle placeholder before any search', () => {
    renderApp()

    expect(screen.getByText(/drop a photo or search a place/i)).toBeInTheDocument()
  })

  it('search button is disabled when no source is selected', () => {
    renderApp()

    expect(screen.getByRole('button', { name: /search/i })).toBeDisabled()
  })
})
