import cron from 'node-cron'
import { generateAndSaveReport } from './pipeline.js'

// "minute hour day month weekday" — "0 8 * * 1" = 08:00 every Monday.
// Override with CRON_SCHEDULE in .env to test (e.g. "*/1 * * * *" = every minute).
const SCHEDULE = process.env.CRON_SCHEDULE || '0 8 * * 1'
// const SCHEDULE = '*/1 * * * *'
// console.log("CRON_SCHEDULE =", process.env.CRON_SCHEDULE);
const REPORT_USER_ID = 'ba1af638-6ad9-4504-ba1c-ed52521f1a3c'   // ← the owner of weekly reports

export function startScheduler() {
  cron.schedule(SCHEDULE, async () => {
    console.log('[cron] generating weekly report...')
    try {
      const report = await generateAndSaveReport(REPORT_USER_ID)
      console.log('[cron] saved report', report.id)
    } catch (err) {
      console.error('[cron] failed:', err.message)
    }
  })
  console.log(`Scheduler started (schedule: "${SCHEDULE}")`)
}
