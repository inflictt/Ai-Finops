// Two token makers. Access = short-lived (used on every request).
// Refresh = long-lived (used only to mint a new access token without re-login).
// Each is signed with its OWN secret so they can't be swapped.
import jwt from 'jsonwebtoken'

export function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email }, // payload — readable, so no secrets here
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
  )
}

export function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
  )
}