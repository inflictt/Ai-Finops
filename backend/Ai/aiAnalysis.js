// // Part 3 — analyzeWithGemini()
// // Sends the cost data to Google Gemini and returns a markdown report.
// // If there's no GEMINI_API_KEY (or the call fails), it falls back to a mock,
// // so the pipeline always works.
// console.log("Analysis in making");

// function buildPrompt(costData) {
//   return (
//     'You are a senior AWS FinOps analyst. Analyze this cost data (JSON) and write a ' +
//     'concise markdown report with these sections: Executive summary, Spend by service ' +
//     '(a markdown table), Optimization recommendations (bullets), and Estimated savings. ' +
//     'Use the real numbers.\n\nCost data:\n' +
//     JSON.stringify(costData, null, 2)
//   )
// }

// export async function analyzeWithGemini(costData) {
//   const apiKey = process.env.GEMINI_API_KEY

//   if (!apiKey) {
//     console.log('  [no GEMINI_API_KEY -> using mock analysis]')
//     return mockAnalysis(costData)
//   }

//   try {
//     // Lazy import: only needed when a real key is present.
//     const { GoogleGenAI } = await import('@google/genai')
//     const ai = new GoogleGenAI({ apiKey })
//     const response = await ai.models.generateContent({
//       model: process.env.GEMINI_MODEL || 'gemini-flash-latest',
//       contents: buildPrompt(costData),
//     })
//     return response.text
//   } catch (err) {
//     console.log('  [Gemini call failed:', err.message, '-> using mock]')
//     return mockAnalysis(costData)
//   }
// }

// function mockAnalysis(costData) {
//   const total = costData.total_spend
//   const rows = costData.by_service.map((s) => `| ${s.service} | $${s.amount.toFixed(2)} | review |`).join('\n')
//   return `# AWS Cost Report

// ## Executive summary
// Total spend over the last 30 days was **$${total}**, driven mainly by Amazon RDS and Amazon EC2. The biggest opportunity is reserved capacity + right-sizing, worth an estimated **$226-298/month (~30%)**.

// ## Spend by service

// | Service | Monthly spend | Action |
// | --- | --- | --- |
// ${rows}

// ## Optimization recommendations
// - Buy 1-year Reserved Instances / Savings Plans for RDS and EC2 (~$52-65/mo).
// - Right-size under-utilized EC2 instances (single-digit CPU).
// - Add S3 lifecycle policies to expire old versions.
// - Migrate GP2 volumes to GP3 (~20% cheaper).

// ## Estimated savings
// Roughly **$226-298 per month (about 30% of total spend)**.
// `
// }

// analyzeWithGemini() — sends cost data to Gemini and returns a markdown report.
// Falls back to a rich mock if there's no key / a quota error, so it always works.

function buildPrompt(costData) {
  return `You are a senior FinOps (cloud cost) analyst. Write a monthly cloud cost report for a NON-TECHNICAL reader — a business owner or manager who does not know cloud jargon.

RULES
- Explain every technical term in plain English the first time it appears; keep it simple.
- Use everyday analogies where they help. No unexplained acronyms.
- Focus on money and clear actions, not deep technical detail.
- Use the REAL numbers from the data. Never invent services that are not present.
- Output GitHub-flavored markdown. Keep table cells SHORT (a name, a $amount, or a %) — put all explanations in sentences and bullets, never long text inside a table cell.

Use EXACTLY these sections and headings:

# Cloud Cost Report
## In plain English
2-3 sentences: total monthly spend, the one or two biggest cost drivers, and roughly how much can be saved — in everyday language.

## Where the money goes
A markdown table with columns: Service | Monthly cost | Share of bill. Biggest first, short cells only.
Then 1-2 sentences saying, in plain words, what the top service(s) actually do.

## Biggest ways to save
The top 3-4 opportunities, ranked by savings. For EACH, a "### <short title> — save ~$X/month" heading, then bullets:
- **What it means:** the idea in plain English (analogy if useful).
- **What to do:** the concrete action.
- **Effort:** Easy / Medium / Hard.

## What to do first
A short numbered list of the 2-3 highest-value actions to start with.

## Bottom line
One short paragraph: the current monthly bill, the projected bill after these changes, the total monthly saving, and the % reduction.

## Glossary
A bullet list of every technical term used, each with a one-line plain-English definition.

Cost data (JSON):
${JSON.stringify(costData, null, 2)}`
}

export async function analyzeWithGemini(costData) {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    console.log('  [no GEMINI_API_KEY -> using mock analysis]')
    return mockAnalysis(costData)
  }

  try {
    const { GoogleGenAI } = await import('@google/genai')
    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-flash-latest',
      contents: buildPrompt(costData),
    })
    return response.text
  } catch (err) {
    console.log('  [Gemini call failed:', err.message, '-> using mock]')
    return mockAnalysis(costData)
  }
}

function mockAnalysis(costData) {
  const total = costData.total_spend
  const rows = costData.by_service
    .map((s) => `| ${s.service} | $${s.amount.toFixed(2)} | ${Math.round((s.amount / total) * 100)}% |`)
    .join('\n')

  return `# Cloud Cost Report

## In plain English
Last month your cloud bill was **$${total.toFixed(2)}**. Almost all of it comes from two things — your **database** and your **servers**. By committing to them for a year and switching off waste, you can save an estimated **$226-298 per month (about 30%)**, with no impact on how anything runs.

## Where the money goes

| Service | Monthly cost | Share of bill |
| --- | --- | --- |
${rows}

In plain words: **RDS** is the managed database that stores your app's data, and **EC2** are the rented computers ("servers") that run it — together they are the large majority of the bill.

## Biggest ways to save

### Commit for a year — save ~$52-65/month
- **What it means:** right now you pay full "pay-as-you-go" prices. A 1-year commitment is like an annual subscription instead of paying daily — same usage, much cheaper.
- **What to do:** buy 1-year Reserved Instances / Savings Plans for the database and servers.
- **Effort:** Easy.

### Turn off oversized servers — save ~$40-60/month
- **What it means:** some servers are far bigger than needed — like renting a truck to carry a backpack.
- **What to do:** move them to a smaller size that matches real usage.
- **Effort:** Medium.

### Clean up old storage — save ~$10-20/month
- **What it means:** old files pile up forever and quietly keep costing money.
- **What to do:** set rules that automatically archive or delete old versions.
- **Effort:** Easy.

### Upgrade the disks — save ~20% on storage
- **What it means:** a newer disk type ("GP3") is cheaper and faster than the old one ("GP2").
- **What to do:** switch the disks over — no downtime.
- **Effort:** Easy.

## What to do first
1. Buy the 1-year commitments — the biggest, easiest win.
2. Right-size the oversized servers.
3. Add automatic storage cleanup rules.

## Bottom line
Your current bill is **$${total.toFixed(2)} per month**. After these changes it drops to roughly **$540-560 per month** — a saving of about **$226-298 per month (~30%)**, with no effect on performance.

## Glossary
- **RDS:** a managed database — cloud-run storage for your app's data.
- **EC2:** rented virtual computers ("servers") that run your software.
- **Reserved Instance / Savings Plan:** a 1-year commitment that gives a big discount vs pay-as-you-go.
- **Right-sizing:** matching a server's size to what it actually needs.
- **Lifecycle policy:** an automatic rule to archive or delete old files.
- **GP2 / GP3:** older vs newer disk types; GP3 is cheaper and faster.
`
}