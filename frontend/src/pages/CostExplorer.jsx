import React from 'react'
import { tint } from '../lib/util.js'
import { SERVICES } from '../lib/data.js'

export default function CostExplorer() {
  const total = SERVICES.reduce((a, s) => a + s.spend, 0)
  return (
    <div>
      <div className="eyebrow mb-3"><span className="ebdot" />Spend breakdown · last 30 days</div>
      <h1 className="disp text-[clamp(1.8rem,3.5vw,2.5rem)]">Cost Explorer</h1>
      <p className="text-[15px] text-ink2 mt-3 max-w-[54ch]">Where every dollar goes, by service — and how much of it is saveable.</p>

      <div className="panel p-6 mt-7">
        <div className="flex flex-col gap-5">
          {SERVICES.map((s) => (
            <div key={s.name}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[14px] font-medium flex items-center gap-2">
                  {s.name}
                  {s.critical && <span className="chip" style={{ color: '#D6435B', background: tint('#D6435B', 0.12), borderColor: tint('#D6435B', 0.3) }}>critical</span>}
                </span>
                <span className="mono text-[13px]">${s.spend.toFixed(2)}</span>
              </div>
              <span className="bar-track"><span className="bar-fill" style={{ width: s.pct + '%' }} /></span>
              <div className="mono text-[11px] text-muted mt-1.5">potential savings {s.save}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-5 border-t border-line flex items-center justify-between">
          <span className="text-[13px] text-muted">Total monthly spend</span>
          <span className="disp text-[24px]">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
