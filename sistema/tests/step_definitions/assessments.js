const { Given, When, Then, Before } = require('@cucumber/cucumber')
const request = require('supertest')
const { expect } = require('chai')
const appModule = require('../../backend/dist/index.js')
const {
  saveStudents,
  saveClasses,
  saveEnrollments,
  saveClassAssessments,
  saveGoals,
} = require('../../backend/dist/services/data.js')

const DEFAULT_GOALS = ['Requirements', 'Tests', 'Implementation', 'Documentation']
const app = appModule.default || appModule

const context = {
  classes: {},
  students: {},
  response: null,
  statusCode: 0,
}

Before(async function () {
  await saveStudents([])
  await saveClasses([])
  await saveEnrollments([])
  await saveClassAssessments([])
  await saveGoals(DEFAULT_GOALS)
  context.classes = {}
  context.students = {}
  context.response = null
  context.statusCode = 0
})

// ===== GIVEN STEPS =====

Given('the assessments data is clean', function () {
  // handled by Before hook
})

// Resolve class/student by name via API (avoids cross-file context coupling)
async function findClass(topic) {
  const res = await request(app).get('/classes')
  return res.body.data.find((c) => c.topic === topic)
}
async function findStudent(name) {
  const res = await request(app).get('/students')
  return res.body.data.find((s) => s.name === name)
}

// ===== WHEN STEPS =====

When('I request the assessments for class {string}', async function (topic) {
  const cls = await findClass(topic)
  const res = await request(app).get(`/classes/${cls.id}`)
  context.response = res.body
  context.statusCode = res.status
})

When(
  'I set the assessment for {string} to {string} on goal {string} in class {string}',
  async function (studentName, grade, goal, topic) {
    const [cls, student] = await Promise.all([findClass(topic), findStudent(studentName)])
    const res = await request(app)
      .put(`/classes/${cls.id}/assessments/${student.id}/${encodeURIComponent(goal)}`)
      .send({ grade })
    context.response = res.body
    context.statusCode = res.status
  },
)

When('I add the goal {string}', async function (name) {
  const res = await request(app).post('/goals').send({ name })
  context.response = res.body
  context.statusCode = res.status
})

When('I remove the goal {string}', async function (name) {
  const res = await request(app).delete(`/goals/${encodeURIComponent(name)}`)
  context.response = res.body
  context.statusCode = res.status
})

// ===== THEN STEPS =====

Then('the assessment response should contain student {string}', function (studentName) {
  const found = context.response.data.students.some((s) => s.name === studentName)
  expect(found).to.be.true
})

Then('the assessment response should include goal {string}', function (goal) {
  expect(context.response.data.goals).to.include(goal)
})

Then('the assessment response should return success', function () {
  expect(context.response.success).to.be.true
})

Then(
  'the grade {string} should be recorded for {string} on goal {string} in class {string}',
  async function (grade, studentName, goal, topic) {
    const [cls, student] = await Promise.all([findClass(topic), findStudent(studentName)])
    const res = await request(app).get(`/classes/${cls.id}`)
    const assessment = res.body.data.assessments.find(
      (a) => a.studentId === student.id && a.goal === goal,
    )
    expect(assessment).to.exist
    expect(assessment.grade).to.equal(grade)
  },
)

Then('the assessment response should contain {int} students', function (count) {
  expect(context.response.data.students).to.have.length(count)
})

Then('the goals list should contain {string}', async function (goal) {
  const res = await request(app).get('/goals')
  expect(res.body.data).to.include(goal)
})

Then('the goals list should not contain {string}', async function (goal) {
  const res = await request(app).get('/goals')
  expect(res.body.data).to.not.include(goal)
})
