import React, { useState, useEffect, useCallback } from 'react'
import './ClassesPage.css'

interface Class {
  id: string
  topic: string
  year: number
  semester: number
}

interface ClassesPageProps {
  onViewClass: (classId: string) => void
}

const ClassesPage: React.FC<ClassesPageProps> = ({ onViewClass }) => {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ topic: '', year: new Date().getFullYear(), semester: 1 })

  const loadClasses = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/classes')
      const json = await res.json()
      if (json.success) setClasses(json.data)
    } catch {
      setMessage({ type: 'error', text: 'Failed to load classes' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadClasses()
  }, [loadClasses])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: name === 'topic' ? value : Number(value) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (!form.topic.trim()) {
      setMessage({ type: 'error', text: 'Topic is required' })
      return
    }
    setSubmitting(true)
    try {
      const url = editingId ? `/classes/${editingId}` : '/classes'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (json.success) {
        setMessage({
          type: 'success',
          text: editingId ? 'Class updated successfully' : 'Class created successfully',
        })
        setEditingId(null)
        setForm({ topic: '', year: new Date().getFullYear(), semester: 1 })
        await loadClasses()
      } else {
        setMessage({ type: 'error', text: json.error })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save class' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (cls: Class) => {
    setEditingId(cls.id)
    setForm({ topic: cls.topic, year: cls.year, semester: cls.semester })
    setMessage(null)
  }

  const handleCancel = () => {
    setEditingId(null)
    setForm({ topic: '', year: new Date().getFullYear(), semester: 1 })
    setMessage(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this class and all its data?')) return
    setSubmitting(true)
    try {
      const res = await fetch(`/classes/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        setMessage({ type: 'success', text: 'Class removed successfully' })
        await loadClasses()
      } else {
        setMessage({ type: 'error', text: json.error })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete class' })
    } finally {
      setSubmitting(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i)

  return (
    <div className="classes-page">
      <h1>Class Management</h1>

      {message && (
        <div className={`message message-${message.type}`} role="alert">
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="class-form">
        <h2>{editingId ? 'Edit Class' : 'New Class'}</h2>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="topic">Topic</label>
            <input
              id="topic"
              name="topic"
              type="text"
              value={form.topic}
              onChange={handleInputChange}
              placeholder="e.g. Software Engineering"
            />
          </div>
          <div className="form-group form-group--sm">
            <label htmlFor="year">Year</label>
            <select id="year" name="year" value={form.year} onChange={handleInputChange}>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="form-group form-group--sm">
            <label htmlFor="semester">Semester</label>
            <select id="semester" name="semester" value={form.semester} onChange={handleInputChange}>
              <option value={1}>1</option>
              <option value={2}>2</option>
            </select>
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" disabled={submitting}>
            {submitting ? (editingId ? 'Saving…' : 'Creating…') : (editingId ? 'Save' : 'Create Class')}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancel} disabled={submitting}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="classes-list">
        <h2>Classes ({classes.length})</h2>
        {loading ? (
          <p>Loading...</p>
        ) : classes.length === 0 ? (
          <p>No classes yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Topic</th>
                <th>Year</th>
                <th>Semester</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((cls) => (
                <tr key={cls.id} className={cls.id === editingId ? 'editing-row' : ''}>
                  <td>{cls.topic}</td>
                  <td>{cls.year}</td>
                  <td>{cls.semester}</td>
                  <td>
                    <button onClick={() => onViewClass(cls.id)} className="btn-view">
                      Open
                    </button>
                    <button onClick={() => handleEdit(cls)} className="btn-edit">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(cls.id)} className="btn-delete">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default ClassesPage
