// All user SQL lives here (the pg equivalent of a Mongoose User model).
// Note the difference from Mongoose: no .save() or schema methods — just
// parameterized queries. We NEVER return the password unless a query needs it
// for a check (findUserByEmail), and we always lowercase the email.
import { randomUUID } from 'crypto'
import { pool } from '../db.js'

export async function createUser({ name, email, passwordHash }) {
  const id = randomUUID()
  const { rows } = await pool.query(
    `INSERT INTO users (id, name, email, password)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, created_at`,
    [id, name, email.toLowerCase(), passwordHash]
  )
  return rows[0] // safe: no password / refresh_token in the returned row
}

// Includes password + refresh_token — used only for login/auth checks.
export async function findUserByEmail(email) {
  const { rows } = await pool.query(`SELECT * FROM users WHERE email = $1`, [email.toLowerCase()])
  return rows[0]
}

// Safe public view of a user (no secrets) — used for /me later.
export async function findUserById(id) {
  const { rows } = await pool.query(
    `SELECT id, name, email, created_at FROM users WHERE id = $1`,
    [id]
  )
  return rows[0]
}

// Full row incl. refresh_token — used by the refresh endpoint.
export async function findUserByIdWithToken(id) {
  const { rows } = await pool.query(`SELECT * FROM users WHERE id = $1`, [id])
  return rows[0]
}

export async function setRefreshToken(id, token) {
  await pool.query(`UPDATE users SET refresh_token = $1 WHERE id = $2`, [token, id])
}