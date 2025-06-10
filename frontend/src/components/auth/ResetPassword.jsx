import { useState } from "react"
import { FiEyeOff, FiEye } from "react-icons/fi"
import { useSearchParams } from "react-router"
import axios from "axios"
import { toast } from "react-toastify"

const ResetPassword = ({ navigate }) => {
  const [searchParams] = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false) // Fixed: was initialized as true
  const [errors, setErrors] = useState({})

  const token = searchParams.get('token')

  // Validate passwords
  const validatePasswords = () => {
    const newErrors = {}

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate before submitting
    if (!validatePasswords()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_SERVER_URL}/auth/reset-password`,
        {
          token, // Include token in request body as expected by backend
          password
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000
        }
      )

      // Check for success response
      if (response.data?.success) {
        toast.success(response.data?.message || 'Password reset successful!')

        // Clear form
        setPassword('')
        setConfirmPassword('')

        // Navigate to login after short delay
        setTimeout(() => {
          navigate('/login')
        }, 1500)
      } else {
        toast.error(response.data?.message || 'Password reset failed')
      }

    } catch (error) {
      console.error('Reset password error:', error)
      const message = error?.response?.data?.message || 'Something went wrong. Please try again.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Real-time password validation
  const handlePasswordChange = (e) => {
    const value = e.target.value
    setPassword(value)

    // Clear password error when user starts typing
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }))
    }

    // Check confirm password match if it exists
    if (confirmPassword && value !== confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }))
    } else if (confirmPassword && value === confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: '' }))
    }
  }

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value
    setConfirmPassword(value)

    // Clear confirm password error when user starts typing
    if (errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: '' }))
    }

    // Check if passwords match
    if (password && value !== password) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }))
    } else if (password && value === password) {
      setErrors(prev => ({ ...prev, confirmPassword: '' }))
    }
  }

  // If no token, show error state
  if (!token) {
    return (
      <div className="w-full max-w-md">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Reset <span className="text-emerald-600 dark:text-emerald-400">Password</span>
        </h2>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
          <p className="text-red-700 dark:text-red-400 text-sm font-medium">
            Invalid or missing reset token. Please request a new reset link.
          </p>
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
              Log In
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

      <form onSubmit={handleSubmit} className="space-y-6"> {/* Fixed: was using onClick instead of onSubmit */}

        <div>
          <label htmlFor="password" className="block text-sm font-semibold font-montserrat text-gray-700 dark:text-gray-300 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              className={`w-full px-4 py-3 pr-12 rounded-md border backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 dark:text-white transition-all shadow-sm ${errors.password
                  ? 'border-red-300 dark:border-red-600 bg-red-50/50 dark:bg-red-900/20'
                  : 'border-white/20 dark:border-gray-600/50 bg-white/50 dark:bg-gray-700/50'
                }`}
              placeholder="Enter your new password"
              required
              value={password}
              onChange={handlePasswordChange}
              disabled={isSubmitting}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.password}
            </p>
          )}
          {!errors.password && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Must be at least 8 characters
            </p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-semibold font-montserrat text-gray-700 dark:text-gray-300 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              className={`w-full px-4 py-3 pr-12 rounded-md border backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 dark:text-white transition-all shadow-sm ${errors.confirmPassword
                  ? 'border-red-300 dark:border-red-600 bg-red-50/50 dark:bg-red-900/20'
                  : 'border-white/20 dark:border-gray-600/50 bg-white/50 dark:bg-gray-700/50'
                }`}
              placeholder="Confirm your new password"
              required
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              disabled={isSubmitting}
            />
            <button
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 focus:outline-none"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !password || !confirmPassword || Object.keys(errors).some(key => errors[key])}
          className="w-full py-4 rounded-md font-mono bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all text-lg font-semibold shadow-lg shadow-emerald-500/20 dark:shadow-emerald-500/10 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
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