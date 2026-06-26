console.log("Data fetching  in making");

const SAMPLE = {
  period: { start: '2026-05-26', end: '2026-06-25' },
  total_spend: 784.16,
  by_service: [
    { service: 'Amazon RDS', amount: 484.0 },
    { service: 'Amazon EC2', amount: 170.0 },
    { service: 'EC2 - Other', amount: 88.0 },
    { service: 'Amazon S3', amount: 24.7 },
    { service: 'Amazon VPC', amount: 14.6 },
    { service: 'CloudWatch', amount: 2.86 },
  ],
}

export function getCostData() {
  return SAMPLE   // later: real Cost Explorer, falling back to SAMPLE
}