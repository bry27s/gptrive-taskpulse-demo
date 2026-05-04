import { FormEvent, useMemo, useState } from 'react'
import './App.css'

type Filter = 'all' | 'open' | 'done'

type Task = {
  id: string
  title: string
  done: boolean
  createdAt: string
}

const STORAGE_KEY = 'taskpulse.tasks.v1'

const seedTasks: Task[] = [
  {
    id: 'seed-1',
    title: 'Review GPTrive generated pull request',
    done: false,
    createdAt: new Date('2026-05-01T09:00:00.000Z').toISOString()
  },
  {
    id: 'seed-2',
    title: 'Merge after checks pass',
    done: true,
    createdAt: new Date('2026-05-01T10:00:00.000Z').toISOString()
  }
]

function loadTasks(): Task[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedTasks
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : seedTasks
  } catch {
    return seedTasks
  }
}

function createTask(title: string): Task {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    done: false,
    createdAt: new Date().toISOString()
  }
}

function saveTasks(tasks: Task[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks())
  const [title, setTitle] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const stats = useMemo(() => {
    const total = tasks.length
    const done = tasks.filter((task) => task.done).length
    return {
      total,
      done,
      open: total - done
    }
  }, [tasks])

  const visibleTasks = useMemo(() => {
    if (filter === 'open') return tasks.filter((task) => !task.done)
    if (filter === 'done') return tasks.filter((task) => task.done)
    return tasks
  }, [filter, tasks])

  function updateTasks(nextTasks: Task[]) {
    setTasks(nextTasks)
    saveTasks(nextTasks)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanTitle = title.trim()
    if (!cleanTitle) return
    updateTasks([createTask(cleanTitle), ...tasks])
    setTitle('')
  }

  function toggleTask(id: string) {
    updateTasks(tasks.map((task) => (
      task.id === id ? { ...task, done: !task.done } : task
    )))
  }

  function deleteTask(id: string) {
    updateTasks(tasks.filter((task) => task.id !== id))
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">TaskPulse</p>
        <h1>Small team task board</h1>
        <p className="hero-copy">
          A compact task board used to test GPTrive-generated code changes.
        </p>
      </section>

      <section className="panel stats-grid" aria-label="Task summary">
        <div>
          <strong>{stats.total}</strong>
          <span>Total</span>
        </div>
        <div>
          <strong>{stats.open}</strong>
          <span>Open</span>
        </div>
        <div>
          <strong>{stats.done}</strong>
          <span>Done</span>
        </div>
      </section>

      <section className="panel">
        <form className="task-form" onSubmit={handleSubmit}>
          <label htmlFor="task-title">New task</label>
          <div className="task-form-row">
            <input
              id="task-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Write a task..."
            />
            <button type="submit">Add</button>
          </div>
        </form>

        <div className="filters" aria-label="Task filters">
          {(['all', 'open', 'done'] as Filter[]).map((option) => (
            <button
              key={option}
              type="button"
              className={filter === option ? 'active' : ''}
              onClick={() => setFilter(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <ul className="task-list" aria-label="Tasks">
          {visibleTasks.map((task) => (
            <li key={task.id} className={task.done ? 'done' : ''}>
              <label>
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggleTask(task.id)}
                />
                <span>{task.title}</span>
              </label>
              <button type="button" onClick={() => deleteTask(task.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
