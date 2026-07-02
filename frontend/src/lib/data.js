// ---- Mock data (no API). One dummy report entry, as requested. ----
// Later, these come from the backend; the UI shape stays the same.

export const REPORT = {
  id: 'rpt_2026_0625',
  date: 'Jun 25, 2026',
  total: '$784.16',
  totalNum: 784.16,
  save: '$262',
  saveRange: '$226–298',
  reduction: '30%',
  status: 'Ready',           // Ready | Generating | Failed
  model: 'Gemini 2.0 Flash',
}

export const SERVICES = [
  { name: 'Amazon RDS', spend: 484.0, save: '$170–215', pct: 62, critical: true },
  { name: 'Amazon EC2', spend: 170.0, save: '$45–60', pct: 22, critical: true },
  { name: 'EC2 – Other', spend: 88.0, save: '$6–12', pct: 11 },
  { name: 'Amazon S3', spend: 24.7, save: '$4–8', pct: 4 },
  { name: 'Amazon VPC', spend: 14.6, save: '$1–2', pct: 2 },
  { name: 'CloudWatch', spend: 3.98, save: '$0–1', pct: 1 },
]

export const FINDINGS = [
  { icon: 'bolt', color: '#D6435B', tag: 'CRITICAL', title: '0% Reserved Instances', note: 'RDS & EC2 on full on-demand — commit 1-yr to save ~$52–65/mo.' },
  { icon: 'server', color: '#D6435B', tag: 'CRITICAL', title: 'Idle, oversized servers', note: 'EC2 t3.xlarge at 3.44% CPU, VPN at 0.3% — right-size down.' },
  { icon: 'trash', color: '#B8791C', tag: 'HIGH', title: 'No S3 lifecycle policies', note: '8 buckets, versions piling up; storage +45% MoM.' },
  { icon: 'disk', color: '#B8791C', tag: 'HIGH', title: 'GP2 → GP3 disk upgrade', note: '~20% cheaper, faster storage on RDS & EBS.' },
]
