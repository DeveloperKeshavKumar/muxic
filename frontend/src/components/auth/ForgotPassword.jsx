import { useState } from "react"
import axios from "axios"

const ForgotPassword = ({ navigate }) => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      setTimeout(() => setMessage(null), 15000);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_SERVER_URL}/auth/forgot-password`,
        { email }
      );

      setMessage({
        type: 'success',
        text: response.data.message || 'Password reset link sent to your email'
      });
      setTimeout(() => setMessage(null), 5000); // Auto-hide after 5s
    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data?.message ||
        'An error occurred while sending the reset link. Please try again.';

      setMessage({ type: 'error', text: errorMessage });
      setTimeout(() => setMessage(null), 5000); // Auto-hide after 5s
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <label htmlFor="email" className="block text-sm font-medium font-montserrat text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-md border border-white/20 dark:border-gray-600/50 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 dark:text-white transition-all shadow-sm"
            placeholder="Enter your email"
            required
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-md font-mono bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all text-lg font-semibold shadow-lg shadow-emerald-500/20 dark:shadow-emerald-500/10 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm font-montserrat text-gray-600 dark:text-gray-400">
          Remember your password?{' '}
          <button
            onClick={() => navigate('/login')}
            className="font-medium hover:underline text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword