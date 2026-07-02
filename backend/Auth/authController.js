// Register / Login / Refresh — same structure as your MERN controller,
// but on Postgres. asyncHandler removes try/catch; ApiError/ApiResponse keep
// responses uniform; access+refresh tokens ride in httpOnly cookies.
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import { generateAccessToken, generateRefreshToken } from './tokens.js'
import {
  createUser,
  findUserByEmail,
  findUserByIdWithToken,
  setRefreshToken,
} from './userStore.js'

// secure:true only in production — in local dev over http the browser would
// silently drop secure cookies (the bug I flagged in your MERN code).
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
}

// make both tokens and persist the refresh token on the user row
async function issueTokens(user) {
  const accessToken = generateAccessToken(user)
  const refreshToken = generateRefreshToken(user)
  await setRefreshToken(user.id, refreshToken)
  return { accessToken, refreshToken }
}

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  if ([name, email, password].some((f) => !f || f.trim() === '')) {
    throw new ApiError(400, 'name, email and password are all required')
  }

  const existing = await findUserByEmail(email)
  if (existing) throw new ApiError(409, 'An account with this email already exists')

  const passwordHash = await bcrypt.hash(password, 10) // 10 = salt rounds
  const user = await createUser({ name, email, passwordHash })

  return res.status(201).json(new ApiResponse(201, user, 'User registered successfully'))
})

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) throw new ApiError(400, 'email and password are required')

  const user = await findUserByEmail(email)
  // Same generic message whether the email or the password is wrong — so we
  // don't reveal which emails have accounts (an improvement over "user doesn't exist").
  if (!user) throw new ApiError(401, 'Invalid email or password')

  const ok = await bcrypt.compare(password, user.password)
  if (!ok) throw new ApiError(401, 'Invalid email or password')

  const { accessToken, refreshToken } = await issueTokens(user)
  const safeUser = { id: user.id, name: user.name, email: user.email }

  return res
    .status(200)
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json(new ApiResponse(200, { user: safeUser, accessToken }, 'Logged in successfully'))
})

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incoming = req.cookies?.refreshToken || req.body?.refreshToken
  if (!incoming) throw new ApiError(401, 'No refresh token provided')

  let decoded
  try {
    decoded = jwt.verify(incoming, process.env.REFRESH_TOKEN_SECRET)
  } catch {
    throw new ApiError(401, 'Refresh token is invalid or expired')
  }

  const user = await findUserByIdWithToken(decoded.id)
  // must still match the copy we stored — stops a stolen/old token being reused
  if (!user || user.refresh_token !== incoming) {
    throw new ApiError(401, 'Refresh token is invalid or has been used')
  }

  const { accessToken, refreshToken } = await issueTokens(user)
  return res
    .status(200)
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json(new ApiResponse(200, { accessToken }, 'Access token refreshed'))
})

// Requires verifyJWT (so req.user exists). Clears the stored refresh token
// AND the cookies. 
export const logoutUser = asyncHandler(async (req, res) => {
  await setRefreshToken(req.user.id, null)

  return res
    .status(200)
    .clearCookie('accessToken', cookieOptions)
    .clearCookie('refreshToken', cookieOptions)
    .json(new ApiResponse(200, {}, 'Logged out successfully'))
})

// Requires verifyJWT — it already loaded req.user (safe view, no password).
export const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, 'Current user fetched'))
})