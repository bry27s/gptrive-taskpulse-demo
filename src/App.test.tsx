import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'


describe('TaskPulse', () => {
  it('renders seeded task summary', () => {
    render(<App />)
    expect(screen.getByText('TaskPulse')).toBeInTheDocument()
    expect(screen.getByText('Review GPTrive generated pull request')).toBeInTheDocument()
    expect(screen.getByText('Merge after checks pass')).toBeInTheDocument()
  })

  it('adds a new task', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('New task'), 'Ship GPTrive demo')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(screen.getByText('Ship GPTrive demo')).toBeInTheDocument()
  })

  it('filters open tasks', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'open' }))

    expect(screen.getByText('Review GPTrive generated pull request')).toBeInTheDocument()
    expect(screen.queryByText('Merge after checks pass')).not.toBeInTheDocument()
  })
})
