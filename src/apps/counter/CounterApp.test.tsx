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
    renderCounter()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('increments the count', async () => {
    renderCounter()
    await userEvent.click(screen.getByTestId('increment'))
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('decrements the count', async () => {
    renderCounter()
    await userEvent.click(screen.getByTestId('decrement'))
    expect(screen.getByText('-1')).toBeInTheDocument()
  })

  it('resets the count to zero', async () => {
    renderCounter()
    await userEvent.click(screen.getByTestId('increment'))
    await userEvent.click(screen.getByTestId('increment'))
    await userEvent.click(screen.getByTestId('reset'))
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('has a back link to the home page', () => {
    renderCounter()
    expect(screen.getByText('← Back to Lab').closest('a')).toHaveAttribute('href', '/')
  })
})
