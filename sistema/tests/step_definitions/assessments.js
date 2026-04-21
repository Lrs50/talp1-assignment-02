const { Given, When, Then, Before } = require('@cucumber/cucumber')
const request = require('supertest')
const { expect } = require('chai')
const appModule = require('../../backend/dist/index.js')
const { saveStudents, saveAssessments } = require('../../backend/dist/services/data.js')

const app = appModule.default || appModule

const context = {
  students: {},
  response: null,
  statusCode: 0,
}

Before(async function () {
  await saveStudents([])
  await saveAssessments([])
  context.students = {}
  context.response = null
  context.statusCode = 0
})

// ===== GIVEN STEPS =====

Given('the assessments data is clean', function () {
  // handled by Before hook
})

Given('there are students registered:', async function (dataTable) {
  const rows = dataTable.hashes()
  for (const row of rows) {
    const res = await request(app).post('/students').send({
      name: row.name,
      cpf: row.CPF,
      email: row.email,
    })
    if (res.body.data) {
      context.students[row.name] = res.body.data
    }
  }
})

Given(
  'a student {string} with CPF {string} and email {string} is registered',
  async function (name, cpf, email) {
    const res = await request(app).post('/students').send({ name, cpf, email })
    if (res.body.data) {
      context.students[name] = res.body.data
    }
  },
)

Given('{string} has grade {string} on goal {string}', async function (studentName, grade, goal) {
  const student = context.students[studentName]
  await request(app)
    .put(`/assessments/${student.id}/${encodeURIComponent(goal)}`)
    .send({ grade })
})

Given('there are no students registered', function () {
  // students already cleared in Before hook
})

// ===== WHEN STEPS =====

When('I request the assessments table', async function () {
  const res = await request(app).get('/assessments')
  context.response = res.body
  context.statusCode = res.status
})

When(
  'I set the grade {string} for student {string} on goal {string}',
  async function (grade, studentName, goal) {
    const student = context.students[studentName]
    const res = await request(app)
      .put(`/assessments/${student.id}/${encodeURIComponent(goal)}`)
      .send({ grade })
    context.response = res.body
    context.statusCode = res.status
  },
)

// ===== THEN STEPS =====

Then('the response should list {int} students', function (count) {
  expect(context.response.success).to.be.true
  expect(context.response.data.students).to.have.length(count)
})

Then('the goals list should include {string}', function (goal) {
  expect(context.response.data.goals).to.include(goal)
})

Then('the response should return success', function () {
  expect(context.response.success).to.be.true
})

Then(
  'the grade {string} should be stored for {string} on goal {string}',
  async function (grade, studentName, goal) {
    const res = await request(app).get('/assessments')
    const student = context.students[studentName]
    const assessment = res.body.data.assessments.find(
      (a) => a.studentId === student.id && a.goal === goal,
    )
    expect(assessment).to.exist
    expect(assessment.grade).to.equal(grade)
  },
)
