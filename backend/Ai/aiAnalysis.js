// // analyzeWithGemini() — asks Gemini for BOTH the plain-English report AND the
// // exact savings numbers, as ONE strict JSON object. Code then VALIDATES those
// // numbers (the guardrail) and returns { markdown, savings } — so the report,
// // the dashboard and the email all use the SAME figures.
// //
// // Hardened version:
// //   1. responseSchema  -> forces Gemini to return ONE clean JSON object
// //      (kills "Unexpected non-whitespace character after JSON").
// //   2. cleanJson()     -> strips ``` fences / stray text as a backup.
// //   3. retry w/ backoff-> rides out temporary 503 "high demand" spikes.
// //   4. fallback()      -> rule-based numbers + narrative if all else fails.
// import { analyzeCosts } from '../Analysis/costAnalysis.js'

// // Structured-output schema: Gemini must return exactly this shape, nothing else.
// const responseSchema = {
//   type: 'object',
//   properties: {
//     total_spend:   { type: 'number' },
//     total_savings: { type: 'number' },
//     reduction_pct: { type: 'number' },
//     by_service: {
//       type: 'array',
//       items: {
//         type: 'object',
//         properties: {
//           service: { type: 'string' },
//           amount:  { type: 'number' },
//           savings: { type: 'number' },
//         },
//         required: ['service', 'amount', 'savings'],
//       },
//     },
//     report_markdown: { type: 'string' },
//   },
//   required: ['total_spend', 'total_savings', 'reduction_pct', 'by_service', 'report_markdown'],
// }

// function buildPrompt(costData) {
//   return `You are a senior FinOps (cloud cost) analyst. Analyse the cost data and return ONE JSON object — nothing else.

// STRICT RULES
// - Use the REAL numbers from the data. Never invent services that aren't present.
// - Savings must be CONSERVATIVE: each service's "savings" is between 0 and its own monthly cost (never more than it costs), realistically 5–40% of it.
// - "total_savings" MUST equal the sum of by_service[].savings.
// - "reduction_pct" MUST equal round(total_savings / total_spend * 100).
// - "report_markdown" MUST use these exact numbers — no other savings figures anywhere in it.

// The report_markdown is written for a NON-TECHNICAL reader (explain every term in plain English, use analogies) and MUST use these sections:
// # Cloud Cost Report
// ## In plain English   (2–3 sentences: total spend, biggest drivers, total saving)
// ## Where the money goes   (a markdown table: Service | Monthly cost | Share of bill, biggest first)
// ## Biggest ways to save   (top 3–4, each "### <title> — save ~$X/month" then bullets: What it means / What to do / Effort)
// ## What to do first   (a short numbered list of 2–3 actions)
// ## Bottom line   (current bill, projected bill = total_spend − total_savings, total saving, reduction_pct)
// ## Glossary   (each technical term, one-line definition)

// Cost data (JSON):
// ${JSON.stringify(costData, null, 2)}`
// }

// export async function analyzeWithGemini(costData) {
//   const apiKey = process.env.GEMINI_API_KEY
//   if (!apiKey) return fallback(costData, 'no GEMINI_API_KEY')

//   const { GoogleGenAI } = await import('@google/genai')
//   const ai = new GoogleGenAI({ apiKey })

//   for (let attempt = 1; attempt <= 3; attempt++) {
//     try {
//       const response = await ai.models.generateContent({
//         model: process.env.GEMINI_MODEL || 'gemini-flash-latest',
//         contents: buildPrompt(costData),
//         config: {
//           responseMimeType: 'application/json',
//           responseSchema, // <- forces a single, valid JSON object
//         },
//       })
//       const parsed = JSON.parse(cleanJson(response.text)) // clean is a backup safety net
//       return validate(parsed, costData)
//     } catch (err) {
//       const transient = /503|UNAVAILABLE|high demand|overloaded|429/i.test(err.message || '')
//       if (transient && attempt < 3) {
//         await new Promise((r) => setTimeout(r, attempt * 1500)) // wait 1.5s, then 3s
//         continue
//       }
//       console.log('  [Gemini failed:', err.message, '-> fallback]')
//       return fallback(costData, err.message)
//     }
//   }
//   return fallback(costData, 'exhausted retries')
// }

// // Backup cleaner: strip ```json fences and keep only the outer { ... } object,
// // in case the model still wraps or trails the JSON despite the schema.
// function cleanJson(text = '') {
//   let t = String(text).trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim()
//   const first = t.indexOf('{')
//   const last = t.lastIndexOf('}')
//   if (first !== -1 && last !== -1 && last > first) t = t.slice(first, last + 1)
//   return t
// }

// // GUARDRAIL: only trust the AI's numbers if they're sane AND self-consistent.
// export function validate(p, costData) {
//   const spend = Number(costData.total_spend) || 0
//   const by = Array.isArray(p.by_service) ? p.by_service : []
//   const ts = Number(p.total_savings)
//   const rp = Number(p.reduction_pct)
//   const sumPer = by.reduce((a, s) => a + (Number(s.savings) || 0), 0)

