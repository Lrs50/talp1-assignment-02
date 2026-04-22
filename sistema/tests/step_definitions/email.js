const { Given, When, Then, Before } = require('@cucumber/cucumber')
const request = require('supertest')
const { expect } = require('chai')
const appModule = require('../../backend/dist/index.js')
const {
  saveStudents,
  saveClasses,
  saveEnrollments,
  saveClassAssessments,
  saveNotifications,
} = require('../../backend/dist/services/data.js')

const app = appModule.default || appModule

// email.js owns the full lifecycle for email scenarios.
// Class/student/enrollment steps are re-defined here with the same patterns as
// classes.js so this file can also run standalone (test:email). When all step
// files are loaded together (npm test) Cucumber deduplicates by exact text —
// BUT since both classes.js and email.js would define the same patterns,
// that causes ambiguity. So email.js uses its own context and relies on
// classes.js steps for class/student setup by NOT redefining them.
// The email-specific Before resets only notifications; classes.js Before
// resets students/classes/enrollments/classAssessments.
// Together (npm test), both Befores run, giving a fully clean slate.

const emailCtx = {
  classes: {},
  students: {},
  batchResult: null,
}

Before(async function () {
  // Reset email-specific state. Classes.js Before handles the rest when both
  // files are loaded. When running standalone (test:email), we need to reset
  // everything here.
  await saveNotifications([])

  // Standalone reset (no-op when classes.js Before already did this)
  await saveStudents([])
  await saveClasses([])
  await saveEnrollments([])
  await saveClassAssessments([])

  emailCtx.classes = {}
  emailCtx.students = {}
  emailCtx.batchResult = null
})

// ===== EMAIL-SPECIFIC GIVEN STEPS =====
// (These duplicate classes.js step text but are needed for standalone test:email runs.
//  npm test loads both files — to prevent ambiguity, these step texts must differ.
//  We use the exact same texts and rely on Node module caching ensuring Cucumber
//  sees only one definition when both are required.)
// NOTE: When loading both classes.js and email.js together, the class/student
// setup steps come from classes.js and store in classes.js context.
// email.js must also capture them. We do this via the API so we have the IDs.

Given('the notification queue is empty', async function () {
  await saveNotifications([])
  emailCtx.batchResult = null
})

Given('no assessments have been changed today', function () {
  // handled by Before hook (clean state)
})

// ===== WHEN STEPS =====

When(
  'the professor sets the assessment for {string} on goal {string} to {string} in {string}',
  async function (studentName, goal, grade, topic) {
    // Resolve IDs via the API since the student/class may have been created by
    // either classes.js steps or email.js Before setup.
    const classesRes = await request(app).get('/classes')
    const cls = classesRes.body.data.find((c) => c.topic === topic)

    const studentsRes = await request(app).get('/students')
    const student = studentsRes.body.data.find((s) => s.name === studentName)

    await request(app)
      .put(`/classes/${cls.id}/assessments/${student.id}/${encodeURIComponent(goal)}`)
      .send({ grade })

    // Cache for later use in Then steps
    emailCtx.classes[topic] = cls
    emailCtx.students[studentName] = student
  },
)

When('the daily email batch runs', async function () {
  const res = await request(app).post('/email/send-daily')
  emailCtx.batchResult = res.body.data
})

// ===== THEN STEPS =====

Then(
  'the pending notification count for {string} should be {int}',
  async function (studentName, count) {
    const res = await request(app).get('/email/pending')
    const studentsRes = await request(app).get('/students')
    const student = studentsRes.body.data.find((s) => s.name === studentName)
    const forStudent = res.body.data.filter((n) => n.studentId === student.id)
    expect(forStudent).to.have.length(count)
  },
)

Then(/^the batch should have sent (\d+) emails?$/, function (countStr) {
  expect(emailCtx.batchResult.sent).to.equal(Number(countStr))
})

Then('the batch should include an email to {string}', function (to) {
  const found = emailCtx.batchResult.emails.some((e) => e.to === to)
  expect(found).to.be.true
})

Then(
  'the email to {string} should list goal {string} graded {string}',
  function (to, goal, grade) {
    const email = emailCtx.batchResult.emails.find((e) => e.to === to)
    expect(email).to.exist
    const goalEntry = email.goals.find((g) => g.goal === goal)
    expect(goalEntry).to.exist
    expect(goalEntry.grade).to.equal(grade)
  },
)

Then('the email to {string} should contain {int} goals', function (to, count) {
  const email = emailCtx.batchResult.emails.find((e) => e.to === to)
  expect(email).to.exist
  expect(email.goals).to.have.length(count)
})
