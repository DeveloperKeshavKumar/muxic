import { useState } from "react"
import { FiEyeOff, FiEye } from "react-icons/fi"
import axios from 'axios'
import LoginWithGoogle from "./LoginWithGoogle"

const RegisterForm = ({ navigate }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      console.log(formData)
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/auth/register`,
        formData
      )

      alert('Registration successful!')
      navigate('/login')
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
        Join the <span className="text-emerald-600 dark:text-emerald-400">Muxic</span> Experience
      </h2>

      <div className="space-y-6">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-semibold font-montserrat text-gray-700 dark:text-gray-300 mb-2">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md border border-white/20 dark:border-gray-600/50 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 dark:text-white transition-all shadow-sm"
            placeholder="Enter your full fullName"
            required
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
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md border border-white/20 dark:border-gray-600/50 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 dark:text-white transition-all shadow-sm"
            placeholder="Choose a unique username"
            required
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
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md border border-white/20 dark:border-gray-600/50 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 dark:text-white transition-all shadow-sm"
            placeholder="Enter your email"
            required
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
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 pr-12 rounded-md border border-white/20 dark:border-gray-600/50 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 dark:text-white transition-all shadow-sm"
                placeholder="Create password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-emerald-600 dark:text-emerald-400 hover:underline focus:outline-none"
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
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 pr-12 rounded-md border border-white/20 dark:border-gray-600/50 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 dark:text-white transition-all shadow-sm"
                placeholder="Confirm password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-emerald-600 dark:text-emerald-400 hover:underline focus:outline-none"
              >
                {showPassword ? <FiEyeOff className={'text-xl'} /> : <FiEye className={'text-xl'}/>}
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full py-2 rounded-md font-mono bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all text-lg font-semibold shadow-lg shadow-emerald-500/20 dark:shadow-emerald-500/10 cursor-pointer"
        >
          Start Your Muxic Journey
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


      {/* Redirect to login */}
      <div className="mt-8 text-center">
        <p className="text-sm font-montserrat text-gray-600 dark:text-gray-400">
          Already synchronized with us?{' '}
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

export default RegisterForm