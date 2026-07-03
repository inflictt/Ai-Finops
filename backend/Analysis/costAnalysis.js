// The analysis layer — replaces the flat "× 0.3" guess and the hardcoded "~30%".
// It's rule-based (not ML, and honest to call it that): different service types
// have different amounts of recoverable spend, which is exactly how a real
// FinOps tool reasons. Savings and the reduction % are now COMPUTED from the
// actual service mix, so they change with the data instead of being constants.

// Typical recoverable share of spend, by service type.
const RATES = [
  { match: /rds|cloud ?sql|database|bigquery|redshift/i, rate: 0.35, kind: 'database' },
  { match: /ec2|compute|instance|\bvm\b|kubernetes|gke|eks/i, rate: 0.30, kind: 'compute' },
  { match: /s3|cloud ?storage|bucket|ebs|disk|blob/i, rate: 0.20, kind: 'storage' },
  { match: /vpc|network|load ?balanc|cdn|egress/i, rate: 0.08, kind: 'network' },
  { match: /cloudwatch|monitor|logging|trace/i, rate: 0.05, kind: 'monitoring' },
]
const DEFAULT = { rate: 0.15, kind: 'other' }

function rateFor(service) {
  return RATES.find((r) => r.match.test(service || '')) || DEFAULT
}

// Priority is driven by how many real dollars are saveable, not a guess.
function priorityFor(savings) {
  if (savings >= 100) return 'critical'
  if (savings >= 30) return 'high'
  if (savings >= 5) return 'medium'
  return 'low'
}

// Takes raw cost data { total_spend, by_service:[{service, amount}] }
// and returns it enriched with per-service savings/priority + totals.
export function analyzeCosts(costData) {
  const services = costData.by_service ?? []

  const by_service = services.map((s) => {
    const { rate, kind } = rateFor(s.service)
    const savings = Math.round(s.amount * rate)
    return {
      service: s.service,
      amount: s.amount,
      savings,
      rate: Math.round(rate * 100), // e.g. 35 (%)
      kind,
      priority: priorityFor(savings),
    }
  })

  const total_spend = costData.total_spend ?? services.reduce((a, s) => a + s.amount, 0)
  const total_savings = by_service.reduce((a, s) => a + s.savings, 0)
  const reduction_pct = total_spend ? Math.round((total_savings / total_spend) * 100) : 0

  return { ...costData, by_service, total_spend, total_savings, reduction_pct }
}