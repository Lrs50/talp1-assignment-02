const { Given, When, Then, Before, After } = require('@cucumber/cucumber')
const { Builder, By, until, WebDriver, Capabilities } = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const { expect } = require('chai')
const axios = require('axios')

let driver
const BASE_URL = 'http://localhost:5173'
const API_URL = 'http://localhost:3001'

const context = {
  students: {},
}

// Initialize WebDriver before each scenario
Before(async function () {
  // Configure Chrome options for visibility
  const options = new chrome.Options()
  // Don't add --headless to see the browser window
  // options.addArguments('--disable-gpu') // Optional: can help with rendering
  
  driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .usingServer('http://localhost:4444/wd/hub')
    .build()

  // Reset backend data
  try {
    const students = await axios.get(`${API_URL}/students`)
    for (const student of students.data.data || []) {
      await axios.delete(`${API_URL}/students/${student.id}`)
    }
  } catch (err) {
    // Ignore if API not ready
  }
})

// Close WebDriver after each scenario
After(async function () {
  if (driver) {
    await driver.quit()
  }
})

// ===== GIVEN STEPS =====

Given('I am on the students page', async function () {
  await driver.get(BASE_URL)
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
  // Reload page to show new students
  await driver.navigate().refresh()
  await driver.wait(until.elementLocated(By.css('table tbody')), 10000)
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
  // Reload page to show new student
  await driver.navigate().refresh()
  await driver.wait(until.elementLocated(By.css('table tbody')), 10000)
})

// ===== WHEN STEPS =====

When('I am on the students page', async function () {
  await driver.get(BASE_URL)
  await driver.wait(until.elementLocated(By.css('input[name="name"]')), 10000)
})

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
    // Wait for response
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
  await nameInput.clear()
})

When('I click the delete button for {string}', async function (studentName) {
  const rows = await driver.findElements(By.css('table tbody tr'))
  for (const row of rows) {
    const text = await row.getText()
    if (text.includes(studentName)) {
      const deleteBtn = await row.findElement(By.css('button.btn-delete'))
      await deleteBtn.click()
      await driver.sleep(300)
      break
    }
  }
})

When('I confirm the deletion', async function () {
  // Browser shows confirmation dialog automatically
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

Then('I should see {number} students in the list', async function (count) {
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
  const tableBody = await driver.findElement(By.css('table tbody'))
  const text = await tableBody.getText()
  expect(text).not.to.include(studentName)
})
