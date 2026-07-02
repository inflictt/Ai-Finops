import cron from 'node-cron'
import { generateAndSaveReport } from './pipeline.js'

// "minute hour day month weekday" — "0 8 * * 1" = 08:00 every Monday.
// Override with CRON_SCHEDULE in .env to test (e.g. "*/1 * * * *" = every minute).
const SCHEDULE = process.env.CRON_SCHEDULE || '0 8 * * 1'
// console.log("CRON_SCHEDULE =", process.env.CRON_SCHEDULE);

export function startScheduler() {
  cron.schedule(SCHEDULE, async () => {
    console.log('[cron] generating weekly report...')
    try {
      const report = await generateAndSaveReport()
      console.log('[cron] saved report', report.id)
    } catch (err) {
      console.error('[cron] failed:', err.message)
    }
  })
  console.log(`Scheduler started (schedule: "${SCHEDULE}")`)
}
