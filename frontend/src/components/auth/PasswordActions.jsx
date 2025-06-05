import { useState } from "react"
import ForgotPassword from "./ForgotPassword"
import ResetPassword from './ResetPassword'
import { useNavigate } from "react-router"

const PasswordActions = ({ type }) => {

  const [email, setEmail] = useState('')
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-2">

      {/* Glass Morph Container matching Home component */}
      <div className="w-full max-w-2xl mt-10 mb-10 backdrop-blur-lg bg-white/30 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl overflow-hidden transition-all hover:shadow-emerald-500/10 hover:border-emerald-500/30">
        <div className="p-8 md:p-10">
          {type.includes('forgot') ? (
            <ForgotPassword
              email={email}
              setEmail={setEmail}
              navigate={navigate}
            />
          ) : (
            <ResetPassword
              navigate={navigate}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default PasswordActions