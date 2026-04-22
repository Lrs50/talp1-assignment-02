import { getGoals, saveGoals, getClassAssessments, saveClassAssessments } from './data.js'

export async function listGoals(): Promise<string[]> {
  return getGoals()
}

export async function addGoal(
  name: string,
): Promise<{ success: boolean; data?: string[]; error?: string }> {
  if (!name || !name.trim()) return { success: false, error: 'Goal name is required' }
  const goals = await getGoals()
  const trimmed = name.trim()
  if (goals.includes(trimmed)) return { success: false, error: 'Goal already exists' }
  goals.push(trimmed)
  await saveGoals(goals)
  return { success: true, data: goals }
}

export async function removeGoal(
  name: string,
): Promise<{ success: boolean; data?: string[]; error?: string }> {
  const goals = await getGoals()
  const idx = goals.indexOf(name)
  if (idx === -1) return { success: false, error: 'Goal not found' }
  goals.splice(idx, 1)
  await saveGoals(goals)
  const assessments = await getClassAssessments()
  await saveClassAssessments(assessments.filter((a) => a.goal !== name))
  return { success: true, data: goals }
}

export async function resetGoals(defaults: string[]): Promise<void> {
  await saveGoals(defaults)
}
