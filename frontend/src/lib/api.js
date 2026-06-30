// all backend calls live here
const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

// backend returns { savings }; the UI expects { save } — map between them
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

export async function getReports() {
  const res = await fetch(`${API}/api/reports`)
  if (!res.ok) throw new Error('failed to load reports')
  const data = await res.json()
  return data.map(toUi)
}

export async function generateReport() {
  const res = await fetch(`${API}/api/generate`, { method: 'POST' })
  if (!res.ok) throw new Error('failed to generate report')
  return toUi(await res.json())
}

export function pdfUrl(id) {
  return `${API}/api/reports/${id}/pdf`
}