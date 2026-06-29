// azure.sample.js

export default {
  provider: "Azure",
 period: {
    start: "2026-05-26",
    end: "2026-06-25"
  },

  total_spend: 642.20,

  by_service: [
      { service:"Virtual Machines", amount:210 },
      { service:"Azure SQL", amount:180 },
      { service:"Blob Storage", amount:95 }
  ]
}