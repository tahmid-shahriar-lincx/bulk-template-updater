const fs = require('fs')
const api = require('./api')

main()

async function main () {
  if (!fs.existsSync('./data')) fs.mkdirSync('./data')

  try {
    const [activeIds, campaigns, templates] = await Promise.all([
      getActiveFBCampaignsLastWeek(),
      getAllCampaigns(),
      getTemplates()
    ])

    const activeCampaigns = campaigns
      .filter(campaign => activeIds.includes(campaign.id))

    const activeTemplatesForUpdate = activeCampaigns
      .map(campaign => campaign.template.id)

    const templatesNeedingUpdate = templates
      .filter(template => !activeTemplatesForUpdate.includes(template.id))

    console.log('Templates needing update:', templatesNeedingUpdate.length)
    writeJsonToFile('templates-needing-update.json', templatesNeedingUpdate)

    for (const template of templatesNeedingUpdate) {
      await api.updateTemplate(template)
      console.log(`Updated template: ${template.id}`)
      await new Promise(resolve => setTimeout(resolve, 1000)) // 1 second delay
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    throw error
  }
}

async function getActiveFBCampaignsLastWeek () {
  const s1Report = await api.getFBS1ReportLastWeek()
  writeJsonToFile('s1-report-last-week.json', s1Report)
  return s1Report.map(row => row.strategisCampaignId)
}

async function getAllCampaigns () {
  const campaigns = await api.getAllCampaigns()
  writeJsonToFile('campaigns.json', campaigns)
  return campaigns
}

async function getTemplates () {
  const templates = await api.getTemplates()
  writeJsonToFile('templates.json', templates)

  const filteredTemplates = filteredTemplatesWithNoAG(templates)
  writeJsonToFile('templates-with-no-ag.json', filteredTemplates)
  return filteredTemplates
}

function writeJsonToFile (filename, data) {
  fs.writeFileSync(`./data/${filename}`, JSON.stringify(data, null, 2))
}

function filteredTemplatesWithNoAG (templates) {
  return templates.filter(template => !template.value.includes('s1pagid={{ag}}'))
}
