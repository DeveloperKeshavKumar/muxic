import React, { useState, useRef, useEffect, useContext } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { toast } from 'react-toastify'
import axios from 'axios'
import { AuthContext } from '../../context/AuthContext'

const VerifyOtp = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600)
  const [canResend, setCanResend] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [verified, setVerified] = useState(false)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const inputRefs = useRef([])

  const { setIsAuth } = useContext(AuthContext)

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  let userId = searchParams.get('userId')

  useEffect(() => {
    // In your fetchUserData function inside useEffect
    const fetchUserData = async () => {
      if (!userId) {
        toast.error('User ID not found. Please try again.')
        navigate('/register')
        return
      }

      try {
        setIsLoadingUser(true)
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/auth/user?userId=${userId}`, {
          withCredentials: true
        })

        if (response.data.success) {
          setVerified(response.data.data.user.isVerified)
          setUserEmail(response.data.data.user.email)
          if (response.data.data.otpExpiresAt) {
            const expiresAt = new Date(response.data.data.otpExpiresAt)
            const now = new Date()
            const secondsLeft = Math.max(0, Math.floor((expiresAt - now) / 1000))

            setTimeLeft(secondsLeft)
            // Immediately enable resend if already expired
            setCanResend(secondsLeft <= 0 || secondsLeft <= 120)
          } else {
            // If no expiration time, allow resend immediately
            setCanResend(true)
            setTimeLeft(0)
          }
        } else {
          toast.error(response.data.message || 'Failed to fetch user data')
          navigate('/register')
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        toast.error(error.response?.data?.message || 'Failed to load user data')
        navigate('/register')
      } finally {
        setIsLoadingUser(false)
      }
    }

    fetchUserData()
  }, [userId, navigate])

  useEffect(() => {
    if (verified) {
      toast.error('Your account is already verified. Redirecting to lobby...')
      navigate('/lobby', { replace: true })
    }
  }, [verified])

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        const newTimeLeft = timeLeft - 1
        setTimeLeft(newTimeLeft)
        // Enable resend when less than 2 minutes left or expired
        setCanResend(newTimeLeft <= 120)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      // Immediately enable when expired
      setCanResend(true)
    }
  }, [timeLeft])

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Handle OTP input change
  const handleChange = (index, value) => {
    if (value.length > 1) return // Prevent multiple characters

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6)
    const newOtp = [...otp]

    for (let i = 0; i < pastedData.length && i < 6; i++) {
      if (/^\d$/.test(pastedData[i])) {
        newOtp[i] = pastedData[i]
      }
    }

    setOtp(newOtp)
    // Focus the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, 5)
    inputRefs.current[nextIndex]?.focus()
  }

  // Handle verify
  const handleVerify = async () => {
    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      toast.error('Please enter a complete 6-digit code.')
      return
    }

    if (!userId) {
      toast.error('User ID not found. Please try again.' + userId)
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/auth/verify`,
        {
          userId,
          otp: parseInt(otpCode)
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.success) {
        toast.success(response.data.message || 'Email verified successfully!')

        // Store user data and tokens if available
        if (response.data.data?.user) {
          localStorage.setItem('user', JSON.stringify(response.data.data.user))
        }

        setIsAuth(response.data.data.user)

        // Redirect to lobby/dashboard
        navigate('/lobby', { replace: true })
      } else {
        toast.error(response.data.message || 'OTP verification failed')
        // Clear OTP on failure
        setOtp(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      }
    } catch (error) {
      console.error('OTP verification error:', error)

      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else if (error.response?.status === 400) {
        toast.error('Invalid OTP. Please check and try again.')
      } else if (error.response?.status === 404) {
        toast.error('User not found. Please try again.')
      } else if (error.response?.status === 410) {
        toast.error('OTP has expired. Please request a new one.')
        setCanResend(true)
        setTimeLeft(0)
      } else {
        toast.error('Network error. Please check your connection and try again.')
      }

      // Clear OTP on error
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  // Handle resend - now this is the only place that triggers OTP sending
  const handleResend = async () => {
    if (!canResend || !userId || isResending) return

    setIsResending(true)
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/auth/otp`,
        {
          params: { userId },
          withCredentials: true
        }
      )

      if (response.data.success) {
        toast.success('New verification code sent to your email!')

        // Sync timer with backend expiration
        if (response.data.data?.otpExpiresAt) {
          const expiresAt = new Date(response.data.data.otpExpiresAt)
          const now = new Date()
          const secondsLeft = Math.max(0, Math.floor((expiresAt - now) / 1000))
          setTimeLeft(secondsLeft)
          setCanResend(secondsLeft <= 120)
        } else {
          // Default to 10 minutes if no expiration from backend
          setTimeLeft(600)
          setCanResend(false)
        }

        setOtp(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()

        if (response.data.data?.email) {
          setUserEmail(response.data.data.email)
        }
      } else {
        toast.error(response.data.message || 'Failed to resend code')
      }
    } catch (error) {
      console.error('Resend error:', error)

      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait before requesting another code.')
      } else if (error.response?.status === 404) {
        toast.error('User not found. Please try again.')
      } else {
        toast.error('Network error. Please try again.')
      }
    } finally {
      setIsResending(false)
    }
  }

  const isOtpComplete = otp.every(digit => digit !== '')
  const maskEmail = (email) => {
    if (!email || !email.includes('@')) return '***@**.*'

    const [localPart, domain] = email.split('@')

    if (localPart.length <= 5) {
      return `${localPart[0]}***@${domain}`
    }

    const visibleStart = localPart.slice(0, 2)
    const visibleEnd = localPart.slice(-3)

    return `${visibleStart}***${visibleEnd}@${domain}`
  }

  const maskedEmail = maskEmail(userEmail)

  // Show loading state while fetching user data
  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-2">
        <div className="fixed inset-0 -z-10 h-full w-full bg-white dark:bg-[#222] bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)] bg-[size:6rem_4rem]">
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#a5d8a7,transparent)] dark:bg-[radial-gradient(circle_500px_at_50%_200px,#2a5c2e,transparent)]"></div>
        </div>
        <div className="w-full max-w-lg backdrop-blur-lg bg-white/30 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-8">
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-3 text-lg text-gray-700 dark:text-gray-300">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-2">
      {/* Matching Gradient Background */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-white dark:bg-[#222] bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#a5d8a7,transparent)] dark:bg-[radial-gradient(circle_500px_at_50%_200px,#2a5c2e,transparent)]"></div>
      </div>

      {/* Glass Morph Container */}
      <div className="w-full max-w-lg mt-10 mb-10 backdrop-blur-lg bg-white/30 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl overflow-hidden transition-all hover:shadow-emerald-500/10 hover:border-emerald-500/30">
        <div className="p-8 md:p-10">
          <div className="w-full max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                Verify Your <span className="text-emerald-600 dark:text-emerald-400">Muxic</span> Account
              </h2>

              <p className="text-gray-600 dark:text-gray-400 font-montserrat">
                We've sent a 6-digit verification code to
              </p>
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold font-montserrat">
                {maskedEmail}
              </p>
            </div>

            {/* OTP Input Boxes */}
            <div className="mb-8">
              <label className="block text-sm font-medium font-montserrat text-gray-700 dark:text-gray-300 mb-4 text-center">
                Enter Verification Code
              </label>

              <div className="flex justify-center gap-3 mb-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-12 text-center text-xl font-bold rounded-lg border border-white/20 dark:border-gray-600/50 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 dark:text-white transition-all shadow-sm"
                    autoComplete="off"
                  />
                ))}
              </div>

              {/* Timer */}
              <div className="text-center mb-6">
                {!canResend ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-montserrat">
                    Code expires in{' '}
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatTime(timeLeft)}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-red-600 dark:text-red-400 font-montserrat">
                    Code expired. Please request a new one.
                  </p>
                )}
              </div>
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={!isOtpComplete || isLoading}
              className={`w-full py-4 rounded-md font-mono text-lg font-semibold shadow-lg transition-all cursor-pointer ${isOtpComplete && !isLoading
                ? 'bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 shadow-emerald-500/20 dark:shadow-emerald-500/10'
                : 'bg-gray-400 dark:bg-gray-600 text-gray-200 cursor-not-allowed'
                }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </div>
              ) : (
                'Verify & Continue'
              )}
            </button>

            {/* Resend Section */}
            <div className="mt-8 text-center">
              <p className="text-sm font-montserrat text-gray-600 dark:text-gray-400 mb-2">
                Didn't receive the code?
              </p>
              <button
                onClick={handleResend}
                disabled={!canResend || isResending}
                className={`font-medium transition-colors ${canResend && !isResending
                  ? 'text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 cursor-pointer'
                  : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }`}
              >
                {isResending ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Resend Code'
                )}
              </button>
            </div>

            {/* Back to register */}
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/register')}
                className="text-sm font-montserrat text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                ← Back to Sign In
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-emerald-300 dark:border-gray-700/50 p-3 text-center text-gray-600 dark:text-gray-400">
          <p className="font-montserrat">© {new Date().getFullYear()} Muxic.in All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default VerifyOtp