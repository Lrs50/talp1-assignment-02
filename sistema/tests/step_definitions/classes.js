const { Given, When, Then, Before } = require('@cucumber/cucumber')
const request = require('supertest')
const { expect } = require('chai')
const appModule = require('../../backend/dist/index.js')
const {
  saveStudents,
  saveClasses,
  saveEnrollments,
  saveClassAssessments,
} = require('../../backend/dist/services/data.js')

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
  context.classes = {}
  context.students = {}
  context.response = null
  context.statusCode = 0
})

// ===== GIVEN STEPS =====

Given('the class data is clean', function () {
  // handled by Before hook
})

Given(
  'a class {string} exists for year {int} semester {int}',
  async function (topic, year, semester) {
    const res = await request(app).post('/classes').send({ topic, year, semester })
    if (res.body.data) context.classes[topic] = res.body.data
  },
)

Given(
  'a student {string} with CPF {string} and email {string} exists',
  async function (name, cpf, email) {
    const res = await request(app).post('/students').send({ name, cpf, email })
    if (res.body.data) context.students[name] = res.body.data
  },
)

Given('{string} is enrolled in class {string}', async function (studentName, topic) {
  const cls = context.classes[topic]
  const student = context.students[studentName]
  await request(app).post(`/classes/${cls.id}/students`).send({ studentId: student.id })
})

Given(
  '{string} has class grade {string} on goal {string} in class {string}',
  async function (studentName, grade, goal, topic) {
    const cls = context.classes[topic]
    const student = context.students[studentName]
    await request(app)
      .put(`/classes/${cls.id}/assessments/${student.id}/${encodeURIComponent(goal)}`)
      .send({ grade })
  },
)

// ===== WHEN STEPS =====

When(
  'I create a class with topic {string} year {int} and semester {int}',
  async function (topic, year, semester) {
    const res = await request(app).post('/classes').send({ topic, year, semester })
    context.response = res.body
    context.statusCode = res.status
    if (res.body.data) context.classes[topic] = res.body.data
  },
)

When('I add student {string} to class {string}', async function (studentName, topic) {
  const cls = context.classes[topic]
  const student = context.students[studentName]
  const res = await request(app)
    .post(`/classes/${cls.id}/students`)
    .send({ studentId: student.id })
  context.response = res.body
  context.statusCode = res.status
})

When('I remove student {string} from class {string}', async function (studentName, topic) {
  const cls = context.classes[topic]
  const student = context.students[studentName]
  const res = await request(app).delete(`/classes/${cls.id}/students/${student.id}`)
  context.response = res.body
  context.statusCode = res.status
})

When('I request the detail of class {string}', async function (topic) {
  const cls = context.classes[topic]
  const res = await request(app).get(`/classes/${cls.id}`)
  context.response = res.body
  context.statusCode = res.status
})

When(
  'I set class grade {string} for {string} on goal {string} in class {string}',
  async function (grade, studentName, goal, topic) {
    const cls = context.classes[topic]
    const student = context.students[studentName]
    const res = await request(app)
      .put(`/classes/${cls.id}/assessments/${student.id}/${encodeURIComponent(goal)}`)
      .send({ grade })
    context.response = res.body
    context.statusCode = res.status
  },
)

When('I delete class {string}', async function (topic) {
  const cls = context.classes[topic]
  const res = await request(app).delete(`/classes/${cls.id}`)
  context.response = res.body
  context.statusCode = res.status
})

// ===== THEN STEPS =====

Then('the class response should indicate success', function () {
  expect(context.response.success).to.be.true
})

Then('a class {string} should exist in the system', async function (topic) {
  const res = await request(app).get('/classes')
  const found = res.body.data.some((c) => c.topic === topic)
  expect(found).to.be.true
})

Then('{string} should be enrolled in {string}', async function (studentName, topic) {
  const cls = context.classes[topic]
  const res = await request(app).get(`/classes/${cls.id}`)
  const found = res.body.data.students.some((s) => s.name === studentName)
  expect(found).to.be.true
})

Then('{string} should not be enrolled in {string}', async function (studentName, topic) {
  const cls = context.classes[topic]
  const res = await request(app).get(`/classes/${cls.id}`)
  const found = res.body.data.students.some((s) => s.name === studentName)
  expect(found).to.be.false
})

Then('the class detail should contain student {string}', function (studentName) {
  const found = context.response.data.students.some((s) => s.name === studentName)
  expect(found).to.be.true
})

Then(
  'the class detail should contain grade {string} for {string} on goal {string}',
  function (grade, studentName, goal) {
    const student = context.response.data.students.find((s) => s.name === studentName)
    expect(student).to.exist
    const assessment = context.response.data.assessments.find(
      (a) => a.studentId === student.id && a.goal === goal,
    )
    expect(assessment).to.exist
    expect(assessment.grade).to.equal(grade)
  },
)

Then(
  'the class grade {string} should be stored for {string} on goal {string} in class {string}',
  async function (grade, studentName, goal, topic) {
    const cls = context.classes[topic]
    const res = await request(app).get(`/classes/${cls.id}`)
    const student = context.students[studentName]
    const assessment = res.body.data.assessments.find(
      (a) => a.studentId === student.id && a.goal === goal,
    )
    expect(assessment).to.exist
    expect(assessment.grade).to.equal(grade)
  },
)

Then('class {string} should no longer exist', async function (topic) {
  const res = await request(app).get('/classes')
  const found = res.body.data.some((c) => c.topic === topic)
  expect(found).to.be.false
})
