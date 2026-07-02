import { getCostData } from '../CostApiData/costData.js'
import { analyzeWithGemini } from '../Ai/aiAnalysis.js'
import { makePdf } from '../Pdfkit/pdfReport.js'
import { addReport } from '../ReportStore/reportStore.js'
import { sendReportEmail } from '../Mail/mailer.js'

export async function generateAndSaveReport() {
    const costData = getCostData()

    const markdown = await analyzeWithGemini(costData)

    const pdf = await makePdf(markdown)

    const report = await addReport({
        markdown,
        pdf,
        costData
    })

    try {
        await sendReportEmail({ ...report, pdf })   // 
    } catch (err) {
        console.error("Email failed:", err)
    }

    return report
}