import { Router, Request, Response } from 'express'
import {
  createClass,
  listClasses,
  getClassDetail,
  updateClass,
  deleteClass,
  enrollStudent,
  enrollMultipleStudents,
  removeStudent,
  setClassAssessment,
  deleteClassAssessment,
} from '../services/classService.js'

const router = Router()

// GET /classes
router.get('/', async (_req: Request, res: Response) => {
  try {
    const classes = await listClasses()
    res.json({ success: true, data: classes })
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// POST /classes
router.post('/', async (req: Request, res: Response) => {
  try {
    const { topic, year, semester } = req.body
    if (!topic || year === undefined || semester === undefined) {
      res.status(400).json({ success: false, error: 'topic, year and semester are required' })
      return
    }
    const result = await createClass({ topic, year: Number(year), semester: Number(semester) })
    if (!result.success) {
      res.status(400).json(result)
      return
    }
    res.status(201).json(result)
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// GET /classes/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const detail = await getClassDetail(req.params.id)
    if (!detail) {
      res.status(404).json({ success: false, error: 'Class not found' })
      return
    }
    res.json({ success: true, data: detail })
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// PUT /classes/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { topic, year, semester } = req.body
    if (topic === undefined && year === undefined && semester === undefined) {
      res.status(400).json({ success: false, error: 'At least one field (topic, year or semester) must be provided' })
      return
    }
    const result = await updateClass(req.params.id, {
      ...(topic !== undefined && { topic }),
      ...(year !== undefined && { year: Number(year) }),
      ...(semester !== undefined && { semester: Number(semester) }),
    })
    if (!result.success) {
      res.status(400).json(result)
      return
    }
    res.json(result)
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// DELETE /classes/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await deleteClass(req.params.id)
    if (!result.success) {
      res.status(404).json(result)
      return
    }
    res.json(result)
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// POST /classes/:id/students/bulk — enroll multiple
router.post('/:id/students/bulk', async (req: Request, res: Response) => {
  try {
    const { studentIds } = req.body
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      res.status(400).json({ success: false, error: 'studentIds array is required' })
      return
    }
    const result = await enrollMultipleStudents(req.params.id, studentIds)
    res.json(result)
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// POST /classes/:id/students — enroll single
router.post('/:id/students', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.body
    if (!studentId) {
      res.status(400).json({ success: false, error: 'studentId is required' })
      return
    }
    const result = await enrollStudent(req.params.id, studentId)
    if (!result.success) {
      res.status(400).json(result)
      return
    }
    res.status(201).json(result)
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// DELETE /classes/:id/students/:studentId — remove
router.delete('/:id/students/:studentId', async (req: Request, res: Response) => {
  try {
    const result = await removeStudent(req.params.id, req.params.studentId)
    if (!result.success) {
      res.status(404).json(result)
      return
    }
    res.json(result)
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// PUT /classes/:classId/assessments/:studentId/:goal
router.put('/:classId/assessments/:studentId/:goal', async (req: Request, res: Response) => {
  try {
    const { grade } = req.body
    if (!grade) {
      res.status(400).json({ success: false, error: 'Grade is required' })
      return
    }
    const goal = decodeURIComponent(req.params.goal)
    const result = await setClassAssessment(req.params.classId, req.params.studentId, goal, grade)
    if (!result.success) {
      res.status(400).json(result)
      return
    }
    res.json(result)
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// DELETE /classes/:classId/assessments/:studentId/:goal
router.delete('/:classId/assessments/:studentId/:goal', async (req: Request, res: Response) => {
  try {
    const goal = decodeURIComponent(req.params.goal)
    const result = await deleteClassAssessment(req.params.classId, req.params.studentId, goal)
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
