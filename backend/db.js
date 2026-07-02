import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Neon requires SSL
})

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reports (
      id         TEXT PRIMARY KEY,
      date       TEXT NOT NULL,
      total      TEXT,
      savings    TEXT,
      reduction  TEXT,
      status     TEXT,
      markdown   TEXT,
      pdf        BYTEA,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `)
  console.log('DB ready: reports table ensured')
}