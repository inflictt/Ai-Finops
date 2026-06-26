import React from 'react'
import { Icon } from '../lib/icons.jsx'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { id: 'reports', label: 'Reports', icon: 'report', badge: 1 },
  { id: 'explorer', label: 'Cost Explorer', icon: 'explore' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
]

export default function Sidebar({ page, setPage }) {
  return (
    <aside className="w-[252px] shrink-0 bg-paper2 border-r border-line flex-col justify-between hidden md:flex">
      <div className="p-3">
        <div className="flex items-center gap-2.5 px-2.5 pt-3.5 pb-2.5">
          <span className="w-9 h-9 rounded-[9px] grid place-items-center bg-ink text-paper"><Icon name="chart" size={20} /></span>
          <span className="disp text-[20px]">Fin<span className="accent-text">Ops</span></span>
        </div>
        <div className="nav-section">Operations</div>
        {NAV.map((n) => (
          <button key={n.id} className={'nav-item' + (page === n.id ? ' active' : '')} onClick={() => setPage(n.id)}>
            <Icon name={n.icon} size={18} />
            {n.label}
            {n.badge ? <span className="nav-badge">{n.badge}</span> : null}
          </button>
        ))}
      </div>
      <div className="p-3">
        <div className="panel p-3 flex items-center gap-3">
          <span className="av">SL</span>
          <div className="leading-tight">
            <div className="text-[13px] font-semibold">Saksham</div>
            <div className="mono text-[11px] text-muted">FinOps · admin</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
