import { randomUUID } from 'crypto'
import { pool } from '../db.js'   

// INSERT a new report, return its metadata
export async function addReport({ markdown, pdf, costData }) {
  const total = costData.total_spend
  const report = {
    id: randomUUID(),
    date: new Date().toISOString().slice(0, 10),
    total: `$${total.toFixed(2)}`,
    savings: `$${Math.round(total * 0.3)}`,
    reduction: '~30%',
    status: 'Ready',
  }
  await pool.query(
    `INSERT INTO reports (id, date, total, savings, reduction, status, markdown, pdf)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [report.id, report.date, report.total, report.savings, report.reduction, report.status, markdown, pdf]
  )
  return report
}

// SELECT lightweight metadata for the dashboard table (no markdown / pdf bytes)
export async function listReports() {
  const { rows } = await pool.query(
    `SELECT id, date, total, savings, reduction, status
     FROM reports
     ORDER BY created_at DESC`
  )
  return rows
}

// SELECT one full report by id (includes the pdf bytes) for download
export async function getReport(id) {
  const { rows } = await pool.query('SELECT * FROM reports WHERE id = $1', [id])
  return rows[0] // undefined if not found
}