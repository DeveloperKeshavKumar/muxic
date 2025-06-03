import { Router } from "express"
import {
    forgotPasswordController,
    googleCallbackController,
    loginController,
    registerController,
    resetPasswordController,
    verifyOTPController
} from "../controllers/auth.controller.js"

const authRouter = Router()

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

authRouter.post('/register', registerController)
authRouter.post('/login', loginController)
authRouter.post('/verify', verifyOTPController)

authRouter.put('/forgot-password', forgotPasswordController)
authRouter.put('/reset-password', resetPasswordController)

authRouter.get('/google', (req, res) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile email`;
  res.redirect(url);
})
authRouter.get('/google/callback', googleCallbackController)

export default authRouter