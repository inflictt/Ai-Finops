// Phase 3/4 — the shared pipeline, now aware of who owns the report.
// userId: the logged-in user for manual runs (/api/generate);
//         null for the weekly cron (a system report — emailed, not shown in a dashboard).
import { getCostData } from '../CostApiData/costData.js'
import { analyzeWithGemini } from '../Ai/aiAnalysis.js'
import { makePdf } from '../Pdfkit/pdfReport.js'
import { addReport } from '../ReportStore/reportStore.js'
import { sendReportEmail } from '../Mail/mailer.js'

export async function generateAndSaveReport(userId = null) {
  const costData = getCostData()
  const markdown = await analyzeWithGemini(costData)
  const pdf = await makePdf(markdown)

  const report = await addReport({ markdown, pdf, costData, userId }) // ← owner stamped here

  try {
    await sendReportEmail({ ...report, pdf }) // keep your existing email line
  } catch (err) {
    console.error('Email failed:', err)
  }

  return report
}