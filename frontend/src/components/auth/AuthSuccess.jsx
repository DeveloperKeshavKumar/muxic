import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { jwtDecode } from 'jwt-decode'

const AuthSuccess = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (token) {
      try {
        const decoded = jwtDecode(token)
        console.log(decoded)

        // Save token and user info in localStorage
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify({
          id: decoded.userId,
          email: decoded.email,
          username: decoded.username,
          fullName: decoded.fullName,
          avatar: decoded.avatar,
          verified: decoded.verified || false,
          bio: decoded.bio || ''
        }))

        navigate('/lobby')
      } catch (err) {
        console.error('Failed to decode token:', err)
        navigate('/login')
      }
    } else {
      navigate('/login')
    }
  }, [navigate])

  return <div>Logging you in...</div>
}

export default AuthSuccess