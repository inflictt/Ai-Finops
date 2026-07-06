import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import cookieParser from 'cookie-parser'
import { initDb } from './db.js'
import { generateAndSaveReport } from './nodeCron/pipeline.js'
import { startScheduler } from './nodeCron/scheduler.js'
import authRoutes from './Auth/authRoutes.js'
import { verifyJWT } from './middlewares/verifyJWT.js'
import { errorHandler } from './middlewares/errorHandler.js'
import { analyzeCosts } from './Analysis/costAnalysis.js' 

import { getCostData } from './CostApiData/costData.js'
import { analyzeWithGemini } from './Ai/aiAnalysis.js'
import { makePdf } from './Pdfkit/pdfReport.js'
import { listReports, getReport } from './ReportStore/reportStore.js'

const app = express()
const PORT = process.env.PORT || 4000

initDb().catch((e) => console.error('DB init failed:', e))
startScheduler()

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(cookieParser())

// ---- public ----
app.use('/api/auth', authRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'finops-backend', time: new Date().toISOString() })
})

// ---- protected: must be logged in (verifyJWT sets req.user) ----

// Cost data for the dashboard charts
app.get('/api/costs', verifyJWT, (req, res) => { res.json(analyzeCosts(getCostData())) })


// Generate + save a report FOR THIS USER
app.post('/api/generate', verifyJWT, async (req, res) => {
  try {
    const report = await generateAndSaveReport(req.user.id) // ← owner
    const { id, date, total, savings, reduction, status } = report
    res.json({ id, date, total, savings, reduction, status })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to generate report' })
  }
})

// List only THIS user's reports
app.get('/api/reports', verifyJWT, async (req, res) => {
  res.json(await listReports(req.user.id))
})

// Download one of THIS user's reports (404 if it isn't theirs)
app.get('/api/reports/:id/pdf', verifyJWT, async (req, res) => {
  const report = await getReport(req.params.id, req.user.id)
  if (!report) return res.status(404).json({ error: 'report not found' })

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="finops-report-${report.id}.pdf"`)
  res.send(report.pdf)
})

// server.js — /api/analyze and /api/report/pdf now destructure { markdown }
app.post('/api/analyze', async (req, res) => {
  const { markdown } = await analyzeWithGemini(getCostData())
  res.json({ analysis: markdown })
})
app.get('/api/report/pdf', async (req, res) => {
  const { markdown } = await analyzeWithGemini(getCostData())
  const pdf = await makePdf(markdown)
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', 'attachment; filename="finops-report.pdf"')
  res.send(pdf)
})

// error handler LAST (after all routes)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`FinOps backend running on http://localhost:${PORT}`)
})