# FinOps — Frontend (React + Tailwind)

The complete dashboard UI in the "Editorial" design language. **Frontend only — no API yet.**
All data is mock data with one dummy report entry; the Generate button runs a fake 1.5s loading state.

## Run it

```bash
cd finops-app/frontend
npm install
npm run dev
```

Open the URL it prints (usually http://localhost:5173).

## What's inside

```
frontend/
├── index.html
├── package.json
├── vite.config.js · postcss.config.js · tailwind.config.js
└── src/
    ├── main.jsx            # entry
    ├── index.css           # Tailwind + Editorial design tokens (light/dark)
    ├── App.jsx             # shell + page switching + theme + mock generate
    ├── lib/
    │   ├── icons.jsx       # inline SVG icon set
    │   ├── util.js         # tint() helper
    │   └── data.js         # MOCK DATA (one dummy report) ← swap for API later
    ├── components/         # Sidebar · Topbar · MetricCard · StatusChip
    └── pages/              # Dashboard · Reports · CostExplorer · Settings
```

## Try it
- Toggle **light / dark** (sun/moon in the topbar, or Settings page).
- Click **Generate report** — a row shows "Generating…", then becomes "Ready".
- Switch pages in the sidebar: Dashboard, Reports, Cost Explorer, Settings.

## Later (when wiring the backend)
Only `src/lib/data.js` and the `onGenerate` handler in `App.jsx` change — replace the mock with
`fetch('/api/...')` calls. Every component stays the same.
