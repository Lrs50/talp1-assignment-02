import React, { useState, useEffect } from 'react'
import './StudentsPage.css'

interface Student {
  id: string
  name: string
  cpf: string
  email: string
  createdAt: string
  updatedAt: string
}

export const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', cpf: '', email: '' })

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

  // Fetch students on mount
  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/students`)
      const json = await res.json()
      if (json.success) {
        setStudents(json.data)
      }
    } catch (err) {
      console.error('Error loading students:', err)
      setMessage({ type: 'error', text: 'Failed to load students' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    try {
      const res = await fetch(`${API_URL}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          cpf: form.cpf,
          email: form.email,
        }),
      })

      const json = await res.json()

      if (json.success) {
        setMessage({ type: 'success', text: 'Student added successfully' })
        setForm({ name: '', cpf: '', email: '' })
        await loadStudents()
      } else {
        setMessage({ type: 'error', text: json.error })
      }
    } catch (err) {
      console.error('Error adding student:', err)
      setMessage({ type: 'error', text: 'Failed to add student' })
    }
  }

  const handleEditStudent = (student: Student) => {
    setEditingId(student.id)
    setForm({ name: student.name, cpf: student.cpf, email: student.email })
  }

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!editingId) return

    try {
      const res = await fetch(`${API_URL}/students/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
        }),
      })

      const json = await res.json()

      if (json.success) {
        setMessage({ type: 'success', text: 'Student updated successfully' })
        setEditingId(null)
        setForm({ name: '', cpf: '', email: '' })
        await loadStudents()
      } else {
        setMessage({ type: 'error', text: json.error })
      }
    } catch (err) {
      console.error('Error updating student:', err)
      setMessage({ type: 'error', text: 'Failed to update student' })
    }
  }

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return

    setMessage(null)

    try {
      const res = await fetch(`${API_URL}/students/${id}`, {
        method: 'DELETE',
      })

      const json = await res.json()

      if (json.success) {
        setMessage({ type: 'success', text: 'Student removed successfully' })
        await loadStudents()
      } else {
        setMessage({ type: 'error', text: json.error })
      }
    } catch (err) {
      console.error('Error deleting student:', err)
      setMessage({ type: 'error', text: 'Failed to delete student' })
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setForm({ name: '', cpf: '', email: '' })
  }

  return (
    <div className="students-page">
      <h1>Student Management</h1>

      {message && (
        <div className={`message message-${message.type}`} role="alert">
          {message.text}
        </div>
      )}

      <form onSubmit={editingId ? handleSaveStudent : handleAddStudent} className="student-form">
        <h2>{editingId ? 'Edit Student' : 'Add Student'}</h2>

        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            id="name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleInputChange}
            placeholder="John Silva"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="cpf">CPF:</label>
          <input
            id="cpf"
            type="text"
            name="cpf"
            value={form.cpf}
            onChange={handleInputChange}
            placeholder="12345678901"
            disabled={editingId !== null}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleInputChange}
            placeholder="john@example.com"
          />
        </div>

        <div className="form-actions">
          <button type="submit">{editingId ? 'Save' : 'Add Student'}</button>
          {editingId && <button type="button" onClick={handleCancel}>Cancel</button>}
        </div>
      </form>

      <div className="students-list">
        <h2>Registered Students ({students.length})</h2>

        {loading ? (
          <p>Loading...</p>
        ) : students.length === 0 ? (
          <p>No students registered yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>CPF</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.cpf}</td>
                  <td>{student.email}</td>
                  <td>
                    <button onClick={() => handleEditStudent(student)} className="btn-edit">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteStudent(student.id)} className="btn-delete">
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

export default StudentsPage
