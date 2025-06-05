import Form from '../components/auth/Form'
import VerifyOtp from '../components/auth/VerifyOtp'
import PasswordActions from '../components/auth/PasswordActions'

const Auth = ({ type }) => {
  return (
    <>
      {(type === 'login' || type === 'register') && <Form type={type} />}
      {(type === 'verify') && <VerifyOtp />}
      {(type.includes('password')) && <PasswordActions type={type} />}
    </>
  )
}

export default Auth