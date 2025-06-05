import { useState } from "react"
import axios from 'axios'
import { TbLockQuestion } from "react-icons/tb"
import { FiEye, FiEyeOff } from "react-icons/fi"
import LoginWithGoogle from "./LoginWithGoogle"

const LoginForm = ({ navigate }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/auth/login`,
        { identifier: email, password },
        { withCredentials: true }
      )

      localStorage.setItem('user', JSON.stringify(response.data.data.user))
      localStorage.setItem('token', JSON.stringify(response.data.data.token))
      localStorage.setItem('refreshToken', JSON.stringify(response.data.data.refreshToken))

      alert('login successful!')
      navigate('/lobby')
    } catch (error) {
      console.log(error)
      const message =
        error.response?.data?.message ||
        'An error occurred during registration.'

      alert(`Error: ${message}`)
    }
  }

  return (
    <div className="w-full max-w-md">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
        Welcome Back to <span className="text-emerald-600 dark:text-emerald-400">Muxic</span>
      </h2>
      <div className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold font-montserrat text-gray-700 dark:text-gray-300 mb-2">
            Username or Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-white/20 dark:border-gray-600/50 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 dark:text-white transition-all shadow-sm"
            placeholder="Enter your email"
            required
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-white/20 dark:border-gray-600/50 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 dark:text-white transition-all shadow-sm pr-12"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-emerald-600 dark:text-emerald-400 hover:underline focus:outline-none"
            >
              {showPassword ? <FiEyeOff className={'text-xl'}/> : <FiEye className={'text-xl'}/>}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end font-montserrat">
          <div className="text-sm">
            <button
              onClick={() => navigate('/forgot-password')}
              className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors">

              <div className="flex items-end gap-x-1">
                <TbLockQuestion className={'text-xl'} />
                <span>Forgot password?</span>
              </div>
            </button>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-2 rounded-md font-mono bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all text-lg font-semibold shadow-lg shadow-emerald-500/20 dark:shadow-emerald-500/10 cursor-pointer"
        >
          Sign Into Muxic
        </button>
      </div>

      {/* Divider */}
      <div className="relative my-12 md:my-10">
        <hr className="border-t border-gray-300 dark:border-gray-600" />
        <div className="absolute left-1/2 -translate-x-1/2 -top-5.5 z-10">
          <span className="w-10 h-10 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-full shadow">
            or
          </span>
        </div>
      </div>

      {/* Google Login Button */}
      <LoginWithGoogle />


      <div className="mt-8 text-center">
        <p className="text-sm font-montserrat text-gray-600 dark:text-gray-400">
          New to synchronized music?{' '}
          <button
            onClick={() => navigate('/register')}
            className="font-medium hover:underline text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
          >
            Create Account
          </button>
        </p>
      </div>
    </div>
  )
}

export default LoginForm