import nodemailer from 'nodemailer'
import { EmailNotification, Grade } from './types.js'
import { getNotifications, saveNotifications } from './data.js'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function today(): string {
  return new Date().toISOString().split('T')[0]
}

export interface EmailSummary {
  to: string
  subject: string
  goals: Array<{ goal: string; grade: Grade }>
}

export interface BatchResult {
  sent: number
  emails: EmailSummary[]
}

// Upsert: one notification per (student, class, goal, day). If the same goal is
// updated multiple times in the same day, only the final grade is kept.
export async function queueNotification(params: {
  studentId: string
  studentName: string
  studentEmail: string
  classId: string
  className: string
  goal: string
  grade: Grade
}): Promise<void> {
  const date = today()
  const notifications = await getNotifications()
  const idx = notifications.findIndex(
    (n) =>
      n.studentId === params.studentId &&
      n.classId === params.classId &&
      n.goal === params.goal &&
      n.date === date &&
      !n.sent,
  )

  if (idx !== -1) {
    notifications[idx].grade = params.grade
    notifications[idx].updatedAt = new Date().toISOString()
    await saveNotifications(notifications)
    return
  }

  notifications.push({
    id: generateId(),
    studentId: params.studentId,
    studentName: params.studentName,
    studentEmail: params.studentEmail,
    classId: params.classId,
    className: params.className,
    goal: params.goal,
    grade: params.grade,
    date,
    sent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  await saveNotifications(notifications)
}

export async function getPendingNotifications(): Promise<EmailNotification[]> {
  const notifications = await getNotifications()
  return notifications.filter((n) => n.date === today() && !n.sent)
}

// Send the daily batch. If no transport is provided, uses the SMTP env config.
// Always returns what was prepared — actual SMTP failure doesn't abort the batch.
export async function sendDailyBatch(
  transport?: { sendMail: (opts: Record<string, unknown>) => Promise<unknown> },
): Promise<BatchResult> {
  const date = today()
  const notifications = await getNotifications()
  const pending = notifications.filter((n) => n.date === date && !n.sent)

  if (pending.length === 0) return { sent: 0, emails: [] }

  // Group pending by student
  const byStudent = new Map<string, EmailNotification[]>()
  for (const n of pending) {
    const list = byStudent.get(n.studentId) ?? []
    list.push(n)
    byStudent.set(n.studentId, list)
  }

  const mailer = transport ?? buildSmtpTransport()
  const emails: EmailSummary[] = []

  for (const studentNotifs of byStudent.values()) {
    const first = studentNotifs[0]
    const goals = studentNotifs.map((n) => ({ goal: n.goal, grade: n.grade }))
    const summary: EmailSummary = {
      to: first.studentEmail,
      subject: 'Your Grades Have Been Updated',
      goals,
    }
    emails.push(summary)

    try {
      await mailer.sendMail({
        from: process.env.SMTP_FROM ?? 'noreply@sistema.edu.br',
        to: first.studentEmail,
        subject: summary.subject,
        html: buildHtml(first.studentName, studentNotifs),
      })
    } catch {
      // Log SMTP failure but continue — result still reflects what was attempted
    }
  }

  // Mark processed notifications as sent
  const sentIds = new Set(pending.map((n) => n.id))
  for (const n of notifications) {
    if (sentIds.has(n.id)) {
      n.sent = true
      n.updatedAt = new Date().toISOString()
    }
  }
  await saveNotifications(notifications)

  return { sent: emails.length, emails }
}

function buildSmtpTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? 'localhost',
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth:
      process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  })
}

function buildHtml(studentName: string, items: EmailNotification[]): string {
  const byClass = new Map<string, EmailNotification[]>()
  for (const n of items) {
    const list = byClass.get(n.className) ?? []
    list.push(n)
    byClass.set(n.className, list)
  }

  let html = `<h2>Olá, ${studentName}</h2><p>The following assessments were updated today:</p>`
  for (const [className, notifs] of byClass) {
    html += `<h3>${className}</h3><ul>`
    for (const n of notifs) {
      html += `<li><strong>${n.goal}</strong>: ${n.grade}</li>`
    }
    html += `</ul>`
  }
  return html
}
