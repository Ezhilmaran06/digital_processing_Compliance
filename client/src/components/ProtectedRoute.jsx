import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protected Route Component
 * Redirects to login if not authenticated
 * Optionally checks for specific roles
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner w-12 h-12"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check role authorization
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-700">403</h1>
                    <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
                        Access Denied
                    </p>
                    <p className="mt-2 text-gray-500 dark:text-gray-500">
                        You don't have permission to access this page.
                    </p>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
