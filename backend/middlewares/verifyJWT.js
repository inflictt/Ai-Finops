// Gatekeeper for protected routes. Reads the access token (from the httpOnly
// cookie OR an "Authorization: Bearer <token>" header), verifies it, loads the
// user, and attaches req.user. If anything is off, it throws 401 and the
// actual route handler never runs.
import jwt from 'jsonwebtoken'
import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import { findUserById } from '../Auth/userStore.js'

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const bearer = req.headers.authorization
  const token =
    req.cookies?.accessToken ||
    (bearer?.startsWith('Bearer ') ? bearer.split(' ')[1] : null)

  if (!token) throw new ApiError(401, 'Not authenticated — please log in')

  let decoded
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
  } catch {
    throw new ApiError(401, 'Access token is invalid or expired')
  }

  const user = await findUserById(decoded.id) // safe view — no password / refresh_token
  if (!user) throw new ApiError(401, 'User no longer exists')

  req.user = user // hand the logged-in user to the next handler
  next()
})