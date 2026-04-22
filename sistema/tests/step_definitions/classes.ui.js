const { Given, When, Then, Before } = require('@cucumber/cucumber')
const { By, until } = require('selenium-webdriver')
const { expect } = require('chai')
const axios = require('axios')
const { getDriver } = require('./ui-setup')

let driver
const BASE_URL = 'http://frontend:5173'
const API_URL = 'http://localhost:3001'

const context = {
  classes: {},
  students: {},
}

Before(function () {
  driver = getDriver()
  context.classes = {}
  context.students = {}
})

// ===== HELPERS =====

async function navigateToClasses() {
  await driver.get(BASE_URL)
  await driver.wait(until.elementLocated(By.css('.app-nav')), 10000)
  // Click Students first to guarantee ClassesPage unmounts on the next click
  // (prevents stale component state when already on this SPA URL).
  const studentsBtn = await driver.findElement(By.xpath('//button[normalize-space()="Students"]'))
  await studentsBtn.click()
  await driver.wait(until.elementLocated(By.css('input[name="name"]')), 10000)
  const classesBtn = await driver.findElement(By.xpath('//button[normalize-space()="Classes"]'))
  await classesBtn.click()
  await driver.wait(until.elementLocated(By.css('.classes-page')), 10000)
  await driver.wait(
    until.elementLocated(By.css('.classes-list table, .classes-list p')),
    10000,
  )
}

