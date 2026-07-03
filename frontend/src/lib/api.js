// Part 6 — talks to the backend. All fetch calls live here.
// credentials:'include' on every call so the auth cookie is sent (the routes
// are now protected by verifyJWT on the backend).
const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

// backend returns { savings }, the UI expects { save } — map between them here
function toUi(r) {
  return {
    id: r.id,
    date: r.date,
    total: r.total,
    save: r.savings,
    saveRange: r.savings,
    reduction: r.reduction,
    status: r.status,
    model: 'Gemini',
  }
}

// GET the saved reports (for the dashboard table)
export async function getReports() {
  const res = await fetch(`${API}/api/reports`, { credentials: 'include' })
  if (!res.ok) throw new Error('failed to load reports')
  const data = await res.json()
  return data.map(toUi)
}

// POST to run the pipeline + save a new report
export async function generateReport() {
  const res = await fetch(`${API}/api/generate`, { method: 'POST', credentials: 'include' })
  if (!res.ok) throw new Error('failed to generate report')
  return toUi(await res.json())
}

// Cost data for the dashboard charts
export async function getCosts() {
  const res = await fetch(`${API}/api/costs`, { credentials: 'include' })
  if (!res.ok) throw new Error('failed to load costs')
  return res.json() // { total_spend, by_service: [{ service, amount }], ... }
}

// PDF download link — opened via <a href>. The browser sends the cookie
// automatically on this same-site navigation, so the protected route lets it through.
export function pdfUrl(id) {
  return `${API}/api/reports/${id}/pdf`
}