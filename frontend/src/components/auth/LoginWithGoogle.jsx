import React from 'react'

const LoginWithGoogle = () => {
    return (
        <button
            type="button"
            onClick={() => window.location.href = `${import.meta.env.VITE_SERVER_URL}/auth/google`}
            className="w-full flex items-center justify-center gap-3 py-2 rounded-md cursor-pointer border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-gray-700 dark:text-gray-200 font-semibold shadow-sm"
        >
            <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google icon"
                className="w-5 h-5"
            />
            Continue with Google
        </button>
    )
}

export default LoginWithGoogle