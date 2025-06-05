// utils/auth.js
import axios from 'axios';

export const checkAuth = async () => {
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_SERVER_URL}/auth/check`,
            { withCredentials: true }
        );
        return response.data.isAuthenticated;
    } catch (error) {
        console.error('Auth check error:', error);
        return false;
    }
};

export const getCurrentUser = async () => {
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_SERVER_URL}/auth/me`,
            { withCredentials: true }
        );
        return response.data.user;
    } catch (error) {
        console.error('Get user error:', error);
        return null;
    }
};