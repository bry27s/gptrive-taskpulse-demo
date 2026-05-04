import { FormEvent, useMemo, useState } from 'react'
import './App.css'

type Filter = 'all' | 'open' | 'done'

type Priority = 'Low' | 'Medium' | 'High'

type Task = {
  id: string
  title: string
  done: boolean
  createdAt: string
  priority: Priority
  dueDate: string | null
}

const STORAGE_KEY = 'taskpulse.tasks.v1'
const priorities: Priority[] = ['Low', 'Medium', 'High']

const seedTasks: Task[] = [
  {
    id: 'seed-1',
    title: 'Review GPTrive generated pull request',
    done: false,
    createdAt: new Date('2026-05-01T09:00:00.000Z').toISOString(),
    priority: 'High',
    dueDate: null
  },
  {
    id: 'seed-2',
    title: 'Merge after checks pass',
    done: true,
    createdAt: new Date('2026-05-01T10:00:00.000Z').toISOString(),
    priority: 'Medium',
    dueDate: '2026-05-02'
  }
]

function isPriority(value: unknown): value is Priority {
  return typeof value === 'string' && priorities.includes(value as Priority)
}

function normalizeTask(value: unknown): Task | null {
  if (!value || typeof value !== 'object') return null

  const task = value as Partial<Task>
  if (
    typeof task.id !== 'string' ||
    typeof task.title !== 'string' ||
    typeof task.done !== 'boolean' ||
    typeof task.createdAt !== 'string'
  ) {
    return null
  }

  return {
    id: task.id,
    title: task.title,
    done: task.done,
    createdAt: task.createdAt,
    priority: isPriority(task.priority) ? task.priority : 'Medium',
    dueDate: typeof task.dueDate === 'string' && task.dueDate ? task.dueDate : null
  }
}

function loadTasks(): Task[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedTasks
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return seedTasks
    return parsed.map(normalizeTask).filter((task): task is Task => task !== null)
  } catch {
    return seedTasks
  }
}

function createTask(title: string, priority: Priority, dueDate: string): Task {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    done: false,
    createdAt: new Date().toISOString(),
    priority,
    dueDate: dueDate || null
  }
}

function saveTasks(tasks: Task[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

function getTodayDateString() {
  const now = new Date()
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 10)
}

function isTaskOverdue(task: Task, todayDate: string) {
  return !task.done && Boolean(task.dueDate) && task.dueDate! < todayDate
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks())
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('Medium')
  const [dueDate, setDueDate] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const todayDate = useMemo(() => getTodayDateString(), [])

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
    const filteredByStatus = tasks.filter((task) => {
      if (filter === 'open') return !task.done
      if (filter === 'done') return task.done
      return true
    })
    const cleanSearch = search.trim().toLowerCase()
    if (!cleanSearch) return filteredByStatus
    return filteredByStatus.filter((task) => task.title.toLowerCase().includes(cleanSearch))
  }, [filter, search, tasks])

  function updateTasks(nextTasks: Task[]) {
    setTasks(nextTasks)
    saveTasks(nextTasks)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanTitle = title.trim()
    if (!cleanTitle) return
    updateTasks([createTask(cleanTitle, priority, dueDate), ...tasks])
    setTitle('')
    setPriority('Medium')
    setDueDate('')
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
          <div className="field title-field">
            <label htmlFor="task-title">New task</label>
            <input
              id="task-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Write a task..."
            />
          </div>

          <div className="task-form-grid">
            <div className="field">
              <label htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                value={priority}
                onChange={(event) => setPriority(event.target.value as Priority)}
              >
                {priorities.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="task-due-date">Due date</label>
              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>

            <button type="submit">Add</button>
          </div>
        </form>

        <div className="task-toolbar">
          <div className="field search-field">
            <label htmlFor="task-search">Search tasks</label>
            <input
              id="task-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title..."
            />
          </div>

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
        </div>

        {visibleTasks.length > 0 ? (
          <ul className="task-list" aria-label="Tasks">
            {visibleTasks.map((task) => {
              const overdue = isTaskOverdue(task, todayDate)
              return (
                <li key={task.id} className={task.done ? 'done' : ''}>
                  <div className="task-content">
                    <label className="task-title-row">
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => toggleTask(task.id)}
                      />
                      <span className="task-title">{task.title}</span>
                    </label>
                    <div className="task-meta" aria-label={`${task.title} metadata`}>
                      <span className={`badge priority-${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                      {task.dueDate ? (
                        <span className="badge due-date">Due {task.dueDate}</span>
                      ) : (
                        <span className="badge no-date">No due date</span>
                      )}
                      {overdue ? <span className="badge overdue">Overdue</span> : null}
                    </div>
                  </div>
                  <button type="button" onClick={() => deleteTask(task.id)}>
                    Delete
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="empty-state">No tasks match your filters.</p>
        )}
      </section>
    </main>
  )
}
