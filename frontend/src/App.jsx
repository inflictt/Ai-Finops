import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Topbar from './components/Topbar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Reports from './pages/Reports.jsx'
import CostExplorer from './pages/CostExplorer.jsx'
import Settings from './pages/Settings.jsx'
import Login from './pages/Login.jsx'
import { getReports, generateReport } from './lib/api.js'
import { useAuth } from './lib/AuthContext.jsx'

export default function App() {
  const { user, loading } = useAuth()
  const [dark, setDark] = useState(false)
  const [page, setPage] = useState('dashboard')
  const [reports, setReports] = useState([])
  const [generating, setGenerating] = useState(false)

  // theme
  useEffect(() => {
    try { if (localStorage.getItem('fin-theme') === 'dark') setDark(true) } catch (e) {}
  }, [])
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    try { localStorage.setItem('fin-theme', dark ? 'dark' : 'light') } catch (e) {}
  }, [dark])

  // load reports only once we know a user is logged in
  useEffect(() => {
    if (!user) return
    getReports().then(setReports).catch((e) => console.error('load reports failed', e))
  }, [user])

  const onGenerate = async () => {
    if (generating) return
    setGenerating(true)
    try {
      await generateReport()
      setReports(await getReports())
    } catch (e) {
      console.error('generate failed', e)
    } finally {
      setGenerating(false)
    }
  }

  const pages = {
    dashboard: <Dashboard reports={reports} />,
    reports: <Reports reports={reports} onGenerate={onGenerate} generating={generating} />,
    explorer: <CostExplorer />,
    settings: <Settings dark={dark} setDark={setDark} />,
  }

  // --- auth gate ---
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-muted" style={{ background: 'var(--desk)' }}>
        Loading…
      </div>
    )
  }
  if (!user) return <Login />

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <div className="relative z-10 flex min-h-screen text-ink">
        <Sidebar page={page} setPage={setPage} />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar page={page} dark={dark} setDark={setDark} onGenerate={onGenerate} generating={generating} />
          <main className="flex-1 overflow-y-auto p-5 sm:p-7">
            <div className="max-w-330">{pages[page]}</div>
          </main>
        </div>
      </div>
    </>
  )
}