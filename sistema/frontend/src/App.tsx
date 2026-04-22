import React, { useState } from 'react'
import StudentsPage from './pages/StudentsPage'
import AssessmentsPage from './pages/AssessmentsPage'
import ClassesPage from './pages/ClassesPage'
import ClassDetailPage from './pages/ClassDetailPage'
import './App.css'

type AppState =
  | { page: 'students' }
  | { page: 'assessments' }
  | { page: 'classes' }
  | { page: 'class-detail'; classId: string }

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({ page: 'students' })

  const nav = (page: 'students' | 'assessments' | 'classes') =>
    setState({ page })

  const isActive = (page: string) =>
    state.page === page || (state.page === 'class-detail' && page === 'classes')

  return (
    <div className="app">
      <nav className="app-nav">
        <span className="app-title">Sistema de Gerenciamento</span>
        <div className="nav-links">
          {(['students', 'assessments', 'classes'] as const).map((p) => (
            <button
              key={p}
              className={`nav-link ${isActive(p) ? 'active' : ''}`}
              onClick={() => nav(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </nav>

      <main className="app-main">
        {state.page === 'students' && <StudentsPage />}
        {state.page === 'assessments' && <AssessmentsPage />}
        {state.page === 'classes' && (
          <ClassesPage onViewClass={(classId) => setState({ page: 'class-detail', classId })} />
        )}
        {state.page === 'class-detail' && (
          <ClassDetailPage
            classId={state.classId}
            onBack={() => setState({ page: 'classes' })}
          />
        )}
      </main>
    </div>
  )
}

export default App
