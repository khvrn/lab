import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { CounterApp } from './CounterApp'

function renderCounter() {
  return render(
    <MemoryRouter>
      <CounterApp />
    </MemoryRouter>
  )
}

describe('CounterApp', () => {
  it('starts at zero', () => {
    // Arrange + Act
    renderCounter()

    // Assert
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('increments the count', async () => {
    // Arrange
    const user = userEvent.setup()
    renderCounter()

    // Act
    await user.click(screen.getByTestId('increment'))

    // Assert
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('decrements the count', async () => {
    // Arrange
    const user = userEvent.setup()
    renderCounter()

    // Act
    await user.click(screen.getByTestId('decrement'))

    // Assert
    expect(screen.getByText('-1')).toBeInTheDocument()
  })

  it('resets the count to zero after incrementing', async () => {
    // Arrange
    const user = userEvent.setup()
    renderCounter()
    await user.click(screen.getByTestId('increment'))
    await user.click(screen.getByTestId('increment'))

    // Act
    await user.click(screen.getByTestId('reset'))

    // Assert
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('has a back link to the home page', () => {
    // Arrange + Act
    renderCounter()

    // Assert
    expect(screen.getByRole('link', { name: /back to lab/i })).toHaveAttribute('href', '/')
  })
})
