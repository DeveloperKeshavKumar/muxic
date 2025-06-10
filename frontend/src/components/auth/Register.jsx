import { FiEyeOff, FiEye } from "react-icons/fi"
import LoginWithGoogle from "./LoginWithGoogle"
import { useContext, useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"

const RegisterForm = ({ navigate }) => {
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')

  // Password validation
  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long"
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter"
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter"
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number"
    }
    return null
  }

  // Form validation
  const validateForm = () => {
    // Clear previous errors
    setError('')

    // Check if all fields are filled
    if (!fullName.trim()) {
      toast.error("Please enter your full name")
      return false
    }

    if (!username.trim()) {
      toast.error("Please enter a username")
      return false
    }

    if (username.length < 3) {
      toast.error("Username must be at least 3 characters long")
      return false
    }

    if (!email.trim()) {
      toast.error("Please enter your email address")
      return false
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address")
      return false
    }

    if (!password) {
      toast.error("Please enter a password")
      return false
    }

    // Password validation
    const passwordError = validatePassword(password)
    if (passwordError) {
      toast.error(passwordError)
      return false
    }

    if (!confirmPassword) {
      toast.error("Please confirm your password")
      return false
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form before submission
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    // Show loading toast
    const loadingToastId = toast.loading("Creating your account...")

    try {
      const registerData = { fullName, username, email, password }

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/auth/register`,
        registerData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 second timeout
        }
      )

      // Dismiss loading toast
      toast.dismiss(loadingToastId)

      if (response.status === 201 && response.data.success) {
        const userData = response.data.data

        // Store user data for verification process
        localStorage.setItem('user', JSON.stringify({
          userId: userData.userId,
          email: userData.email,
          username: userData.username,
          isVerified: userData.isVerified
        }))

        // Show success toast with verification message
        toast.success("Account created! Please check your email for verification code 📧", {
          autoClose: 4000,
        })

        // Navigate to verify page after a short delay
        setTimeout(() => {
          navigate(`/verify?userId=${userData.userId}`)
        }, 1500)

      } else {
        toast.error("Registration failed. Please try again.")
      }

    } catch (error) {
      console.error('Registration error:', error)

      // Dismiss loading toast in case of error
      toast.dismiss(loadingToastId)

      // Handle different error scenarios
      if (error.code === 'ECONNABORTED') {
        toast.error("Request timeout. Please check your connection and try again.")
      } else if (error.response) {
        // Server responded with error status
        const errorData = error.response.data
        const errorMessage = errorData?.message || "Registration failed"

        switch (error.response.status) {
          case 400:
            // Handle validation errors
            if (errorData?.errors && Array.isArray(errorData.errors)) {
              // Show first validation error
              toast.error(errorData.errors[0])
            } else {
              toast.error(errorMessage || "Invalid registration data")
            }
            break
          case 409:
            // Handle duplicate email/username with specific message from server
            toast.error(errorMessage) // Will show "Email already registered" or "Username already taken"
            break
          case 422:
            toast.error("Please check your input and try again")
            break
          case 500:
            toast.error("Server error. Please try again later.")
            break
          default:
            toast.error(errorMessage)
        }

        setError(errorMessage)
      } else if (error.request) {
        // Network error
        toast.error("Network error. Please check your connection.")
      } else {
        // Something else happened
        toast.error("An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
        Join the <span className="text-emerald-600 dark:text-emerald-400">Muxic</span> Experience
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-semibold font-montserrat text-gray-700 dark:text-gray-300 mb-2">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            className="w-full px-4 py-2 rounded-md border border-white/20 dark:border-gray-600/50 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 dark:text-white transition-all shadow-sm"
            placeholder="Enter your full name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-semibold font-montserrat text-gray-700 dark:text-gray-300 mb-2">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            className="w-full px-4 py-2 rounded-md border border-white/20 dark:border-gray-600/50 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 dark:text-white transition-all shadow-sm"
            placeholder="Choose a unique username"
            required
            minLength={3}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="reg-email" className="block text-sm font-semibold font-montserrat text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="reg-email"
            name="email"
            className="w-full px-4 py-2 rounded-md border border-white/20 dark:border-gray-600/50 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 dark:text-white transition-all shadow-sm"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Password & Confirm Password Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Password */}
          <div>
            <label htmlFor="reg-password" className="block text-sm font-semibold font-montserrat text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="reg-password"
                name="password"
                className="w-full px-4 py-2 pr-12 rounded-md border border-white/20 dark:border-gray-600/50 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 dark:text-white transition-all shadow-sm"
                placeholder="Create password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                title={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(!showPassword)}
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 focus:outline-none transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <FiEyeOff className={'text-xl'} /> : <FiEye className={'text-xl'} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold font-montserrat text-gray-700 dark:text-gray-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                className="w-full px-4 py-2 pr-12 rounded-md border border-white/20 dark:border-gray-600/50 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 dark:text-white transition-all shadow-sm"
                placeholder="Confirm password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 focus:outline-none transition-colors"
                disabled={isLoading}
              >
                {showConfirmPassword ? <FiEyeOff className={'text-xl'} /> : <FiEye className={'text-xl'} />}
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 rounded-md font-mono bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all text-lg font-semibold shadow-lg shadow-emerald-500/20 dark:shadow-emerald-500/10 cursor-pointer"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Creating Account...
            </div>
          ) : (
            "Start Your Muxic Journey"
          )}
        </button>
      </form>

      {/* Google Login Button */}
      <LoginWithGoogle />

      {/* Redirect to login */}
      <div className="mt-8 text-center">
        <p className="text-sm font-montserrat text-gray-600 dark:text-gray-400">
          Already synchronized with us?{' '}
          <button
            onClick={() => navigate('/login')}
            className="font-semibold hover:underline text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
            disabled={isLoading}
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  )
}

export default RegisterForm