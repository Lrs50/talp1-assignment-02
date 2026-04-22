import React, { useState, useEffect, useCallback } from 'react'
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

interface EmailResult {
  to: string
  previewUrl?: string
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({ page: 'students' })
  const [pendingCount, setPendingCount] = useState(0)
  const [sending, setSending] = useState(false)
  const [lastResult, setLastResult] = useState<EmailResult[] | null>(null)

  const refreshPending = useCallback(async () => {
    try {
      const res = await fetch('/email/pending')
      const json = await res.json()
      if (json.success) setPendingCount(json.data.length)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    refreshPending()
    const id = setInterval(refreshPending, 10000)
    return () => clearInterval(id)
  }, [refreshPending])

  const handleSendEmails = async () => {
    setSending(true)
    setLastResult(null)
    try {
      const res = await fetch('/email/send-daily', { method: 'POST' })
      const json = await res.json()
      if (json.success) {
        setLastResult(json.data.emails)
        await refreshPending()
      }
    } catch { /* ignore */ } finally {
      setSending(false)
    }
  }

  const nav = (page: 'students' | 'assessments' | 'classes') => {
    setState({ page })
    setLastResult(null)
  }

  const isActive = (page: string) =>
    state.page === page || (state.page === 'class-detail' && page === 'classes')

  return (
    <div className="app">
      <nav className="app-nav">
        <span className="app-title">Academic Assessment System</span>
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
          <button
            className="nav-send-btn"
            onClick={handleSendEmails}
            disabled={sending || pendingCount === 0}
            title={pendingCount === 0 ? 'No pending notifications' : `Send ${pendingCount} notification(s)`}
          >
            {sending ? 'Sending…' : pendingCount > 0 ? `Send Emails (${pendingCount})` : 'Send Emails'}
          </button>
        </div>
      </nav>

      {lastResult !== null && (
        <div className="email-result-bar">
          {lastResult.length === 0
            ? 'No pending notifications to send.'
            : lastResult.map((r, i) => (
                <span key={i}>
                  Sent to {r.to}
                  {r.previewUrl && (
                    <> — <a href={r.previewUrl} target="_blank" rel="noreferrer">view email ↗</a></>
                  )}
                </span>
              ))}
        </div>
      )}

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
