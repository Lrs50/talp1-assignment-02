import React, { useState, useEffect, useCallback } from 'react'
import './AssessmentsPage.css'

type Grade = 'MANA' | 'MPA' | 'MA' | ''

interface Student {
  id: string
  name: string
  cpf: string
  email: string
}

interface Assessment {
  id: string
  studentId: string
  goal: string
  grade: Grade
}

interface AssessmentMatrix {
  students: Student[]
  goals: string[]
  assessments: Assessment[]
}

export const AssessmentsPage: React.FC = () => {
  const [matrix, setMatrix] = useState<AssessmentMatrix>({ students: [], goals: [], assessments: [] })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const API_URL = ''

  const loadMatrix = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/assessments`)
      const json = await res.json()
      if (json.success) {
        setMatrix(json.data)
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to load assessments' })
    } finally {
      setLoading(false)
    }
  }, [API_URL])

  useEffect(() => {
    loadMatrix()
  }, [loadMatrix])

  const getGrade = (studentId: string, goal: string): Grade => {
    const a = matrix.assessments.find((a) => a.studentId === studentId && a.goal === goal)
    return a ? a.grade : ''
  }

  const handleGradeChange = async (studentId: string, goal: string, grade: string) => {
    const cellKey = `${studentId}:${goal}`
    setSaving(cellKey)
    setMessage(null)

    try {
      if (grade === '') {
        await fetch(`${API_URL}/assessments/${studentId}/${encodeURIComponent(goal)}`, {
          method: 'DELETE',
        })
      } else {
        await fetch(`${API_URL}/assessments/${studentId}/${encodeURIComponent(goal)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ grade }),
        })
      }
      setMessage({ type: 'success', text: 'Assessment saved' })
      await loadMatrix()
    } catch {
      setMessage({ type: 'error', text: 'Failed to save assessment' })
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="assessments-page">
      <h1>Assessments</h1>

      {message && (
        <div className={`message message-${message.type}`} role="alert">
          {message.text}
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : matrix.students.length === 0 ? (
        <p className="empty-state">No students registered yet.</p>
      ) : (
        <div className="matrix-wrapper">
          <table className="assessment-matrix">
            <thead>
              <tr>
                <th className="student-col">Student</th>
                {matrix.goals.map((goal) => (
                  <th key={goal}>{goal}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.students.map((student) => (
                <tr key={student.id}>
                  <td className="student-name">{student.name}</td>
                  {matrix.goals.map((goal) => {
                    const cellKey = `${student.id}:${goal}`
                    const grade = getGrade(student.id, goal)
                    return (
                      <td key={goal} className={`grade-cell grade-${grade || 'empty'}`}>
                        <select
                          value={grade}
                          onChange={(e) => handleGradeChange(student.id, goal, e.target.value)}
                          disabled={saving === cellKey}
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
