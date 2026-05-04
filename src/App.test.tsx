import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

describe('TaskPulse', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders seeded task summary', () => {
    render(<App />)
    expect(screen.getByText('TaskPulse')).toBeInTheDocument()
    expect(screen.getByText('Review GPTrive generated pull request')).toBeInTheDocument()
    expect(screen.getByText('Merge after checks pass')).toBeInTheDocument()
  })

  it('adds a high priority task', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('New task'), 'Ship GPTrive demo')
    await user.selectOptions(screen.getByLabelText('Priority'), 'High')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(screen.getByText('Ship GPTrive demo')).toBeInTheDocument()
    expect(screen.getByLabelText('Ship GPTrive demo metadata')).toHaveTextContent('High')
  })

  it('searches tasks by title', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Search tasks'), 'Merge')

    expect(screen.getByText('Merge after checks pass')).toBeInTheDocument()
    expect(screen.queryByText('Review GPTrive generated pull request')).not.toBeInTheDocument()
  })

  it('shows an overdue badge for an unfinished task with a past due date', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('New task'), 'File late report')
    fireEvent.change(screen.getByLabelText('Due date'), { target: { value: '2020-01-01' } })
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(screen.getByText('File late report')).toBeInTheDocument()
    expect(screen.getByText('Overdue')).toBeInTheDocument()
  })

  it('filters open tasks', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'open' }))

    expect(screen.getByText('Review GPTrive generated pull request')).toBeInTheDocument()
    expect(screen.queryByText('Merge after checks pass')).not.toBeInTheDocument()
  })
})
