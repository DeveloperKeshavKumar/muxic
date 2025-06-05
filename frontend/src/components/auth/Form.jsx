import { useNavigate } from 'react-router'
import LoginForm from './Login'
import RegisterForm from './Register'

// Main Form Component
const Form = ({ type = 'login' }) => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">

      {/* Glass Morph Container matching Home component */}
      <div className="w-full max-w-2xl mt-10 mb-10 backdrop-blur-lg bg-white/30 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl overflow-hidden transition-all hover:shadow-emerald-500/10 hover:border-emerald-500/30">
        <div className="p-6 md:p-8">
          {type === 'login' ? (
            <LoginForm navigate={navigate} />
          ) : (
            <RegisterForm navigate={navigate} />
          )}
        </div>

        {/* Footer matching Home component */}
        <div className="border-t border-emerald-300 dark:border-gray-700/50 p-3 text-center text-gray-600 dark:text-gray-400">
          <p className="font-montserrat">© {new Date().getFullYear()} Muxic.in All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default Form