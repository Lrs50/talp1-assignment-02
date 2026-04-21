import fs from 'fs/promises'
import path from 'path'
import { Student } from './types.js'

const STUDENTS_FILE = path.join(process.cwd(), 'data', 'students.json')

export async function getStudents(): Promise<Student[]> {
  try {
    const data = await fs.readFile(STUDENTS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

export async function saveStudents(students: Student[]): Promise<void> {
  await fs.writeFile(STUDENTS_FILE, JSON.stringify(students, null, 2), 'utf-8')
}
