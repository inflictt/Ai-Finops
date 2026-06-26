import express from 'express'      
import cors from 'cors'            
import 'dotenv/config'  
import { getCostData } from './CostApiData/costData.js'  
import { analyzeWithGemini } from './Ai/aiAnalysis.js'
import { makePdf } from "./Pdfkit/pdfReport.js";

const app = express()             
const PORT = process.env.PORT || 4000 

app.use(cors())                    
app.use(express.json())            

// ---- routes ----
// proves the server is alive. 
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'finops-backend',
    time: new Date().toISOString(),
  })
})
 
//  return the cost data (sample for now)
app.get('/api/costs', (req, res) => {
  res.json(getCostData())
})
 
//  run the AI analysis on the cost data
app.post('/api/analyze', async (req, res) => {
  const costData = getCostData()
  const analysis = await analyzeWithGemini(costData)
  res.json({ analysis })
})
// makePdf()  turning the report into a real PDF
app.get('/api/report/pdf', async (req, res) => {
  const costData = getCostData()
  const analysis = await analyzeWithGemini(costData)   // ← all 3 steps chain here!
  const pdf = await makePdf(analysis)
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', 'attachment; filename="finops-report.pdf"')
  res.send(pdf)
})

app.listen(PORT, () => {
  console.log(`FinOps backend running on http://localhost:${PORT}`)
})


