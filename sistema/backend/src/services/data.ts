import fs from 'fs/promises'
import path from 'path'
import { Student, Assessment, Class, Enrollment, ClassAssessment, EmailNotification } from './types.js'

const STUDENTS_FILE = path.join(process.cwd(), 'data', 'students.json')
const ASSESSMENTS_FILE = path.join(process.cwd(), 'data', 'assessments.json')
const CLASSES_FILE = path.join(process.cwd(), 'data', 'classes.json')
const ENROLLMENTS_FILE = path.join(process.cwd(), 'data', 'enrollments.json')
const CLASS_ASSESSMENTS_FILE = path.join(process.cwd(), 'data', 'class-assessments.json')
const NOTIFICATIONS_FILE = path.join(process.cwd(), 'data', 'notifications.json')

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

export const getAssessments = () => readJson<Assessment>(ASSESSMENTS_FILE)
export const saveAssessments = (d: Assessment[]) => writeJson(ASSESSMENTS_FILE, d)

export const getClasses = () => readJson<Class>(CLASSES_FILE)
export const saveClasses = (d: Class[]) => writeJson(CLASSES_FILE, d)

export const getEnrollments = () => readJson<Enrollment>(ENROLLMENTS_FILE)
export const saveEnrollments = (d: Enrollment[]) => writeJson(ENROLLMENTS_FILE, d)

export const getClassAssessments = () => readJson<ClassAssessment>(CLASS_ASSESSMENTS_FILE)
export const saveClassAssessments = (d: ClassAssessment[]) => writeJson(CLASS_ASSESSMENTS_FILE, d)

export const getNotifications = () => readJson<EmailNotification>(NOTIFICATIONS_FILE)
export const saveNotifications = (d: EmailNotification[]) => writeJson(NOTIFICATIONS_FILE, d)
