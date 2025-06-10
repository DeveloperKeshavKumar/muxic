import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { toast } from 'react-toastify'
import { AuthContext } from '../../context/AuthContext'

// OAuth Success Page Component
export const OAuthSuccess = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [isProcessing, setIsProcessing] = useState(true)

    const { setIsAuth } = useContext(AuthContext)

    useEffect(() => {
        const token = searchParams.get('token')

        if (token) {
            // Store the token (adjust storage method based on your auth strategy)
            localStorage.setItem('token', token)

            // You might want to decode the token to get user info
            try {
                const tokenPayload = JSON.parse(atob(token.split('.')[1]))
                localStorage.setItem('auth', true)
                localStorage.setItem('user', JSON.stringify({
                    email: tokenPayload.email,
                    username: tokenPayload.username,
                    fullName: tokenPayload.fullName,
                    avatar: tokenPayload.avatar,
                    verified: tokenPayload.verified,
                    bio: tokenPayload.bio
                }))
                setIsAuth({
                    authenticated: true,
                    user: tokenPayload
                })
            } catch (error) {
                console.warn('Could not decode token payload:', error)
            }

            toast.success('Successfully logged in with Google!', {
                theme: localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'
            })

            // Check if there's a redirect URL stored
            const redirectUrl = sessionStorage.getItem('redirectAfterLogin')
            sessionStorage.removeItem('redirectAfterLogin')

            setTimeout(() => {
                navigate(redirectUrl || '/lobby', { replace: true })
            }, 1000)
        } else {
            toast.error('Authentication failed - no token received', {
                theme: localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'
            })
            navigate('/login', { replace: true })
        }

        setIsProcessing(false)
    }, [searchParams, navigate])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-md w-full px-4 py-8 sm:px-8 space-y-8">
                <div className="text-center">
                    {isProcessing ? (
                        <>
                            <div className="w-16 h-16 mx-auto mb-4 border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-600 dark:border-t-emerald-500 rounded-full animate-spin"></div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Completing Sign In
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                Please wait while we finish setting up your account...
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center transition-colors duration-300">
                                <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                                Sign In Successful!
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                                Redirecting you to your Lobby...
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

// OAuth Error Page Component
export const OAuthError = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        const message = searchParams.get('message')
        const decodedMessage = message ? decodeURIComponent(message) : 'Authentication failed'
        setErrorMessage(decodedMessage)

        toast.error(decodedMessage, {
            theme: localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'
        })
    }, [searchParams])

    const handleRetry = () => {
        navigate('/login', { replace: true })
    }

    const handleGoHome = () => {
        navigate('/', { replace: true })
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-md w-full px-4 py-8 sm:px-8 space-y-8">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center transition-colors duration-300">
                        <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                        Authentication Failed
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-300">
                        {errorMessage}
                    </p>

                    <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 justify-center">
                        <button
                            onClick={handleRetry}
                            className="py-3 px-6 rounded-md bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={handleGoHome}
                            className="py-3 px-6 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-semibold focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                        >
                            Go to Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Main OAuth Handler Component (for routing)
export const OAuthHandler = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const error = searchParams.get('error')

    useEffect(() => {
        if (!error && window.location.pathname !== '/auth/success') {
            navigate('/login', { replace: true })
        }
    }, [error, navigate])

    if (error) {
        return <OAuthError />
    } else if (window.location.pathname === '/auth/success') {
        return <OAuthSuccess />
    }

    return null
}