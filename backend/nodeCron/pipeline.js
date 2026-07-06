// Phase 3/4/5 — the shared pipeline, now aware of who owns the report AND
// carrying the AI's validated savings numbers through to storage.
import { getCostData } from '../CostApiData/costData.js'
import { analyzeWithGemini } from '../Ai/aiAnalysis.js'
import { makePdf } from '../Pdfkit/pdfReport.js'
import { addReport } from '../ReportStore/reportStore.js'
import { sendReportEmail } from '../Mail/mailer.js'

export async function generateAndSaveReport(userId = null) {
  const costData = getCostData()

  // Gemini now returns BOTH the report text and the validated savings numbers.
  const { markdown, savings } = await analyzeWithGemini(costData)

  const pdf = await makePdf(markdown)

  // Pass the AI's savings so the STORED report (and thus the dashboard) match
  // the PDF. addReport falls back to rule-based numbers if savings is null.
  const report = await addReport({ markdown, pdf, costData, userId, savings })

  try {
    await sendReportEmail({ ...report, pdf })
  } catch (err) {
    console.error('Email failed:', err)
  }

  return report
}