//   const okShape = typeof p.report_markdown === 'string' && p.report_markdown.length > 40 && by.length > 0
//   const okBounds =
//     ts > 0 && ts <= spend &&
//     by.every((s) => (Number(s.savings) || 0) >= 0 && (Number(s.savings) || 0) <= (Number(s.amount) || 0) + 0.5)
//   const okConsistent =
//     Math.abs(sumPer - ts) <= Math.max(2, ts * 0.05) &&
//     Math.abs(rp - (spend ? Math.round((ts / spend) * 100) : 0)) <= 2

//   if (!(okShape && okBounds && okConsistent)) throw new Error('AI numbers failed validation')

//   return {
//     markdown: p.report_markdown,
//     savings: {
//       total_savings: Math.round(ts),
//       reduction_pct: Math.round(rp),
//       by_service: by.map((s) => ({ service: s.service, savings: Math.round(Number(s.savings) || 0) })),
//     },
//   }
// }

// // FALLBACK: rule-based numbers + a matching narrative, so nothing ever breaks.
// export function fallback(costData, reason) {
//   console.log('  [ai fallback]:', reason)
//   const a = analyzeCosts(costData)
//   return {
//     markdown: fallbackMarkdown(costData, a),
//     savings: {
//       total_savings: a.total_savings,
//       reduction_pct: a.reduction_pct,
//       by_service: a.by_service.map((s) => ({ service: s.service, savings: s.savings })),
//     },
//   }
// }

// function fallbackMarkdown(costData, a) {
//   const rows = a.by_service
//     .map((s) => `| ${s.service} | $${s.amount.toFixed(2)} | ${a.total_spend ? Math.round((s.amount / a.total_spend) * 100) : 0}% |`)
//     .join('\n')
//   const projected = (a.total_spend - a.total_savings).toFixed(2)
//   const top = [...a.by_service].sort((x, y) => y.savings - x.savings).slice(0, 3)
//   const opps = top
//     .map(
//       (s) =>
//         `### Optimise ${s.service} — save ~$${s.savings}/month\n- **What it means:** ${s.service} is a large, recoverable part of the bill.\n- **What to do:** right-size it, schedule it off outside work hours, or commit to reserved capacity.\n- **Effort:** Easy.`
//     )
//     .join('\n\n')

//   return `# Cloud Cost Report

// ## In plain English
// Last month your cloud bill was **$${a.total_spend.toFixed(2)}**. Based on typical recoverable spend for each service, about **$${a.total_savings} (~${a.reduction_pct}%)** can be saved.

// ## Where the money goes

// | Service | Monthly cost | Share of bill |
// | --- | --- | --- |
// ${rows}

// ## Biggest ways to save

// ${opps}

// ## What to do first
// 1. Tackle the largest service first — the biggest, easiest win.
// 2. Schedule non-production resources to switch off outside work hours.
// 3. Clean up unused storage and old backups.

// ## Bottom line
// Your current bill is **$${a.total_spend.toFixed(2)}**. After these changes it drops to about **$${projected}** — a saving of **$${a.total_savings} (~${a.reduction_pct}%)**.

// ## Glossary
// - **Right-sizing:** matching a resource's size to what it actually needs.
// - **Reserved capacity:** a 1-year commitment that is cheaper than pay-as-you-go.
// - **Lifecycle policy:** an automatic rule to archive or delete old files.
// `
// }


// analyzeWithGemini() — asks Gemini for BOTH the plain-English report AND the
// exact savings numbers, as ONE strict JSON object. Code then VALIDATES those
// numbers (the guardrail) and returns { markdown, savings } — so the report,
// the dashboard and the email all use the SAME figures.
//
// If there's no API key, an error, or the AI's numbers don't pass validation,
// it falls back to the rule-based analyzeCosts() (+ a matching narrative), so
// the app never breaks and the fallback's markdown & numbers still agree.



import { analyzeCosts } from '../Analysis/costAnalysis.js'

function buildPrompt(costData) {
  return `You are a senior FinOps (cloud cost) analyst. Analyse the cost data and return ONE JSON object — nothing else.

STRICT RULES
- Output ONLY valid JSON. No markdown code fences, no text before or after the JSON.
- Use the REAL numbers from the data. Never invent services that aren't present.
- Savings must be CONSERVATIVE: each service's "savings" is between 0 and its own monthly cost (never more than it costs), and realistically 5–40% of it.
- "total_savings" MUST equal the sum of by_service[].savings.
- "reduction_pct" MUST equal round(total_savings / total_spend * 100).
- "report_markdown" MUST use these exact numbers — no other savings figures anywhere in it.

Return exactly this shape:
{
  "total_spend": <number>,
  "total_savings": <number>,
  "reduction_pct": <number>,
  "by_service": [ { "service": <string>, "amount": <number>, "savings": <number> } ],
  "report_markdown": "<the full report as GitHub-flavored markdown>"
}

The report_markdown is written for a NON-TECHNICAL reader (explain every term in plain English, use analogies) and MUST use these sections:
# Cloud Cost Report
## In plain English   (2–3 sentences: total spend, biggest drivers, total saving)
## Where the money goes   (a markdown table: Service | Monthly cost | Share of bill, biggest first)
## Biggest ways to save   (top 3–4, each "### <title> — save ~$X/month" then bullets: What it means / What to do / Effort)
## What to do first   (a short numbered list of 2–3 actions)
## Bottom line   (current bill, projected bill = total_spend − total_savings, total saving, reduction_pct)
## Glossary   (each technical term, one-line definition)

Cost data (JSON):
${JSON.stringify(costData, null, 2)}`
}

export async function analyzeWithGemini(costData) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return fallback(costData, 'no GEMINI_API_KEY')

  try {
    const { GoogleGenAI } = await import('@google/genai')
    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-flash-latest',
      contents: buildPrompt(costData),
      config: { responseMimeType: 'application/json' }, 
    })
    const parsed = JSON.parse(response.text) // throws on bad JSON -> caught below
    return validate(parsed, costData) // throws if numbers are unsafe -> caught below
  } catch (err) {
    console.log('  [Gemini failed / invalid output:', err.message, '-> fallback]')
    return fallback(costData, err.message)
  }
}


export function validate(p, costData) {
  const spend = Number(costData.total_spend) || 0
  const by = Array.isArray(p.by_service) ? p.by_service : []
  const ts = Number(p.total_savings)
  const rp = Number(p.reduction_pct)
  const sumPer = by.reduce((a, s) => a + (Number(s.savings) || 0), 0)

  const okShape = typeof p.report_markdown === 'string' && p.report_markdown.length > 40 && by.length > 0
  const okBounds =
    ts > 0 && ts <= spend &&
    by.every((s) => (Number(s.savings) || 0) >= 0 && (Number(s.savings) || 0) <= (Number(s.amount) || 0) + 0.5)
  const okConsistent =
    Math.abs(sumPer - ts) <= Math.max(2, ts * 0.05) &&
    Math.abs(rp - (spend ? Math.round((ts / spend) * 100) : 0)) <= 2

  if (!(okShape && okBounds && okConsistent)) throw new Error('AI numbers failed validation')

  return {
    markdown: p.report_markdown,
    savings: {
      total_savings: Math.round(ts),
      reduction_pct: Math.round(rp),
      by_service: by.map((s) => ({ service: s.service, savings: Math.round(Number(s.savings) || 0) })),
    },
  }
}

// FALLBACK: rule-based numbers + a matching narrative, so nothing ever breaks
// and the fallback's markdown & numbers still agree.
export function fallback(costData, reason) {
  console.log('  [ai fallback]:', reason)
  const a = analyzeCosts(costData)
  return {
    markdown: fallbackMarkdown(costData, a),
    savings: {
      total_savings: a.total_savings,
      reduction_pct: a.reduction_pct,
      by_service: a.by_service.map((s) => ({ service: s.service, savings: s.savings })),
    },
  }
}

function fallbackMarkdown(costData, a) {
  const rows = a.by_service
    .map((s) => `| ${s.service} | $${s.amount.toFixed(2)} | ${a.total_spend ? Math.round((s.amount / a.total_spend) * 100) : 0}% |`)
    .join('\n')
  const projected = (a.total_spend - a.total_savings).toFixed(2)
  const top = [...a.by_service].sort((x, y) => y.savings - x.savings).slice(0, 3)
  const opps = top
    .map(
      (s) =>
        `### Optimise ${s.service} — save ~$${s.savings}/month\n- **What it means:** ${s.service} is a large, recoverable part of the bill.\n- **What to do:** right-size it, schedule it off outside work hours, or commit to reserved capacity.\n- **Effort:** Easy.`
    )
    .join('\n\n')

  return `# Cloud Cost Report

## In plain English
Last month your cloud bill was **$${a.total_spend.toFixed(2)}**. Based on typical recoverable spend for each service, about **$${a.total_savings} (~${a.reduction_pct}%)** can be saved.

## Where the money goes

| Service | Monthly cost | Share of bill |
| --- | --- | --- |
${rows}

## Biggest ways to save

${opps}

## What to do first
1. Tackle the largest service first — the biggest, easiest win.
2. Schedule non-production resources to switch off outside work hours.
3. Clean up unused storage and old backups.

## Bottom line
Your current bill is **$${a.total_spend.toFixed(2)}**. After these changes it drops to about **$${projected}** — a saving of **$${a.total_savings} (~${a.reduction_pct}%)**.

## Glossary
- **Right-sizing:** matching a resource's size to what it actually needs.
- **Reserved capacity:** a 1-year commitment that is cheaper than pay-as-you-go.
- **Lifecycle policy:** an automatic rule to archive or delete old files.
`
}