import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { initDb } from './db.js'
import { generateAndSaveReport } from './nodeCron/pipeline.js'
import { startScheduler } from './nodeCron/scheduler.js'
import cookieParser from 'cookie-parser'
import authRoutes from './Auth/authRoutes.js'
import { errorHandler } from './middlewares/errorHandler.js'

import { getCostData } from './CostApiData/costData.js'
import { analyzeWithGemini } from './Ai/aiAnalysis.js'
import { makePdf } from './Pdfkit/pdfReport.js'
import { addReport, listReports, getReport } from './ReportStore/reportStore.js'

const app = express()
const PORT = process.env.PORT || 4000
initDb().catch((e) => console.error('DB init failed:', e))
startScheduler()

app.use(cors())
app.use(express.json())
app.use(cookieParser())            
app.use('/api/auth', authRoutes)


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

// // Generate + Save Report
// app.post('/api/generate', async (req, res) => {
//   const costData = getCostData()
//   const markdown = await analyzeWithGemini(costData)
//   const pdf = await makePdf(markdown)

//   const report = await addReport({ markdown, pdf, costData })

//   const { id, date, total, savings, reduction, status } = report

//   res.json({ id, date, total, savings, reduction, status })
// })

// /api/generate now reuses the shared pipeline:
app.post('/api/generate', async (req, res) => {
  try {
    const report = await generateAndSaveReport()

    const { id, date, total, savings, reduction, status } = report

    res.json({
      id,
      date,
      total,
      savings,
      reduction,
      status,
    })
  } catch (err) {
    console.error(err)

    res.status(500).json({
      error: "Failed to generate report",
    })
  }
})

// List Reports
app.get('/api/reports',async (req, res) => {
  res.json(await listReports())
})

// Download Report
app.get('/api/reports/:id/pdf', async(req, res) => {
  const report = await getReport(req.params.id)

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
app.use(errorHandler)               

app.listen(PORT, () => {
  console.log(`FinOps backend running on http://localhost:${PORT}`)
})