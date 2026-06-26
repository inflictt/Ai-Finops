import express from 'express'      
import cors from 'cors'            
import 'dotenv/config'  
import { getCostData } from './costData.js'  

const app = express()             
const PORT = process.env.PORT || 4000 

app.use(cors())                    
app.use(express.json())            

// ---- routes ----
// A "health check": proves the server is alive. Visit /api/health in a browser.
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'finops-backend',
    time: new Date().toISOString(),
  })
})

// Part 2: return the cost data (sample for now)
app.get('/api/costs', (req, res) => {
  res.json(getCostData())
})

app.listen(PORT, () => {
  console.log(`FinOps backend running on http://localhost:${PORT}`)
})


