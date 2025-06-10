import React, { useEffect, useContext, useState } from 'react'
import { useNavigate } from 'react-router'
import { AuthContext } from '../context/AuthContext'

const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate()
    const { isAuth, setIsAuth } = useContext(AuthContext)
    const [isCheckingAuth, setIsCheckingAuth] = useState(true)

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const savedAuthStatus = localStorage.getItem('auth')
                const savedUser = JSON.parse(localStorage.getItem('user') || 'null')
                if (savedAuthStatus && (!isAuth || !isAuth.authenticated)) {
                    setIsAuth({
                        authenticated: true,
                        user: savedUser
                    })
                }
                else if (!savedAuthStatus) {
                    navigate('/login', { replace: true })
                    return
                }
            } catch (error) {
                console.error('Auth check failed:', error)
                navigate('/login', { replace: true })
            } finally {
                console.log(isAuth)
                setIsCheckingAuth(false)
            }
        }

        checkAuth()
    }, [navigate, setIsAuth])

    if (isCheckingAuth) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return isAuth?.authenticated ? children : null
}

export default ProtectedRoute