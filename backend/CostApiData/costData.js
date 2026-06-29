
// console.log("Data fetching  in making");

// const SAMPLE = {
//   period: { start: '2026-05-26', end: '2026-06-25' },
//   total_spend: 784.16,
//   by_service: [
//     { service: 'Amazon RDS', amount: 484.0 },
//     { service: 'Amazon EC2', amount: 170.0 },
//     { service: 'EC2 - Other', amount: 88.0 },
//     { service: 'Amazon S3', amount: 24.7 },
//     { service: 'Amazon VPC', amount: 14.6 },
//     { service: 'CloudWatch', amount: 2.86 },
//   ],
// }

// export function getCostData() {
//   return SAMPLE   // later: real Cost Explorer, falling back to SAMPLE
// }

// const SAMPLE = {
//   period: { start: '2026-05-26', end: '2026-06-25' },
//   total_spend: 784.16,
//   by_service: [
//     { service: 'Amazon RDS', amount: 484.0 },
//     { service: 'Amazon EC2', amount: 170.0 },
//     { service: 'EC2 - Other', amount: 88.0 },
//     { service: 'Amazon S3', amount: 24.7 },
//     { service: 'Amazon VPC', amount: 14.6 },
//     { service: 'CloudWatch', amount: 2.86 },
//   ],
// }

// export function getCostData() {
//   return SAMPLE   // later: real Cost Explorer, falling back to SAMPLE
// }
const SAMPLE = {
  provider: "AWS",

  account_name: "Development",

  currency: "USD",

  generated_at: "2026-06-30T10:00:00Z",

  period: {
    start: "2026-05-26",
    end: "2026-06-25",
  },

  total_spend: 784.16,

  by_service: [
    { service: "Amazon RDS", amount: 484.0 },
    { service: "Amazon EC2", amount: 170.0 },
    { service: "EC2 - Other", amount: 88.0 },
    { service: "Amazon S3", amount: 24.7 },
    { service: "Amazon VPC", amount: 14.6 },
    { service: "CloudWatch", amount: 2.86 },
  ],
};
export function getCostData() {
  return SAMPLE   // later: real Cost Explorer, falling back to SAMPLE
}

// // CostApiData/costData.js
// import aws from '../providers/aws.sample.js'
// import azure from '../providers/azure.sample.js'
// import gcp from '../providers/gcp.sample.js'

// const SAMPLES = { aws, azure, gcp }

// export function getCostData(provider = 'aws') {
//   return SAMPLES[provider] || SAMPLES.aws
// }
