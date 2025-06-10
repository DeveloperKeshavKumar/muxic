import { TbLockQuestion } from "react-icons/tb"
import { FiEye, FiEyeOff } from "react-icons/fi"
import LoginWithGoogle from "./LoginWithGoogle"
import { useContext, useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { AuthContext } from "../../context/AuthContext"

const LoginForm = ({ navigate }) => {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { setIsAuth } = useContext(AuthContext)

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Basic validation
    if (!identifier.trim() || !password.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)

    try {
      const loginData = { identifier: identifier.trim(), password }
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/auth/login`,
        loginData,
        { withCredentials: true }
      )

      if (response.status === 200 && response.data.success) {
        const data = response.data.data

        // Store authentication data
        localStorage.setItem('auth', 'true')
        localStorage.setItem('token', data.token)
        localStorage.setItem('refreshToken', JSON.stringify(data.refreshToken))
        localStorage.setItem('user', JSON.stringify(data.user))

        // Update auth state
        setIsAuth({
          authenticated: true,
          user: data.user
        })

        // Show success toast
        toast.success('Login successful! Welcome back to Muxic')

        setTimeout(() => {
          navigate('/lobby')
        }, 100)
      }
    } catch (error) {
      console.error('Login error:', error)

      // Handle different error scenarios
      if (error.response) {
        const { status, data } = error.response

        switch (status) {
          case 401:
            toast.error('Invalid username/email or password')
            break
          case 403:
            if (data.message && (data.message.includes('banned') || data.message.includes('suspended'))) {
              toast.error(`Account suspended${data.message.includes(':') ? data.message.split(':')[1] : ''}`)
            } else if (data.message && data.message.includes('deactivated')) {
              toast.error('Account deactivated. Please contact support.')
            } else {
              toast.error(data?.message || 'Access denied')
            }
            break
          case 422:
            toast.error('Please check your input and try again')
            break
          case 429:
            toast.error('Too many login attempts. Please try again later')
            break
          case 500:
            toast.error('Server error. Please try again later')
            break
          default:
            toast.error(data?.message || 'Login failed. Please try again')
        }
      } else if (error.request) {
        toast.error('Network error. Please check your connection')
      } else {
        toast.error('Login failed. Please try again')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
        Welcome Back to <span className="text-emerald-600 dark:text-emerald-400">Muxic</span>
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="identifier" className="block text-sm font-semibold font-montserrat text-gray-700 dark:text-gray-300 mb-2">
            Username or Email Address
          </label>
          <input
            type="text"
            id="identifier"
            className="w-full px-4 py-2 rounded-md border border-white/20 dark:border-gray-600/50 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 dark:text-white transition-all shadow-sm"
            placeholder="Enter your username or email"
            required
            disabled={isLoading}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold font-montserrat text-gray-700 dark:text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              className="w-full px-4 py-2 rounded-md border border-white/20 dark:border-gray-600/50 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 dark:text-white transition-all shadow-sm pr-12"
              placeholder="Enter your password"
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              title={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword(!showPassword)}
              type="button"
              disabled={isLoading}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 focus:outline-none disabled:opacity-50"
            >
              {showPassword ? <FiEyeOff className="text-xl" /> : <FiEye className="text-xl" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end font-montserrat">
          <div className="text-sm">
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              disabled={isLoading}
              className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors disabled:opacity-50"
            >
              <div className="flex items-end gap-x-1">
                <TbLockQuestion className="text-xl" />
                <span>Forgot password?</span>
              </div>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 rounded-md font-mono text-white transition-all text-lg font-semibold shadow-lg ${isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600 shadow-emerald-500/20 dark:shadow-emerald-500/10 cursor-pointer'
            }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Signing in...
            </div>
          ) : (
            "Sign into Muxic"
          )}
        </button>
      </form>

      {/* Google Login Button */}
      <LoginWithGoogle />

      <div className="mt-8 text-center">
        <p className="text-sm font-montserrat text-gray-600 dark:text-gray-400">
          New to synchronized music?{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
            disabled={isLoading}
            className="font-medium hover:underline text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors disabled:opacity-50"
          >
            Create Account
          </button>
        </p>
      </div>
    </div>
  )
}

export default LoginForm