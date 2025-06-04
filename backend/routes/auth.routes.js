import { Router } from "express"
import crypto from 'crypto';
import {
  forgotPasswordController,
  googleCallbackController,
  loginController,
  registerController,
  resetPasswordController,
  verifyOTPController
} from "../controllers/auth.controller.js"

const authRouter = Router()

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI

authRouter.post('/register', registerController)
authRouter.post('/login', loginController)
authRouter.post('/verify', verifyOTPController)

authRouter.put('/forgot-password', forgotPasswordController)
authRouter.put('/reset-password', resetPasswordController)

authRouter.get('/google', (req, res) => {
  if (!CLIENT_ID || !REDIRECT_URI) {
    return res.status(500).json({ message: 'Google login is unavailable' })
  }

  const state = crypto.randomUUID()
  res.cookie('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 5 * 60 * 1000,
  })

  const url = `https://accounts.google.com/o/oauth2/v2/auth?state=${state}&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile email`
  res.redirect(url)
})
authRouter.get('/google/callback', googleCallbackController)

export default authRouter