import nodemailer from 'nodemailer'
import { EmailNotification, Grade } from './types.js'
import { getNotifications, saveNotifications, generateId } from './data.js'

function today(): string {
  return new Date().toISOString().split('T')[0]
}

export interface EmailSummary {
  to: string
  subject: string
  goals: Array<{ goal: string; grade: Grade }>
  previewUrl?: string
}

export interface BatchResult {
  sent: number
  emails: EmailSummary[]
}

// Lazily-created Ethereal test transport — no credentials required.
// Ethereal captures outgoing mail and makes it viewable at a URL.
let _transport: nodemailer.Transporter | null = null

async function getTransport(): Promise<nodemailer.Transporter> {
  if (!_transport) {
    const account = await nodemailer.createTestAccount()
    _transport = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: { user: account.user, pass: account.pass },
    })
  }
  return _transport
}

// Upsert: one unsent notification per (student, class, goal, day).
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

type Mailer = nodemailer.Transporter

async function dispatchStudentEmail(mailer: Mailer, notifs: EmailNotification[]): Promise<EmailSummary> {
  const first = notifs[0]
  const goals = notifs.map((n) => ({ goal: n.goal, grade: n.grade }))
  let previewUrl: string | undefined
  try {
    const info = await mailer.sendMail({
      from: '"Assessment System" <noreply@assessment.local>',
      to: first.studentEmail,
      subject: 'Your Grades Have Been Updated',
      html: buildHtml(first.studentName, notifs),
    })
    previewUrl = nodemailer.getTestMessageUrl(info) || undefined
  } catch {
    // Non-fatal — result still reflects what was attempted
  }
  return { to: first.studentEmail, subject: 'Your Grades Have Been Updated', goals, previewUrl }
}

// Sends all currently-pending notifications. Safe to call multiple times per day —
// each notification is marked sent after dispatch and never duplicated.
export async function sendDailyBatch(): Promise<BatchResult> {
  const date = today()
  const notifications = await getNotifications()
  const pending = notifications.filter((n) => n.date === date && !n.sent)
  if (pending.length === 0) return { sent: 0, emails: [] }

  const byStudent = new Map<string, EmailNotification[]>()
  for (const n of pending) {
    const list = byStudent.get(n.studentId) ?? []
    list.push(n)
    byStudent.set(n.studentId, list)
  }

  const mailer = await getTransport()
  const emails: EmailSummary[] = []
  for (const notifs of byStudent.values()) {
    emails.push(await dispatchStudentEmail(mailer, notifs))
  }

  const sentIds = new Set(pending.map((n) => n.id))
  for (const n of notifications) {
    if (sentIds.has(n.id)) { n.sent = true; n.updatedAt = new Date().toISOString() }
  }
  await saveNotifications(notifications)
  return { sent: emails.length, emails }
}

export async function clearPendingNotifications(): Promise<void> {
  await saveNotifications([])
}

function buildHtml(studentName: string, items: EmailNotification[]): string {
  const byClass = new Map<string, EmailNotification[]>()
  for (const n of items) {
    const list = byClass.get(n.className) ?? []
    list.push(n)
    byClass.set(n.className, list)
  }
  let html = `<h2>Hello, ${studentName}</h2><p>The following assessments were updated today:</p>`
  for (const [className, notifs] of byClass) {
    html += `<h3>${className}</h3><ul>`
    for (const n of notifs) {
      html += `<li><strong>${n.goal}</strong>: ${n.grade}</li>`
    }
    html += `</ul>`
  }
  return html
}
