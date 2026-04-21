import { Assessment, Grade } from './types.js'
import { getAssessments, saveAssessments, getStudents } from './data.js'

export const GOALS = ['Requisitos', 'Testes', 'Implementação', 'Documentação']
const VALID_GRADES: Grade[] = ['MANA', 'MPA', 'MA']

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export async function getAssessmentMatrix() {
  const students = await getStudents()
  const assessments = await getAssessments()
  return { students, goals: GOALS, assessments }
}

export async function setAssessment(
  studentId: string,
  goal: string,
  grade: Grade,
): Promise<{ success: boolean; data?: Assessment; error?: string }> {
  if (!GOALS.includes(goal)) {
    return { success: false, error: `Invalid goal. Must be one of: ${GOALS.join(', ')}` }
  }
  if (!VALID_GRADES.includes(grade)) {
    return { success: false, error: `Invalid grade. Must be one of: ${VALID_GRADES.join(', ')}` }
  }

  const students = await getStudents()
  if (!students.find((s) => s.id === studentId)) {
    return { success: false, error: 'Student not found' }
  }

  const assessments = await getAssessments()
  const index = assessments.findIndex((a) => a.studentId === studentId && a.goal === goal)

  if (index !== -1) {
    assessments[index].grade = grade
    assessments[index].updatedAt = new Date().toISOString()
    await saveAssessments(assessments)
    return { success: true, data: assessments[index] }
  }

  const assessment: Assessment = {
    id: generateId(),
    studentId,
    goal,
    grade,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  assessments.push(assessment)
  await saveAssessments(assessments)
  return { success: true, data: assessment }
}

export async function deleteAssessment(
  studentId: string,
  goal: string,
): Promise<{ success: boolean; error?: string }> {
  const assessments = await getAssessments()
  const index = assessments.findIndex((a) => a.studentId === studentId && a.goal === goal)
  if (index === -1) {
    return { success: false, error: 'Assessment not found' }
  }
  assessments.splice(index, 1)
  await saveAssessments(assessments)
  return { success: true }
}
