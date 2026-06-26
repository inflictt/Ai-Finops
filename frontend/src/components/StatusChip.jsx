import React from 'react'
import { tint } from '../lib/util.js'

const COLORS = { Ready: '#1F8A5B', Generating: '#B8791C', Failed: '#D6435B' }

export default function StatusChip({ status }) {
  const c = COLORS[status] || '#78736A'
  return (
    <span className="chip" style={{ color: c, background: tint(c, 0.13), borderColor: tint(c, 0.32) }}>
      {status === 'Generating' && <span className="dot dot-live" style={{ background: c, width: 6, height: 6 }} />}
      {status}
    </span>
  )
}
