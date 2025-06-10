import React, { createContext, useEffect, useState } from 'react'

export const AuthContext = createContext()

const AuthProvider = ({ children }) => {
    const [isAuth, setIsAuth] = useState({
        authenticated: false,
        user: null
    })

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const storedAuth = localStorage.getItem('auth')
        const storedUser = localStorage.getItem('user')
        if (storedAuth === 'true') {
            setIsAuth({
                authenticated: true,
                user: storedUser ? JSON.parse(storedUser) : null
            })
        }
        setLoading(false)
    }, [])

    if (loading) return null

    return (
        <AuthContext.Provider value={{ isAuth, setIsAuth }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider