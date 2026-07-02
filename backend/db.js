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
   await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id          TEXT PRIMARY KEY,
      name        TEXT,
      email       TEXT UNIQUE NOT NULL,
      password    TEXT,               -- bcrypt hash; NULL for Google-only users
      google_id   TEXT UNIQUE,        -- set only for Google sign-in users
      created_at  TIMESTAMPTZ DEFAULT now()
    )
  `)

  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS refresh_token TEXT`)

  console.log('DB ready: reports table ensured')
}