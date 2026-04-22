// Email UI tests: grades are set through the browser (Selenium); notification
// queuing and batch-send verification are done via API (axios).
const { Given, When, Then, Before } = require('@cucumber/cucumber')
const { By, until } = require('selenium-webdriver')
const { expect } = require('chai')
const axios = require('axios')
const { getDriver } = require('./ui-setup')

let driver
const BASE_URL = 'http://frontend:5173'
const API_URL = 'http://localhost:3001'

const ctx = {
  classes: {},
  students: {},
  batchResult: null,
}

Before(function () {
  driver = getDriver()
  ctx.classes = {}
  ctx.students = {}
  ctx.batchResult = null
})

// ===== HELPERS =====

async function navigateToClassDetail(topic) {
  await driver.get(BASE_URL)
  await driver.wait(until.elementLocated(By.css('.app-nav')), 10000)
  // Students → Classes ensures ClassesPage remounts fresh on every call
  const studentsBtn = await driver.findElement(By.xpath('//button[normalize-space()="Students"]'))
  await studentsBtn.click()
  await driver.wait(until.elementLocated(By.css('input[name="name"]')), 10000)
  const classesBtn = await driver.findElement(By.xpath('//button[normalize-space()="Classes"]'))
  await classesBtn.click()
  await driver.wait(
    until.elementLocated(By.css('.classes-list table, .classes-list p')),
    10000,
  )
  const rows = await driver.findElements(By.css('.classes-list table tbody tr'))
  for (const row of rows) {
    const text = await row.getText()
    if (text.includes(topic)) {
      await row.findElement(By.css('button.btn-view')).click()
      break
    }
  }
  await driver.wait(until.elementLocated(By.css('.assessment-matrix, .empty-state')), 10000)
}

async function resolveIds(studentName, topic) {
  const [classesRes, studentsRes] = await Promise.all([
    axios.get(`${API_URL}/classes`),
    axios.get(`${API_URL}/students`),
  ])
  const cls = classesRes.data.data.find((c) => c.topic === topic)
  const student = studentsRes.data.data.find((s) => s.name === studentName)
  ctx.classes[topic] = cls
  ctx.students[studentName] = student
  return { cls, student }
}

// ===== GIVEN STEPS =====

Given('the notification queue is empty', async function () {
  await axios.delete(`${API_URL}/email/pending`)
  ctx.batchResult = null
})

Given('no assessments have been changed today', function () {
  // handled by ui-setup.js Before hook (clean state) + notification queue clear above
})

// ===== WHEN STEPS =====

When(
  'the professor sets the assessment for {string} on goal {string} to {string} in {string}',
  async function (studentName, goal, grade, topic) {
    const { cls, student } = await resolveIds(studentName, topic)
    await navigateToClassDetail(topic)

    await driver.wait(until.elementLocated(By.css('.assessment-matrix')), 10000)

    // Find goal column index
    const headers = await driver.findElements(By.css('.assessment-matrix thead tr th'))
    let goalIndex = -1
    for (let i = 0; i < headers.length; i++) {
      if ((await headers[i].getText()) === goal) { goalIndex = i; break }
    }
    expect(goalIndex).to.not.equal(-1, `Goal "${goal}" not found`)

    // Find student row
    const rows = await driver.findElements(By.css('.assessment-matrix tbody tr'))
    for (const row of rows) {
      const name = await row.findElement(By.css('.student-name')).then((el) => el.getText())
      if (name === studentName) {
        const cells = await row.findElements(By.css('td'))
        const select = await cells[goalIndex].findElement(By.css('select'))
        await select.findElement(By.css(`option[value="${grade}"]`)).click()
        await driver.sleep(500)
        break
      }
    }

    // Update local ctx with resolved IDs for later assertions
    ctx.classes[topic] = cls
    ctx.students[studentName] = student
  },
)

When('the daily email batch runs', async function () {
  const res = await axios.post(`${API_URL}/email/send-daily`)
  ctx.batchResult = res.data.data
})

// ===== THEN STEPS =====

Then(
  'the pending notification count for {string} should be {int}',
  async function (studentName, count) {
    const [pendingRes, studentsRes] = await Promise.all([
      axios.get(`${API_URL}/email/pending`),
      axios.get(`${API_URL}/students`),
    ])
    const student = studentsRes.data.data.find((s) => s.name === studentName)
    const forStudent = pendingRes.data.data.filter((n) => n.studentId === student.id)
    expect(forStudent).to.have.length(count)
  },
)

Then(/^the batch should have sent (\d+) emails?$/, function (countStr) {
  expect(ctx.batchResult.sent).to.equal(Number(countStr))
})

Then('the batch should include an email to {string}', function (to) {
  expect(ctx.batchResult.emails.some((e) => e.to === to)).to.be.true
})

Then(
  'the email to {string} should list goal {string} graded {string}',
  function (to, goal, grade) {
    const email = ctx.batchResult.emails.find((e) => e.to === to)
    expect(email).to.exist
    const entry = email.goals.find((g) => g.goal === goal)
    expect(entry).to.exist
    expect(entry.grade).to.equal(grade)
  },
)

Then('the email to {string} should contain {int} goals', function (to, count) {
  const email = ctx.batchResult.emails.find((e) => e.to === to)
  expect(email).to.exist
  expect(email.goals).to.have.length(count)
})
