import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { toast } from 'react-toastify'

const LoginWithGoogle = ({ onSuccess, onError }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    // Handle OAuth callback results
    useEffect(() => {
        const token = searchParams.get('token')
        const error = searchParams.get('message')
        const currentPath = window.location.pathname

        // Handle success callback
        if (currentPath === '/auth/success' && token) {
            setIsLoading(false)
            toast.success('Successfully logged in with Google!')

            // Store token if needed (depending on your auth strategy)
            localStorage.setItem('token', token)

            // Call success callback if provided
            if (onSuccess) {
                onSuccess(token)
            } else {
                // Default redirect to dashboard or home
                navigate('/dashboard', { replace: true })
            }
        }

        // Handle error callback
        if (currentPath === '/auth/error' && error) {
            setIsLoading(false)
            const errorMessage = decodeURIComponent(error)
            toast.error(errorMessage || 'Google authentication failed')

            // Call error callback if provided
            if (onError) {
                onError(errorMessage)
            } else {
                // Default redirect back to login
                navigate('/login', { replace: true })
            }
        }
    }, [searchParams, navigate, onSuccess, onError])

    const handleGoogleLogin = async () => {
        try {
            setIsLoading(true)

            // Store current location for potential redirect after login
            const currentLocation = window.location.pathname
            if (currentLocation !== '/login' && currentLocation !== '/register') {
                sessionStorage.setItem('redirectAfterLogin', currentLocation)
            }

            // Redirect to backend Google OAuth endpoint
            window.location.href = `${import.meta.env.VITE_SERVER_URL}/auth/google`

        } catch (error) {
            setIsLoading(false)
            console.error('Google login error:', error)
            toast.error('Failed to initiate Google login')
        }
    }

    return (
        <>
            <div className="relative my-12 md:my-10">
                <hr className="border-t border-gray-300 dark:border-gray-600" />
                <div className="absolute left-1/2 -translate-x-1/2 -top-2.5 z-10">
                    <span className="border border-gray-600 rounded-full px-3 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900">
                        OR
                    </span>
                </div>
            </div>

            <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-md cursor-pointer border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-gray-700 dark:text-gray-200 font-semibold shadow-sm disabled:opacity-70 disabled:cursor-not-allowed relative"
            >
                {isLoading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                        <span>Connecting to Google...</span>
                    </>
                ) : (
                    <>
                        <img
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="Google icon"
                            className="w-5 h-5"
                            loading="lazy"
                        />
                        <span>Continue with Google</span>
                    </>
                )}
            </button>
        </>
    )
}

export default LoginWithGoogle