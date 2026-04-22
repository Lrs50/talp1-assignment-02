const { Given, When, Then, Before } = require('@cucumber/cucumber')
const { By, until, Key } = require('selenium-webdriver')
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

// ===== GIVEN STEPS =====

// Single definition covers both Given/When/And keyword variants
Given('I am on the students page', async function () {
  await driver.get(BASE_URL)
  // Force a true reload — driver.get(same_url) can be a no-op in Chrome
  // when the SPA is already at BASE_URL, leaving stale component state.
  await driver.navigate().refresh()
  await driver.wait(until.elementLocated(By.css('input[name="name"]')), 10000)
})

Given('there is a student with CPF {string}', async function (cpf) {
  const student = {
    name: 'Existing Student',
    cpf: cpf,
    email: `student${cpf}@example.com`,
  }
  try {
    const res = await axios.post(`${API_URL}/students`, student)
    if (res.data.data) {
      context.students[cpf] = res.data.data
    }
  } catch (err) {
    console.error('Failed to create student:', err.message)
  }
})

Given('there are students in the system:', async function (dataTable) {
  const rows = dataTable.hashes()
  for (const row of rows) {
    const student = {
      name: row.name,
      cpf: row.CPF,
      email: row.email,
    }
    try {
      const res = await axios.post(`${API_URL}/students`, student)
      if (res.data.data) {
        context.students[row.name] = res.data.data
      }
    } catch (err) {
      console.error('Failed to create student:', err.message)
    }
  }
  // Navigation happens in "When/Given I am on the students page"
})

Given('there is a student with:', async function (dataTable) {
  const row = dataTable.rowsHash()
  const student = {
    name: row['name'],
    cpf: row['CPF'],
    email: row['email'],
  }
  try {
    const res = await axios.post(`${API_URL}/students`, student)
    if (res.data.data) {
      context.students[student.name] = res.data.data
    }
  } catch (err) {
    console.error('Failed to create student:', err.message)
  }
  // Navigation happens in "And I am on the students page"
})

// ===== WHEN STEPS =====

When('I fill in the form with:', async function (dataTable) {
  const row = dataTable.rowsHash()

  const nameInput = await driver.findElement(By.css('input[name="name"]'))
  const cpfInput = await driver.findElement(By.css('input[name="cpf"]'))
  const emailInput = await driver.findElement(By.css('input[name="email"]'))

  await nameInput.clear()
  if (row.name) {
    await nameInput.sendKeys(row.name)
  }

  await cpfInput.clear()
  if (row.CPF) {
    await cpfInput.sendKeys(row.CPF)
  }

  await emailInput.clear()
  if (row.email) {
    await emailInput.sendKeys(row.email)
  }
})

When('I click the {string} button', async function (buttonName) {
  let selector
  if (buttonName === 'Add Student') {
    selector = 'button[type="submit"]'
  } else if (buttonName === 'Save') {
    selector = 'button[type="submit"]'
  }

  if (selector) {
    const button = await driver.findElement(By.css(selector))
    await button.click()
    await driver.sleep(500)
  }
})

When('I click the edit button for {string}', async function (studentName) {
  const rows = await driver.findElements(By.css('table tbody tr'))
  for (const row of rows) {
    const text = await row.getText()
    if (text.includes(studentName)) {
      const editBtn = await row.findElement(By.css('button.btn-edit'))
      await editBtn.click()
      await driver.sleep(300)
      break
    }
  }
})

When('I update the email to {string}', async function (newEmail) {
  const emailInput = await driver.findElement(By.css('input[name="email"]'))
  await emailInput.clear()
  await emailInput.sendKeys(newEmail)
})

When('I clear the name field', async function () {
  const nameInput = await driver.findElement(By.css('input[name="name"]'))
  await nameInput.click()
  await nameInput.sendKeys(Key.chord(Key.CONTROL, 'a'))
  await nameInput.sendKeys(Key.BACK_SPACE)
})

When('I click the delete button for {string}', async function (studentName) {
  const rows = await driver.findElements(By.css('table tbody tr'))
  for (const row of rows) {
    const text = await row.getText()
    if (text.includes(studentName)) {
      const deleteBtn = await row.findElement(By.css('button.btn-delete'))
      await deleteBtn.click()
      break
    }
  }
})

When('I confirm the deletion', async function () {
  await driver.wait(until.alertIsPresent(), 3000)
  await driver.switchTo().alert().accept()
  await driver.sleep(500)
})

// ===== THEN STEPS =====

Then('I should see the message {string}', async function (message) {
  const messageDiv = await driver.wait(
    until.elementLocated(By.css('.message-success')),
    5000
  )
  const text = await messageDiv.getText()
  expect(text).to.include(message)
})

Then('I should see the error {string}', async function (errorMessage) {
  const errorDiv = await driver.wait(
    until.elementLocated(By.css('.message-error')),
    5000
  )
  const text = await errorDiv.getText()
  expect(text).to.include(errorMessage)
})

Then('the student {string} should appear in the list', async function (studentName) {
  await driver.wait(until.elementLocated(By.css('table tbody')), 5000)
  const tableBody = await driver.findElement(By.css('table tbody'))
  const text = await tableBody.getText()
  expect(text).to.include(studentName)
})

Then('the student should not be added', async function () {
  const messageDiv = await driver.findElement(By.css('.message-error'))
  expect(messageDiv).to.exist
})

Then('I should see {int} students in the list', async function (count) {
  await driver.wait(until.elementLocated(By.css('table tbody')), 5000)
  const rows = await driver.findElements(By.css('table tbody tr'))
  expect(rows.length).to.equal(count)
})

Then('the list should contain {string}', async function (studentName) {
  const tableBody = await driver.findElement(By.css('table tbody'))
  const text = await tableBody.getText()
  expect(text).to.include(studentName)
})

Then(
  'the student {string} should have email {string}',
  async function (studentName, email) {
    const rows = await driver.findElements(By.css('table tbody tr'))
    for (const row of rows) {
      const text = await row.getText()
      if (text.includes(studentName)) {
        expect(text).to.include(email)
        break
      }
    }
  }
)

Then("the student's name should remain {string}", async function (studentName) {
  const tableBody = await driver.findElement(By.css('table tbody'))
  const text = await tableBody.getText()
  expect(text).to.include(studentName)
})

Then('the student {string} should not be in the list', async function (studentName) {
  await driver.sleep(500)
  const tables = await driver.findElements(By.css('table tbody'))
  if (tables.length === 0) return // no table means no students at all
  const text = await tables[0].getText()
  expect(text).not.to.include(studentName)
})
