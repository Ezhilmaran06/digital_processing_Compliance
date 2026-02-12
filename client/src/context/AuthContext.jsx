import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

/**
 * Auth Provider Component
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on mount
        const verifySession = async () => {
            const token = localStorage.getItem('token');
            const currentUser = authService.getCurrentUser();

            if (token && currentUser) {
                try {
                    // Verify token with backend
                    const response = await authService.getProfile();
                    if (response.success) {
                        setUser({ ...currentUser, ...response.data });
                    }
                } catch (error) {
                    console.error('Session verification failed:', error);
                    // api.js interceptor will handle 401 and redirect if needed
                }
            }
            setLoading(false);
        };

        verifySession();
    }, []);

    /**
     * Login function
     */
    const login = async (credentials) => {
        const response = await authService.login(credentials);
        if (response.success) {
            setUser(response.data);
        }
        return response;
    };

    /**
     * Register function
     */
    const register = async (userData) => {
        const response = await authService.register(userData);
        if (response.success) {
            setUser(response.data);
        }
        return response;
    };

    /**
     * Logout function
     */
    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    /**
     * Check if user has specific role
     */
    const hasRole = (role) => {
        return user?.role === role;
    };

    /**
     * Check if user has one of the specified roles
     */
    const hasAnyRole = (roles) => {
        return roles.includes(user?.role);
    };

    /**
     * Update user state
     */
    const updateUser = (userData) => {
        setUser(userData);
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        hasRole,
        hasAnyRole,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
