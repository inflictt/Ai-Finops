// aws.sample.js
export default {
  provider: "AWS",
  period: {
    start: "2026-05-26",
    end: "2026-06-25"
  },
  total_spend: 784.16,

  by_service: [
    { service: "Amazon EC2", amount: 170 },
    { service: "Amazon RDS", amount: 484 },
    { service: "Amazon S3", amount: 24.7 }
  ]
}