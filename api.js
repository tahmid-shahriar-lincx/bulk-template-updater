const axios = require('axios')
const dotenv = require('dotenv')

dotenv.config()

const apiUrl = process.env.API_URL
const bearerToken = process.env.BEARER_TOKEN

module.exports = {
  getTemplates,
  getFBS1ReportLastWeek,
  getAllCampaigns,
  updateTemplate
}

async function getTemplates () {
  return makeGetApiCall('/templates')
}

async function updateTemplate (template) {
  const value = template.value.includes('?')
    ? template.value + '&s1pagid={{ag}}'
    : template.value + '?s1pagid={{ag}}'
  return makePostApiCall(`/templates/${template.id}`, { ...template, value })
}

async function getFBS1ReportLastWeek () {
  const { dateStart, dateEnd } = getDateRange(7)
  return makeGetApiCall('/s1/report/daily-v3', {
    dateStart,
    dateEnd,
    dbSource: 'ch',
    networkId: 112,
    organization: 'Interlincx',
    timezone: 'UTC'
  })
}

async function getAllCampaigns () {
  return makeGetApiCall('/campaigns')
}

function getAuthHeaders () {
  return {
    Authorization: `Bearer ${bearerToken}`
  }
}

function getDateRange (daysAgo = 7) {
  const date7DaysAgo = (new Date()).setDate((new Date()).getDate() - daysAgo)
  const dateStart = new Date(date7DaysAgo).toISOString().split('T')[0]
  const dateEnd = (new Date()).toISOString().split('T')[0]
  return { dateStart, dateEnd }
}

async function makeGetApiCall (endpoint, params = {}) {
  const response = await axios.get(`${apiUrl}${endpoint}`, {
    headers: getAuthHeaders(),
    params
  })
  return response.data
}

async function makePostApiCall (endpoint, body = {}) {
  const response = await axios.post(`${apiUrl}${endpoint}`, body, {
    headers: getAuthHeaders()
  })
  return response.data
}
