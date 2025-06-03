import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import axios from 'axios'
import { User, UserStats } from '../models/index.js'
import { sendEmail } from '../config/index.js'

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    })
}

const generateRefreshToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '30d'
    })
}

const setTokenCookies = (res, token, refreshToken) => {
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }

    res.cookie('token', token, cookieOptions)
    res.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    })
}

const registerController = async (req, res, next) => {
    try {
        const { email, password, username, fullName } = req.body

        // Validate required fields
        if (!email || !password || !username || !fullName) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            })
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { username: username }
            ]
        })

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: existingUser.email === email.toLowerCase()
                    ? 'Email already registered'
                    : 'Username already taken'
            })
        }

        // Generate OTP
        const otp = User.generateOTP()
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        // Create user
        const user = new User({
            email: email.toLowerCase(),
            password,
            username,
            fullName,
            otp: {
                code: otp,
                expiresAt: otpExpires
            }
        })

        await user.save()

        // Initialize user stats
        await UserStats.initializeUserStats(user._id)

        // Send verification email
        setImmediate(async () => {
            try {
                const emailResult = await sendEmail(user.email, 'verification', otp, user.username)
                if (!emailResult.success) {
                    console.error('Email send failed:', emailResult.error)
                }
            } catch (err) {
                console.error('Async email error:', err)
            }
        })

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please check your email for verification code.',
            data: {
                userId: user._id,
                email: user.email,
                username: user.username,
                isVerified: user.isVerified,
                // otp,
                // otpExpires
            }
        })

    } catch (error) {
        console.error('Register error:', error)

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message)
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            })
        }

        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.'
        })
    }
}

const verifyOTPController = async (req, res, next) => {
    try {
        const { userId, otp } = req.body

        // Validate required fields
        if (!userId || !otp) {
            return res.status(400).json({
                success: false,
                message: 'User ID and OTP are required'
            })
        }

        // Find user with OTP
        const user = await User.findById(userId).select('+otp.code +otp.expiresAt')

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        // Check if already verified
        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Account already verified'
            })
        }

        // Check if OTP exists and is valid
        if (!user.otp?.code || user.otp.code !== otp) {
            console.log(otp, user.otp.code)
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP code'
            })
        }

        // Check if OTP is expired
        if (user.otp.expiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'OTP code has expired. Please request a new one.'
            })
        }

        // Verify user
        user.isVerified = true
        user.otp = undefined
        await user.save()

        // Send welcome email
        setImmediate(async () => {
            try {
                await sendEmail(user.email, 'welcome', user.username)
            } catch (err) {
                console.error('Async welcome email error:', err)
            }
        })


        // Generate tokens
        const token = generateToken(user._id)
        const refreshToken = generateRefreshToken(user._id)

        // Set cookies
        setTokenCookies(res, token, refreshToken)

        res.status(200).json({
            success: true,
            message: 'Email verified successfully! Welcome to our platform.',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    fullName: user.fullName,
                    avatar: user.avatar,
                    bio: user.bio,
                    isVerified: user.isVerified
                },
                token,
                refreshToken
            }
        })

    } catch (error) {
        console.error('Verify OTP error:', error)
        res.status(500).json({
            success: false,
            message: 'Verification failed. Please try again.'
        })
    }
}

const loginController = async (req, res, next) => {
    try {
        const { identifier, password } = req.body

        // Validate required fields
        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email/username and password are required'
            })
        }

        // Find user by email or username
        const user = await User.findByCredentials(identifier)

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            })
        }

        // Check password
        const isValidPassword = await user.comparePassword(password)

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            })
        }

        // Check if user is banned
        if (user.isBanned) {
            return res.status(403).json({
                success: false,
                message: `Account suspended${user.banReason ? `: ${user.banReason}` : ''}`
            })
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account deactivated. Please contact support.'
            })
        }

        // Check if email is verified
        if (!user.isVerified) {
            // Generate new OTP
            const otp = User.generateOTP()
            const otpExpires = new Date(Date.now() + 10 * 60 * 1000)

            user.otp = {
                code: otp,
                expiresAt: otpExpires
            }
            await user.save()

            // Send verification email
            setImmediate(async () => {
                try {
                    await sendEmail(user.email, 'verification', otp, user.username)
                } catch (err) {
                    console.error('Async resend verification email error:', err)
                }
            })


            return res.status(403).json({
                success: false,
                message: 'Please verify your email first. A new verification code has been sent.',
                requiresVerification: true,
                userId: user._id
            })
        }

        // Update last login
        user.lastLogin = new Date()
        await user.save()

        // Generate tokens
        const token = generateToken(user._id)
        const refreshToken = generateRefreshToken(user._id)

        // Set cookies
        setTokenCookies(res, token, refreshToken)

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    fullName: user.fullName,
                    avatar: user.avatar,
                    bio: user.bio,
                    privacy: user.privacy,
                    lastLogin: user.lastLogin
                },
                token,
                refreshToken
            }
        })

    } catch (error) {
        console.error('Login error:', error)
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.'
        })
    }
}