async function navigateToClassDetail(topic) {
  await navigateToClasses()
  const rows = await driver.findElements(By.css('.classes-list table tbody tr'))
  for (const row of rows) {
    const text = await row.getText()
    if (text.includes(topic)) {
      const viewBtn = await row.findElement(By.css('button.btn-view'))
      await viewBtn.click()
      break
    }
  }
  // Wait for detail page content (matrix or empty state)
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

Given('the class data is clean', function () {
  // handled by ui-setup.js Before hook
})

Given(
  'a class {string} exists for year {int} semester {int}',
  async function (topic, year, semester) {
    const res = await axios.post(`${API_URL}/classes`, { topic, year, semester })
    if (res.data.data) context.classes[topic] = res.data.data
  },
)

Given(
  'a student {string} with CPF {string} and email {string} exists',
  async function (name, cpf, email) {
    const res = await axios.post(`${API_URL}/students`, { name, cpf, email })
    if (res.data.data) context.students[name] = res.data.data
  },
)

Given('{string} is enrolled in class {string}', async function (studentName, topic) {
  const cls = context.classes[topic]
  const student = context.students[studentName]
  await axios.post(`${API_URL}/classes/${cls.id}/students`, { studentId: student.id })
})

Given(
  '{string} has class grade {string} on goal {string} in class {string}',
  async function (studentName, grade, goal, topic) {
    const cls = context.classes[topic]
    const student = context.students[studentName]
    await axios.put(
      `${API_URL}/classes/${cls.id}/assessments/${student.id}/${encodeURIComponent(goal)}`,
      { grade },
    )
  },
)

// ===== WHEN STEPS =====

When(
  'I create a class with topic {string} year {int} and semester {int}',
  async function (topic, year, semester) {
    await navigateToClasses()

    const topicInput = await driver.findElement(By.css('input[name="topic"]'))
    await topicInput.clear()
    await topicInput.sendKeys(topic)

    const yearSelect = await driver.findElement(By.css('select[name="year"]'))
    await yearSelect.findElement(By.css(`option[value="${year}"]`)).click()

    const semesterSelect = await driver.findElement(By.css('select[name="semester"]'))
    await semesterSelect.findElement(By.css(`option[value="${semester}"]`)).click()

    const submitBtn = await driver.findElement(By.css('button[type="submit"]'))
    await submitBtn.click()
    await driver.sleep(500)
  },
)

When(
  'I update class {string} to topic {string} year {int} semester {int}',
  async function (oldTopic, newTopic, year, semester) {
    await navigateToClasses()

    const rows = await driver.findElements(By.css('.classes-list table tbody tr'))
    for (const row of rows) {
      const text = await row.getText()
      if (text.includes(oldTopic)) {
        await row.findElement(By.css('button.btn-edit')).click()
        await driver.sleep(300)
        break
      }
    }

    const topicInput = await driver.findElement(By.css('input[name="topic"]'))
    await topicInput.clear()
    await topicInput.sendKeys(newTopic)
    await driver.findElement(By.css('select[name="year"]'))
      .findElement(By.css(`option[value="${year}"]`)).click()
    await driver.findElement(By.css('select[name="semester"]'))
      .findElement(By.css(`option[value="${semester}"]`)).click()
    await driver.findElement(By.css('button[type="submit"]')).click()
    await driver.sleep(500)
  },
)

When('I add student {string} to class {string}', async function (studentName, topic) {
  await navigateToClassDetail(topic)

  // Enroll UI is now a checkbox list
  await driver.wait(until.elementLocated(By.css('.enroll-list')), 5000)
  const items = await driver.findElements(By.css('.enroll-item'))
  for (const item of items) {
    const text = await item.getText()
    if (text.trim() === studentName) {
      const checkbox = await item.findElement(By.css('input[type="checkbox"]'))
      await checkbox.click()
      break
    }
  }

  const enrollBtn = await driver.findElement(By.css('button.btn-enroll'))
  await enrollBtn.click()
  await driver.sleep(500)
})

When(
  'I enroll students {string} and {string} in class {string}',
  async function (nameA, nameB, topic) {
    await navigateToClassDetail(topic)

    await driver.wait(until.elementLocated(By.css('.enroll-list')), 5000)
    const items = await driver.findElements(By.css('.enroll-item'))
    for (const item of items) {
      const text = await item.getText()
      if (text.trim() === nameA || text.trim() === nameB) {
        await item.findElement(By.css('input[type="checkbox"]')).click()
      }
    }

    const enrollBtn = await driver.findElement(By.css('button.btn-enroll'))
    await enrollBtn.click()
    await driver.sleep(500)
  },
)

When('I remove student {string} from class {string}', async function (studentName, topic) {
  await navigateToClassDetail(topic)

  const row = await getStudentRow(studentName)
  expect(row).to.not.be.null
  const removeBtn = await row.findElement(By.css('button.btn-remove-student'))
  await removeBtn.click()

  await driver.wait(until.alertIsPresent(), 3000)
  await driver.switchTo().alert().accept()
  await driver.sleep(500)
})

When('I request the detail of class {string}', async function (topic) {
  await navigateToClassDetail(topic)
})

When(
  'I set class grade {string} for {string} on goal {string} in class {string}',
  async function (grade, studentName, goal, topic) {
    await navigateToClassDetail(topic)
    await driver.wait(until.elementLocated(By.css('.assessment-matrix')), 10000)

    const goalIndex = await getGoalColumnIndex(goal)
    expect(goalIndex).to.not.equal(-1, `Goal "${goal}" not found`)

    const row = await getStudentRow(studentName)
    expect(row).to.not.be.null

    const cells = await row.findElements(By.css('td'))
    const select = await cells[goalIndex].findElement(By.css('select'))
    await select.findElement(By.css(`option[value="${grade}"]`)).click()
    await driver.sleep(300)
  },
)

When('I delete class {string}', async function (topic) {
  await navigateToClasses()

  const rows = await driver.findElements(By.css('.classes-list table tbody tr'))
  for (const row of rows) {
    const text = await row.getText()
    if (text.includes(topic)) {
      await row.findElement(By.css('button.btn-delete')).click()
      break
    }
  }

  await driver.wait(until.alertIsPresent(), 3000)
  await driver.switchTo().alert().accept()
  await driver.sleep(500)
})

// ===== THEN STEPS =====

Then('the class response should indicate success', async function () {
  await driver.wait(until.elementLocated(By.css('.message-success')), 5000)
})

Then('a class {string} should exist in the system', async function (topic) {
  await driver.wait(until.elementLocated(By.css('.classes-list table tbody')), 5000)
  const tbody = await driver.findElement(By.css('.classes-list table tbody'))
  expect(await tbody.getText()).to.include(topic)
})

Then('{string} should be enrolled in {string}', async function (studentName, _topic) {
  await driver.wait(until.elementLocated(By.css('.assessment-matrix tbody')), 5000)
  const tbody = await driver.findElement(By.css('.assessment-matrix tbody'))
  expect(await tbody.getText()).to.include(studentName)
})

Then('{string} should not be enrolled in {string}', async function (studentName, _topic) {
  await driver.sleep(300)
  const tbodies = await driver.findElements(By.css('.assessment-matrix tbody'))
  if (tbodies.length === 0) return
  expect(await tbodies[0].getText()).not.to.include(studentName)
})

Then('the class detail should contain student {string}', async function (studentName) {
  await driver.wait(until.elementLocated(By.css('.assessment-matrix tbody')), 5000)
  const tbody = await driver.findElement(By.css('.assessment-matrix tbody'))
  expect(await tbody.getText()).to.include(studentName)
})

Then(
  'the class detail should contain grade {string} for {string} on goal {string}',
  async function (grade, studentName, goal) {
    const goalIndex = await getGoalColumnIndex(goal)
    const row = await getStudentRow(studentName)
    expect(row).to.not.be.null

    const cells = await row.findElements(By.css('td'))
    const select = await cells[goalIndex].findElement(By.css('select'))
    expect(await select.getAttribute('value')).to.equal(grade)
  },
)

Then(
  'the class grade {string} should be stored for {string} on goal {string} in class {string}',
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

Then('class {string} should no longer exist', async function (topic) {
  await driver.sleep(300)
  const tbodies = await driver.findElements(By.css('.classes-list table tbody'))
  if (tbodies.length === 0) return
  expect(await tbodies[0].getText()).not.to.include(topic)
})
