import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Topbar from './components/Topbar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Reports from './pages/Reports.jsx'
import CostExplorer from './pages/CostExplorer.jsx'
import Settings from './pages/Settings.jsx'
import { REPORT } from './lib/data.js'
import { getReports, generateReport } from './lib/api.js'


export default function App() {
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

  // load saved reports from the backend on first render
  useEffect(() => {
    getReports().then(setReports).catch((e) => console.error('load reports failed', e))
  }, [])

  // generate → backend runs the pipeline → refresh the list
  const onGenerate = async () => {
    if (generating) return
    setGenerating(true)
    try {
      await generateReport()
      const list = await getReports()
      setReports(list)
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




// export default function App() {
//   const [dark, setDark] = useState(false)
//   const [page, setPage] = useState('dashboard')
//   const [reports, setReports] = useState([REPORT]) // one dummy entry
//   const [generating, setGenerating] = useState(false)

//   useEffect(() => {
//     try { if (localStorage.getItem('fin-theme') === 'dark') setDark(true) } catch (e) {}
//   }, [])
//   useEffect(() => {
//     document.documentElement.classList.toggle('dark', dark)
//     try { localStorage.setItem('fin-theme', dark ? 'dark' : 'light') } catch (e) {}
//   }, [dark])

//   // mock generate (no API): show "Generating…", then resolve to a ready report
//   const onGenerate = () => {
//     if (generating) return
//     setGenerating(true)
//     setReports((r) => [
//       { id: 'tmp', date: 'Generating…', total: '—', save: '—', reduction: '—', status: 'Generating', model: 'Gemini 2.0 Flash' },
//       ...r,
//     ])
//     setTimeout(() => {
//       setReports((r) => {
//         const c = [...r]
//         c[0] = { id: 'rpt_new', date: 'Jun 26, 2026', total: '$779.84', save: '$268', saveRange: '$240–290', reduction: '31%', status: 'Ready', model: 'Gemini 2.0 Flash' }
//         return c
//       })
//       setGenerating(false)
//     }, 1600)
//   }

//   const pages = {
//     dashboard: <Dashboard reports={reports} />,
//     reports: <Reports reports={reports} onGenerate={onGenerate} generating={generating} />,
//     explorer: <CostExplorer />,
//     settings: <Settings dark={dark} setDark={setDark} />,
//   }

//   return (
//     <>
//       <div className="grain" aria-hidden="true" />
//       <div className="relative z-10 flex min-h-screen text-ink">
//         <Sidebar page={page} setPage={setPage} />
//         <div className="flex-1 flex flex-col min-w-0">
//           <Topbar page={page} dark={dark} setDark={setDark} onGenerate={onGenerate} generating={generating} />
//           <main className="flex-1 overflow-y-auto p-5 sm:p-7">
//             <div className="max-w-330">{pages[page]}</div>
//           </main>
//         </div>
//       </div>
//     </>
//   )
// }
