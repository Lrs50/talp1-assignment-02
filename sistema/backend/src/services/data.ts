import fs from 'fs/promises'
import path from 'path'
import { Student, Class, Enrollment, ClassAssessment, EmailNotification } from './types.js'

const DATA_DIR = path.join(process.cwd(), 'data')
const STUDENTS_FILE = path.join(DATA_DIR, 'students.json')
const CLASSES_FILE = path.join(DATA_DIR, 'classes.json')
const ENROLLMENTS_FILE = path.join(DATA_DIR, 'enrollments.json')
const CLASS_ASSESSMENTS_FILE = path.join(DATA_DIR, 'class-assessments.json')
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json')
const GOALS_FILE = path.join(DATA_DIR, 'goals.json')

const DEFAULT_GOALS = ['Requirements', 'Tests', 'Implementation', 'Documentation']

async function readJson<T>(file: string): Promise<T[]> {
  try {
    return JSON.parse(await fs.readFile(file, 'utf-8'))
  } catch {
    return []
  }
}

async function writeJson<T>(file: string, data: T[]): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf-8')
}

export const getStudents = () => readJson<Student>(STUDENTS_FILE)
export const saveStudents = (d: Student[]) => writeJson(STUDENTS_FILE, d)

export const getClasses = () => readJson<Class>(CLASSES_FILE)
export const saveClasses = (d: Class[]) => writeJson(CLASSES_FILE, d)

export const getEnrollments = () => readJson<Enrollment>(ENROLLMENTS_FILE)
export const saveEnrollments = (d: Enrollment[]) => writeJson(ENROLLMENTS_FILE, d)

export const getClassAssessments = () => readJson<ClassAssessment>(CLASS_ASSESSMENTS_FILE)
export const saveClassAssessments = (d: ClassAssessment[]) => writeJson(CLASS_ASSESSMENTS_FILE, d)

export const getNotifications = () => readJson<EmailNotification>(NOTIFICATIONS_FILE)
export const saveNotifications = (d: EmailNotification[]) => writeJson(NOTIFICATIONS_FILE, d)

export async function getGoals(): Promise<string[]> {
  try {
    const raw = await fs.readFile(GOALS_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...DEFAULT_GOALS]
  } catch {
    return [...DEFAULT_GOALS]
  }
}

export async function saveGoals(goals: string[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(GOALS_FILE, JSON.stringify(goals, null, 2), 'utf-8')
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
