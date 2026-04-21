import { Router, Request, Response } from 'express'
import {
  getAssessmentMatrix,
  setAssessment,
  deleteAssessment,
} from '../services/assessmentService.js'

const router = Router()

// GET /assessments — return matrix (students + goals + assessments)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const matrix = await getAssessmentMatrix()
    res.json({ success: true, data: matrix })
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// PUT /assessments/:studentId/:goal — set or update a grade
router.put('/:studentId/:goal', async (req: Request, res: Response) => {
  try {
    const { grade } = req.body
    if (!grade) {
      res.status(400).json({ success: false, error: 'Grade is required' })
      return
    }
    const goal = decodeURIComponent(req.params.goal)
    const result = await setAssessment(req.params.studentId, goal, grade)
    if (!result.success) {
      res.status(400).json(result)
      return
    }
    res.json(result)
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// DELETE /assessments/:studentId/:goal — clear a grade
router.delete('/:studentId/:goal', async (req: Request, res: Response) => {
  try {
    const goal = decodeURIComponent(req.params.goal)
    const result = await deleteAssessment(req.params.studentId, goal)
    if (!result.success) {
      res.status(404).json(result)
      return
    }
    res.json(result)
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

export default router
