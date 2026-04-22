import { Router, Request, Response } from 'express'
import { getPendingNotifications, sendDailyBatch, clearPendingNotifications } from '../services/emailService.js'

const router = Router()

// GET /email/pending — list today's unsent notifications
router.get('/pending', async (_req: Request, res: Response) => {
  try {
    const notifications = await getPendingNotifications()
    res.json({ success: true, data: notifications })
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// POST /email/send-daily — trigger the daily batch
router.post('/send-daily', async (_req: Request, res: Response) => {
  try {
    const result = await sendDailyBatch()
    res.json({ success: true, data: result })
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// DELETE /email/pending — clear the queue (test helper)
router.delete('/pending', async (_req: Request, res: Response) => {
  try {
    await clearPendingNotifications()
    res.json({ success: true })
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

export default router
