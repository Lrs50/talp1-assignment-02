const { Given, When, Then, Before } = require('@cucumber/cucumber')
const request = require('supertest')
const { expect } = require('chai')
const appModule = require('../../backend/dist/index.js')
const { getStudents, saveStudents } = require('../../backend/dist/services/data.js')

// Handle both ES6 default exports and CommonJS exports
const app = appModule.default || appModule

const context = {
  students: {},
  form: {},
  response: null,
  statusCode: 0,
  error: null,
}

// Reset data before each scenario
Before(async function () {
  await saveStudents([])
  context.students = {}
  context.form = {}
  context.response = null
  context.statusCode = 0
  context.error = null
})

// ===== GIVEN STEPS =====

Given('there is a student with CPF {string}', async function (cpf) {
  const students = await getStudents()
  const student = {
    id: `student-${Date.now()}`,
    name: 'Existing Student',
    cpf: cpf,
    email: `student${cpf}@example.com`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  students.push(student)
  await saveStudents(students)
  context.students[cpf] = student
})

Given('there are students in the system:', async function (dataTable) {
  const students = await getStudents()
  const rows = dataTable.hashes()
  for (const row of rows) {
    const student = {
      id: `student-${Date.now()}-${Math.random()}`,
      name: row.name,
      cpf: row.CPF,
      email: row.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    students.push(student)
    context.students[student.name] = student
  }
  await saveStudents(students)
})

Given('there is a student with:', async function (dataTable) {
  const row = dataTable.rowsHash()
  const student = {
    id: `student-${Date.now()}`,
    name: row['name'],
    cpf: row['CPF'],
    email: row['email'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const students = await getStudents()
  students.push(student)
  await saveStudents(students)
  context.students[student.name] = student
})

// ===== WHEN STEPS =====

When('I am on the students page', async function () {
  // Just a marker - in API testing, this means we're ready to make requests
})

When('I fill in the form with:', async function (dataTable) {
  const row = dataTable.rowsHash()
  context.form = {
    name: row.name || '',
    cpf: row.CPF || '',
    email: row.email || '',
  }
})

When('I click the {string} button', async function (buttonName) {
  if (buttonName === 'Add Student') {
    const res = await request(app)
      .post('/students')
      .send({
        name: context.form.name,
        cpf: context.form.cpf,
        email: context.form.email,
      })
    context.response = res.body
    context.statusCode = res.status
    if (!res.body.success) {
      context.error = res.body.error
    }
  } else if (buttonName === 'Save') {
    const res = await request(app)
      .put(`/students/${context.form.studentId}`)
      .send({
        name: context.form.name,
        email: context.form.email,
      })
    context.response = res.body
    context.statusCode = res.status
    if (!res.body.success) {
      context.error = res.body.error
    }
  }
})

When('I click the edit button for {string}', async function (studentName) {
  const student = context.students[studentName]
  if (student) {
    context.form.studentId = student.id
  }
})

When('I update the email to {string}', function (newEmail) {
  context.form.email = newEmail
})

When('I clear the name field', function () {
  context.form.name = ''
})

When('I click the delete button for {string}', async function (studentName) {
  const student = context.students[studentName]
  if (student) {
    const res = await request(app).delete(`/students/${student.id}`)
    context.response = res.body
    context.statusCode = res.status
    if (!res.body.success) {
      context.error = res.body.error
    }
  }
})

When('I confirm the deletion', async function () {
  // In API testing, deletion is already executed
})

// ===== THEN STEPS =====

Then('I should see the message {string}', function (message) {
  // Verify success response
  expect(context.response.success).to.be.true
  expect(context.statusCode).to.be.oneOf([200, 201])
})

Then('I should see the error {string}', function (errorMessage) {
  expect(context.response.success).to.be.false
  expect(context.error).to.equal(errorMessage)
})

Then('the student {string} should appear in the list', async function (studentName) {
  const res = await request(app).get('/students')
  const students = res.body.data
  const found = students.some((s) => s.name === studentName)
  expect(found).to.be.true
})

Then('the student should not be added', async function () {
  expect(context.response.success).to.be.false
})

Then('I should see {int} students in the list', async function (count) {
  const res = await request(app).get('/students')
  const students = res.body.data
  expect(students.length).to.equal(count)
})

Then('the list should contain {string}', async function (studentName) {
  const res = await request(app).get('/students')
  const students = res.body.data
  const found = students.some((s) => s.name === studentName)
  expect(found).to.be.true
})

Then('the student {string} should have email {string}', async function (studentName, email) {
  const res = await request(app).get('/students')
  const students = res.body.data
  const student = students.find((s) => s.name === studentName)
  expect(student).to.exist
  expect(student.email).to.equal(email)
})

Then("the student's name should remain {string}", async function (studentName) {
  const res = await request(app).get('/students')
  const students = res.body.data
  const student = students.find((s) => s.name === studentName)
  expect(student).to.exist
})

Then('the student {string} should not be in the list', async function (studentName) {
  const res = await request(app).get('/students')
  const students = res.body.data
  const found = students.some((s) => s.name === studentName)
  expect(found).to.be.false
})
