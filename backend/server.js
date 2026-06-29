import express from 'express'
import cors from 'cors'
import 'dotenv/config'

import { getCostData } from './CostApiData/costData.js'
import { analyzeWithGemini } from './Ai/aiAnalysis.js'
import { makePdf } from './Pdfkit/pdfReport.js'
import { addReport, listReports, getReport } from './ReportStore/reportStore.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

// Health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'finops-backend',
    time: new Date().toISOString(),
  })
})

// Sample cost data
app.get('/api/costs', (req, res) => {
  res.json(getCostData())
})

// AI analysis
app.post('/api/analyze', async (req, res) => {
  const costData = getCostData()
  const analysis = await analyzeWithGemini(costData)
  res.json({ analysis })
})

// Generate PDF directly
app.get('/api/report/pdf', async (req, res) => {
  const costData = getCostData()
  const analysis = await analyzeWithGemini(costData)
  const pdf = await makePdf(analysis)

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', 'attachment; filename="finops-report.pdf"')
  res.send(pdf)
})

// Generate + Save Report
app.post('/api/generate', async (req, res) => {
  const costData = getCostData()
  const markdown = await analyzeWithGemini(costData)
  const pdf = await makePdf(markdown)

  const report = addReport({ markdown, pdf, costData })

  const { id, date, total, savings, reduction, status } = report

  res.json({ id, date, total, savings, reduction, status })
})

// List Reports
app.get('/api/reports', (req, res) => {
  res.json(listReports())
})

// Download Report
app.get('/api/reports/:id/pdf', (req, res) => {
  const report = getReport(req.params.id)

  if (!report) {
    return res.status(404).json({ error: 'report not found' })
  }

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="finops-report-${report.id}.pdf"`
  )

  res.send(report.pdf)
})

app.listen(PORT, () => {
  console.log(`FinOps backend running on http://localhost:${PORT}`)
})