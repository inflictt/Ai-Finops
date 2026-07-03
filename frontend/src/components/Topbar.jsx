import React from 'react'
import { Icon } from '../lib/icons.jsx'
import { useAuth } from '../lib/AuthContext.jsx'

const TITLES = { dashboard: 'Dashboard', reports: 'Reports', explorer: 'Cost Explorer', settings: 'Settings' }

export default function Topbar({ page, dark, setDark, onGenerate, generating }) {
  const { user, logout } = useAuth()

  return (
    <header
      className="h-16 shrink-0 border-b border-line flex items-center justify-between gap-4 px-5 sticky top-0 z-20"
      style={{ background: 'color-mix(in srgb, var(--paper) 82%, transparent)', backdropFilter: 'blur(12px)' }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="mono text-[12px] text-muted hidden sm:inline">FinOps /</span>
        <span className="disp text-[18px] truncate">{TITLES[page]}</span>
      </div>
      <div className="flex items-center gap-2.5">
        <button className="btn-icon" aria-label="Toggle theme" onClick={() => setDark((d) => !d)}>
          <Icon name={dark ? 'sun' : 'moon'} size={18} />
        </button>
        <button className="btn btn-primary" onClick={onGenerate}>
          {generating ? 'Generating…' : 'Generate report'}
        </button>
        {user && (
          <div className="flex items-center gap-2 pl-1">
            <span className="mono text-[12px] text-muted hidden md:inline">{user.email}</span>
            <button className="btn-outline" onClick={logout}>Log out</button>
          </div>
        )}
      </div>
    </header>
  )
}