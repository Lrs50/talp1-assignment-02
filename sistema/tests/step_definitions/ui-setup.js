const { setDefaultTimeout, Before, BeforeAll, AfterAll } = require('@cucumber/cucumber')
const { Builder } = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const axios = require('axios')

const API_URL = 'http://localhost:3001'

// UI tests open a real browser — give all hooks and steps 30s
setDefaultTimeout(30 * 1000)

let driver = null

BeforeAll({ timeout: 60000 }, async function () {
  driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options())
    .usingServer('http://localhost:4444/wd/hub')
    .build()
})

AfterAll(async function () {
  if (driver) {
    await driver.quit()
    driver = null
  }
})

// Clean all data before each scenario and reset goals to English defaults
Before(async function () {
  try {
    const [studentsRes, classesRes] = await Promise.all([
      axios.get(`${API_URL}/students`),
      axios.get(`${API_URL}/classes`),
    ])
    await Promise.all([
      axios.post(`${API_URL}/goals/reset`),
      ...(studentsRes.data.data || []).map((s) => axios.delete(`${API_URL}/students/${s.id}`)),
      ...(classesRes.data.data || []).map((c) => axios.delete(`${API_URL}/classes/${c.id}`)),
    ])
  } catch {
    // ignore if API not ready
  }
})

function getDriver() {
  return driver
}

module.exports = { getDriver }
