import { getCostData } from '../CostApiData/costData.js'
import { analyzeWithGemini } from '../Ai/aiAnalysis.js'
import { makePdf } from '../Pdfkit/pdfReport.js'
import { addReport } from '../ReportStore/reportStore.js'

export async function generateAndSaveReport() {
  const costData = getCostData()
  const markdown = await analyzeWithGemini(costData)
  const pdf = await makePdf(markdown)
  return await addReport({ markdown, pdf, costData })
}
