import { Router } from "express"
import {
  forgotPasswordController,
  googleCallbackController,
  googleLoginController,
  loginController,
  registerController,
  resetPasswordController,
  verifyOTPController
} from "../controllers/auth.controller.js"

import { validate } from '../middlewares/validate.js'

const authRouter = Router()

authRouter.post('/register', validate(registerSchema), registerController)
authRouter.post('/login', validate(loginSchema), loginController)
authRouter.post('/verify', validate(verifyOTPSchema), verifyOTPController)

authRouter.put('/forgot-password', validate(forgotPasswordSchema), forgotPasswordController)
authRouter.put('/reset-password', validate(resetPasswordSchema), resetPasswordController)

authRouter.get('/google', googleLoginController)
authRouter.get('/google/callback', validate(googleCallbackQuerySchema, 'query'), googleCallbackController)

export default authRouter