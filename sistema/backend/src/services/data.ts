import fs from 'fs/promises'
import path from 'path'
import { Student, Assessment } from './types.js'

const STUDENTS_FILE = path.join(process.cwd(), 'data', 'students.json')
const ASSESSMENTS_FILE = path.join(process.cwd(), 'data', 'assessments.json')

export async function getStudents(): Promise<Student[]> {
  try {
    const data = await fs.readFile(STUDENTS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

export async function saveStudents(students: Student[]): Promise<void> {
  const dir = path.dirname(STUDENTS_FILE)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(STUDENTS_FILE, JSON.stringify(students, null, 2), 'utf-8')
}

export async function getAssessments(): Promise<Assessment[]> {
  try {
    const data = await fs.readFile(ASSESSMENTS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

export async function saveAssessments(assessments: Assessment[]): Promise<void> {
  const dir = path.dirname(ASSESSMENTS_FILE)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(ASSESSMENTS_FILE, JSON.stringify(assessments, null, 2), 'utf-8')
}
