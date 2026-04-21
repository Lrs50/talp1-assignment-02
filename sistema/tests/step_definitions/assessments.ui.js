const { Given, When, Then, Before } = require('@cucumber/cucumber')
const { By, until } = require('selenium-webdriver')
const { expect } = require('chai')
const axios = require('axios')
const { getDriver } = require('./ui-setup')

let driver
const BASE_URL = 'http://frontend:5173'
const API_URL = 'http://localhost:3001'

const context = {
  students: {},
}

// Sync — just grabs the shared driver and resets in-memory state
Before(function () {
  driver = getDriver()
  context.students = {}
})

// ===== HELPERS =====

async function navigateToAssessments() {
  await driver.get(BASE_URL)
  await driver.wait(until.elementLocated(By.css('.app-nav')), 10000)
  const btn = await driver.findElement(By.xpath('//button[normalize-space()="Assessments"]'))
  await btn.click()
  await driver.wait(
    until.elementLocated(By.css('.assessment-matrix, .empty-state')),
    10000,
  )
}

async function getGoalColumnIndex(goal) {
  const headers = await driver.findElements(By.css('.assessment-matrix thead tr th'))
  for (let i = 0; i < headers.length; i++) {
    const text = await headers[i].getText()
    if (text === goal) return i
  }
  return -1
}

async function getStudentRow(studentName) {
  const rows = await driver.findElements(By.css('.assessment-matrix tbody tr'))
  for (const row of rows) {
    const nameCell = await row.findElement(By.css('.student-name'))
    const name = await nameCell.getText()
    if (name === studentName) return row
  }
  return null
}

// ===== GIVEN STEPS =====

Given('the assessments data is clean', function () {
  // handled by ui-setup.js Before hook
})

Given('there are students registered:', async function (dataTable) {
  const rows = dataTable.hashes()
  for (const row of rows) {
    try {
      const res = await axios.post(`${API_URL}/students`, {
        name: row.name,
        cpf: row.CPF,
        email: row.email,
      })
      if (res.data.data) context.students[row.name] = res.data.data
    } catch (err) {
      console.error('Failed to create student:', err.message)
    }
  }
})

Given(
  'a student {string} with CPF {string} and email {string} is registered',
  async function (name, cpf, email) {
    try {
      const res = await axios.post(`${API_URL}/students`, { name, cpf, email })
      if (res.data.data) context.students[name] = res.data.data
    } catch (err) {
      console.error('Failed to create student:', err.message)
    }
  },
)

Given('{string} has grade {string} on goal {string}', async function (studentName, grade, goal) {
  const student = context.students[studentName]
  try {
    await axios.put(
      `${API_URL}/assessments/${student.id}/${encodeURIComponent(goal)}`,
      { grade },
    )
  } catch (err) {
    console.error('Failed to set initial grade:', err.message)
  }
})

Given('there are no students registered', function () {
  // students already cleared by ui-setup.js Before hook
})

// ===== WHEN STEPS =====

When('I request the assessments table', async function () {
  await navigateToAssessments()
})

When(
  'I set the grade {string} for student {string} on goal {string}',
  async function (grade, studentName, goal) {
    await navigateToAssessments()

    await driver.wait(until.elementLocated(By.css('.assessment-matrix')), 10000)

    const goalIndex = await getGoalColumnIndex(goal)
    expect(goalIndex).to.not.equal(-1, `Goal "${goal}" not found in table headers`)

    const row = await getStudentRow(studentName)
    expect(row).to.not.be.null

    const cells = await row.findElements(By.css('td'))
    const select = await cells[goalIndex].findElement(By.css('select'))
    const option = await select.findElement(By.css(`option[value="${grade}"]`))
    await option.click()
    await driver.sleep(300)
  },
)

// ===== THEN STEPS =====

Then('the response should list {int} students', async function (count) {
  if (count === 0) {
    await driver.wait(until.elementLocated(By.css('.empty-state')), 5000)
    const text = await driver.findElement(By.css('.empty-state')).getText()
    expect(text).to.include('No students registered')
  } else {
    await driver.wait(until.elementLocated(By.css('.assessment-matrix tbody tr')), 5000)
    const rows = await driver.findElements(By.css('.assessment-matrix tbody tr'))
    expect(rows.length).to.equal(count)
  }
})

Then('the goals list should include {string}', async function (goal) {
  const headers = await driver.findElements(By.css('.assessment-matrix thead tr th'))
  const texts = []
  for (const h of headers) texts.push(await h.getText())
  expect(texts).to.include(goal)
})

Then('the response should return success', async function () {
  const msgDiv = await driver.wait(
    until.elementLocated(By.css('.message-success')),
    5000,
  )
  const text = await msgDiv.getText()
  expect(text).to.include('Assessment saved')
})

Then(
  'the grade {string} should be stored for {string} on goal {string}',
  async function (grade, studentName, goal) {
    await driver.sleep(300)

    const goalIndex = await getGoalColumnIndex(goal)
    const row = await getStudentRow(studentName)
    expect(row).to.not.be.null

    const cells = await row.findElements(By.css('td'))
    const select = await cells[goalIndex].findElement(By.css('select'))
    const value = await select.getAttribute('value')
    expect(value).to.equal(grade)
  },
)
