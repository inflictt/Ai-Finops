import React from 'react'
import { Icon } from '../lib/icons.jsx'

export default function Settings({ dark, setDark }) {
  return (
    <div>
      <div className="eyebrow mb-3"><span className="ebdot" />Configuration</div>
      <h1 className="disp text-[clamp(1.8rem,3.5vw,2.5rem)]">Settings</h1>
      <p className="text-[15px] text-ink2 mt-3 max-w-[54ch]">Real keys live in the backend later — these fields are a UI preview only.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-7">
        <div className="panel p-6">
          <h2 className="disp text-[18px] mb-4">AI engine</h2>
          <div className="flex flex-col gap-2 mb-4">
            <label className="field-label">Gemini API key</label>
            <input className="input" type="password" placeholder="paste key (stored in backend .env)" disabled />
          </div>
          <div className="flex flex-col gap-2">
            <label className="field-label">Model</label>
            <select className="input" defaultValue="gemini-2.0-flash">
              <option>gemini-2.0-flash</option>
              <option>gemini-2.5-flash</option>
            </select>
          </div>
        </div>

        <div className="panel p-6">
          <h2 className="disp text-[18px] mb-4">Storage &amp; theme</h2>
          <div className="flex flex-col gap-2 mb-4">
            <label className="field-label">S3 bucket (optional)</label>
            <input className="input" placeholder="finops-reports-yourname" disabled />
          </div>
          <div className="flex items-center justify-between pt-1">
            <div>
              <div className="field-label">Appearance</div>
              <div className="text-[12.5px] text-muted">Light / dark theme</div>
            </div>
            <button className="btn btn-outline" onClick={() => setDark((d) => !d)}>
              <Icon name={dark ? 'sun' : 'moon'} size={14} />{dark ? 'Light' : 'Dark'} mode
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
