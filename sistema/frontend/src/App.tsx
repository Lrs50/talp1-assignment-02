import React, { useState } from 'react'
import StudentsPage from './pages/StudentsPage'
import AssessmentsPage from './pages/AssessmentsPage'
import './App.css'

type Page = 'students' | 'assessments'

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('students')

  return (
    <div className="app">
      <nav className="app-nav">
        <span className="app-title">Sistema de Gerenciamento</span>
        <div className="nav-links">
          <button
            className={`nav-link ${page === 'students' ? 'active' : ''}`}
            onClick={() => setPage('students')}
          >
            Students
          </button>
          <button
            className={`nav-link ${page === 'assessments' ? 'active' : ''}`}
            onClick={() => setPage('assessments')}
          >
            Assessments
          </button>
        </div>
      </nav>

      <main className="app-main">
        {page === 'students' && <StudentsPage />}
        {page === 'assessments' && <AssessmentsPage />}
      </main>
    </div>
  )
}

export default App
