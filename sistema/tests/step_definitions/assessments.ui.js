const { Given, When, Then, Before } = require('@cucumber/cucumber')
const { By, until } = require('selenium-webdriver')
const { expect } = require('chai')
const axios = require('axios')
const { getDriver } = require('./ui-setup')

let driver
const BASE_URL = 'http://frontend:5173'
const API_URL = 'http://localhost:3001'

Before(function () {
  driver = getDriver()
})

// ===== HELPERS =====

async function navigateToAssessments() {
  await driver.get(BASE_URL)
  await driver.wait(until.elementLocated(By.css('.app-nav')), 10000)
  // Students → Assessments guarantees a fresh AssessmentsPage mount
  const studentsBtn = await driver.findElement(By.xpath('//button[normalize-space()="Students"]'))
  await studentsBtn.click()
  await driver.wait(until.elementLocated(By.css('input[name="name"]')), 10000)
  const assessmentsBtn = await driver.findElement(By.xpath('//button[normalize-space()="Assessments"]'))
  await assessmentsBtn.click()
  // Wait for the class selector to appear
  await driver.wait(until.elementLocated(By.css('select#class-select')), 10000)
}

async function selectClass(topic) {
  const select = await driver.findElement(By.css('select#class-select'))
  const options = await select.findElements(By.css('option'))
  for (const opt of options) {
    const text = await opt.getText()
    if (text.includes(topic)) {
      await opt.click()
      break
    }
  }
  await driver.wait(
    until.elementLocated(By.css('.assessment-matrix, .empty-state')),
    10000,
  )
}

async function getGoalColumnIndex(goal) {
  const headers = await driver.findElements(By.css('.assessment-matrix thead tr th'))
  for (let i = 0; i < headers.length; i++) {
    if ((await headers[i].getText()) === goal) return i
  }
  return -1
}

async function getStudentRow(studentName) {
  const rows = await driver.findElements(By.css('.assessment-matrix tbody tr'))
  for (const row of rows) {
    const name = await row.findElement(By.css('.student-name')).then((el) => el.getText())
    if (name === studentName) return row
  }
  return null
}

// ===== GIVEN STEPS =====

Given('the assessments data is clean', function () {
  // handled by ui-setup.js Before hook
})

// ===== WHEN STEPS =====

When('I request the assessments for class {string}', async function (topic) {
  await navigateToAssessments()
  await selectClass(topic)
})

When(
  'I set the assessment for {string} to {string} on goal {string} in class {string}',
  async function (studentName, grade, goal, topic) {
    await navigateToAssessments()
    await selectClass(topic)
    await driver.wait(until.elementLocated(By.css('.assessment-matrix')), 10000)

    const goalIndex = await getGoalColumnIndex(goal)
    expect(goalIndex).to.not.equal(-1, `Goal "${goal}" not found`)

    const row = await getStudentRow(studentName)
    expect(row).to.not.be.null

    const cells = await row.findElements(By.css('td'))
    const select = await cells[goalIndex].findElement(By.css('select'))
    await select.findElement(By.css(`option[value="${grade}"]`)).click()
    await driver.sleep(500)
  },
)

When('I add the goal {string}', async function (name) {
  await navigateToAssessments()
  const input = await driver.findElement(By.css('input[aria-label="New goal name"]'))
  await input.clear()
  await input.sendKeys(name)
  const btn = await driver.findElement(By.css('.goal-add button'))
  await btn.click()
  await driver.sleep(300)
})

When('I remove the goal {string}', async function (name) {
  const chips = await driver.findElements(By.css('.goal-chip'))
  for (const chip of chips) {
    const text = await chip.getText()
    if (text.includes(name)) {
      await chip.findElement(By.css('button')).click()
      await driver.wait(until.alertIsPresent(), 3000)
      await driver.switchTo().alert().accept()
      await driver.sleep(300)
      break
    }
  }
})

// ===== THEN STEPS =====

Then('the assessment response should contain student {string}', async function (studentName) {
  await driver.wait(until.elementLocated(By.css('.assessment-matrix tbody')), 5000)
  const tbody = await driver.findElement(By.css('.assessment-matrix tbody'))
  expect(await tbody.getText()).to.include(studentName)
})

Then('the assessment response should include goal {string}', async function (goal) {
  const headers = await driver.findElements(By.css('.assessment-matrix thead tr th'))
  const texts = []
  for (const h of headers) texts.push(await h.getText())
  expect(texts).to.include(goal)
})

Then('the assessment response should return success', async function () {
  const msg = await driver.wait(until.elementLocated(By.css('.message-success')), 5000)
  expect(await msg.getText()).to.not.be.empty
})

Then(
  'the grade {string} should be recorded for {string} on goal {string} in class {string}',
  async function (grade, studentName, goal, _topic) {
    await driver.sleep(300)
    const goalIndex = await getGoalColumnIndex(goal)
    const row = await getStudentRow(studentName)
    expect(row).to.not.be.null
    const cells = await row.findElements(By.css('td'))
    const select = await cells[goalIndex].findElement(By.css('select'))
    expect(await select.getAttribute('value')).to.equal(grade)
  },
)

Then('the assessment response should contain {int} students', async function (count) {
  if (count === 0) {
    await driver.wait(async () => {
      const empties = await driver.findElements(By.css('.empty-state'))
      const matrices = await driver.findElements(By.css('.assessment-matrix'))
      return empties.length > 0 && matrices.length === 0
    }, 10000, 'Timed out waiting for empty assessment page')
  } else {
    await driver.wait(until.elementLocated(By.css('.assessment-matrix tbody tr')), 5000)
    const rows = await driver.findElements(By.css('.assessment-matrix tbody tr'))
    expect(rows.length).to.equal(count)
  }
})

Then('the goals list should contain {string}', async function (goal) {
  await driver.sleep(300)
  const chips = await driver.findElements(By.css('.goal-chip'))
  const texts = []
  for (const chip of chips) texts.push(await chip.getText())
  expect(texts.some((t) => t.includes(goal))).to.be.true
})

Then('the goals list should not contain {string}', async function (goal) {
  await driver.sleep(300)
  const chips = await driver.findElements(By.css('.goal-chip'))
  const texts = []
  for (const chip of chips) texts.push(await chip.getText())
  expect(texts.some((t) => t.includes(goal))).to.be.false
})
