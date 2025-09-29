const test = require('tape')
const sinon = require('sinon')
const axios = require('axios')
const api = require('./api')

const apiUrl = process.env.API_URL

test('updateTemplates function', async function (t) {
  const axiosStub = sinon.stub(axios, 'post')
  const mockResponse = { data: { success: true, id: '123' } }
  axiosStub.resolves(mockResponse)

  const template = {
    id: 'cm0bu1nhr00go0bs6ex1i0x8k',
    organization: 'Interlincx',
    value: 'http://{{domain}}/?subid={{campaignId}}',
    key: 'MediaGo RSOC - AFD - Interlincx'
  }

  const result = await api.updateTemplate(template)
  t.ok(axiosStub.calledOnce, 'should make API call')
  t.deepEqual(result, mockResponse.data, 'should return response data')
  t.equal(
    axiosStub.args[0][0],
    `${apiUrl}/templates/${template.id}`,
    'correct URL'
  )
  t.equal(
    axiosStub.args[0][1].value,
    template.value + '&s1pagid={{ag}}',
    'correct data'
  )
  axiosStub.restore()
  t.end()
})

test('updateTemplates function without search query', async function (t) {
  const axiosStub = sinon.stub(axios, 'post')
  const mockResponse = { data: { success: true, id: '123' } }
  axiosStub.resolves(mockResponse)

  const template = {
    id: 'cm0bu1nhr00go0bs6ex1i0x8k',
    organization: 'Interlincx',
    value: 'http://{{domain}}',
    key: 'MediaGo RSOC - AFD - Interlincx'
  }

  const result = await api.updateTemplate(template)
  t.ok(axiosStub.calledOnce, 'should make API call')
  t.deepEqual(result, mockResponse.data, 'should return response data')
  t.equal(
    axiosStub.args[0][0],
    `${apiUrl}/templates/${template.id}`,
    'correct URL'
  )
  t.equal(
    axiosStub.args[0][1].value,
    template.value + '?s1pagid={{ag}}',
    'correct data'
  )
  axiosStub.restore()
  t.end()
})
