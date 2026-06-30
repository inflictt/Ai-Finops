import React from 'react'
import StatusChip from '../components/StatusChip.jsx'
import { Icon } from '../lib/icons.jsx'
import { pdfUrl } from '../lib/api.js'

export default function Reports({ reports, onGenerate, generating }) {
  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="eyebrow mb-3"><span className="ebdot" />All reports</div>
          <h1 className="disp text-[clamp(1.8rem,3.5vw,2.5rem)]">Report history</h1>
          <p className="text-[15px] text-ink2 mt-3 max-w-[54ch]">Every weekly cost report. Download the PDF, or generate a new one on demand.</p>
        </div>
        {/* <button className="btn btn-primary" onClick={onGenerate}>
          <Icon name="spark" size={16} />{generating ? 'Generating…' : 'Generate report'}
        </button> */}
      </div>

      <div className="panel p-6 mt-7">
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>Date</th><th>Total spend</th><th>Savings</th><th>Reduction</th><th>Engine</th><th>Status</th><th style={{ textAlign: 'right' }}>Report</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{r.date}</td>
                  <td className="mono">{r.total}</td>
                  <td className="mono" style={{ color: '#1F8A5B' }}>{r.save}</td>
                  <td className="mono">{r.reduction}</td>
                  <td className="mono text-muted">{r.model}</td>
                  <td><StatusChip status={r.status} /></td>
                  <td style={{ textAlign: 'right' }}>
                    {/* {r.status === 'Ready'
                      ? <button className="btn btn-outline"><Icon name="download" size={14} />PDF</button>
                      : <span className="mono text-[11px] text-muted">…</span>} */}
                      {r.status === 'Ready'
                        ? <a className="btn btn-outline" href={pdfUrl(r.id)} target="_blank" rel="noreferrer"><Icon name="download" size={14} />PDF</a>
                        : <span className="mono text-[11px] text-muted">…</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
