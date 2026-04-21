import { Student } from './types.js'
import { getStudents, saveStudents } from './data.js'

// Simple ID generation
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Validation
function validateCPF(cpf: string): boolean {
  return /^\d{11}$/.test(cpf)
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validateName(name: string): boolean {
  return name.trim().length > 0 && name.length <= 255
}

// Service functions
export async function createStudent(data: {
  name: string
  cpf: string
  email: string
}): Promise<{ success: boolean; data?: Student; error?: string }> {
  // Validate inputs
  if (!validateName(data.name)) {
    return { success: false, error: 'Name is required' }
  }

  if (!validateCPF(data.cpf)) {
    return { success: false, error: 'CPF must be exactly 11 digits' }
  }

  if (!validateEmail(data.email)) {
    return { success: false, error: 'Email must be a valid email address' }
  }

  // Check for duplicate CPF
  const students = await getStudents()
  if (students.some((s) => s.cpf === data.cpf)) {
    return { success: false, error: 'This CPF is already registered' }
  }

  // Create student
  const student: Student = {
    id: generateId(),
    name: data.name.trim(),
    cpf: data.cpf,
    email: data.email.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  students.push(student)
  await saveStudents(students)

  return { success: true, data: student }
}

export async function listStudents(): Promise<Student[]> {
  return await getStudents()
}

export async function getStudent(id: string): Promise<Student | null> {
  const students = await getStudents()
  return students.find((s) => s.id === id) || null
}

export async function updateStudent(
  id: string,
  data: Partial<{ name: string; email: string }>,
): Promise<{ success: boolean; data?: Student; error?: string }> {
  const students = await getStudents()
  const index = students.findIndex((s) => s.id === id)

  if (index === -1) {
    return { success: false, error: 'Student not found' }
  }

  const student = students[index]

  // Validate name if provided
  if (data.name !== undefined && !validateName(data.name)) {
    return { success: false, error: 'Name is required' }
  }

  // Validate email if provided
  if (data.email !== undefined && !validateEmail(data.email)) {
    return { success: false, error: 'Email must be a valid email address' }
  }

  // Update fields
  if (data.name !== undefined) student.name = data.name.trim()
  if (data.email !== undefined) student.email = data.email.trim()
  student.updatedAt = new Date().toISOString()

  students[index] = student
  await saveStudents(students)

  return { success: true, data: student }
}

export async function deleteStudent(id: string): Promise<{ success: boolean; error?: string }> {
  const students = await getStudents()
  const index = students.findIndex((s) => s.id === id)

  if (index === -1) {
    return { success: false, error: 'Student not found' }
  }

  students.splice(index, 1)
  await saveStudents(students)

  return { success: true }
}
