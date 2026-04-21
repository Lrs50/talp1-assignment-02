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

// Clean all student data before each scenario
Before(async function () {
  try {
    const res = await axios.get(`${API_URL}/students`)
    for (const student of res.data.data || []) {
      await axios.delete(`${API_URL}/students/${student.id}`)
    }
  } catch {
    // ignore if API not ready
  }
})

function getDriver() {
  return driver
}

module.exports = { getDriver }
