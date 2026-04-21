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
