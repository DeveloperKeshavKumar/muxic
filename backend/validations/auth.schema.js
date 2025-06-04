import { z } from 'zod'

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string()
        .min(8, 'Password must be at least 8 characters long'),
    username: z.string()
        .min(5, 'Username must be at least 5 characters')
        .max(20, 'Username cannot exceed 20 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    fullName: z.string()
        .min(1, 'Full name is required')
        .max(25, 'Full name cannot exceed 25 characters')
})

export const loginSchema = z.object({
    identifier: z.string().min(5, 'Email or username is required'),
    password: z.string().min(8)
})

export const verifyOTPSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    otp: z.string().length(6, 'OTP must be 6 digits')
})

export const forgotPasswordSchema = z.object({
    email: z.string().email()
})

export const resetPasswordSchema = z.object({
    token: z.string().min(10, 'Invalid or missing token'),
    password: z.string().min(8, 'Password must be at least 8 characters long')
})

export const googleCallbackQuerySchema = z.object({
    code: z.string().min(1),
    state: z.string().uuid()
})