const forgotPasswordController = async (req, res, next) => {
    try {
        const { email } = req.body

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            })
        }

        const user = await User.findOne({ email: email.toLowerCase() })

        if (!user) {
            // Don't reveal if email exists or not
            return res.status(200).json({
                success: true,
                message: 'If the email exists, a password reset link has been sent.'
            })
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex')
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

        user.resetPasswordToken = resetToken
        user.resetPasswordExpires = resetExpires
        await user.save()

        // Send reset email
        setImmediate(async () => {
            try {
                const emailResult = await sendEmail(user.email, 'resetPassword', resetToken, user.username)
                if (!emailResult.success) {
                    console.error('Failed to send reset email:', emailResult.error)
                }
            } catch (err) {
                console.error('Async reset password email error:', err)
            }
        })

        res.status(200).json({
            success: true,
            message: 'If the email exists, a password reset link has been sent.'
        })

    } catch (error) {
        console.error('Forgot password error:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to process request. Please try again.'
        })
    }
}

const resetPasswordController = async (req, res, next) => {
    try {
        const { token } = req.query
        const { password } = req.body

        if (!token || !password) {
            return res.status(400).json({
                success: false,
                message: 'Token and new password are required'
            })
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            })
        }

        // Find user by reset token
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        }).select('+resetPasswordToken +resetPasswordExpires')

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            })
        }

        // Reset password
        user.password = password
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined
        await user.save()

        res.status(200).json({
            success: true,
            message: 'Password reset successful. You can now login with your new password.'
        })

    } catch (error) {
        console.error('Reset password error:', error)
        res.status(500).json({
            success: false,
            message: 'Password reset failed. Please try again.'
        })
    }
}

const googleCallbackController = async (req, res) => {
    const { code } = req.query

    try {
        // Exchange authorization code for access token
        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            code,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            grant_type: 'authorization_code',
        })

        const { access_token } = tokenResponse.data

        // Get user profile using the access token
        const profileResponse = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` },
        })

        const googleUser = profileResponse.data

        if (!googleUser || !googleUser.id) {
            return res.status(400).json({
                success: false,
                message: 'Google authentication failed',
            })
        }

        let user = await User.findOne({ googleId: googleUser.id })

        if (user) {
            user.lastLogin = new Date()
            await user.save()
        } else {
            const existingUser = await User.findOne({ email: googleUser.email })

            if (existingUser) {
                existingUser.googleId = googleUser.id
                existingUser.isVerified = true
                existingUser.lastLogin = new Date()
                if (!existingUser.avatar && googleUser.picture) {
                    existingUser.avatar = googleUser.picture
                }
                user = await existingUser.save()
            } else {
                user = new User({
                    email: googleUser.email,
                    username: await generateUniqueUsername(googleUser.name || googleUser.email),
                    fullName: googleUser.name || googleUser.email.split('@')[0],
                    avatar: googleUser.picture,
                    googleId: googleUser.id,
                    isVerified: true,
                    lastLogin: new Date(),
                })

                await user.save()

                await UserStats.initializeUserStats(user._id)
                await sendEmail(user.email, 'welcome', user.username)
            }
        }

        // Generate tokens
        const token = generateToken(user._id)
        const refreshToken = generateRefreshToken(user._id)

        // Set token cookies
        setTokenCookies(res, token, refreshToken)

        const redirectUrl = `${process.env.CLIENT_URL}/auth/success?token=${token}`
        res.redirect(redirectUrl)

    } catch (error) {
        console.error('Google callback error:', error.response?.data || error.message)
        const errorUrl = `${process.env.CLIENT_URL}/auth/error?message=Authentication failed`
        res.redirect(errorUrl)
    }
}

const generateUniqueUsername = async (baseName) => {
    let username = baseName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 10)

    if (username.length < 5) {
        username = username + Math.floor(Math.random() * 10000)
    }

    let isUnique = false
    let counter = 1
    let finalUsername = username

    while (!isUnique) {
        const existing = await User.findOne({ username: finalUsername })
        if (!existing) {
            isUnique = true
        } else {
            finalUsername = `${username}${counter}`
            counter++
        }
    }

    return finalUsername
}

export {
    registerController,
    loginController,
    verifyOTPController,
    googleCallbackController,
    forgotPasswordController,
    resetPasswordController
}