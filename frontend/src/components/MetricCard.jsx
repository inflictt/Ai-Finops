import React from 'react'
import { Icon } from '../lib/icons.jsx'
import { tint } from '../lib/util.js'

export default function MetricCard({ icon, color, value, label, delta, deltaColor }) {
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <span className="metric-ic" style={{ background: tint(color, 0.14), color }}>
          <Icon name={icon} size={19} />
        </span>
        {delta && <span className="mono text-[11px] font-semibold" style={{ color: deltaColor }}>{delta}</span>}
      </div>
      <div className="metric-val text-ink">{value}</div>
      <div className="text-[12.5px] text-muted">{label}</div>
    </div>
  )
}
