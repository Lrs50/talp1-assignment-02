import { Class, Enrollment, ClassAssessment, Grade, Student } from './types.js'
import {
  getClasses,
  saveClasses,
  getEnrollments,
  saveEnrollments,
  getClassAssessments,
  saveClassAssessments,
  getStudents,
} from './data.js'
import { GOALS } from './assessmentService.js'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

const VALID_GRADES: Grade[] = ['MANA', 'MPA', 'MA']

interface ClassDetail {
  cls: Class
  students: Student[]
  goals: string[]
  assessments: ClassAssessment[]
}

export async function createClass(data: {
  topic: string
  year: number
  semester: number
}): Promise<{ success: boolean; data?: Class; error?: string }> {
  if (!data.topic || data.topic.trim().length === 0) {
    return { success: false, error: 'Topic is required' }
  }
  if (!Number.isInteger(data.year) || data.year < 2000 || data.year > 2100) {
    return { success: false, error: 'Valid year is required' }
  }
  if (data.semester !== 1 && data.semester !== 2) {
    return { success: false, error: 'Semester must be 1 or 2' }
  }

  const cls: Class = {
    id: generateId(),
    topic: data.topic.trim(),
    year: data.year,
    semester: data.semester,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const classes = await getClasses()
  classes.push(cls)
  await saveClasses(classes)
  return { success: true, data: cls }
}

export async function listClasses(): Promise<Class[]> {
  return getClasses()
}

export async function getClassDetail(id: string): Promise<ClassDetail | null> {
  const classes = await getClasses()
  const cls = classes.find((c) => c.id === id)
  if (!cls) return null

  const enrollments = await getEnrollments()
  const classEnrollments = enrollments.filter((e) => e.classId === id)

  const allStudents = await getStudents()
  const students = classEnrollments
    .map((e) => allStudents.find((s) => s.id === e.studentId))
    .filter((s): s is Student => s !== undefined)

  const allAssessments = await getClassAssessments()
  const assessments = allAssessments.filter((a) => a.classId === id)

  return { cls, students, goals: GOALS, assessments }
}

export async function updateClass(
  id: string,
  data: Partial<{ topic: string; year: number; semester: number }>,
): Promise<{ success: boolean; data?: Class; error?: string }> {
  const classes = await getClasses()
  const index = classes.findIndex((c) => c.id === id)
  if (index === -1) return { success: false, error: 'Class not found' }

  const cls = classes[index]
  if (data.topic !== undefined) {
    if (!data.topic.trim()) return { success: false, error: 'Topic is required' }
    cls.topic = data.topic.trim()
  }
  if (data.year !== undefined) cls.year = data.year
  if (data.semester !== undefined) cls.semester = data.semester
  cls.updatedAt = new Date().toISOString()

  classes[index] = cls
  await saveClasses(classes)
  return { success: true, data: cls }
}

export async function deleteClass(id: string): Promise<{ success: boolean; error?: string }> {
  const classes = await getClasses()
  const index = classes.findIndex((c) => c.id === id)
  if (index === -1) return { success: false, error: 'Class not found' }

  classes.splice(index, 1)
  await saveClasses(classes)

  const enrollments = await getEnrollments()
  await saveEnrollments(enrollments.filter((e) => e.classId !== id))

  const assessments = await getClassAssessments()
  await saveClassAssessments(assessments.filter((a) => a.classId !== id))

  return { success: true }
}

export async function enrollStudent(
  classId: string,
  studentId: string,
): Promise<{ success: boolean; data?: Enrollment; error?: string }> {
  const classes = await getClasses()
  if (!classes.find((c) => c.id === classId)) {
    return { success: false, error: 'Class not found' }
  }

  const allStudents = await getStudents()
  if (!allStudents.find((s) => s.id === studentId)) {
    return { success: false, error: 'Student not found' }
  }

  const enrollments = await getEnrollments()
  if (enrollments.find((e) => e.classId === classId && e.studentId === studentId)) {
    return { success: false, error: 'Student is already enrolled in this class' }
  }

  const enrollment: Enrollment = {
    id: generateId(),
    classId,
    studentId,
    createdAt: new Date().toISOString(),
  }
  enrollments.push(enrollment)
  await saveEnrollments(enrollments)
  return { success: true, data: enrollment }
}

export async function removeStudent(
  classId: string,
  studentId: string,
): Promise<{ success: boolean; error?: string }> {
  const enrollments = await getEnrollments()
  const index = enrollments.findIndex(
    (e) => e.classId === classId && e.studentId === studentId,
  )
  if (index === -1) return { success: false, error: 'Enrollment not found' }

  enrollments.splice(index, 1)
  await saveEnrollments(enrollments)

  const assessments = await getClassAssessments()
  await saveClassAssessments(
    assessments.filter((a) => !(a.classId === classId && a.studentId === studentId)),
  )

  return { success: true }
}

export async function setClassAssessment(
  classId: string,
  studentId: string,
  goal: string,
  grade: Grade,
): Promise<{ success: boolean; data?: ClassAssessment; error?: string }> {
  if (!GOALS.includes(goal)) {
    return { success: false, error: `Invalid goal. Must be one of: ${GOALS.join(', ')}` }
  }
  if (!VALID_GRADES.includes(grade)) {
    return { success: false, error: `Invalid grade. Must be one of: ${VALID_GRADES.join(', ')}` }
  }

  const enrollments = await getEnrollments()
  if (!enrollments.find((e) => e.classId === classId && e.studentId === studentId)) {
    return { success: false, error: 'Student is not enrolled in this class' }
  }

  const assessments = await getClassAssessments()
  const index = assessments.findIndex(
    (a) => a.classId === classId && a.studentId === studentId && a.goal === goal,
  )

  if (index !== -1) {
    assessments[index].grade = grade
    assessments[index].updatedAt = new Date().toISOString()
    await saveClassAssessments(assessments)
    return { success: true, data: assessments[index] }
  }

  const assessment: ClassAssessment = {
    id: generateId(),
    classId,
    studentId,
    goal,
    grade,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  assessments.push(assessment)
  await saveClassAssessments(assessments)
  return { success: true, data: assessment }
}

export async function deleteClassAssessment(
  classId: string,
  studentId: string,
  goal: string,
): Promise<{ success: boolean; error?: string }> {
  const assessments = await getClassAssessments()
  const index = assessments.findIndex(
    (a) => a.classId === classId && a.studentId === studentId && a.goal === goal,
  )
  if (index === -1) return { success: false, error: 'Assessment not found' }
  assessments.splice(index, 1)
  await saveClassAssessments(assessments)
  return { success: true }
}
