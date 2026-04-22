export interface Student {
  id: string
  name: string
  cpf: string
  email: string
  createdAt: string
  updatedAt: string
}

export type Grade = 'MANA' | 'MPA' | 'MA'

export interface Assessment {
  id: string
  studentId: string
  goal: string
  grade: Grade
  createdAt: string
  updatedAt: string
}

export interface Class {
  id: string
  topic: string
  year: number
  semester: number
  createdAt: string
  updatedAt: string
}

export interface Enrollment {
  id: string
  classId: string
  studentId: string
  createdAt: string
}

export interface ClassAssessment {
  id: string
  classId: string
  studentId: string
  goal: string
  grade: Grade
  createdAt: string
  updatedAt: string
}

export interface EmailNotification {
  id: string
  studentId: string
  studentName: string
  studentEmail: string
  classId: string
  className: string
  goal: string
  grade: Grade
  date: string
  sent: boolean
  createdAt: string
  updatedAt: string
}
