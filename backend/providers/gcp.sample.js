// gcp.sample.js

export default {
  provider: "GCP",
  period: {
    start: "2026-05-26",
    end: "2026-06-25"
  },

  total_spend:705,

  by_service:[
      { service:"Compute Engine", amount:290 },
      { service:"BigQuery", amount:160 },
      { service:"Cloud Storage", amount:90 }
  ]
}