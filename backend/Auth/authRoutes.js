// Auth routes — mounted at /api/auth in server.js.
import { Router } from 'express'
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getCurrentUser,
} from './authController.js'
import { verifyJWT } from '../middlewares/verifyJWT.js'

const router = Router()

// public — no token needed
router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/refresh', refreshAccessToken)

// protected — must be logged in (verifyJWT runs first)
router.post('/logout', verifyJWT, logoutUser)
router.get('/me', verifyJWT, getCurrentUser)

export default router