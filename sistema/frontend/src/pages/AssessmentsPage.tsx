import React, { useState, useEffect, useCallback } from 'react'
import './AssessmentsPage.css'

type Grade = 'MANA' | 'MPA' | 'MA' | ''

interface Student { id: string; name: string }
interface ClassAssessment { studentId: string; goal: string; grade: Grade }
interface ClassInfo { id: string; topic: string; year: number; semester: number }
interface ClassDetail { cls: ClassInfo; students: Student[]; goals: string[]; assessments: ClassAssessment[] }
interface ClassListItem { id: string; topic: string; year: number; semester: number }

const AssessmentsPage: React.FC = () => {
  const [classes, setClasses] = useState<ClassListItem[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [detail, setDetail] = useState<ClassDetail | null>(null)
  const [goals, setGoals] = useState<string[]>([])
  const [newGoal, setNewGoal] = useState('')
  const [loadingMatrix, setLoadingMatrix] = useState(false)
  const [savingCell, setSavingCell] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const loadGoals = useCallback(async () => {
    const res = await fetch('/goals')
    const json = await res.json()
    if (json.success) setGoals(json.data)
  }, [])

  const loadClasses = useCallback(async () => {
    const res = await fetch('/classes')
    const json = await res.json()
    if (json.success) setClasses(json.data)
  }, [])

  const loadDetail = useCallback(async (classId: string) => {
    setLoadingMatrix(true)
    try {
      const res = await fetch(`/classes/${classId}`)
      const json = await res.json()
      if (json.success) setDetail(json.data)
    } finally {
      setLoadingMatrix(false)
    }
  }, [])

  useEffect(() => { loadGoals(); loadClasses() }, [loadGoals, loadClasses])

  useEffect(() => {
    if (selectedId) loadDetail(selectedId)
    else setDetail(null)
  }, [selectedId, loadDetail])

  const getGrade = (studentId: string, goal: string): Grade => {
    const a = detail?.assessments.find((a) => a.studentId === studentId && a.goal === goal)
    return a ? a.grade : ''
  }

  const handleGradeChange = async (studentId: string, goal: string, grade: string) => {
    const cellKey = `${studentId}:${goal}`
    setSavingCell(cellKey)
    setMessage(null)
    try {
      const url = `/classes/${selectedId}/assessments/${studentId}/${encodeURIComponent(goal)}`
      const res = await fetch(url, grade === ''
        ? { method: 'DELETE' }
        : { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ grade }) }
      )
      const json = await res.json()
      if (json.success) {
        setMessage({ type: 'success', text: 'Assessment saved' })
        await loadDetail(selectedId)
      } else {
        setMessage({ type: 'error', text: json.error ?? 'Failed to save' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save assessment' })
    } finally {
      setSavingCell(null)
    }
  }

  const handleAddGoal = async () => {
    if (!newGoal.trim()) return
    setMessage(null)
    const res = await fetch('/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newGoal.trim() }),
    })
    const json = await res.json()
    if (json.success) {
      setMessage({ type: 'success', text: 'Goal added' })
      setNewGoal('')
      await loadGoals()
      if (selectedId) await loadDetail(selectedId)
    } else {
      setMessage({ type: 'error', text: json.error })
    }
  }

  const handleRemoveGoal = async (goal: string) => {
    if (!confirm(`Remove goal "${goal}" and all its assessments?`)) return
    setMessage(null)
    const res = await fetch(`/goals/${encodeURIComponent(goal)}`, { method: 'DELETE' })
    const json = await res.json()
    if (json.success) {
      setMessage({ type: 'success', text: 'Goal removed' })
      await loadGoals()
      if (selectedId) await loadDetail(selectedId)
    } else {
      setMessage({ type: 'error', text: json.error })
    }
  }

  return (
    <div className="assessments-page">
      <h1>Assessments</h1>
      <p className="grade-legend">
        <span>MANA — Goal Not Yet Achieved</span>
        <span>MPA — Goal Partially Achieved</span>
        <span>MA — Goal Achieved</span>
      </p>

      {message && (
        <div className={`message message-${message.type}`} role="alert">{message.text}</div>
      )}

      {/* Goal management */}
      <div className="goal-management">
        <div className="goal-chips">
          {goals.map((g) => (
            <span key={g} className="goal-chip">
              {g}
              <button onClick={() => handleRemoveGoal(g)} aria-label={`Remove goal ${g}`}>×</button>
            </span>
          ))}
        </div>
        <div className="goal-add">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
            placeholder="New goal name"
            aria-label="New goal name"
          />
          <button onClick={handleAddGoal} disabled={!newGoal.trim()}>Add Goal</button>
        </div>
      </div>

      {/* Class selector */}
      <div className="class-selector">
        <label htmlFor="class-select">Class</label>
        <select
          id="class-select"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">— Select a class —</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.topic} ({c.year} / {c.semester})
            </option>
          ))}
        </select>
      </div>

      {/* Matrix */}
      {!selectedId ? (
        <p className="empty-state">Select a class to view its assessments.</p>
      ) : loadingMatrix ? (
        <p className="empty-state">Loading...</p>
      ) : !detail ? null : detail.students.length === 0 ? (
        <p className="empty-state">No students enrolled in this class.</p>
      ) : (
        <div className="matrix-wrapper">
          <table className="assessment-matrix">
            <thead>
              <tr>
                <th className="student-col">Student</th>
                {detail.goals.map((goal) => <th key={goal}>{goal}</th>)}
              </tr>
            </thead>
            <tbody>
              {detail.students.map((student) => (
                <tr key={student.id}>
                  <td className="student-name">{student.name}</td>
                  {detail.goals.map((goal) => {
                    const cellKey = `${student.id}:${goal}`
                    const grade = getGrade(student.id, goal)
                    return (
                      <td key={goal} className={`grade-cell grade-${grade || 'empty'}`}>
                        <select
                          value={grade}
                          onChange={(e) => handleGradeChange(student.id, goal, e.target.value)}
                          disabled={savingCell === cellKey}
                          aria-label={`Grade for ${student.name} on ${goal}`}
                        >
                          <option value="">—</option>
                          <option value="MANA">MANA</option>
                          <option value="MPA">MPA</option>
                          <option value="MA">MA</option>
                        </select>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AssessmentsPage
