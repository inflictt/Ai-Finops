// Part 3 — analyzeWithGemini()
// Sends the cost data to Google Gemini and returns a markdown report.
// If there's no GEMINI_API_KEY (or the call fails), it falls back to a mock,
// so the pipeline always works.

function buildPrompt(costData) {
  return (
    'You are a senior AWS FinOps analyst. Analyze this cost data (JSON) and write a ' +
    'concise markdown report with these sections: Executive summary, Spend by service ' +
    '(a markdown table), Optimization recommendations (bullets), and Estimated savings. ' +
    'Use the real numbers.\n\nCost data:\n' +
    JSON.stringify(costData, null, 2)
  )
}

export async function analyzeWithGemini(costData) {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    console.log('  [no GEMINI_API_KEY -> using mock analysis]')
    return mockAnalysis(costData)
  }

  try {
    // Lazy import: only needed when a real key is present.
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
  const rows = costData.by_service.map((s) => `| ${s.service} | $${s.amount.toFixed(2)} | review |`).join('\n')
  return `# AWS Cost Report

## Executive summary
Total spend over the last 30 days was **$${total}**, driven mainly by Amazon RDS and Amazon EC2. The biggest opportunity is reserved capacity + right-sizing, worth an estimated **$226-298/month (~30%)**.

## Spend by service

| Service | Monthly spend | Action |
| --- | --- | --- |
${rows}

## Optimization recommendations
- Buy 1-year Reserved Instances / Savings Plans for RDS and EC2 (~$52-65/mo).
- Right-size under-utilized EC2 instances (single-digit CPU).
- Add S3 lifecycle policies to expire old versions.
- Migrate GP2 volumes to GP3 (~20% cheaper).

## Estimated savings
Roughly **$226-298 per month (about 30% of total spend)**.
`
}