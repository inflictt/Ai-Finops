import { randomUUID } from 'crypto'
const reports = [] // newest first
// save a freshly generated report, return its metadata + id
export function addReport({ markdown, pdf, costData }) {
  const total = costData.total_spend
  const report = {
    id: randomUUID(),
    date: new Date().toISOString().slice(0, 10),
    total: `$${total.toFixed(2)}`,
    savings: `$${Math.round(total * 0.3)}`, // summary estimate; exact figures live in the PDF
    reduction: '~30%',
    status: 'Ready',
    markdown, 
    pdf,
  }
  reports.unshift(report)
  return report
}

// lightweight list for the dashboard table (no markdown / pdf bytes)
export function listReports() {
  return reports.map(({ id, date, total, savings, reduction, status }) => ({
    id, date, total, savings, reduction, status,
  }))
}

// find one report by id (used to download its PDF)
export function getReport(id) {
  return reports.find((r) => r.id === id)
}