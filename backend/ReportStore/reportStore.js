// Phase 4 — reports are now scoped to the user who created them.
import { randomUUID } from 'crypto'
import { pool } from '../db.js'
import { analyzeCosts } from '../Analysis/costAnalysis.js'

// INSERT a new report, stamped with its owner's user_id.
// `savings` (from the AI, already validated) is used when present so the stored
// report matches the PDF; otherwise we compute rule-based numbers as a fallback.
export async function addReport({ markdown, pdf, costData, userId = null, savings = null }) {
  const a = savings || analyzeCosts(costData)
  const report = {
    id: randomUUID(),
    date: new Date().toISOString().slice(0, 10),
    total: `$${(Number(costData.total_spend) || 0).toFixed(2)}`,
    savings: `$${a.total_savings}`,
    reduction: `~${a.reduction_pct}%`,
    status: 'Ready',
  }
  await pool.query(
    `INSERT INTO reports (id, date, total, savings, reduction, status, markdown, pdf, user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [report.id, report.date, report.total, report.savings, report.reduction, report.status, markdown, pdf, userId]
  )
  return report
}

// Only THIS user's reports (for the dashboard table).
export async function listReports(userId) {
  const { rows } = await pool.query(
    `SELECT id, date, total, savings, reduction, status
     FROM reports
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  )
  return rows
}

// One report — but only if it belongs to this user, so you can't
// download someone else's PDF by guessing its id.
export async function getReport(id, userId) {
  const { rows } = await pool.query(
    `SELECT * FROM reports WHERE id = $1 AND user_id = $2`,
    [id, userId]
  )
  return rows[0] // undefined if not found OR not yours
}