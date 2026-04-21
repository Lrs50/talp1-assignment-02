import { Router, Request, Response } from 'express'
import {
  createStudent,
  listStudents,
  getStudent,
  updateStudent,
  deleteStudent,
} from '../services/studentService.js'

const router = Router()

// GET /students — List all students
router.get('/', async (_req: Request, res: Response) => {
  try {
    const students = await listStudents()
    res.json({ success: true, data: students })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// POST /students — Create a new student
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, cpf, email } = req.body

    // Validate required fields
    if (!name || !cpf || !email) {
      res.status(400).json({
        success: false,
        error: !name ? 'Name is required' : !cpf ? 'CPF is required' : 'Email is required',
      })
      return
    }

    const result = await createStudent({ name, cpf, email })

    if (!result.success) {
      res.status(400).json(result)
      return
    }

    res.status(201).json(result)
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// GET /students/:id — Get a specific student
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const student = await getStudent(req.params.id)

    if (!student) {
      res.status(404).json({ success: false, error: 'Student not found' })
      return
    }

    res.json({ success: true, data: student })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// PUT /students/:id — Update a student
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body

    const result = await updateStudent(req.params.id, { name, email })

    if (!result.success) {
      res.status(400).json(result)
      return
    }

    res.json(result)
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// DELETE /students/:id — Delete a student
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await deleteStudent(req.params.id)

    if (!result.success) {
      res.status(404).json(result)
      return
    }

    res.json(result)
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

export default router
