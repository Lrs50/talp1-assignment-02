import React, { useState, useEffect, useCallback } from 'react'
import './ClassDetailPage.css'

type Grade = 'MANA' | 'MPA' | 'MA' | ''

interface Student {
  id: string
  name: string
  cpf: string
  email: string
}

interface ClassAssessment {
  studentId: string
  goal: string
  grade: Grade
}

interface ClassInfo {
  id: string
  topic: string
  year: number
  semester: number
}

interface ClassDetail {
  cls: ClassInfo
  students: Student[]
  goals: string[]
  assessments: ClassAssessment[]
}

interface ClassDetailPageProps {
  classId: string
  onBack: () => void
}

const ClassDetailPage: React.FC<ClassDetailPageProps> = ({ classId, onBack }) => {
  const [detail, setDetail] = useState<ClassDetail | null>(null)
  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [enrollingId, setEnrollingId] = useState('')
  const [savingCell, setSavingCell] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const loadDetail = useCallback(async () => {
    setLoading(true)
    try {
      const [detailRes, studentsRes] = await Promise.all([
        fetch(`/classes/${classId}`),
        fetch('/students'),
      ])
      const detailJson = await detailRes.json()
      const studentsJson = await studentsRes.json()
      if (detailJson.success) setDetail(detailJson.data)
      if (studentsJson.success) setAllStudents(studentsJson.data)
    } catch {
      setMessage({ type: 'error', text: 'Failed to load class data' })
    } finally {
      setLoading(false)
    }
  }, [classId])

  useEffect(() => {
    loadDetail()
  }, [loadDetail])

  const enrolledIds = new Set(detail?.students.map((s) => s.id) ?? [])
  const availableStudents = allStudents.filter((s) => !enrolledIds.has(s.id))

  const getGrade = (studentId: string, goal: string): Grade => {
    const a = detail?.assessments.find((a) => a.studentId === studentId && a.goal === goal)
    return a ? a.grade : ''
  }

  const handleEnroll = async () => {
    if (!enrollingId) return
    setMessage(null)
    try {
      const res = await fetch(`/classes/${classId}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: enrollingId }),
      })
      const json = await res.json()
      if (json.success) {
        setMessage({ type: 'success', text: 'Student enrolled' })
        setEnrollingId('')
        await loadDetail()
      } else {
        setMessage({ type: 'error', text: json.error })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to enroll student' })
    }
  }

  const handleRemove = async (studentId: string) => {
    if (!confirm('Remove this student from the class?')) return
    setMessage(null)
    try {
      const res = await fetch(`/classes/${classId}/students/${studentId}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        setMessage({ type: 'success', text: 'Student removed' })
        await loadDetail()
      } else {
        setMessage({ type: 'error', text: json.error })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to remove student' })
    }
  }

  const handleGradeChange = async (studentId: string, goal: string, grade: string) => {
    const cellKey = `${studentId}:${goal}`
    setSavingCell(cellKey)
    setMessage(null)
    try {
      if (grade === '') {
        await fetch(`/classes/${classId}/assessments/${studentId}/${encodeURIComponent(goal)}`, {
          method: 'DELETE',
        })
      } else {
        await fetch(`/classes/${classId}/assessments/${studentId}/${encodeURIComponent(goal)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ grade }),
        })
      }
      setMessage({ type: 'success', text: 'Assessment saved' })
      await loadDetail()
    } catch {
      setMessage({ type: 'error', text: 'Failed to save assessment' })
    } finally {
      setSavingCell(null)
    }
  }

  if (loading && !detail) return <div className="class-detail-page"><p>Loading...</p></div>
  if (!detail) return <div className="class-detail-page"><p>Class not found.</p></div>

  return (
    <div className="class-detail-page">
      <div className="detail-header">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <div>
          <h1>{detail.cls.topic}</h1>
          <span className="detail-meta">{detail.cls.year} · Semester {detail.cls.semester}</span>
        </div>
      </div>

      {message && (
        <div className={`message message-${message.type}`} role="alert">
          {message.text}
        </div>
      )}

      {/* Enroll student */}
      {availableStudents.length > 0 && (
        <div className="enroll-section">
          <select
            value={enrollingId}
            onChange={(e) => setEnrollingId(e.target.value)}
            aria-label="Select student to enroll"
          >
            <option value="">— Select student to enroll —</option>
            {availableStudents.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <button onClick={handleEnroll} disabled={!enrollingId} className="btn-enroll">
            Enroll
          </button>
        </div>
      )}

      {/* Assessment matrix */}
      {detail.students.length === 0 ? (
        <p className="empty-state">No students enrolled in this class.</p>
      ) : (
        <div className="matrix-wrapper">
          <table className="assessment-matrix">
            <thead>
              <tr>
                <th className="student-col">Student</th>
                {detail.goals.map((goal) => (
                  <th key={goal}>{goal}</th>
                ))}
                <th>Remove</th>
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
                  <td>
                    <button
                      onClick={() => handleRemove(student.id)}
                      className="btn-delete btn-remove-student"
                      aria-label={`Remove ${student.name}`}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ClassDetailPage
