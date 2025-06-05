import { useState, useEffect } from "react"
import { FiEyeOff, FiEye } from "react-icons/fi"
import { useSearchParams } from "react-router"
import axios from "axios"

const ResetPassword = ({ navigate }) => {
  const [searchParams] = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState(null)
  const [tokenValid, setTokenValid] = useState(true)

  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setTokenValid(false)
      setMessage({
        type: 'error',
        text: 'Invalid reset token. Please request a new password reset link.',
      })
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Clear previous messages
    setMessage(null)

    // Validation
    if (password.length < 8) {
      setMessage({
        type: 'error',
        text: 'Password must be at least 8 characters long',
      })
      return
    }

    if (password !== confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Passwords do not match',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_SERVER_URL}/auth/reset-password`,
        { token, password }
      )

      setMessage({
        type: 'success',
        text: response.data.message || 'Password reset successful. You can now login with your new password.',
      })

      // Auto-navigate to login after 3 seconds
      setTimeout(() => navigate('/login'), 3000)
    } catch (error) {
      console.error('Reset password error:', error)

      let errorMessage = 'Network error. Please check your connection and try again.'

      if (error.response) {
        errorMessage = error.response.data.message || 'Password reset failed. Please try again.'

        // Handle invalid/expired token cases
        if (error.response.status === 400 &&
          (errorMessage.includes('expired') || errorMessage.includes('invalid'))) {
          setTokenValid(false)
        }
      }

      setMessage({
        type: 'error',
        text: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!tokenValid) {
    return (
      <div className="w-full max-w-md">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Reset <span className="text-emerald-600 dark:text-emerald-400">Password</span>
        </h2>

        <div className="p-4 rounded-md bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 mb-6">
          {message?.text}
        </div>

        <button
          onClick={() => navigate('/forgot-password')}
          className="w-full py-4 rounded-md font-mono bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all text-lg font-semibold shadow-lg shadow-emerald-500/20 dark:shadow-emerald-500/10 cursor-pointer"
        >
          Request New Reset Link
        </button>

        <div className="mt-8 text-center">
          <p className="text-sm font-montserrat text-gray-600 dark:text-gray-400">
            Remember your password?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-semibold hover:underline text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
        Reset Your <span className="text-emerald-600 dark:text-emerald-400">Password</span>
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {message && (
          <div className={`p-4 rounded-md ${message.type === 'success'
            ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200'
            : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'}`}>
            {message.text}
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-semibold font-montserrat text-gray-700 dark:text-gray-300 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-md border border-white/20 dark:border-gray-600/50 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 dark:text-white transition-all shadow-sm"
              placeholder="Enter your new password"
              required
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Must be at least 8 characters
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-semibold font-montserrat text-gray-700 dark:text-gray-300 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-md border border-white/20 dark:border-gray-600/50 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 dark:text-white transition-all shadow-sm"
              placeholder="Confirm your new password"
              required
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-md font-mono bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all text-lg font-semibold shadow-lg shadow-emerald-500/20 dark:shadow-emerald-500/10 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm font-montserrat text-gray-600 dark:text-gray-400">
          Remember your password?{' '}
          <button
            onClick={() => navigate('/login')}
            className="font-semibold hover:underline text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  )
}

export default ResetPassword