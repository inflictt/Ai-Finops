import React, { useState, useEffect } from 'react'
import MetricCard from '../components/MetricCard.jsx'
import StatusChip from '../components/StatusChip.jsx'
import { Icon } from '../lib/icons.jsx'
import { tint } from '../lib/util.js'
import { FINDINGS } from '../lib/data.js'
import { getCosts } from '../lib/api.js'

export default function Dashboard({ reports }) {
  const latest = reports[0] || { total: '$0.00', saveRange: '—', reduction: '—', model: '—', date: '—' }
  const readyCount = reports.filter((r) => r.status === 'Ready').length

  // real cost data from the backend (GET /api/costs)
  const [costs, setCosts] = useState(null)
  useEffect(() => {
    getCosts().then(setCosts).catch((e) => console.error('load costs failed', e))
  }, [])
  const services = costs?.by_service ?? []
  const totalSpend = costs?.total_spend ?? 0
  const maxAmount = Math.max(1, ...services.map((s) => s.amount))

  return (
    <div>
      <div className="eyebrow mb-3"><span className="ebdot" />Weekly cost intelligence · ap-south-1</div>
      <h1 className="disp text-[clamp(2rem,4vw,3rem)] max-w-[18ch]" style={{ letterSpacing: '-.035em' }}>
        Your AWS bill, <span className="accent-text">read by AI.</span>
      </h1>
      <p className="text-[15.5px] text-ink2 mt-3.5 max-w-[58ch]">
        An automated weekly report finds where the money goes and where you're wasting it , no spreadsheets, no manual analysis.
      </p>

      {/* metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-7">
        <MetricCard icon="chart" color="#3A30E0" value={latest.total} label="Monthly spend"  />
        <MetricCard icon="piggy" color="#1F8A5B" value={latest.saveRange} label="Savings identified"   />
        <MetricCard icon="trendDown" color="#0E8C9B" value={ latest.reduction} label="Cost reduction"   />
        <MetricCard icon="file" color="#5B4BFF" value={String(readyCount)} label="Reports generated" />
      </div>

      {/* spend + recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <div className="panel p-6 lg:col-span-2">
          <div className="flex items-baseline justify-between mb-1">
            <h2 className="disp text-[19px]">Spend by service</h2>
            <span className="mono text-[11px] text-muted">last 30 days</span>
          </div>
          <p className="text-[13px] text-muted mb-5">Bar length = monthly spend · chip = ~30% savings estimate</p>
          <div className="flex flex-col gap-4">
            {services.map((s) => (
              <div key={s.service} className="grid grid-cols-[120px_1fr_auto] items-center gap-3">
                <span className="text-[13.5px] font-medium truncate">{s.service}</span>
                <span className="bar-track"><span className="bar-fill" style={{ width: (s.amount / maxAmount) * 100 + '%' }} /></span>
                <span className="flex items-center gap-2 justify-end">
                  <span className="mono text-[13px] w-[58px] text-right">${s.amount.toFixed(2)}</span>
                  <span className="chip hidden sm:inline-flex" style={{ color: '#1F8A5B', background: tint('#1F8A5B', 0.12), borderColor: tint('#1F8A5B', 0.3) }}>~${Math.round(s.amount * 0.3)}</span>
                </span>
              </div>
            ))}
            {services.length === 0 && <div className="text-[13px] text-muted">Loading cost data…</div>}
          </div>
          <div className="mt-6 pt-5 border-t border-line flex items-center justify-between">
            <span className="text-[13px] text-muted">Total monthly spend</span>
            <span className="disp text-[22px]">${totalSpend.toFixed(2)}</span>
          </div>
        </div>

        <div className="panel p-6">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="disp text-[19px]">Recent reports</h2>
            <span className="pill"><span className="dot dot-live" style={{ background: '#1F8A5B' }} />weekly</span>
          </div>
          {/* <div> */}
            <div className="max-h-[420px] overflow-y-auto pr-2">

            {reports.map((r, i) => (
              <div key={i} className="feed-item  ">
                <span className="feed-ic " style={{ background: tint('#3A30E0', 0.12), color: 'var(--accent)' }}><Icon name="file" size={15} /></span>
                <div className="min-w-0 ">
                  <div className="text-[13.5px] font-medium truncate ">{r.date}</div>
                  <div className="mono text-[11px] text-muted">{r.total} · save {r.save}</div>
                </div>
                <span className="ml-auto"><StatusChip status={r.status} /></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* latest analysis */}
      {/* <div className="panel p-6 mt-4">
        <div className="flex items-baseline justify-between mb-1">
        </div>
        <h2 className="disp text-[19px] mt-2 mb-4 max-w-[70ch]">
          Two services hold almost all the saveable money — commit to reserved capacity and right-size to cut ~30%.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FINDINGS.map((f, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-[12px] bg-paper2">
              <span className="feed-ic" style={{ background: tint(f.color, 0.14), color: f.color }}><Icon name={f.icon} size={15} /></span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[13.5px] font-semibold truncate">{f.title}</span>
                  <span className="chip" style={{ color: f.color, background: tint(f.color, 0.13), borderColor: tint(f.color, 0.3) }}>{f.tag}</span>
                </div>
                <div className="text-[12.5px] text-muted">{f.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mono text-[11px] text-muted mt-6 flex items-center gap-2">
        <span className="dot dot-live" style={{ background: '#1F8A5B' }} />UI preview · mock data · no API connected yet
      </div> */}
    </div>
  )
}