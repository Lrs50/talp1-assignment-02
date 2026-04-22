import { Router, Request, Response } from 'express'
import { listGoals, addGoal, removeGoal, resetGoals } from '../services/goalService.js'

const DEFAULT_GOALS = ['Requirements', 'Tests', 'Implementation', 'Documentation']

const router = Router()

// GET /goals
router.get('/', async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await listGoals() })
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// POST /goals — add a goal
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name } = req.body
    if (!name) {
      res.status(400).json({ success: false, error: 'name is required' })
      return
    }
    const result = await addGoal(name)
    if (!result.success) { res.status(400).json(result); return }
    res.status(201).json(result)
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// DELETE /goals/:name — remove a goal (cascades class assessments)
router.delete('/:name', async (req: Request, res: Response) => {
  try {
    const result = await removeGoal(decodeURIComponent(req.params.name))
    if (!result.success) { res.status(404).json(result); return }
    res.json(result)
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// POST /goals/reset — restore defaults (test / dev helper)
router.post('/reset', async (_req: Request, res: Response) => {
  try {
    await resetGoals(DEFAULT_GOALS)
    res.json({ success: true, data: DEFAULT_GOALS })
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

export default router
