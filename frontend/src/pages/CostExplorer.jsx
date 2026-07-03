import React, { useState, useEffect } from 'react'
import { tint } from '../lib/util.js'
import { getCosts } from '../lib/api.js'

export default function CostExplorer() {
  // live cost data from the backend (GET /api/costs) — same source as the dashboard
  const [costs, setCosts] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getCosts().then(setCosts).catch(() => setError('Could not load cost data'))
  }, [])

  const services = costs?.by_service ?? []
  const total = costs?.total_spend ?? services.reduce((a, s) => a + s.amount, 0)

  // derive the display fields from the live { service, amount } data:
  // - pct    = share of the total bill (bar length)
  // - critical = the big spenders (>= 20% of the bill)
  // - save   = a ~25–40% savings estimate (until the AI report refines it)
  const rows = services.map((s) => {
    const share = total ? (s.amount / total) * 100 : 0
    return {
      name: s.service,
      spend: s.amount,
      pct: share,
      critical: share >= 20,
      save: `$${Math.round(s.amount * 0.25)}–${Math.round(s.amount * 0.4)}`,
    }
  })

  return (
    <div>
      <div className="eyebrow mb-3"><span className="ebdot" />Spend breakdown · last 30 days</div>
      <h1 className="disp text-[clamp(1.8rem,3.5vw,2.5rem)]">Cost Explorer</h1>
      <p className="text-[15px] text-ink2 mt-3 max-w-[54ch]">Where every dollar goes, by service — and how much of it is saveable.</p>

      <div className="panel p-6 mt-7">
        {error && <div className="text-[13px]" style={{ color: 'var(--destructive)' }}>{error}</div>}
        {!costs && !error && <div className="text-[13px] text-muted">Loading cost data…</div>}

        <div className="flex flex-col gap-5">
          {rows.map((s) => (
            <div key={s.name}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[14px] font-medium flex items-center gap-2">
                  {s.name}
                  {s.critical && (
                    <span className="chip" style={{ color: '#D6435B', background: tint('#D6435B', 0.12), borderColor: tint('#D6435B', 0.3) }}>critical</span>
                  )}
                </span>
                <span className="mono text-[13px]">${s.spend.toFixed(2)}</span>
              </div>
              <span className="bar-track"><span className="bar-fill" style={{ width: s.pct + '%' }} /></span>
              <div className="mono text-[11px] text-muted mt-1.5">potential savings {s.save}</div>
            </div>
          ))}
        </div>

        {costs && (
          <div className="mt-6 pt-5 border-t border-line flex items-center justify-between">
            <span className="text-[13px] text-muted">Total monthly spend</span>
            <span className="disp text-[24px]">${total.toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  )
}